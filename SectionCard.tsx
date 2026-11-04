import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  icon?: LucideIcon;
  description?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export function SectionCard({
  title,
  icon: Icon,
  description,
  children,
  className = "",
  actions,
}: Props) {
  return (
    <section
      className={`relative rounded-xl border border-border bg-card/60 backdrop-blur-sm p-5 ${className}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {Icon && (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-[var(--neon-blue)]">
              <Icon className="h-4.5 w-4.5" size={18} />
            </span>
          )}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              {title}
            </h3>
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function StatRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/40 py-2 last:border-0">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`text-sm text-foreground ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

export function SeverityBadge({ severity }: { severity: "low" | "medium" | "high" | "critical" }) {
  const map = {
    low: "bg-[oklch(0.78_0.21_155/15%)] text-[var(--neon-green)] border-[var(--neon-green)]/40",
    medium:
      "bg-[oklch(0.8_0.18_75/15%)] text-[oklch(0.85_0.18_75)] border-[oklch(0.85_0.18_75)]/40",
    high: "bg-[oklch(0.7_0.22_40/15%)] text-[oklch(0.78_0.22_40)] border-[oklch(0.78_0.22_40)]/40",
    critical:
      "bg-[oklch(0.65_0.24_25/15%)] text-[oklch(0.78_0.24_25)] border-[oklch(0.78_0.24_25)]/40",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${map[severity]}`}
    >
      {severity}
    </span>
  );
}

export function PresenceBadge({ present }: { present: boolean }) {
  return present ? (
    <span className="inline-flex items-center gap-1 rounded-md border border-[var(--neon-green)]/40 bg-[oklch(0.78_0.21_155/15%)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--neon-green)]">
      Present
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-md border border-[oklch(0.78_0.24_25)]/40 bg-[oklch(0.65_0.24_25/15%)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[oklch(0.78_0.24_25)]">
      Missing
    </span>
  );
}
