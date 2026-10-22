import { qdrant, respond, sql } from "@/lib/query-log";
import { db, getClusters } from "@/lib/store";

export async function GET() {
  return respond({ clusters: getClusters(), dishes: db.dishes }, [
    qdrant("Lấy cụm và toạ độ 2D của các món", {
      method: "POST /collections/dishes/points/scroll",
      with_payload: ["cluster_id", "x", "y"],
      with_vector: false,
      limit: 2000,
    }, db.dishes.length),
    sql("Tên món và thông tin cụm", `
      SELECT d.item_id, d.dish_name, d.price, d.image_url, c.cluster_id, c.cluster_name
      FROM dishes d
      JOIN clusters c ON c.cluster_id = d.cluster_id;`, db.dishes.length),
  ]);
}
