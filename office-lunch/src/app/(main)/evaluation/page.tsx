"use client";

import { PageHead, Section, card } from "@/components/ui";
import type { Evaluation } from "@/lib/evaluation";
import { useFetch } from "@/lib/hooks";

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

export default function EvaluationPage() {
  const { data: e } = useFetch<Evaluation>("/api/evaluation");
  if (!e) return <PageHead title="Đánh giá mô hình" />;

  const best = e.methods.reduce((a, b) => (b.accuracy > a.accuracy ? b : a));
  const { tp, fn, fp, tn } = e.confusion;
  const precision = tp / (tp + fp);
  const recall = tp / (tp + fn);
  const minAcc = 0.76, maxAcc = 0.83;

  // Biểu đồ đường accuracy theo minsup
  const W = 520, H = 220, P = { l: 44, r: 16, t: 16, b: 32 };
  const xs = (i: number) => P.l + (i / (e.minsup.length - 1)) * (W - P.l - P.r);
  const ys = (v: number) => P.t + (1 - (v - minAcc) / (maxAcc - minAcc)) * (H - P.t - P.b);
  const path = (k: "ind" | "joi") => e.minsup.map((m, i) => `${i ? "L" : "M"}${xs(i)},${ys(m[k])}`).join(" ");

  return (
    <div className="flex flex-col gap-10">
      <PageHead
        title="Đánh giá mô hình"
        sub="Phân loại giao dịch yes/no trên bộ food của Trans2Vec: so sánh các cách biểu diễn vector."
      />

      {e.simulated && (
        <div className="rounded-xl bg-accent-soft px-4 py-3 text-sm">
          Kết quả mô hình bên dưới đang là <b>số giả lập</b> để dựng giao diện. Thông tin bộ dữ liệu là số thật đếm từ food.txt.
        </div>
      )}

      <Section title="Bộ dữ liệu food.txt">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Giao dịch", e.dataset.transactions.toLocaleString("vi-VN"), `${e.dataset.yes} yes · ${e.dataset.no} no`],
            ["Mã món khác nhau", e.dataset.uniqueItems.toLocaleString("vi-VN"), "item_id 1 – 1559"],
            ["Món / giao dịch", String(e.dataset.avgLength).replace(".", ","), `ít nhất ${e.dataset.minLength}, nhiều nhất ${e.dataset.maxLength}`],
            ["Chia dữ liệu", `${e.split.train} / ${e.split.test}`, `train / test · trung bình ${e.split.runs} lần chạy`],
          ].map(([k, v, n]) => (
            <div key={k} className={`${card} p-5`}>
              <div className="text-sm text-muted">{k}</div>
              <div className="mt-2 text-2xl font-semibold tabular-nums">{v}</div>
              <div className="mt-1 text-xs text-muted">{n}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="So sánh phương pháp">
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full min-w-[36rem] text-sm">
            <thead className="text-left text-xs text-muted">
              <tr className="border-b border-line">
                <th className="px-5 py-3 font-medium">Phương pháp</th>
                <th className="px-5 py-3 font-medium">Accuracy</th>
                <th className="px-5 py-3 text-right font-medium">Macro F1</th>
                <th className="px-5 py-3 text-right font-medium">Thời gian train</th>
              </tr>
            </thead>
            <tbody>
              {e.methods.map((m) => (
                <tr key={m.method} className="border-b border-line last:border-0">
                  <td className="px-5 py-3">
                    <span className={m === best ? "font-semibold" : ""}>{m.method}</span>
                    {m.group === "baseline" && <span className="ml-2 text-xs text-muted">baseline</span>}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-32 rounded-full bg-surface-2">
                        <div className={`h-full rounded-full ${m === best ? "bg-accent" : "bg-ink/40"}`} style={{ width: `${((m.accuracy - 0.6) / 0.3) * 100}%` }} />
                      </div>
                      <span className="tabular-nums">{pct(m.accuracy)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">{m.f1.toFixed(3)}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-muted">{m.trainSeconds}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Section title="Ảnh hưởng của minsup" sub="Ngưỡng hỗ trợ tối thiểu khi khai thác tập phổ biến">
          <div className={`${card} p-4`}>
            <div className="overflow-x-auto">
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[22rem]" role="img" aria-label="Accuracy theo minsup">
                {[0.77, 0.79, 0.81, 0.83].map((v) => (
                  <g key={v}>
                    <line x1={P.l} x2={W - P.r} y1={ys(v)} y2={ys(v)} stroke="var(--line)" />
                    <text x={P.l - 8} y={ys(v) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">{pct(v)}</text>
                  </g>
                ))}
                {e.minsup.map((m, i) => (
                  <text key={m.minsup} x={xs(i)} y={H - 10} textAnchor="middle" fontSize="11" fill="var(--muted)">{m.minsup}</text>
                ))}
                <path d={path("ind")} fill="none" stroke="var(--muted)" strokeWidth="2" />
                <path d={path("joi")} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
                {e.minsup.map((m, i) => (
                  <g key={i}>
                    <circle cx={xs(i)} cy={ys(m.ind)} r="3" fill="var(--surface)" stroke="var(--muted)" strokeWidth="1.5" />
                    <circle cx={xs(i)} cy={ys(m.joi)} r="3.5" fill="var(--accent)" />
                  </g>
                ))}
              </svg>
            </div>
            <div className="mt-2 flex gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-accent" /> Trans2Vec-Joi</span>
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-muted" /> Trans2Vec-Ind</span>
            </div>
          </div>
        </Section>

        <Section title="Ma trận nhầm lẫn" sub={`${best.method}, ${e.split.test} giao dịch test`}>
          <div className={`${card} p-5`}>
            <div className="grid grid-cols-[4rem_1fr_1fr] gap-1.5 text-center text-sm">
              <span />
              <span className="pb-1 text-xs text-muted">Dự đoán yes</span>
              <span className="pb-1 text-xs text-muted">Dự đoán no</span>
              <span className="flex items-center text-xs text-muted">Thật yes</span>
              <span className="rounded-lg bg-good-soft py-5 text-xl font-semibold tabular-nums text-good">{tp}</span>
              <span className="rounded-lg bg-surface-2 py-5 text-xl font-semibold tabular-nums">{fn}</span>
              <span className="flex items-center text-xs text-muted">Thật no</span>
              <span className="rounded-lg bg-surface-2 py-5 text-xl font-semibold tabular-nums">{fp}</span>
              <span className="rounded-lg bg-good-soft py-5 text-xl font-semibold tabular-nums text-good">{tn}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-muted">Precision</div><div className="font-semibold tabular-nums">{pct(precision)}</div></div>
              <div><div className="text-muted">Recall</div><div className="font-semibold tabular-nums">{pct(recall)}</div></div>
            </div>
          </div>
        </Section>
      </div>

      <Section title="Cấu hình Qdrant">
        <div className={`${card} grid gap-4 p-5 font-mono text-sm sm:grid-cols-5`}>
          {Object.entries(e.qdrant).map(([k, v]) => (
            <div key={k}>
              <div className="text-xs text-muted">{k}</div>
              <div>{String(v)}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
