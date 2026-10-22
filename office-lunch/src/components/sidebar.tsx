"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "./user-context";
import { Avatar } from "./ui";

// Menu chia theo 2 môn: phần ứng dụng (CSDL nâng cao) và phần thực nghiệm (KDD).
const sections = [
  {
    title: "Ứng dụng",
    links: [
      { href: "/", label: "Hôm nay ăn gì" },
      { href: "/history", label: "Lịch sử" },
      { href: "/stats", label: "Thống kê" },
      { href: "/dishes", label: "Quản lý món" },
      { href: "/profile", label: "Khẩu vị" },
    ],
  },
  {
    title: "Thực nghiệm Trans2Vec",
    links: [
      { href: "/clusters", label: "Khám phá cụm" },
      { href: "/evaluation", label: "Đánh giá mô hình" },
    ],
  },
];

const allLinks = sections.flatMap((s) => s.links);

function UserSelect({ compact }: { compact?: boolean }) {
  const { user, users, switchUser } = useUser();
  return (
    <label className={`flex items-center gap-3 rounded-lg ${compact ? "" : "p-2 hover:bg-surface-2"}`}>
      <Avatar name={user.name} />
      {!compact && <span className="sr-only">Người dùng</span>}
      <select
        id={compact ? "user-select-mobile" : "user-select"}
        aria-label="Đổi người dùng"
        value={user.id}
        onChange={(e) => switchUser(e.target.value)}
        className={`min-w-0 flex-1 bg-transparent text-sm font-medium focus:outline-none ${compact ? "max-w-32" : ""}`}
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>{compact ? u.name : `${u.name} · ${u.team}`}</option>
        ))}
      </select>
    </label>
  );
}

export function Sidebar() {
  const path = usePathname();
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line px-4 py-6 lg:flex">
        <Link href="/" className="px-2 text-lg font-bold tracking-tight">
          Office<span className="text-accent">Lunch</span>
        </Link>
        <nav className="mt-8 flex flex-1 flex-col gap-6">
          {sections.map((s) => (
            <div key={s.title} className="flex flex-col gap-0.5">
              <span className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted">{s.title}</span>
              {s.links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-lg px-2 py-1.5 text-sm transition-colors ${
                    isActive(l.href) ? "bg-surface-2 font-medium text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <UserSelect />
      </aside>

      {/* Mobile */}
      <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 pt-3">
          <Link href="/" className="font-bold tracking-tight">
            Office<span className="text-accent">Lunch</span>
          </Link>
          <UserSelect compact />
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 py-2">
          {allLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-sm ${isActive(l.href) ? "bg-ink text-bg" : "text-muted"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}
