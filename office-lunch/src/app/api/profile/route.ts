import { respond, sql } from "@/lib/query-log";
import { clusterAffinity, userFromRequest } from "@/lib/store";
import type { UserProfile } from "@/lib/types";

export async function GET(req: Request) {
  const profile = userFromRequest(req);
  return respond({ profile, affinity: clusterAffinity(profile.id) }, [
    sql("Hồ sơ người dùng", `
      SELECT u.user_id, u.full_name, u.team, u.diet, u.spicy, u.budget
      FROM users u
      WHERE u.user_id = ?;  -- '${profile.id}'`, 1),
    sql("Món kiêng và món thích", `
      SELECT 'avoid' AS kind, tag AS val FROM user_avoid WHERE user_id = ?
      UNION ALL
      SELECT 'like', CAST(item_id AS VARCHAR(10)) FROM user_likes WHERE user_id = ?;`, profile.avoid.length + profile.likedItemIds.length),
    sql("Điểm yêu thích theo cụm (yes +1, no -1, món thích +2)", `
      SELECT d.cluster_id,
             SUM(CASE WHEN m.label = 'yes' THEN 1 ELSE -1 END) AS score
      FROM meals m
      JOIN meal_items mi ON mi.meal_id = m.meal_id
      JOIN dishes d      ON d.item_id  = mi.item_id
      WHERE m.user_id = ? AND d.cluster_id <> 6
      GROUP BY d.cluster_id;`, Object.keys(clusterAffinity(profile.id)).length),
  ]);
}

export async function PUT(req: Request) {
  const profile = userFromRequest(req);
  const { id: _ignored, ...patch } = (await req.json()) as Partial<UserProfile>;
  void _ignored;
  Object.assign(profile, patch);
  return respond(profile, [
    sql("Cập nhật hồ sơ", `
      UPDATE users
      SET diet = ?, spicy = ?, budget = ?, full_name = ?
      WHERE user_id = ?;  -- '${profile.id}'`, 1),
    sql("Ghi lại món kiêng và món thích", `
      DELETE FROM user_avoid WHERE user_id = ?;
      INSERT INTO user_avoid (user_id, tag) VALUES (?, ?);      -- × ${profile.avoid.length}
      DELETE FROM user_likes WHERE user_id = ?;
      INSERT INTO user_likes (user_id, item_id) VALUES (?, ?);  -- × ${profile.likedItemIds.length}`),
  ]);
}
