import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Chip({ active, children, ...rest }: { active?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
        active ? "bg-ink text-bg" : "bg-surface-2 text-muted hover:text-ink"
      }`}
      {...rest}
    >
      {children}
    </button>
  );
}

type Variant = "primary" | "ghost" | "danger" | "quiet";
const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink hover:opacity-90",
  ghost: "bg-surface-2 text-ink hover:bg-line",
  quiet: "text-muted hover:bg-surface-2 hover:text-ink",
  danger: "text-bad hover:bg-bad-soft",
};

export function Button({ variant = "ghost", className = "", ...rest }: { variant?: Variant } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:opacity-50 ${variants[variant]} ${className}`}
      {...rest}
    />
  );
}

export function PageHead({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {sub && <p className="mt-1.5 max-w-2xl text-sm text-muted">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export function ClusterPill({ name, color }: { name: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <span className="size-1.5 rounded-full" style={{ background: color }} />
      {name}
    </span>
  );
}

export function LabelBadge({ label }: { label: "yes" | "no" }) {
  return label === "yes" ? (
    <span className="rounded-md bg-good-soft px-1.5 py-0.5 font-mono text-xs text-good">yes</span>
  ) : (
    <span className="rounded-md bg-bad-soft px-1.5 py-0.5 font-mono text-xs text-bad">no</span>
  );
}

const avatarHues = [24, 150, 210, 280, 340, 60];
export function Avatar({ name, size = "size-8" }: { name: string; size?: string }) {
  const initials = name.split(" ").map((w) => w[0]).slice(-2).join("").toUpperCase();
  const hue = avatarHues[[...name].reduce((s, c) => s + c.charCodeAt(0), 0) % avatarHues.length];
  return (
    <span
      className={`${size} inline-flex shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white`}
      style={{ background: `hsl(${hue} 45% 48%)` }}
    >
      {initials}
    </span>
  );
}

export function Section({ title, sub, children, aside }: { title: string; sub?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {sub && <p className="text-sm text-muted">{sub}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

export const card = "rounded-2xl bg-surface ring-1 ring-line";
export const input =
  "w-full rounded-lg bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-muted focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent";
