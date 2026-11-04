import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Cookie,
  Cpu,
  Database,
  Download,
  Globe2,
  Layers,
  Lock,
  MapPin,
  Network,
  Radar,
  Server,
  ShieldAlert,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { generateScan, type ScanResult } from "@/lib/mock-scan";
import { Logo } from "@/components/cyber/Logo";
import { ScoreRing } from "@/components/cyber/ScoreRing";
import { PresenceBadge, SectionCard, SeverityBadge, StatRow } from "@/components/cyber/SectionCard";

export const Route = createFileRoute("/scan/$domain")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.domain} — CyberScan Report` },
      { name: "description", content: `Full security and technology report for ${params.domain}.` },
    ],
  }),
  component: ScanPage,
});

const SCAN_STEPS = [
  "Resolving DNS records",
  "Probing TLS handshake",
  "Fingerprinting server stack",
  "Inspecting security headers",
  "Auditing cookies & ports",
  "Running vulnerability checks",
  "Compiling recommendations",
];

function useSimulatedScan(domain: string): {
  result: ScanResult | null;
  step: number;
  progress: number;
} {
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);

  useEffect(() => {
    setStep(0);
    setResult(null);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setStep(i);
      if (i >= SCAN_STEPS.length) {
        clearInterval(interval);
        setResult(generateScan(domain));
      }
    }, 320);
    return () => clearInterval(interval);
  }, [domain]);

  return { result, step, progress: Math.min(100, (step / SCAN_STEPS.length) * 100) };
}

function ScanPage() {
  const { domain } = Route.useParams();
  const { result, step, progress } = useSimulatedScan(domain);

  return (
    <div className="min-h-screen text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <Logo />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> New scan
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {!result ? (
          <Scanning domain={domain} step={step} progress={progress} />
        ) : (
          <Dashboard result={result} />
        )}
      </main>
    </div>
  );
}

function Scanning({ domain, step, progress }: { domain: string; step: number; progress: number }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center py-20 text-center">
      <div className="relative inline-flex h-32 w-32 items-center justify-center rounded-full border border-[var(--neon-blue)]/40 animate-pulse-ring">
        <div className="absolute inset-2 overflow-hidden rounded-full">
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[var(--neon-blue)] to-transparent animate-scan-line" />
        </div>
        <Radar className="h-12 w-12 text-[var(--neon-blue)]" />
      </div>
      <h1 className="mt-8 text-2xl font-bold">
        Scanning <span className="neon-text-blue">{domain}</span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Running multi-layer recon — this typically takes a few seconds.
      </p>
      <div className="mt-8 w-full">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-green)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <ul className="mt-6 space-y-2 text-left text-sm">
          {SCAN_STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              {i < step ? (
                <CheckCircle2 className="h-4 w-4 text-[var(--neon-green)]" />
              ) : i === step ? (
                <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--neon-blue)]" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-muted" />
              )}
              <span className={i <= step ? "text-foreground" : "text-muted-foreground"}>{s}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Dashboard({ result }: { result: ScanResult }) {
  const techData = useMemo(() => {
    const byCat: Record<string, number> = {};
    result.technologies.forEach((t) => {
      byCat[t.category] = (byCat[t.category] || 0) + 1;
    });
    return Object.entries(byCat).map(([name, value]) => ({ name, value }));
  }, [result]);

  const riskCounts = useMemo(() => {
    const m: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    result.vulnerabilities.forEach((v) => {
      m[v.severity]++;
    });
    return [
      { name: "Low", value: m.low, fill: "var(--neon-green)" },
      { name: "Medium", value: m.medium, fill: "oklch(0.85 0.18 75)" },
      { name: "High", value: m.high, fill: "oklch(0.78 0.22 40)" },
      { name: "Critical", value: m.critical, fill: "oklch(0.78 0.24 25)" },
    ];
  }, [result]);

  const headersData = useMemo(
    () => [
      {
        name: "Present",
        value: result.securityHeaders.filter((h) => h.present).length,
        fill: "var(--neon-green)",
      },
      {
        name: "Missing",
        value: result.securityHeaders.filter((h) => !h.present).length,
        fill: "oklch(0.78 0.24 25)",
      },
    ],
    [result],
  );

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${result.domain}-cyberscan.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const downloadPDF = () => window.print();

  const riskColor =
    result.riskLevel === "Safe"
      ? "var(--neon-green)"
      : result.riskLevel === "Suspicious"
        ? "var(--warning)"
        : "var(--destructive)";

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card/60 p-6 backdrop-blur">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" aria-hidden />
        <div className="relative grid gap-6 md:grid-cols-[auto_1fr_auto] md:items-center">
          <ScoreRing score={result.score} label={result.riskLevel} />
          <div>
            <div className="flex items-center gap-3">
              <img src={result.basic.favicon} alt="" className="h-8 w-8 rounded" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{result.basic.name}</h1>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-[var(--neon-blue)] hover:underline"
                >
                  {result.url}
                </a>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span
                className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1"
                style={{ borderColor: `${riskColor}`, color: riskColor }}
              >
                <ShieldAlert className="h-3.5 w-3.5" /> Risk: {result.riskLevel}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2 py-1 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {result.basic.city}, {result.basic.country}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2 py-1 text-muted-foreground">
                <Server className="h-3.5 w-3.5" /> {result.basic.isp}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2 py-1 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> {result.http.responseTimeMs} ms
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 ${result.basic.status === "Online" ? "border-[var(--neon-green)]/40 text-[var(--neon-green)]" : "border-destructive/40 text-destructive"}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" /> {result.basic.status}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={downloadPDF}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-green)] px-4 py-2 text-sm font-semibold text-[oklch(0.12_0.02_250)]"
            >
              <Download className="h-4 w-4" /> PDF report
            </button>
            <button
              onClick={downloadJSON}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/60 px-4 py-2 text-sm hover:border-[var(--neon-blue)]/50"
            >
              <Download className="h-4 w-4" /> Export JSON
            </button>
          </div>
        </div>
      </div>

      {/* Top quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickStat
          icon={ShieldCheck}
          label="SSL"
          value={result.ssl.valid ? "Valid" : "Invalid"}
          sub={`${result.ssl.tls} • ${result.ssl.daysRemaining}d left`}
          color={result.ssl.valid ? "var(--neon-green)" : "var(--destructive)"}
        />
        <QuickStat
          icon={Network}
          label="Open ports"
          value={String(result.ports.length)}
          sub={`${result.ports.filter((p) => p.risk === "critical" || p.risk === "high").length} risky`}
          color="var(--neon-blue)"
        />
        <QuickStat
          icon={AlertTriangle}
          label="Vulnerabilities"
          value={String(result.vulnerabilities.length)}
          sub={`${result.vulnerabilities.filter((v) => v.severity === "critical").length} critical`}
          color="oklch(0.78 0.22 40)"
        />
        <QuickStat
          icon={Activity}
          label="Performance"
          value={`${result.performance.score}/100`}
          sub={`${result.performance.pageSizeKb} KB`}
          color="var(--neon-green)"
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Risk distribution" icon={ShieldAlert} className="lg:col-span-1">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskCounts}
                  dataKey="value"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {riskCounts.map((e, i) => (
                    <Cell key={i} fill={e.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {riskCounts.map((r) => (
              <div key={r.name} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: r.fill }} />
                <span className="text-muted-foreground">{r.name}</span>
                <span className="ml-auto font-semibold">{r.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Technology distribution" icon={Layers} className="lg:col-span-1">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={techData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="name"
                  stroke="var(--muted-foreground)"
                  fontSize={10}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" fill="var(--neon-blue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Security headers" icon={Lock} className="lg:col-span-1">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={headersData} dataKey="value" innerRadius={45} outerRadius={75}>
                  {headersData.map((e, i) => (
                    <Cell key={i} fill={e.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {headersData[0].value} of {result.securityHeaders.length} headers configured
          </p>
        </SectionCard>
      </div>

      {/* Info grids */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Basic information" icon={Globe2}>
          <StatRow label="Hostname" value={result.basic.hostname} mono />
          <StatRow label="IP Address" value={result.basic.ip} mono />
          <StatRow label="IPv6" value={result.basic.ipv6} mono />
          <StatRow label="ASN" value={result.basic.asn} mono />
          <StatRow label="ISP" value={result.basic.isp} />
          <StatRow label="Hosting" value={result.basic.hostingProvider} />
          <StatRow label="Location" value={`${result.basic.city}, ${result.basic.country}`} />
          <StatRow
            label="Coordinates"
            value={`${result.basic.lat.toFixed(2)}, ${result.basic.lng.toFixed(2)}`}
            mono
          />
        </SectionCard>

        <SectionCard title="Domain (WHOIS)" icon={Database}>
          <StatRow label="Registrar" value={result.domain_info.registrar} />
          <StatRow label="Created" value={result.domain_info.creationDate} mono />
          <StatRow label="Expires" value={result.domain_info.expirationDate} mono />
          <StatRow label="Updated" value={result.domain_info.updatedDate} mono />
          <StatRow label="Age" value={`${result.domain_info.ageYears} years`} />
          <StatRow label="Status" value={result.domain_info.status} mono />
          <StatRow label="Owner" value={result.domain_info.owner} />
        </SectionCard>

        <SectionCard title="DNS records" icon={Network}>
          <div className="space-y-1">
            {result.dns.map((d, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-md border border-border/60 bg-secondary/40 px-3 py-2 text-sm"
              >
                <span className="inline-flex w-14 justify-center rounded bg-[oklch(0.75_0.2_230/15%)] py-0.5 text-xs font-bold text-[var(--neon-blue)]">
                  {d.type}
                </span>
                <span className="font-mono text-xs text-foreground/90 break-all">{d.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="SSL / TLS certificate" icon={Lock}>
          <StatRow label="Available" value={<PresenceBadge present={result.ssl.available} />} />
          <StatRow label="Valid" value={<PresenceBadge present={result.ssl.valid} />} />
          <StatRow label="Trusted" value={<PresenceBadge present={result.ssl.trusted} />} />
          <StatRow label="Issuer" value={result.ssl.issuer} />
          <StatRow label="Algorithm" value={result.ssl.algorithm} mono />
          <StatRow label="Version" value={result.ssl.version} mono />
          <StatRow label="TLS" value={result.ssl.tls} mono />
          <StatRow
            label="Expiry"
            value={`${result.ssl.expiry} (${result.ssl.daysRemaining} days)`}
            mono
          />
          <StatRow label="Self-signed" value={result.ssl.selfSigned ? "Yes" : "No"} />
        </SectionCard>

        <SectionCard title="Server & infrastructure" icon={Server}>
          <StatRow label="Web Server" value={result.server.webServer} mono />
          <StatRow label="OS (est.)" value={result.server.os} />
          <StatRow label="Backend" value={result.server.backend} />
          <StatRow label="Framework" value={result.server.framework} />
          <StatRow label="Reverse Proxy" value={result.server.reverseProxy} />
          <StatRow label="CDN" value={result.server.cdn} />
          <StatRow label="Cache" value={result.server.cache} />
          <StatRow label="Cloud Provider" value={result.server.cloud} />
        </SectionCard>

        <SectionCard title="Technologies detected" icon={Cpu}>
          <div className="flex flex-wrap gap-2">
            {result.technologies.map((t) => (
              <span
                key={t.name}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2.5 py-1 text-xs"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--neon-blue)]" />
                <span className="font-medium">{t.name}</span>
                <span className="text-muted-foreground">· {t.category}</span>
              </span>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="HTTP response" icon={Wifi}>
          <StatRow label="Status" value={result.http.status} mono />
          <StatRow
            label="Final URL"
            value={<span className="break-all">{result.http.finalUrl}</span>}
            mono
          />
          <StatRow label="Response time" value={`${result.http.responseTimeMs} ms`} mono />
          <StatRow label="Redirects" value={`${result.http.redirects.length}`} />
          <StatRow label="Headers" value={result.http.headersCount} mono />
          <StatRow label="Cookies" value={result.http.cookiesCount} mono />
          <StatRow label="Compression" value={result.http.compression} mono />
          <StatRow label="Caching" value={result.http.caching} mono />
        </SectionCard>

        <SectionCard title="Security headers" icon={ShieldCheck}>
          <div className="space-y-1.5">
            {result.securityHeaders.map((h) => (
              <div
                key={h.name}
                className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-secondary/40 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="font-mono text-xs text-foreground truncate">{h.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {h.recommendation}
                  </div>
                </div>
                <PresenceBadge present={h.present} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Cookie analysis" icon={Cookie}>
          <StatRow label="Total cookies" value={result.cookies.total} mono />
          <StatRow label="Secure" value={result.cookies.secure} mono />
          <StatRow label="HttpOnly" value={result.cookies.httpOnly} mono />
          <StatRow label="SameSite" value={result.cookies.sameSite} mono />
          <StatRow label="Third-party" value={result.cookies.thirdParty} mono />
          <StatRow label="Avg. expiry" value={`${result.cookies.avgExpiryDays} days`} mono />
        </SectionCard>

        <SectionCard title="Open ports" icon={Radar} description="Authorized targets only">
          <div className="overflow-hidden rounded-md border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Port</th>
                  <th className="px-3 py-2 text-left">Proto</th>
                  <th className="px-3 py-2 text-left">Service</th>
                  <th className="px-3 py-2 text-right">Risk</th>
                </tr>
              </thead>
              <tbody>
                {result.ports.map((p) => (
                  <tr key={p.port} className="border-t border-border/40">
                    <td className="px-3 py-2 font-mono">{p.port}</td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                      {p.protocol}
                    </td>
                    <td className="px-3 py-2">{p.service}</td>
                    <td className="px-3 py-2 text-right">
                      <SeverityBadge severity={p.risk} />
                    </td>
                  </tr>
                ))}
                {result.ports.length === 0 && (
                  <tr>
                    <td className="px-3 py-3 text-xs text-muted-foreground" colSpan={4}>
                      No open ports detected.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Vulnerability analysis" icon={AlertTriangle}>
        <div className="grid gap-3 md:grid-cols-2">
          {result.vulnerabilities.map((v) => (
            <div key={v.title} className="rounded-lg border border-border bg-secondary/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm font-semibold">{v.title}</h4>
                <SeverityBadge severity={v.severity} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{v.description}</p>
              <p className="mt-2 text-xs">
                <span className="text-[var(--neon-blue)] font-semibold">Fix:</span>{" "}
                <span className="text-foreground/90">{v.recommendation}</span>
              </p>
            </div>
          ))}
          {result.vulnerabilities.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No vulnerabilities detected in this scan.
            </p>
          )}
        </div>
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Reputation" icon={ShieldCheck}>
          <StatRow label="HTTPS" value={<PresenceBadge present={result.reputation.https} />} />
          <StatRow
            label="Blacklist"
            value={
              result.reputation.blacklist === "Clean" ? (
                <span className="text-[var(--neon-green)] text-xs font-semibold uppercase">
                  Clean
                </span>
              ) : (
                <span className="text-destructive text-xs font-semibold uppercase">Listed</span>
              )
            }
          />
          <StatRow label="Suspicious indicators" value={result.reputation.suspicious} mono />
          <StatRow
            label="SSL trust"
            value={<PresenceBadge present={result.reputation.sslTrust} />}
          />
          <StatRow
            label="Reputation score"
            value={<span className="font-bold neon-text-green">{result.reputation.score}/100</span>}
          />
        </SectionCard>

        <SectionCard title="SEO" icon={Globe2}>
          <StatRow
            label="Title"
            value={
              <span className="truncate max-w-[220px] inline-block align-bottom">
                {result.seo.title}
              </span>
            }
          />
          <StatRow
            label="Description"
            value={
              <span className="truncate max-w-[220px] inline-block align-bottom text-muted-foreground">
                {result.seo.description}
              </span>
            }
          />
          <StatRow label="Canonical" value={<PresenceBadge present={true} />} />
          <StatRow label="robots.txt" value={<PresenceBadge present={result.seo.robots} />} />
          <StatRow label="sitemap.xml" value={<PresenceBadge present={result.seo.sitemap} />} />
          <StatRow label="Open Graph" value={<PresenceBadge present={result.seo.og} />} />
          <StatRow label="Twitter Tags" value={<PresenceBadge present={result.seo.twitter} />} />
        </SectionCard>

        <SectionCard title="Performance" icon={Activity}>
          <StatRow label="Response time" value={`${result.performance.responseTimeMs} ms`} mono />
          <StatRow label="Page size" value={`${result.performance.pageSizeKb} KB`} mono />
          <StatRow
            label="Compression"
            value={result.performance.compression ? "Enabled" : "Disabled"}
          />
          <StatRow label="Caching" value={result.performance.caching ? "Enabled" : "Disabled"} />
          <StatRow label="Image optimization" value={result.performance.imageOpt ? "Yes" : "No"} />
          <StatRow label="Lazy loading" value={result.performance.lazyLoading ? "Yes" : "No"} />
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground uppercase tracking-wider">
                Performance score
              </span>
              <span className="font-bold">{result.performance.score}/100</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-green)]"
                style={{ width: `${result.performance.score}%` }}
              />
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Security recommendations"
        icon={ShieldCheck}
        description="Generated from detected issues"
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {result.recommendations.map((rec) => (
            <div
              key={rec}
              className="flex items-start gap-2.5 rounded-lg border border-border bg-secondary/40 p-3 text-sm"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--neon-green)]" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <p className="text-center text-xs text-muted-foreground">
        Scan completed {new Date(result.scannedAt).toLocaleString()} · CyberScan demo dataset
      </p>
    </div>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card/60 p-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-md"
          style={{ background: `${color}20`, color }}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}
