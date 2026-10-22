import type { Weather, WeatherNow } from "@/lib/types";

// Thời tiết hiện tại từ Open-Meteo (miễn phí, không cần API key).
const cities: Record<string, { name: string; lat: number; lon: number }> = {
  hcm: { name: "TP.HCM", lat: 10.82, lon: 106.63 },
  hn: { name: "Hà Nội", lat: 21.03, lon: 105.85 },
  dn: { name: "Đà Nẵng", lat: 16.05, lon: 108.2 },
};

const rainCodes = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99]);

function describe(code: number) {
  if (code === 0) return "Trời quang";
  if (code <= 3) return "Có mây";
  if (code === 45 || code === 48) return "Sương mù";
  if (code >= 95) return "Dông";
  if (rainCodes.has(code)) return "Mưa";
  return "Nhiều mây";
}

export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("city") ?? "hcm";
  const city = cities[key] ?? cities.hcm;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,precipitation,weather_code&timezone=Asia%2FBangkok`;
    const res = await fetch(url, { next: { revalidate: 900 } });
    if (!res.ok) throw new Error(String(res.status));
    const { current } = (await res.json()) as { current: { temperature_2m: number; precipitation: number; weather_code: number } };
    const weather: Weather =
      rainCodes.has(current.weather_code) || current.precipitation > 0.2 ? "mua" : current.temperature_2m >= 30 ? "nang-nong" : "mat";
    return Response.json({
      city: city.name,
      temperature: Math.round(current.temperature_2m),
      description: describe(current.weather_code),
      weather,
      source: "open-meteo",
    } satisfies WeatherNow);
  } catch {
    return Response.json({ city: city.name, temperature: 32, description: "Không lấy được thời tiết", weather: "nang-nong", source: "fallback" } satisfies WeatherNow);
  }
}
