import { ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5">
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--neon-blue)] to-[var(--neon-green)] text-[oklch(0.12_0.02_250)] shadow-[var(--shadow-neon-blue)] transition-transform group-hover:scale-105">
        <ShieldCheck className="h-5 w-5" strokeWidth={2.5} />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-lg font-bold tracking-tight">
            <span className="neon-text-blue">Cyber</span>
            <span className="neon-text-green">Scan</span>
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            security intel
          </span>
        </span>
      )}
    </Link>
  );
}
