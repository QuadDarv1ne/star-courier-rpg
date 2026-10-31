import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "star-courier-admin-2025";

// IP geolocation lookup — tries multiple providers
async function lookupIp(ip: string): Promise<{ country?: string; city?: string; region?: string; lat?: number; lon?: number; isp?: string; org?: string; asn?: string }> {
  if (!ip || ip === "unknown" || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("21.0.") || ip.startsWith("10.") || ip.startsWith("192.168.")) {
    return {};
  }
  try {
    // Try ipapi.co (free, no key)
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch(`https://ipapi.co/${ip}/json/`, { signal: ctrl.signal });
    clearTimeout(t);
    if (res.ok) {
      const d = await res.json();
      if (d && !d.error) {
        return {
          country: d.country_name || d.country || null,
          city: d.city || null,
          region: d.region || null,
          lat: d.latitude || null,
          lon: d.longitude || null,
          isp: d.org || null,
          org: d.org || null,
          asn: d.asn || null,
        };
      }
    }
  } catch {}
  // Fallback: ip-api.com
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon,isp,org,as`, { signal: ctrl.signal });
    clearTimeout(t);
    if (res.ok) {
      const d = await res.json();
      if (d && d.status === "success") {
        return {
          country: d.country || null,
          city: d.city || null,
          region: d.regionName || null,
          lat: d.lat || null,
          lon: d.lon || null,
          isp: d.isp || null,
          org: d.org || null,
          asn: d.as || null,
        };
      }
    }
  } catch {}
  return {};
}

// POST /api/analytics — collect comprehensive visitor data with server-side geo lookup
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, metadata, sessionId, path } = body;

    // IP extraction — check multiple headers
    const cfIp = req.headers.get("cf-connecting-ip");
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const ip = cfIp || forwarded?.split(",")[0]?.trim() || realIp || "unknown";

    const userAgent = req.headers.get("user-agent") || "unknown";

    // Parse browser + version
    let browser: string | null = null;
    let browserVer: string | null = null;
    if (userAgent !== "unknown") {
      if (userAgent.includes("Firefox/")) { browser = "Firefox"; browserVer = userAgent.match(/Firefox\/([\d.]+)/)?.[1] || null; }
      else if (userAgent.includes("Edg/")) { browser = "Edge"; browserVer = userAgent.match(/Edg\/([\d.]+)/)?.[1] || null; }
      else if (userAgent.includes("OPR/")) { browser = "Opera"; browserVer = userAgent.match(/OPR\/([\d.]+)/)?.[1] || null; }
      else if (userAgent.includes("Chrome/")) { browser = "Chrome"; browserVer = userAgent.match(/Chrome\/([\d.]+)/)?.[1] || null; }
      else if (userAgent.includes("Safari/") && !userAgent.includes("Chrome")) { browser = "Safari"; browserVer = userAgent.match(/Version\/([\d.]+)/)?.[1] || null; }
      else browser = "Other";
    }

    // Parse OS + version
    let os: string | null = null;
    let osVer: string | null = null;
    if (userAgent !== "unknown") {
      if (userAgent.includes("Windows NT 10")) { os = "Windows"; osVer = "10/11"; }
      else if (userAgent.includes("Windows NT 6.3")) { os = "Windows"; osVer = "8.1"; }
      else if (userAgent.includes("Windows NT 6.1")) { os = "Windows"; osVer = "7"; }
      else if (userAgent.includes("Windows NT")) { os = "Windows"; osVer = null; }
      else if (userAgent.includes("Mac OS X")) { os = "macOS"; osVer = userAgent.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, ".") || null; }
      else if (userAgent.includes("Android")) { os = "Android"; osVer = userAgent.match(/Android ([\d.]+)/)?.[1] || null; }
      else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) { os = "iOS"; osVer = userAgent.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, ".") || null; }
      else if (userAgent.includes("Linux")) { os = "Linux"; osVer = null; }
      else os = "Other";
    }

    // Parse device type
    let device: string | null = null;
    if (userAgent.includes("Mobile") || userAgent.includes("iPhone") || userAgent.includes("Android")) device = "Mobile";
    else if (userAgent.includes("iPad") || userAgent.includes("Tablet")) device = "Tablet";
    else device = "Desktop";

    // Server-side IP geolocation
    let geo = {};
    if (body.country || body.city) {
      // Client already provided geo data
      geo = {
        country: body.country || null,
        city: body.city || null,
        region: body.region || null,
        lat: body.lat || null,
        lon: body.lon || null,
      };
    } else {
      // Server-side lookup
      geo = await lookupIp(ip);
    }

    // Build comprehensive device info from client + server — enhanced with fingerprints
    const deviceInfo = {
      cpuCores: body.cpuCores || null,
      deviceMemory: body.deviceMemory || null,
      connection: body.connection || null,
      hasTouch: body.hasTouch ?? null,
      touchPoints: body.touchPoints || null,
      gpu: body.gpu || null,
      gpuVendor: body.gpuVendor || null,
      webglVersion: body.webglVersion || null,
      canvasFingerprint: body.canvasFingerprint || null,
      webglFingerprint: body.webglFingerprint || null,
      audioFingerprint: body.audioFingerprint || null,
      battery: body.battery || null,
      colorDepth: body.colorDepth || null,
      pixelRatio: body.pixelRatio || null,
      orientation: body.orientation || null,
      availScreen: body.availScreen || null,
      prefersDark: body.prefersDark ?? null,
      prefersReducedMotion: body.prefersReducedMotion ?? null,
      prefersContrast: body.prefersContrast ?? null,
      prefersForcedColors: body.prefersForcedColors ?? null,
      cookiesEnabled: body.cookiesEnabled ?? null,
      dnt: body.dnt || null,
      pdfViewer: body.pdfViewer ?? null,
      platform: body.platform || null,
      vendor: body.vendor || null,
      languages: body.languages || null,
      browserVer,
      osVer,
      isp: (geo as any).isp || null,
      org: (geo as any).org || null,
      asn: (geo as any).asn || null,
      referrer: body.referrer || req.headers.get("referer") || null,
      hdrSupported: body.hdrSupported ?? null,
      wideGamut: body.wideGamut ?? null,
      storageEstimate: body.storageEstimate || null,
      onlineStatus: body.onlineStatus ?? null,
      isMobile: body.isMobile ?? null,
    };

    const event = await db.analyticsEvent.create({
      data: {
        sessionId: sessionId || "unknown",
        ip, userAgent, browser, os, device,
        country: (geo as any).country || null,
        city: (geo as any).city || null,
        region: (geo as any).region || null,
        lat: (geo as any).lat || null,
        lon: (geo as any).lon || null,
        timezone: body.timezone || null,
        language: body.language || null,
        screenRes: body.screenRes || null,
        viewport: body.viewport || null,
        path: path || "/",
        action: action || "page_view",
        metadata: JSON.stringify({ ...deviceInfo, ...(metadata ? { custom: metadata } : {}) }),
      },
    });

    return NextResponse.json({ ok: true, id: event.id });
  } catch (e) {
    console.error("Analytics POST error:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// GET /api/analytics — admin only, returns comprehensive stats
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${ADMIN_TOKEN}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      total, browsers, oss, devices, countries, cities,
      recentEvents, ips, actions, timezones, languages, screenResolutions,
    ] = await Promise.all([
      db.analyticsEvent.count(),
      db.analyticsEvent.groupBy({ by: ["browser"], _count: true, orderBy: { _count: { browser: "desc" } } }),
      db.analyticsEvent.groupBy({ by: ["os"], _count: true, orderBy: { _count: { os: "desc" } } }),
      db.analyticsEvent.groupBy({ by: ["device"], _count: true, orderBy: { _count: { device: "desc" } } }),
      db.analyticsEvent.groupBy({ by: ["country"], _count: true, orderBy: { _count: { country: "desc" } }, take: 50 }),
      db.analyticsEvent.groupBy({ by: ["city"], _count: true, orderBy: { _count: { city: "desc" } }, take: 50 }),
      db.analyticsEvent.findMany({ take: 100, orderBy: { createdAt: "desc" } }),
      db.analyticsEvent.groupBy({ by: ["ip"], _count: true, orderBy: { _count: { ip: "desc" } }, take: 100 }),
      db.analyticsEvent.groupBy({ by: ["action"], _count: true, orderBy: { _count: { action: "desc" } } }),
      db.analyticsEvent.groupBy({ by: ["timezone"], _count: true, orderBy: { _count: { timezone: "desc" } }, take: 30 }),
      db.analyticsEvent.groupBy({ by: ["language"], _count: true, orderBy: { _count: { language: "desc" } }, take: 30 }),
      db.analyticsEvent.groupBy({ by: ["screenRes"], _count: true, orderBy: { _count: { screenRes: "desc" } }, take: 30 }),
    ]);

    const uniqueIps = await db.analyticsEvent.findMany({ select: { ip: true }, distinct: ["ip"] });
    const uniqueSessions = await db.analyticsEvent.findMany({ select: { sessionId: true }, distinct: ["sessionId"] });

    // Parse metadata from recent events for device details
    const recentWithMeta = recentEvents.map((e: any) => {
      let meta: any = null;
      try { meta = JSON.parse(e.metadata); } catch {}
      return {
        ...e,
        cpuCores: meta?.cpuCores, deviceMemory: meta?.deviceMemory, gpu: meta?.gpu,
        gpuVendor: meta?.gpuVendor, webglVersion: meta?.webglVersion,
        canvasFingerprint: meta?.canvasFingerprint, webglFingerprint: meta?.webglFingerprint,
        audioFingerprint: meta?.audioFingerprint,
        connection: meta?.connection, battery: meta?.battery,
        colorDepth: meta?.colorDepth, pixelRatio: meta?.pixelRatio,
        orientation: meta?.orientation, platform: meta?.platform, vendor: meta?.vendor,
        languages: meta?.languages, browserVer: meta?.browserVer, osVer: meta?.osVer,
        hasTouch: meta?.hasTouch, touchPoints: meta?.touchPoints,
        prefersDark: meta?.prefersDark, prefersReducedMotion: meta?.prefersReducedMotion,
        prefersContrast: meta?.prefersContrast, prefersForcedColors: meta?.prefersForcedColors,
        cookiesEnabled: meta?.cookiesEnabled, dnt: meta?.dnt, pdfViewer: meta?.pdfViewer,
        isp: meta?.isp, org: meta?.org, asn: meta?.asn, referrer: meta?.referrer,
        hdrSupported: meta?.hdrSupported, wideGamut: meta?.wideGamut,
        storageEstimate: meta?.storageEstimate, onlineStatus: meta?.onlineStatus,
        isMobile: meta?.isMobile, availScreen: meta?.availScreen,
      };
    });

    // Aggregate device stats from metadata
    const gpuStats: Record<string, number> = {};
    const cpuStats: Record<string, number> = {};
    const memStats: Record<string, number> = {};
    const connStats: Record<string, number> = {};
    const ispStats: Record<string, number> = {};
    const platformStats: Record<string, number> = {};
    const orientationStats: Record<string, number> = {};
    const referrerStats: Record<string, number> = {};

    recentEvents.forEach((e: any) => {
      try {
        const m = JSON.parse(e.metadata);
        if (m?.gpu) gpuStats[m.gpu] = (gpuStats[m.gpu] || 0) + 1;
        if (m?.cpuCores) cpuStats[`${m.cpuCores} cores`] = (cpuStats[`${m.cpuCores} cores`] || 0) + 1;
        if (m?.deviceMemory) memStats[`${m.deviceMemory} GB`] = (memStats[`${m.deviceMemory} GB`] || 0) + 1;
        if (m?.connection?.type) connStats[m.connection.type] = (connStats[m.connection.type] || 0) + 1;
        if (m?.isp) ispStats[m.isp] = (ispStats[m.isp] || 0) + 1;
        if (m?.platform) platformStats[m.platform] = (platformStats[m.platform] || 0) + 1;
        if (m?.orientation) orientationStats[m.orientation] = (orientationStats[m.orientation] || 0) + 1;
        if (m?.referrer) {
          try {
            const u = new URL(m.referrer);
            referrerStats[u.hostname] = (referrerStats[u.hostname] || 0) + 1;
          } catch {}
        }
      } catch {}
    });

    // Hourly activity for last 24h
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last24h = await db.analyticsEvent.findMany({
      where: { createdAt: { gte: dayAgo } },
      select: { createdAt: true },
    });
    const hourly: Record<string, number> = {};
    last24h.forEach((e) => {
      const h = new Date(e.createdAt).toISOString().slice(0, 13) + ":00";
      hourly[h] = (hourly[h] || 0) + 1;
    });

    // Country -> cities mapping
    const geoStats: Record<string, Record<string, number>> = {};
    recentEvents.forEach((e: any) => {
      if (e.country && e.city) {
        if (!geoStats[e.country]) geoStats[e.country] = {};
        geoStats[e.country][e.city] = (geoStats[e.country][e.city] || 0) + 1;
      }
    });

    // Session duration stats
    const sessionIds = uniqueSessions.map(s => s.sessionId);
    let avgSessionEvents = 0;
    if (sessionIds.length > 0) {
      const sessionCounts = await Promise.all(
        sessionIds.slice(0, 100).map(sid => db.analyticsEvent.count({ where: { sessionId: sid }}))
      );
      avgSessionEvents = sessionCounts.reduce((a, b) => a + b, 0) / Math.max(sessionCounts.length, 1);
    }

    return NextResponse.json({
      total, uniqueIps: uniqueIps.length, uniqueSessions: uniqueSessions.length,
      avgSessionEvents: Math.round(avgSessionEvents * 10) / 10,
      browsers, oss, devices, countries, cities, ips, actions,
      timezones, languages, screenResolutions,
      recentEvents: recentWithMeta,
      hourlyActivity: Object.entries(hourly).map(([hour, count]) => ({ hour, count })),
      gpuStats: Object.entries(gpuStats).map(([gpu, count]) => ({ gpu, count })).sort((a, b) => b.count - a.count),
      cpuStats: Object.entries(cpuStats).map(([cpu, count]) => ({ cpu, count })).sort((a, b) => b.count - a.count),
      memStats: Object.entries(memStats).map(([mem, count]) => ({ mem, count })).sort((a, b) => b.count - a.count),
      connStats: Object.entries(connStats).map(([conn, count]) => ({ conn, count })).sort((a, b) => b.count - a.count),
      ispStats: Object.entries(ispStats).map(([isp, count]) => ({ isp, count })).sort((a, b) => b.count - a.count).slice(0, 30),
      platformStats: Object.entries(platformStats).map(([platform, count]) => ({ platform, count })).sort((a, b) => b.count - a.count),
      orientationStats: Object.entries(orientationStats).map(([orientation, count]) => ({ orientation, count })).sort((a, b) => b.count - a.count),
      referrerStats: Object.entries(referrerStats).map(([referrer, count]) => ({ referrer, count })).sort((a, b) => b.count - a.count).slice(0, 20),
      geoStats: Object.entries(geoStats).map(([country, cities]) => ({ country, cities: Object.entries(cities).map(([city, count]) => ({ city, count })) })),
    });
  } catch (e) {
    console.error("Analytics GET error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
