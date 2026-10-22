// Client gọi API. UI chỉ đi qua file này, nên khi đổi sang backend thật
// (Next route → Teradata/Qdrant, hoặc FastAPI) không phải sửa component.

import { QUERY_HEADER, type QueryLog } from "./query-log";

const USER_KEY = "officelunch.user";

export function getUserId(): string | null {
  try {
    return localStorage.getItem(USER_KEY);
  } catch {
    return null;
  }
}

export function setUserId(id: string) {
  try {
    localStorage.setItem(USER_KEY, id);
  } catch {
    // trình duyệt chặn localStorage: bỏ qua, API mặc định dùng người dùng đầu tiên
  }
}

// Nhật ký truy vấn cho khung "Xem truy vấn"
export interface QueryEntry extends QueryLog {
  id: number;
  endpoint: string;
  at: number;
}
let seq = 0;
const listeners = new Set<(entries: QueryEntry[]) => void>();
export function onQueries(fn: (entries: QueryEntry[]) => void) {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const userId = getUserId();
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(userId ? { "x-user-id": userId } : {}), ...init?.headers },
  });
  const raw = res.headers.get(QUERY_HEADER);
  if (raw) {
    const endpoint = `${init?.method ?? "GET"} ${url}`;
    const entries = (JSON.parse(decodeURIComponent(raw)) as QueryLog[]).map((q) => ({ ...q, id: ++seq, endpoint, at: Date.now() }));
    listeners.forEach((fn) => fn(entries));
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Lỗi ${res.status}`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });

export const api = {
  get: <T>(url: string) => req<T>(url),
  post: <T>(url: string, body: unknown) => req<T>(url, json("POST", body)),
  put: <T>(url: string, body: unknown) => req<T>(url, json("PUT", body)),
  del: (url: string) => req<void>(url, { method: "DELETE" }),
};
