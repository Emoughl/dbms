import { evaluation } from "@/lib/evaluation";
import { qdrant, respond, sql } from "@/lib/query-log";

export async function GET() {
  return respond(evaluation, [
    sql("Kết quả thực nghiệm đã lưu", `
      SELECT method, minsup, accuracy, f1_macro, train_seconds
      FROM experiment_results
      WHERE dataset = 'food'
      ORDER BY accuracy DESC;`, evaluation.methods.length + evaluation.minsup.length * 2),
    qdrant("Thông tin collection giao dịch", "GET /collections/transactions", 1),
  ]);
}
