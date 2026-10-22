import { qdrant, respond, sql } from "@/lib/query-log";
import { db, recommend, userFromRequest, userMeals } from "@/lib/store";
import type { Budget, LunchContext } from "@/lib/types";

const budgetMax: Record<Budget, number | null> = { "duoi-35": 35000, "35-50": 50000, "tren-50": null };

// Bản thật: Qdrant Query API (recommend theo món thích/không thích) + lọc payload theo ngữ cảnh,
// sau đó kNN trên collection giao dịch để dự đoán yes/no.
export async function POST(req: Request) {
  const body = (await req.json()) as { context: LunchContext; exclude?: number[]; limit?: number };
  const user = userFromRequest(req);
  const recs = recommend({ ...body, userId: user.id });

  const history = userMeals(user.id).slice(0, 20);
  const isMain = (id: number) => db.dishes.find((d) => d.itemId === id)?.clusterId !== 6;
  const positive = [...new Set([...user.likedItemIds, ...history.filter((m) => m.label === "yes").flatMap((m) => m.itemIds)])].filter(isMain).slice(0, 12);
  const negative = [...new Set(history.filter((m) => m.label === "no").flatMap((m) => m.itemIds))].filter((id) => isMain(id) && !positive.includes(id)).slice(0, 6);
  const maxPrice = budgetMax[body.context.budget];

  const must: unknown[] = [];
  if (maxPrice) must.push({ key: "price", range: { lte: maxPrice } });
  if (body.context.breakTime === 15) must.push({ key: "tags", match: { any: ["nhanh"] } });
  if (user.diet === "chay") must.push({ key: "cluster_id", match: { value: 5 } });
  const mustNot: unknown[] = [{ key: "cluster_id", match: { value: 6 } }];
  if (user.avoid.length) mustNot.push({ key: "tags", match: { any: user.avoid } });
  if (body.exclude?.length) mustNot.push({ has_id: body.exclude });

  const top = recs[0]?.dish.itemId;
  return respond(recs, [
    sql("Hồ sơ và lịch sử gần đây của người dùng", `
      SELECT u.diet, u.budget, m.label, mi.item_id
      FROM users u
      LEFT JOIN meals m       ON m.user_id = u.user_id AND m.meal_date >= CURRENT_DATE - 30
      LEFT JOIN meal_items mi ON mi.meal_id = m.meal_id
      WHERE u.user_id = ?;  -- '${user.id}'`, history.length),
    qdrant("Tìm món hợp khẩu vị, lọc theo ngữ cảnh", {
      method: "POST /collections/dishes/points/query",
      query: { recommend: { positive, negative, strategy: "average_vector" } },
      filter: { must, must_not: mustNot },
      limit: body.limit ?? 4,
      with_payload: true,
    }, recs.length),
    qdrant("Dự đoán thích/không: kNN trên giao dịch food.txt + giao dịch của app", {
      method: "POST /collections/transactions/points/query",
      query: top ?? "<vector món>",
      using: "default",
      limit: 15,
      with_payload: ["label"],
      "// sau đó": "đếm nhãn yes/no trong 15 láng giềng → predictedLabel",
    }, 15),
    sql("Đồ uống hay đi kèm (luật kết hợp từ tập phổ biến)", `
      SELECT antecedent, consequent, confidence
      FROM item_rules
      WHERE antecedent IN (${recs.map((r) => r.dish.itemId).join(", ")})
        AND consequent IN (SELECT item_id FROM dishes WHERE cluster_id = 6)
      QUALIFY ROW_NUMBER() OVER (PARTITION BY antecedent ORDER BY confidence DESC) = 1;`, recs.filter((r) => r.drink).length),
  ]);
}
