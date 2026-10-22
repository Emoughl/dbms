"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, getUserId, setUserId } from "@/lib/api";
import type { UserProfile } from "@/lib/types";

interface Ctx {
  user: UserProfile;
  users: UserProfile[];
  switchUser: (id: string) => void;
}

const UserContext = createContext<Ctx | null>(null);

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser phải nằm trong UserProvider");
  return ctx;
};

// Người dùng mẫu: không có đăng nhập, chọn ở thanh bên để demo nhiều khẩu vị khác nhau.
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userId, setId] = useState<string | null>(null);

  useEffect(() => {
    api.get<UserProfile[]>("/api/users").then((all) => {
      const saved = getUserId();
      const id = all.some((u) => u.id === saved) ? saved! : all[0].id;
      setUserId(id);
      setUsers(all);
      setId(id);
    });
  }, []);

  const switchUser = useCallback((id: string) => {
    setUserId(id);
    setId(id);
  }, []);

  const user = users.find((u) => u.id === userId);
  if (!user) return <div className="flex min-h-dvh items-center justify-center text-sm text-muted">Đang tải…</div>;

  // key={user.id}: đổi người dùng thì các trang tải lại dữ liệu của người đó
  return (
    <UserContext.Provider value={{ user, users, switchUser }}>
      <div key={user.id} className="contents">{children}</div>
    </UserContext.Provider>
  );
}
