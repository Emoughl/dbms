import { respond, sql } from "@/lib/query-log";
import { db } from "@/lib/store";

export async function GET() {
  return respond(db.users, [sql("Danh sách người dùng", `
    SELECT user_id, full_name, team, diet, spicy, budget
    FROM users
    ORDER BY full_name;`, db.users.length)]);
}
