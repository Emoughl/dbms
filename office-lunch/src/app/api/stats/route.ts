import { respond, sql } from "@/lib/query-log";
import { stats, userFromRequest } from "@/lib/store";

const JOIN = `FROM meals m
      JOIN meal_items mi ON mi.meal_id = m.meal_id
      JOIN dishes d      ON d.item_id  = mi.item_id`;

export async function GET(req: Request) {
  const user = userFromRequest(req);
  const s = stats(user.id);
  return respond(s, [
    sql("Tổng quan: số bữa, tỉ lệ hài lòng", `
      SELECT COUNT(*) AS total_meals,
             AVG(CASE WHEN label = 'yes' THEN 1.0 ELSE 0 END) AS yes_rate
      FROM meals
      WHERE user_id = ?  -- '${user.id}'
        AND meal_date >= CURRENT_DATE - 56;`, 1),
    sql("Chi tiêu theo tuần", `
      SELECT TRUNC(m.meal_date, 'IW') AS week_start, SUM(d.price) AS amount
      ${JOIN}
      WHERE m.user_id = ? AND m.meal_date >= CURRENT_DATE - 56
      GROUP BY 1
      ORDER BY 1;`, s.weeklySpend.length),
    sql("Món ăn nhiều nhất", `
      SELECT TOP 6 d.item_id, d.dish_name, COUNT(*) AS times
      ${JOIN}
      WHERE m.user_id = ? AND d.cluster_id <> 6
      GROUP BY d.item_id, d.dish_name
      ORDER BY times DESC;`, s.topDishes.length),
    sql("Hài lòng theo cụm món", `
      SELECT d.cluster_id,
             SUM(CASE WHEN m.label = 'yes' THEN 1 ELSE 0 END) AS yes_cnt,
             SUM(CASE WHEN m.label = 'no'  THEN 1 ELSE 0 END) AS no_cnt
      ${JOIN}
      WHERE m.user_id = ? AND d.cluster_id <> 6
      GROUP BY d.cluster_id;`, s.clusterYes.length),
  ]);
}
