// Ghi lại các truy vấn Teradata/Qdrant mà backend thật sẽ chạy cho mỗi request.
// Route gửi kèm qua header "x-ol-queries"; khung "Xem truy vấn" trên UI đọc header này.
// Giai đoạn UI: nội dung là câu truy vấn mẫu, số dòng lấy từ dữ liệu giả.

export type Engine = "teradata" | "qdrant";

export interface QueryLog {
  engine: Engine;
  title: string;
  text: string;
  rows?: number;
}

export const QUERY_HEADER = "x-ol-queries";

export const sql = (title: string, text: string, rows?: number): QueryLog => ({ engine: "teradata", title, text: dedent(text), rows });
export const qdrant = (title: string, body: unknown, rows?: number): QueryLog => ({
  engine: "qdrant",
  title,
  text: typeof body === "string" ? dedent(body) : compactJson(body),
  rows,
});

// JSON thụt lề nhưng gom mảng số/chuỗi ngắn về một dòng cho dễ đọc
function compactJson(body: unknown) {
  return JSON.stringify(body, null, 2).replace(/\[\s+([^\[\]{}]*?)\s+\]/g, (_, inner: string) => `[${inner.split(/,\s+/).join(", ")}]`);
}

function dedent(s: string) {
  const lines = s.replace(/^\n/, "").replace(/\s+$/, "").split("\n");
  const pad = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length));
  return lines.map((l) => l.slice(pad)).join("\n");
}

export function respond(data: unknown, queries: QueryLog[], init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set(QUERY_HEADER, encodeURIComponent(JSON.stringify(queries)));
  if (data === null) return new Response(null, { ...init, status: init?.status ?? 204, headers });
  return Response.json(data, { ...init, headers });
}
