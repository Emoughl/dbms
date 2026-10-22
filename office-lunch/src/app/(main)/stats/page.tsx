"use client";

import Link from "next/link";
import { DishImage } from "@/components/dish-image";
import { PageHead, Section, card } from "@/components/ui";
import { useFetch } from "@/lib/hooks";
import { formatPrice } from "@/lib/labels";
import type { Cluster, Dish, Stats } from "@/lib/types";

export default function StatsPage() {
  const { data: s } = useFetch<Stats>("/api/stats");
  const meta = useFetch<{ clusters: Cluster[]; dishes: Dish[] }>("/api/clusters");
  const clusters = meta.data?.clusters ?? [];

  if (!s) return <PageHead title="Thống kê" />;
  if (s.totalMeals === 0)
    return (
      <>
        <PageHead title="Thống kê" />
        <div className={`${card} flex flex-col items-center gap-3 p-12 text-center`}>
          <p className="font-medium">Chưa có bữa ăn nào để thống kê</p>
          <p className="max-w-sm text-sm text-muted">Chọn món ở trang Hôm nay ăn gì hoặc thêm bữa trong Lịch sử, số liệu sẽ hiện ở đây.</p>
          <Link href="/" className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-ink">Chọn món hôm nay</Link>
        </div>
      </>
    );

  const maxWeek = Math.max(1, ...s.weeklySpend.map((w) => w.amount));
  const maxTop = Math.max(1, ...s.topDishes.map((d) => d.count));

  const kpis = [
    { label: "Số bữa đã ghi", value: String(s.totalMeals), note: "8 tuần gần nhất" },
    { label: "Chi tiêu tuần này", value: formatPrice(s.spendThisWeek), note: "từ thứ Hai" },
    { label: "Tỉ lệ hài lòng", value: `${Math.round(s.yesRate * 100)}%`, note: "bữa được đánh giá yes" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <PageHead title="Thống kê" sub="Thói quen ăn trưa của bạn, tính từ lịch sử bữa ăn." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className={`${card} p-5`}>
            <div className="text-sm text-muted">{k.label}</div>
            <div className="mt-2 text-3xl font-semibold tabular-nums">{k.value}</div>
            <div className="mt-1 text-xs text-muted">{k.note}</div>
          </div>
        ))}
        {s.favorite && (
          <div className={`${card} flex items-center gap-4 p-5`}>
            <DishImage src={s.favorite.dish.image} alt={s.favorite.dish.name} sizes="64px" className="size-16 shrink-0 rounded-xl" />
            <div className="min-w-0">
              <div className="text-sm text-muted">Ăn nhiều nhất</div>
              <div className="truncate font-semibold">{s.favorite.dish.name}</div>
              <div className="text-xs text-muted">{s.favorite.count} lần</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Chi tiêu theo tuần">
          <div className={`${card} p-5`}>
            <div className="flex h-48 items-end gap-2">
              {s.weeklySpend.map((w) => (
                <div key={w.week} className="group flex h-full flex-1 flex-col justify-end gap-1.5">
                  <span className="text-center text-xs tabular-nums text-muted opacity-0 transition group-hover:opacity-100">{formatPrice(w.amount)}</span>
                  <div className="rounded-t-md bg-accent/80 transition group-hover:bg-accent" style={{ height: `${(w.amount / maxWeek) * 80}%` }} />
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2 border-t border-line pt-2">
              {s.weeklySpend.map((w) => (
                <span key={w.week} className="flex-1 text-center text-[11px] tabular-nums text-muted">
                  {w.week.slice(8, 10)}/{w.week.slice(5, 7)}
                </span>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Món ăn nhiều nhất">
          <ul className={`${card} flex flex-col gap-3 p-5`}>
            {s.topDishes.map(({ dish, count }) => (
              <li key={dish.itemId} className="grid grid-cols-[2rem_8rem_1fr_2rem] items-center gap-3 text-sm sm:grid-cols-[2rem_10rem_1fr_2rem]">
                <DishImage src={dish.image} alt="" sizes="32px" className="size-8 rounded-lg" />
                <span className="truncate">{dish.name}</span>
                <div className="h-2 rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-ink/70" style={{ width: `${(count / maxTop) * 100}%` }} />
                </div>
                <span className="text-right tabular-nums text-muted">{count}</span>
              </li>
            ))}
          </ul>
        </Section>

        <div className="lg:col-span-2">
        <Section title="Hài lòng theo nhóm món" sub="Số bữa yes / no của từng cụm">
          <ul className={`${card} grid gap-x-10 gap-y-3 p-5 lg:grid-cols-2`}>
            {s.clusterYes.filter((c) => c.yes + c.no > 0).map((c) => {
              const total = c.yes + c.no;
              return (
                <li key={c.clusterId} className="grid grid-cols-[8rem_1fr_3.5rem] items-center gap-3 text-sm">
                  <span className="truncate">{clusters[c.clusterId]?.name}</span>
                  <div className="flex h-2 overflow-hidden rounded-full bg-surface-2">
                    <div className="bg-good" style={{ width: `${(c.yes / total) * 100}%` }} />
                    <div className="bg-bad" style={{ width: `${(c.no / total) * 100}%` }} />
                  </div>
                  <span className="text-right text-xs tabular-nums text-muted">{c.yes}/{c.no}</span>
                </li>
              );
            })}
          </ul>
        </Section>
        </div>
      </div>
    </div>
  );
}
