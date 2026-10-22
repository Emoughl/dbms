import type { Cluster, Dish, Meal, UserProfile, Weather } from "./types";

// DỮ LIỆU GIẢ cho giai đoạn làm UI.
// itemId lấy từ các mã có thật trong datasets/food/food.txt.
// Tên món được gán theo cụm (cluster-aware naming): sau khi chạy Word2Vec +
// phân cụm thật, sẽ gán lại tên cho đúng cụm mà mã món rơi vào.
// Ảnh: Unsplash (giấy phép Unsplash, dùng miễn phí).

// Số liệu thật của food.txt (đếm trực tiếp từ file).
export const datasetStats = {
  transactions: 4000,
  yes: 2000,
  no: 2000,
  uniqueItems: 1559,
  avgLength: 26.6,
  minLength: 3,
  maxLength: 262,
};

export const clusters: Cluster[] = [
  { id: 0, name: "Món nước", description: "Phở, bún, hủ tiếu, hợp trời mát và mưa", color: "#4f7cac" },
  { id: 1, name: "Cơm phần", description: "Cơm văn phòng no lâu, giá vừa", color: "#d9822b" },
  { id: 2, name: "Bún trộn & khô", description: "Bún chả, bún thịt nướng, mì trộn", color: "#a37c3c" },
  { id: 3, name: "Bánh mì & xôi", description: "Nhanh gọn khi chỉ có 15 phút", color: "#b5577a" },
  { id: 4, name: "Healthy", description: "Salad, poke, ức gà, ít tinh bột", color: "#4a9a6a" },
  { id: 5, name: "Món chay", description: "Cơm chay, bún chay, đậu hũ", color: "#7d6bc2" },
  { id: 6, name: "Đồ uống & tráng miệng", description: "Trà, chè, sinh tố ăn kèm", color: "#8c8c5a" },
];

type Seed = [itemId: number, name: string, clusterId: number, price: number, tags: string[], photo: string];

const seeds: Seed[] = [
  [1102, "Phở bò tái", 0, 55000, ["nước", "nóng", "bò"], "photo-1766050586763-723571af4dde"],
  [509, "Bún bò Huế", 0, 50000, ["nước", "nóng", "cay", "bò"], "photo-1597345637412-9fd611e758f3"],
  [992, "Hủ tiếu Nam Vang", 0, 45000, ["nước", "nóng", "tôm", "heo"], "photo-1759324342316-f6943c935c4a"],
  [1449, "Bún riêu cua", 0, 40000, ["nước", "nóng", "cua"], "photo-1745817078506-bfc70df458b5"],
  [200, "Mì Quảng gà", 0, 45000, ["nước", "gà"], "photo-1790955333423-96ea0abb9b89"],
  [829, "Bánh canh cá lóc", 0, 40000, ["nước", "nóng", "cá"], "photo-1631709497146-a239ef373cf1"],
  [1232, "Cơm tấm sườn bì chả", 1, 45000, ["cơm", "heo", "no-lau"], "photo-1568717099337-5aaecc090548"],
  [849, "Cơm gà xối mỡ", 1, 45000, ["cơm", "gà", "chiên"], "photo-1787329682500-04fa551dde92"],
  [507, "Cơm rang dưa bò", 1, 50000, ["cơm", "bò", "chiên"], "photo-1680674814945-7945d913319c"],
  [977, "Cơm văn phòng 2 món", 1, 35000, ["cơm", "no-lau", "re"], "photo-1640116309648-79c20583e1c9"],
  [395, "Cơm cá kho tộ", 1, 40000, ["cơm", "cá"], "photo-1767436093457-84ea9122eb4e"],
  [584, "Cơm sườn rim", 1, 40000, ["cơm", "heo"], "photo-1766050587783-1c90751275dd"],
  [1160, "Bún chả Hà Nội", 2, 45000, ["bún", "heo", "nướng"], "photo-1742893368398-128bded9c656"],
  [1404, "Bún thịt nướng", 2, 40000, ["bún", "heo", "nướng"], "photo-1623509636544-4cfcb1195b40"],
  [1317, "Mì trộn tóp mỡ", 2, 35000, ["mì", "heo", "re"], "photo-1644083130607-b5ecc6cc7e8e"],
  [1240, "Bún đậu mắm tôm", 2, 50000, ["bún", "đậu", "mắm tôm"], "photo-1690949237809-3f0336b9ba33"],
  [762, "Bánh cuốn nóng", 2, 35000, ["bánh", "nhẹ", "re"], "photo-1655427221151-870cc71a63c2"],
  [1112, "Bánh mì thịt nướng", 3, 25000, ["nhanh", "heo", "re"], "photo-1715925717150-2a6d181d8846"],
  [63, "Bánh mì chảo", 3, 40000, ["nhanh", "bò", "trứng"], "photo-1562221293-ba2428780166"],
  [506, "Xôi gà", 3, 30000, ["nhanh", "gà", "no-lau"], "photo-1679279726946-a158b8bcaa23"],
  [1162, "Xôi mặn thập cẩm", 3, 30000, ["nhanh", "heo", "re"], "photo-1636401870585-a8852371e84a"],
  [286, "Bánh bao trứng muối", 3, 20000, ["nhanh", "nhẹ", "re"], "photo-1763661195425-1e3cdd575eb3"],
  [941, "Salad ức gà", 4, 60000, ["healthy", "gà", "nhẹ", "ít tinh bột"], "photo-1546069901-ba9599a7e63c"],
  [120, "Poke cá hồi", 4, 85000, ["healthy", "cá", "lạnh"], "photo-1670816978291-a5cf23d87968"],
  [296, "Gỏi cuốn tôm thịt", 4, 40000, ["healthy", "nhẹ", "tôm", "lạnh"], "photo-1669340781012-ae89fbac9fc3"],
  [180, "Cơm gạo lứt gà luộc", 4, 55000, ["healthy", "gà", "cơm"], "photo-1772693471187-6e7d364f99ee"],
  [629, "Bún gạo lứt trộn rau", 4, 45000, ["healthy", "nhẹ", "chay"], "photo-1553909489-2542a1068437"],
  [1006, "Cơm chay thập cẩm", 5, 35000, ["chay", "cơm", "re"], "photo-1665556899022-9761f95769e5"],
  [1434, "Bún Huế chay", 5, 35000, ["chay", "nước", "cay"], "photo-1612966948332-81d747414a8f"],
  [879, "Đậu hũ sốt cà", 5, 30000, ["chay", "đậu", "re"], "photo-1789999018388-68773a66b33f"],
  [1401, "Mì xào chay", 5, 35000, ["chay", "mì"], "photo-1585032226651-759b368d7246"],
  [979, "Trà đá", 6, 5000, ["uống", "lạnh", "re"], "photo-1556679343-c7306c1976bc"],
  [320, "Trà tắc", 6, 15000, ["uống", "lạnh"], "photo-1656936599916-c009ade6e7da"],
  [1068, "Chè khúc bạch", 6, 25000, ["ngọt", "lạnh"], "photo-1787550275377-9f54a07c68c8"],
  [1551, "Sinh tố bơ", 6, 30000, ["uống", "lạnh", "healthy"], "photo-1630252595285-3bbcb51378d8"],
  [103, "Sữa chua nếp cẩm", 6, 20000, ["ngọt", "lạnh", "nhẹ"], "photo-1733197012835-e99ebf3c914d"],
];

// Toạ độ 2D giả: mỗi cụm có một tâm, món rải quanh tâm theo itemId (ổn định giữa các lần render).
const centers: [number, number][] = [
  [22, 28], [70, 24], [52, 52], [84, 62], [26, 74], [12, 50], [60, 84],
];

function jitter(seed: number, range: number) {
  const s = Math.sin(seed * 12.9898) * 43758.5453;
  return (s - Math.floor(s) - 0.5) * range;
}

export const dishes: Dish[] = seeds.map(([itemId, name, clusterId, price, tags, photo]) => ({
  itemId,
  name,
  clusterId,
  price,
  tags,
  image: `https://images.unsplash.com/${photo}`,
  x: centers[clusterId][0] + jitter(itemId, 16),
  y: centers[clusterId][1] + jitter(itemId + 7, 16),
}));

export const users: UserProfile[] = [
  { id: "u-001", name: "Minh Anh", team: "Phòng Data", diet: "binh-thuong", avoid: ["mắm tôm"], spicy: 2, budget: "35-50", likedItemIds: [509, 1160] },
  { id: "u-002", name: "Quốc Bảo", team: "Kỹ thuật", diet: "binh-thuong", avoid: [], spicy: 1, budget: "duoi-35", likedItemIds: [1232, 1112] },
  { id: "u-003", name: "Thu Hà", team: "Marketing", diet: "it-tinh-bot", avoid: ["chiên"], spicy: 0, budget: "tren-50", likedItemIds: [941, 120] },
];

// Khẩu vị giả của từng người: trọng số chọn mỗi cụm khi sinh lịch sử.
const tastes: Record<string, Record<number, number>> = {
  "u-001": { 0: 4, 1: 2, 2: 3, 3: 1, 4: 1, 5: 0.3 },
  "u-002": { 0: 1, 1: 5, 2: 1, 3: 3 },
  "u-003": { 0: 1, 4: 5, 5: 1.5 },
};

// Đồ uống hay đi kèm từng cụm, dùng để sinh giao dịch có tính kết hợp.
const drinkFor: Record<number, number[]> = { 0: [979, 979, 320], 1: [979, 320], 2: [979, 320], 3: [320, 1551], 4: [1551, 103], 5: [979, 320] };

function prng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function weighted<T>(rand: () => number, entries: [T, number][]): T {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [v, w] of entries) if ((r -= w) <= 0) return v;
  return entries[entries.length - 1][0];
}

function generateMeals(): Meal[] {
  const out: Meal[] = [];
  const today = new Date();
  for (const [userId, taste] of Object.entries(tastes)) {
    const rand = prng(userId.charCodeAt(4) * 977);
    for (let back = 1; back <= 56; back++) {
      const d = new Date(today);
      d.setDate(d.getDate() - back);
      if (d.getDay() === 0 || d.getDay() === 6 || rand() < 0.15) continue;
      const clusterId = weighted(rand, Object.entries(taste).map(([c, w]) => [Number(c), w]));
      const pool = dishes.filter((x) => x.clusterId === clusterId);
      const main = pool[Math.floor(rand() * pool.length)];
      const itemIds = [main.itemId];
      if (rand() < 0.65) {
        const drinks = drinkFor[clusterId];
        itemIds.push(drinks[Math.floor(rand() * drinks.length)]);
      }
      const weather: Weather = weighted(rand, [["nang-nong", 5], ["mua", 3], ["mat", 2]]);
      const likeP = Math.min(0.9, 0.35 + (taste[clusterId] ?? 0) * 0.12);
      out.push({
        id: `m-${userId}-${back}`,
        userId,
        date: d.toISOString().slice(0, 10),
        itemIds,
        label: rand() < likeP ? "yes" : "no",
        context: { weather, budget: "35-50", breakTime: 30, mood: "gi-cung-duoc", groupSize: 1 },
      });
    }
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

export const meals: Meal[] = generateMeals();
