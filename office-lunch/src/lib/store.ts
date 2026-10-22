import { clusters, dishes, meals, users } from "./mock-data";
import type {
  Budget,
  Dish,
  LunchContext,
  Meal,
  Recommendation,
  Stats,
  UserProfile,
} from "./types";

// Kho dữ liệu trong bộ nhớ, thay cho Teradata + Qdrant trong giai đoạn làm UI.
// Khi làm backend: thay từng hàm ở đây bằng truy vấn Teradata (CRUD)
// và search/recommend của Qdrant; các route trong src/app/api giữ nguyên.

interface Db {
  dishes: Dish[];
  meals: Meal[];
  users: UserProfile[];
}

// Đổi DB_KEY khi đổi cấu trúc Db để dev server không giữ kho cũ sau hot reload.
const DB_KEY = "__officeLunchDb_v3";
const g = globalThis as unknown as Record<string, Db | undefined>;
export const db: Db =
  g[DB_KEY] ??
  (g[DB_KEY] = {
    dishes: structuredClone(dishes),
    meals: structuredClone(meals),
    users: structuredClone(users),
  });

export const getClusters = () => clusters;
export const getUser = (id: string | null) => db.users.find((u) => u.id === id);
export const userMeals = (userId: string) => db.meals.filter((m) => m.userId === userId);

// Lấy người dùng hiện tại từ header x-user-id (client gửi kèm mọi request).
export function userFromRequest(req: Request) {
  return getUser(req.headers.get("x-user-id")) ?? db.users[0];
}

const DRINK_CLUSTER = 6;
const budgetMax: Record<Budget, number> = { "duoi-35": 35000, "35-50": 50000, "tren-50": 1_000_000 };
const dishById = (id: number) => db.dishes.find((d) => d.itemId === id);

// Mức yêu thích từng cụm: lịch sử yes (+1) / no (-1) và món tự đánh dấu thích (+2).
// Bản thật: lấy vector trung bình các giao dịch "yes" làm query vector trong Qdrant.
export function clusterAffinity(userId: string): Record<number, number> {
  const score: Record<number, number> = {};
  const add = (id: number, v: number) => {
    const d = dishById(id);
    if (d && d.clusterId !== DRINK_CLUSTER) score[d.clusterId] = (score[d.clusterId] ?? 0) + v;
  };
  for (const m of userMeals(userId)) for (const id of m.itemIds) add(id, m.label === "yes" ? 1 : -1);
  for (const id of getUser(userId)?.likedItemIds ?? []) add(id, 2);
  return score;
}

// Luật kết hợp món chính → đồ uống: confidence = P(đồ uống | món chính) trên toàn bộ giao dịch.
// Bản thật: lấy từ tập phổ biến (food_items_fis_*.txt) hoặc FP-Growth trên Teradata.
export function drinkFor(dish: Dish): Recommendation["drink"] {
  const withMain = db.meals.filter((m) => m.itemIds.includes(dish.itemId));
  const sameCluster = db.meals.filter((m) => m.itemIds.some((id) => dishById(id)?.clusterId === dish.clusterId));
  const base = withMain.length >= 3 ? withMain : sameCluster;
  if (!base.length) return undefined;
  const counts = new Map<number, number>();
  for (const m of base)
    for (const id of m.itemIds) if (dishById(id)?.clusterId === DRINK_CLUSTER) counts.set(id, (counts.get(id) ?? 0) + 1);
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (!best) return undefined;
  const drink = dishById(best[0]);
  return drink && { dish: drink, confidence: best[1] / base.length };
}

interface RecommendInput {
  userId: string;
  context: LunchContext;
  exclude?: number[];
  limit?: number;
}

export function recommend({ userId, context, exclude = [], limit = 4 }: RecommendInput): Recommendation[] {
  const profile = getUser(userId) ?? db.users[0];
  const affinity = clusterAffinity(profile.id);
  const maxAff = Math.max(1, ...Object.values(affinity).map(Math.abs));

  const avoid = new Set(profile.avoid);
  const maxPrice = budgetMax[context.budget];
  const lastMeal = userMeals(profile.id)[0]?.itemIds ?? [];

  const candidates = db.dishes.filter(
    (d) =>
      d.clusterId !== DRINK_CLUSTER &&
      !exclude.includes(d.itemId) &&
      !d.tags.some((t) => avoid.has(t)) &&
      !(profile.diet === "chay" && d.clusterId !== 5) &&
      d.price <= maxPrice,
  );

  const scored = candidates.map((dish) => {
    const reasons: string[] = [];
    const aff = affinity[dish.clusterId] ?? 0;
    let s = 0.45 + 0.25 * (aff / maxAff);
    if (aff > 0) reasons.push(`Bạn hay chọn món nhóm ${clusters[dish.clusterId].name}`);
    if (profile.likedItemIds.includes(dish.itemId)) { s += 0.08; reasons.unshift("Món bạn đã đánh dấu thích"); }

    if (context.weather === "nang-nong" && dish.tags.some((t) => t === "lạnh" || t === "nhẹ")) {
      s += 0.15;
      reasons.unshift("Mát, nhẹ bụng cho trời nắng");
    }
    if (context.weather !== "nang-nong" && dish.tags.includes("nóng")) {
      s += 0.15;
      reasons.unshift(context.weather === "mua" ? "Món nóng cho ngày mưa" : "Món nóng hợp trời mát");
    }
    if (context.weather === "nang-nong" && dish.tags.includes("nóng")) s -= 0.1;
    if (profile.diet === "it-tinh-bot" && dish.tags.includes("healthy")) s += 0.12;

    if (context.breakTime === 15) {
      if (dish.tags.includes("nhanh")) {
        s += 0.2;
        reasons.unshift("Lấy nhanh, kịp giờ nghỉ 15 phút");
      } else s -= 0.15;
    }
    if (context.mood === "an-nhe" && dish.tags.includes("nhẹ")) { s += 0.12; reasons.unshift("Đúng ý muốn ăn nhẹ"); }
    if (context.mood === "no-bung" && dish.tags.includes("no-lau")) { s += 0.12; reasons.unshift("No lâu đến chiều"); }
    if (context.mood === "healthy" && dish.tags.includes("healthy")) { s += 0.18; reasons.unshift("Lựa chọn healthy"); }
    if (lastMeal.includes(dish.itemId)) s -= 0.3;

    const score = Math.max(0.05, Math.min(0.99, s + ((dish.itemId % 7) - 3) / 100));
    return {
      dish,
      score,
      reason: reasons[0] ?? "Thử món mới ngoài thói quen của bạn",
      predictedLabel: score >= 0.55 ? "yes" : "no",
      drink: drinkFor(dish),
    } satisfies Recommendation;
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

function weekStart(iso: string) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

export function stats(userId: string): Stats {
  const list = userMeals(userId);
  const priceOf = (m: Meal) => m.itemIds.reduce((s, id) => s + (dishById(id)?.price ?? 0), 0);

  const thisWeek = weekStart(new Date().toISOString().slice(0, 10));
  const weekly = new Map<string, number>();
  for (const m of list) weekly.set(weekStart(m.date), (weekly.get(weekStart(m.date)) ?? 0) + priceOf(m));
  const weeks = [...weekly.keys()].sort().slice(-8);

  const dishCount = new Map<number, number>();
  for (const m of list)
    for (const id of m.itemIds) if (dishById(id)?.clusterId !== DRINK_CLUSTER) dishCount.set(id, (dishCount.get(id) ?? 0) + 1);
  const topDishes = [...dishCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id, count]) => ({ dish: dishById(id)!, count }))
    .filter((x) => x.dish);

  const clusterYes = clusters
    .filter((c) => c.id !== DRINK_CLUSTER)
    .map((c) => {
      const ms = list.filter((m) => m.itemIds.some((id) => dishById(id)?.clusterId === c.id));
      return { clusterId: c.id, yes: ms.filter((m) => m.label === "yes").length, no: ms.filter((m) => m.label === "no").length };
    });

  return {
    totalMeals: list.length,
    spendThisWeek: weekly.get(thisWeek) ?? 0,
    yesRate: list.length ? list.filter((m) => m.label === "yes").length / list.length : 0,
    favorite: topDishes[0],
    weeklySpend: weeks.map((w) => ({ week: w, amount: weekly.get(w) ?? 0 })),
    topDishes,
    clusterYes,
  };
}
