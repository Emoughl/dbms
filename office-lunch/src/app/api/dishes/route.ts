import { qdrant, respond, sql } from "@/lib/query-log";
import { db } from "@/lib/store";
import type { Dish } from "@/lib/types";

export async function GET() {
  return respond(db.dishes, [
    sql("Danh sách món", `
      SELECT item_id, dish_name, cluster_id, price, tags, image_url
      FROM dishes
      ORDER BY cluster_id, dish_name;`, db.dishes.length),
  ]);
}

export async function POST(req: Request) {
  const dish = (await req.json()) as Dish;
  if (db.dishes.some((d) => d.itemId === dish.itemId))
    return Response.json({ error: `Mã món ${dish.itemId} đã có` }, { status: 409 });
  db.dishes.push(dish);
  return respond(dish, [
    sql("Thêm món", `
      INSERT INTO dishes (item_id, dish_name, cluster_id, price, tags, image_url)
      VALUES (${dish.itemId}, '${dish.name}', ${dish.clusterId}, ${dish.price}, '${dish.tags.join(",")}', ?);`, 1),
    qdrant("Cập nhật payload cho vector món (vector đã có từ Word2Vec)", {
      method: "POST /collections/dishes/points/payload",
      payload: { cluster_id: dish.clusterId, price: dish.price, tags: dish.tags },
      points: [dish.itemId],
    }, 1),
  ], { status: 201 });
}
