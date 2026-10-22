"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/labels";
import type { Dish, Label, Meal } from "@/lib/types";
import { Button, Chip, input } from "./ui";

interface Props {
  dishes: Dish[];
  initial?: Meal;
  onSubmit: (m: Pick<Meal, "date" | "itemIds" | "label">) => void;
  onCancel: () => void;
}

export function MealForm({ dishes, initial, onSubmit, onCancel }: Props) {
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [itemIds, setItemIds] = useState<number[]>(initial?.itemIds ?? []);
  const [label, setLabel] = useState<Label>(initial?.label ?? "yes");
  const [q, setQ] = useState("");

  const toggle = (id: number) => setItemIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  const shown = dishes.filter((d) => d.name.toLowerCase().includes(q.toLowerCase())).slice(0, 18);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (itemIds.length) onSubmit({ date, itemIds, label });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted">Ngày</span>
          <input id="meal-date" type="date" className={input} value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <div className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted">Bạn thấy bữa này thế nào?</span>
          <div className="flex gap-2">
            <Chip active={label === "yes"} onClick={() => setLabel("yes")}>Hài lòng (yes)</Chip>
            <Chip active={label === "no"} onClick={() => setLabel("no")}>Không hợp (no)</Chip>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <span className="text-muted">Món đã ăn ({itemIds.length})</span>
        <input id="meal-search" className={input} placeholder="Tìm món…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          {shown.map((d) => (
            <Chip key={d.itemId} active={itemIds.includes(d.itemId)} onClick={() => toggle(d.itemId)}>
              {d.name} <span className="text-muted">· {formatPrice(d.price)}</span>
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button onClick={onCancel}>Huỷ</Button>
        <Button type="submit" variant="primary" disabled={!itemIds.length}>
          {initial ? "Lưu thay đổi" : "Thêm bữa ăn"}
        </Button>
      </div>
    </form>
  );
}
