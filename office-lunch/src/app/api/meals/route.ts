import { qdrant, respond, sql } from "@/lib/query-log";
import { db, userFromRequest, userMeals } from "@/lib/store";
import type { Meal } from "@/lib/types";

export async function GET(req: Request) {
  const user = userFromRequest(req);
  const list = userMeals(user.id);
  return respond(list, [
    sql("Lịch sử bữa ăn", `
      SELECT m.meal_id, m.meal_date, m.label, mi.item_id
      FROM meals m
      JOIN meal_items mi ON mi.meal_id = m.meal_id
      WHERE m.user_id = ?  -- '${user.id}'
      ORDER BY m.meal_date DESC, m.meal_id;`, list.reduce((s, m) => s + m.itemIds.length, 0)),
  ]);
}

export async function POST(req: Request) {
  const body = (await req.json()) as Omit<Meal, "id" | "userId">;
  const user = userFromRequest(req);
  const meal: Meal = { ...body, id: `m-${Date.now()}`, userId: user.id };
  db.meals.push(meal);
  db.meals.sort((a, b) => b.date.localeCompare(a.date));
  return respond(meal, [
    sql("Thêm bữa ăn", `
      INSERT INTO meals (meal_id, user_id, meal_date, label, weather, budget, break_time, mood)
      VALUES (?, ?, DATE '${meal.date}', '${meal.label}', ?, ?, ?, ?);
      INSERT INTO meal_items (meal_id, item_id) VALUES (?, ?);  -- ${meal.itemIds.join(", ")}`, 1 + meal.itemIds.length),
    qdrant("Lưu vector giao dịch mới (để phân loại kNN về sau)", {
      method: "PUT /collections/transactions/points",
      points: [{ id: meal.id, vector: `<trung bình vector của ${meal.itemIds.join(", ")}>`, payload: { user_id: user.id, label: meal.label, source: "app" } }],
    }, 1),
  ], { status: 201 });
}
