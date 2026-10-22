import { qdrant, respond, sql } from "@/lib/query-log";
import { db } from "@/lib/store";
import type { Meal } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  const meal = db.meals.find((m) => m.id === id);
  if (!meal) return Response.json({ error: "Không tìm thấy bữa ăn" }, { status: 404 });
  Object.assign(meal, (await req.json()) as Partial<Meal>, { id });
  db.meals.sort((a, b) => b.date.localeCompare(a.date));
  return respond(meal, [
    sql("Sửa bữa ăn", `
      UPDATE meals SET meal_date = DATE '${meal.date}', label = '${meal.label}'
      WHERE meal_id = ?;  -- '${id}'
      DELETE FROM meal_items WHERE meal_id = ?;
      INSERT INTO meal_items (meal_id, item_id) VALUES (?, ?);  -- ${meal.itemIds.join(", ")}`, 1),
    qdrant("Cập nhật nhãn và vector giao dịch", {
      method: "POST /collections/transactions/points/payload",
      payload: { label: meal.label },
      points: [id],
    }, 1),
  ]);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  db.meals = db.meals.filter((m) => m.id !== id);
  return respond(null, [
    sql("Xoá bữa ăn", `
      DELETE FROM meal_items WHERE meal_id = ?;  -- '${id}'
      DELETE FROM meals WHERE meal_id = ?;`, 1),
    qdrant("Xoá vector giao dịch", { method: "POST /collections/transactions/points/delete", points: [id] }, 1),
  ]);
}
