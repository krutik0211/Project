// Deterministic mock scan generator — produces realistic-looking data for any URL.

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function pick<T>(r: () => number, arr: T[]): T {
  return arr[Math.floor(r() * arr.length)];
}

export type Severity = "low" | "medium" | "high" | "critical";
export type RiskLevel = "Safe" | "Suspicious" | "High Risk";

export interface ScanResult {
  url: string;
  domain: string;
  scannedAt: string;
  score: number;
  riskLevel: RiskLevel;
  basic: {
    name: string;
    ip: string;
    ipv6: string;
    hostname: string;
    country: string;
    city: string;
    isp: string;
    hostingProvider: string;
    asn: string;
    lat: number;
    lng: number;
    status: "Online" | "Offline";
    favicon: string;
  };
  domain_info: {
    registrar: string;
    creationDate: string;
    expirationDate: string;
    updatedDate: string;
    ageYears: number;
    status: string;
    owner: string;
  };
  dns: { type: string; value: string }[];
  ssl: {
    available: boolean;
    valid: boolean;
    issuer: string;
    algorithm: string;
    version: string;
    expiry: string;
    daysRemaining: number;
    selfSigned: boolean;
    trusted: boolean;
    tls: string;
  };
  server: {
    webServer: string;
    os: string;
    backend: string;
    framework: string;
    reverseProxy: string;
    cdn: string;
    cache: string;
    cloud: string;
  };
  technologies: { name: string; category: string }[];
  http: {
    status: number;
    redirects: string[];
    finalUrl: string;
    responseTimeMs: number;
    headersCount: number;
    cookiesCount: number;
    compression: string;
    caching: string;
  };
  securityHeaders: { name: string; present: boolean; recommendation: string }[];
  cookies: {
    total: number;
    secure: number;
    httpOnly: number;
    sameSite: number;
    thirdParty: number;
    avgExpiryDays: number;
  };
  ports: { port: number; protocol: string; service: string; risk: Severity }[];
  vulnerabilities: {
    title: string;
    severity: Severity;
    description: string;
    recommendation: string;
  }[];
  reputation: {
    https: boolean;
    blacklist: "Clean" | "Listed";
    suspicious: number;
    sslTrust: boolean;
    score: number;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
    canonical: string;
    robots: boolean;
    sitemap: boolean;
    og: boolean;
    twitter: boolean;
  };
  performance: {
    responseTimeMs: number;
    pageSizeKb: number;
    compression: boolean;
    caching: boolean;
    imageOpt: boolean;
    lazyLoading: boolean;
    score: number;
  };
  recommendations: string[];
}

export function normalizeUrl(input: string): { url: string; domain: string } {
  let u = input.trim();
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  try {
    const parsed = new URL(u);
    return { url: parsed.toString().replace(/\/$/, ""), domain: parsed.hostname };
  } catch {
    return { url: u, domain: u.replace(/^https?:\/\//, "").split("/")[0] };
  }
}

export function generateScan(input: string): ScanResult {
  const { url, domain } = normalizeUrl(input);
  const seed = hashStr(domain);
  const r = rng(seed);

  const score = 35 + Math.floor(r() * 60);
  const riskLevel: RiskLevel = score >= 80 ? "Safe" : score >= 55 ? "Suspicious" : "High Risk";

  const countries = [
    ["United States", "San Francisco", 37.77, -122.41],
    ["Germany", "Frankfurt", 50.11, 8.68],
    ["Singapore", "Singapore", 1.35, 103.82],
    ["United Kingdom", "London", 51.5, -0.12],
    ["India", "Mumbai", 19.07, 72.87],
    ["Japan", "Tokyo", 35.68, 139.69],
  ] as const;
  const c = pick(r, countries as unknown as (typeof countries)[number][]);

  const isps = [
    "Cloudflare Inc.",
    "Amazon AWS",
    "Google Cloud",
    "Hetzner Online",
    "DigitalOcean",
    "Microsoft Azure",
  ];
  const isp = pick(r, isps);

  const ip = `${20 + Math.floor(r() * 200)}.${Math.floor(r() * 256)}.${Math.floor(r() * 256)}.${Math.floor(r() * 256)}`;
  const ipv6 = `2606:${(0x4700 + Math.floor(r() * 100)).toString(16)}::${Math.floor(r() * 9999).toString(16)}`;

  const registrars = [
    "GoDaddy.com, LLC",
    "Namecheap, Inc.",
    "Google Domains",
    "Gandi SAS",
    "MarkMonitor Inc.",
  ];
  const ageYears = 1 + Math.floor(r() * 22);
  const createdYear = 2026 - ageYears;
  const expYear = 2026 + 1 + Math.floor(r() * 5);

  const allTech = [
    ["React", "JS Framework"],
    ["Next.js", "Framework"],
    ["Vue", "JS Framework"],
    ["Node.js", "Runtime"],
    ["PHP", "Language"],
    ["Laravel", "Framework"],
    ["WordPress", "CMS"],
    ["Tailwind CSS", "CSS"],
    ["Bootstrap", "CSS"],
    ["jQuery", "JS Library"],
    ["Cloudflare", "CDN"],
    ["Google Analytics", "Analytics"],
    ["Google Tag Manager", "Tag Manager"],
    ["reCAPTCHA", "Security"],
    ["Font Awesome", "Icons"],
    ["Nginx", "Web Server"],
    ["Apache", "Web Server"],
    ["Stripe", "Payments"],
  ];
  const techCount = 5 + Math.floor(r() * 7);
  const technologies = [...allTech]
    .sort(() => r() - 0.5)
    .slice(0, techCount)
    .map(([name, category]) => ({ name, category }));

  const headers = [
    "Content-Security-Policy",
    "Strict-Transport-Security",
    "X-Frame-Options",
    "X-XSS-Protection",
    "Referrer-Policy",
    "Permissions-Policy",
    "X-Content-Type-Options",
    "Cross-Origin-Opener-Policy",
  ];
  const securityHeaders = headers.map((name) => {
    const present = r() > 0.45;
    return {
      name,
      present,
      recommendation: present
        ? "Configured correctly"
        : `Enable ${name} to mitigate related attacks`,
    };
  });

  const portCatalog = [
    [80, "TCP", "HTTP", "low"],
    [443, "TCP", "HTTPS", "low"],
    [22, "TCP", "SSH", "medium"],
    [21, "TCP", "FTP", "high"],
    [25, "TCP", "SMTP", "medium"],
    [3306, "TCP", "MySQL", "high"],
    [6379, "TCP", "Redis", "critical"],
    [8080, "TCP", "HTTP-Alt", "medium"],
  ] as const;
  const ports = portCatalog
    .filter(() => r() > 0.45)
    .map(([port, protocol, service, risk]) => ({
      port,
      protocol,
      service,
      risk: risk as Severity,
    }));

  const vulnPool: {
    title: string;
    severity: Severity;
    description: string;
    recommendation: string;
  }[] = [
    {
      title: "Missing HSTS header",
      severity: "medium",
      description: "Strict-Transport-Security is not set, allowing protocol downgrade attacks.",
      recommendation: "Add Strict-Transport-Security with a long max-age.",
    },
    {
      title: "Server version disclosed",
      severity: "low",
      description: "The Server header leaks software version details.",
      recommendation: "Hide or genericize the Server response header.",
    },
    {
      title: "Weak TLS cipher detected",
      severity: "high",
      description: "Outdated cipher suite is negotiable.",
      recommendation: "Disable TLS 1.0/1.1 and weak ciphers.",
    },
    {
      title: "Cookies missing Secure flag",
      severity: "medium",
      description: "Some cookies are sent over plaintext channels.",
      recommendation: "Mark all cookies as Secure and HttpOnly.",
    },
    {
      title: "Open admin panel detected",
      severity: "critical",
      description: "/admin endpoint responds without auth gate.",
      recommendation: "Restrict admin access by IP and add MFA.",
    },
    {
      title: "Outdated jQuery version",
      severity: "medium",
      description: "Detected jQuery 1.x with known XSS CVEs.",
      recommendation: "Upgrade to latest jQuery 3.x.",
    },
    {
      title: "Missing Content-Security-Policy",
      severity: "high",
      description: "No CSP defined; vulnerable to XSS injection.",
      recommendation: "Define a strict CSP whitelist.",
    },
    {
      title: "Directory listing enabled",
      severity: "high",
      description: "Server exposes file listing on directories.",
      recommendation: "Disable directory indexing in server config.",
    },
  ];
  const vulnerabilities = vulnPool.filter(() => r() > 0.4).slice(0, 6);

  const responseTimeMs = 80 + Math.floor(r() * 600);

  return {
    url,
    domain,
    scannedAt: new Date().toISOString(),
    score,
    riskLevel,
    basic: {
      name: domain.split(".")[0].replace(/^\w/, (s) => s.toUpperCase()),
      ip,
      ipv6,
      hostname: domain,
      country: c[0],
      city: c[1],
      isp,
      hostingProvider: isp,
      asn: `AS${1000 + Math.floor(r() * 60000)}`,
      lat: c[2],
      lng: c[3],
      status: r() > 0.05 ? "Online" : "Offline",
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
    },
    domain_info: {
      registrar: pick(r, registrars),
      creationDate: `${createdYear}-${String(1 + Math.floor(r() * 12)).padStart(2, "0")}-15`,
      expirationDate: `${expYear}-06-21`,
      updatedDate: `2025-${String(1 + Math.floor(r() * 12)).padStart(2, "0")}-09`,
      ageYears,
      status: "clientTransferProhibited",
      owner: r() > 0.5 ? "Redacted for Privacy" : `${domain} Holdings Ltd.`,
    },
    dns: [
      { type: "A", value: ip },
      { type: "AAAA", value: ipv6 },
      { type: "MX", value: `10 mail.${domain}` },
      { type: "TXT", value: `v=spf1 include:_spf.${isp.toLowerCase().split(" ")[0]}.com ~all` },
      { type: "NS", value: `ns1.${isp.toLowerCase().split(" ")[0]}.com` },
      { type: "NS", value: `ns2.${isp.toLowerCase().split(" ")[0]}.com` },
      { type: "CNAME", value: `www.${domain} → ${domain}` },
      { type: "SOA", value: `ns1.${domain}. admin.${domain}.` },
    ],
    ssl: {
      available: true,
      valid: r() > 0.1,
      issuer: pick(r, ["Let's Encrypt", "DigiCert Inc", "Sectigo", "GlobalSign", "Cloudflare Inc"]),
      algorithm: "ECDSA-SHA256",
      version: "v3",
      expiry: `2026-${String(1 + Math.floor(r() * 12)).padStart(2, "0")}-22`,
      daysRemaining: 30 + Math.floor(r() * 300),
      selfSigned: false,
      trusted: r() > 0.1,
      tls: pick(r, ["TLS 1.3", "TLS 1.2"]),
    },
    server: {
      webServer: pick(r, ["nginx/1.25.3", "Apache/2.4.58", "LiteSpeed", "Cloudflare"]),
      os: pick(r, ["Linux (Ubuntu)", "Linux (Debian)", "Linux (CentOS)", "FreeBSD"]),
      backend: pick(r, ["Node.js", "PHP 8.2", "Python 3.11", "Go 1.22"]),
      framework: pick(r, ["Next.js", "Laravel", "Django", "Express", "Rails"]),
      reverseProxy: pick(r, ["Cloudflare", "Nginx", "Envoy", "HAProxy"]),
      cdn: pick(r, ["Cloudflare", "Fastly", "Akamai", "CloudFront"]),
      cache: pick(r, ["Redis", "Varnish", "Memcached"]),
      cloud: pick(r, ["AWS", "GCP", "Azure", "Hetzner"]),
    },
    technologies,
    http: {
      status: 200,
      redirects: [`http://${domain}`, `https://${domain}`],
      finalUrl: url,
      responseTimeMs,
      headersCount: 14 + Math.floor(r() * 10),
      cookiesCount: Math.floor(r() * 12),
      compression: "br",
      caching: "public, max-age=3600",
    },
    securityHeaders,
    cookies: {
      total: 3 + Math.floor(r() * 10),
      secure: 2 + Math.floor(r() * 8),
      httpOnly: 2 + Math.floor(r() * 6),
      sameSite: 2 + Math.floor(r() * 6),
      thirdParty: Math.floor(r() * 5),
      avgExpiryDays: 30 + Math.floor(r() * 300),
    },
    ports,
    vulnerabilities,
    reputation: {
      https: true,
      blacklist: r() > 0.1 ? "Clean" : "Listed",
      suspicious: Math.floor(r() * 3),
      sslTrust: r() > 0.1,
      score: Math.min(100, score + Math.floor(r() * 10)),
    },
    seo: {
      title: `${domain} — Official Website`,
      description: `${domain} provides services and information for its visitors and customers worldwide.`,
      keywords: `${domain}, services, official`,
      canonical: url,
      robots: r() > 0.1,
      sitemap: r() > 0.2,
      og: r() > 0.3,
      twitter: r() > 0.3,
    },
    performance: {
      responseTimeMs,
      pageSizeKb: 200 + Math.floor(r() * 2500),
      compression: r() > 0.2,
      caching: r() > 0.2,
      imageOpt: r() > 0.4,
      lazyLoading: r() > 0.4,
      score: 40 + Math.floor(r() * 55),
    },
    recommendations: [
      "Enable HTTPS site-wide and redirect all HTTP traffic",
      "Add a strict Content-Security-Policy header",
      "Enable HSTS with includeSubDomains and preload",
      "Hide server version banner",
      "Set Secure, HttpOnly and SameSite=Strict on all cookies",
      "Close non-essential open ports (FTP, Redis, MySQL)",
      "Upgrade outdated JavaScript libraries",
      "Add X-Frame-Options: DENY or use CSP frame-ancestors",
    ],
  };
}

export const POPULAR_DOMAINS = [
  "github.com",
  "vercel.com",
  "stripe.com",
  "openai.com",
  "cloudflare.com",
  "wikipedia.org",
];
