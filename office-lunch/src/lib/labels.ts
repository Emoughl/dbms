import type { Budget, Mood, Weather } from "./types";

export const weatherLabel: Record<Weather, string> = { "nang-nong": "Nắng nóng", mua: "Mưa", mat: "Trời mát" };
export const budgetLabel: Record<Budget, string> = { "duoi-35": "Dưới 35k", "35-50": "35k – 50k", "tren-50": "Trên 50k" };
export const moodLabel: Record<Mood, string> = {
  "an-nhe": "Ăn nhẹ",
  "no-bung": "Ăn no",
  healthy: "Healthy",
  "gi-cung-duoc": "Gì cũng được",
};

export const formatPrice = (vnd: number) => `${Math.round(vnd / 1000)}k`;

export const formatDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" });

// Dòng giao dịch đúng định dạng food.txt
export const toTransactionLine = (label: string, itemIds: number[]) => `${label}\t${itemIds.join(" ")}`;
