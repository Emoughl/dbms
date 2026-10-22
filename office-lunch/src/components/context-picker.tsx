"use client";

import { budgetLabel, moodLabel, weatherLabel } from "@/lib/labels";
import type { BreakTime, Budget, LunchContext, Mood, Weather } from "@/lib/types";
import { Chip } from "./ui";

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-muted">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

interface Props {
  value: LunchContext;
  onChange: (v: LunchContext) => void;
  autoWeather?: Weather; // thời tiết lấy tự động, đánh dấu trên chip
}

export function ContextPicker({ value, onChange, autoWeather }: Props) {
  const set = <K extends keyof LunchContext>(k: K, v: LunchContext[K]) => onChange({ ...value, [k]: v });
  return (
    <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
      <Group label="Thời tiết">
        {(Object.keys(weatherLabel) as Weather[]).map((w) => (
          <Chip key={w} active={value.weather === w} onClick={() => set("weather", w)}>
            {weatherLabel[w]}
            {autoWeather === w && <span className="ml-1 opacity-60">· tự động</span>}
          </Chip>
        ))}
      </Group>
      <Group label="Ngân sách">
        {(Object.keys(budgetLabel) as Budget[]).map((b) => (
          <Chip key={b} active={value.budget === b} onClick={() => set("budget", b)}>{budgetLabel[b]}</Chip>
        ))}
      </Group>
      <Group label="Thời gian nghỉ">
        {([15, 30, 60] as BreakTime[]).map((t) => (
          <Chip key={t} active={value.breakTime === t} onClick={() => set("breakTime", t)}>{t} phút</Chip>
        ))}
      </Group>
      <Group label="Hôm nay muốn">
        {(Object.keys(moodLabel) as Mood[]).map((m) => (
          <Chip key={m} active={value.mood === m} onClick={() => set("mood", m)}>{moodLabel[m]}</Chip>
        ))}
      </Group>
    </div>
  );
}
