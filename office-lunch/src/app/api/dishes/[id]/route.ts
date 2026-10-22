import { qdrant, respond, sql } from "@/lib/query-log";
import { db } from "@/lib/store";
import type { Dish } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const itemId = Number((await params).id);
  const dish = db.dishes.find((d) => d.itemId === itemId);
  if (!dish) return Response.json({ error: "Không tìm thấy món" }, { status: 404 });
  Object.assign(dish, (await req.json()) as Partial<Dish>, { itemId });
  return respond(dish, [
    sql("Sửa món", `
      UPDATE dishes
      SET dish_name = '${dish.name}', cluster_id = ${dish.clusterId}, price = ${dish.price}, tags = '${dish.tags.join(",")}'
      WHERE item_id = ${itemId};`, 1),
    qdrant("Đồng bộ payload sang Qdrant (dùng để lọc khi gợi ý)", {
      method: "POST /collections/dishes/points/payload",
      payload: { cluster_id: dish.clusterId, price: dish.price, tags: dish.tags },
      points: [itemId],
    }, 1),
  ]);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const itemId = Number((await params).id);
  db.dishes = db.dishes.filter((d) => d.itemId !== itemId);
  return respond(null, [
    sql("Xoá món", `DELETE FROM dishes WHERE item_id = ${itemId};`, 1),
    qdrant("Xoá payload món (giữ vector vì còn dùng cho thực nghiệm)", {
      method: "POST /collections/dishes/points/payload/clear",
      points: [itemId],
    }, 1),
  ]);
}
