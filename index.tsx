import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Activity,
  Globe2,
  Lock,
  Radar,
  ScanSearch,
  Server,
  ShieldAlert,
} from "lucide-react";
import { Logo } from "@/components/cyber/Logo";
import { normalizeUrl, POPULAR_DOMAINS } from "@/lib/mock-scan";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CyberScan — Website Intelligence & Security Analyzer" },
      {
        name: "description",
        content:
          "Scan any website for security headers, SSL, DNS, technologies, vulnerabilities and reputation in seconds.",
      },
      { property: "og:title", content: "CyberScan — Website Intelligence & Security Analyzer" },
      {
        property: "og:description",
        content:
          "Scan any website for security headers, SSL, DNS, technologies, vulnerabilities and reputation in seconds.",
      },
    ],
  }),
  component: Index,
});

const FEATURES = [
  {
    icon: ShieldAlert,
    title: "Vulnerability scan",
    desc: "CVE-aware checks, severity scoring and fix-it recommendations.",
  },
  {
    icon: Lock,
    title: "SSL & TLS audit",
    desc: "Cert chain, expiry, cipher strength and trust signals.",
  },
  {
    icon: Server,
    title: "Server fingerprint",
    desc: "Stack, CDN, OS, framework and reverse-proxy detection.",
  },
  {
    icon: Globe2,
    title: "DNS & WHOIS",
    desc: "A/AAAA/MX/TXT records, registrar, age and ownership.",
  },
  {
    icon: Radar,
    title: "Port reconnaissance",
    desc: "Open ports, services and risk classification at a glance.",
  },
  {
    icon: Activity,
    title: "Performance signals",
    desc: "Response time, caching, compression and page weight.",
  },
];

function Index() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cyberscan:recent");
      if (raw) setRecent(JSON.parse(raw));
    } catch {
      /* noop */
    }
  }, []);

  const go = (raw: string) => {
    if (!raw.trim()) return;
    const { domain } = normalizeUrl(raw);
    const next = [domain, ...recent.filter((d) => d !== domain)].slice(0, 6);
    setRecent(next);
    try {
      localStorage.setItem("cyberscan:recent", JSON.stringify(next));
    } catch {
      /* noop */
    }
    navigate({ to: "/scan/$domain", params: { domain } });
  };

  return (
    <div className="min-h-screen text-foreground">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="hidden gap-7 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#popular" className="hover:text-foreground transition-colors">
            Popular
          </a>
          <a href="#how" className="hover:text-foreground transition-colors">
            How it works
          </a>
        </nav>
        <span className="hidden md:inline-flex items-center gap-2 rounded-full border border-[var(--neon-green)]/40 bg-[oklch(0.78_0.21_155/10%)] px-3 py-1 text-xs text-[var(--neon-green)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--neon-green)] animate-pulse" />
          Scanner online
        </span>
      </header>

      <main className="relative">
        <div className="absolute inset-0 grid-bg pointer-events-none opacity-50" aria-hidden />
        <section className="relative mx-auto max-w-5xl px-6 pt-16 pb-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Radar className="h-3 w-3 text-[var(--neon-blue)]" /> Security recon
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Website Intelligence &amp;{" "}
            <span className="bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-green)] bg-clip-text text-transparent">
              Security Analyzer
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Enter any URL and CyberScan generates a complete security and technology report — SSL,
            headers, DNS, vulnerabilities, ports, reputation and fix recommendations.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              go(url);
            }}
            className="relative mx-auto mt-10 flex max-w-2xl items-center gap-2 rounded-2xl border border-border bg-card/80 p-2 shadow-[var(--shadow-neon-blue)] backdrop-blur"
          >
            <ScanSearch className="ml-3 h-5 w-5 text-[var(--neon-blue)]" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter Website URL — e.g. https://example.com"
              className="flex-1 bg-transparent px-2 py-3 text-base outline-none placeholder:text-muted-foreground/70"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-green)] px-5 py-3 text-sm font-semibold text-[oklch(0.12_0.02_250)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Analyze
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-4 flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <button
              onClick={() => go("https://example.com")}
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              Try an example scan →
            </button>
          </div>

          {recent.length > 0 && (
            <div className="mt-10">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                Recent scans
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {recent.map((d) => (
                  <button
                    key={d}
                    onClick={() => go(d)}
                    className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-foreground hover:border-[var(--neon-blue)]/60"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div id="popular" className="mt-10">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
              Popular domains
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_DOMAINS.map((d) => (
                <button
                  key={d}
                  onClick={() => go(d)}
                  className="rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-[var(--neon-green)]/60"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="relative mx-auto max-w-7xl px-6 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Recon, hardened and visualized</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Every scan unlocks a full intel dashboard.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-xl border border-border bg-card/60 p-5 backdrop-blur transition-colors hover:border-[var(--neon-blue)]/50"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--neon-blue)]/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-[var(--neon-blue)]">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="mx-auto max-w-5xl px-6 pb-20">
          <div className="rounded-2xl border border-border bg-card/60 p-8 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              How it works
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {["Enter URL", "Run multi-layer scan", "Read intelligence report"].map((s, i) => (
                <div key={s}>
                  <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--neon-blue)]/50 bg-[oklch(0.75_0.2_230/10%)] text-[var(--neon-blue)] font-semibold">
                    {i + 1}
                  </div>
                  <p className="mt-3 text-sm font-medium">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} CyberScan. For authorized testing only.</span>
          <span>Scans are simulated for demonstration purposes.</span>
        </div>
      </footer>
    </div>
  );
}
