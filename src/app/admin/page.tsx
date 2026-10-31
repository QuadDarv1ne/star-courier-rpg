"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Lock, Shield, ArrowLeft, Globe, Monitor, Smartphone, Activity, Users, MapPin, Clock, RefreshCw, LogOut, Eye, Cpu, Wifi } from "lucide-react";

const ADMIN_TOKEN = "star-courier-admin-2025";
const STORAGE_KEY = "sc-admin-token";

interface AnalyticsData {
  total: number;
  uniqueIps: number;
  uniqueSessions: number;
  avgSessionEvents: number;
  browsers: { browser: string; _count: number }[];
  oss: { os: string; _count: number }[];
  devices: { device: string; _count: number }[];
  countries: { country: string; _count: number }[];
  cities: { city: string; _count: number }[];
  ips: { ip: string; _count: number }[];
  recentEvents: any[];
  actions: { action: string; _count: number }[];
  hourlyActivity: { hour: string; count: number }[];
  gpuStats: { gpu: string; count: number }[];
  cpuStats: { cpu: string; count: number }[];
  memStats: { mem: string; count: number }[];
  connStats: { conn: string; count: number }[];
  ispStats: { isp: string; count: number }[];
  platformStats: { platform: string; count: number }[];
  orientationStats: { orientation: string; count: number }[];
  referrerStats: { referrer: string; count: number }[];
  timezones: { timezone: string; _count: number }[];
  languages: { language: string; _count: number }[];
  screenResolutions: { screenRes: string; _count: number }[];
  geoStats: { country: string; cities: { city: string; count: number }[] }[];
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "devices" | "hardware" | "geo" | "events" | "ips">("overview");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_KEY) : null;
    if (saved === ADMIN_TOKEN) {
      setAuthed(true);
      fetchData(saved);
    }
  }, []);

  const fetchData = useCallback(async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics", { headers: { authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_TOKEN) {
      sessionStorage.setItem(STORAGE_KEY, password);
      setAuthed(true);
      fetchData(password);
    } else {
      setError("Неверный пароль");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setAuthed(false);
    setData(null);
  };

  // Login form
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md panel-glow clip-corner p-8"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-rose-700 flex items-center justify-center" style={{ boxShadow: "0 0 30px oklch(0.62 0.22 22 / 40%)" }}>
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-amber-100 mb-2 font-mono">Admin Panel</h1>
          <p className="text-sm text-foreground/60 text-center mb-6">Star Courier · Analytics Dashboard</p>
          <form onSubmit={handleLogin} className="space-y-3">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/50" />
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Пароль администратора"
                className="w-full pl-10 pr-4 py-3 bg-zinc-900/60 border border-amber-400/30 rounded-lg text-foreground placeholder:text-foreground/40 focus:border-amber-400/70 focus:outline-none clip-corner"
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-rose-400 text-center">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-amber-500/90 hover:bg-amber-400 text-zinc-950 font-semibold uppercase tracking-wider clip-corner glow-primary transition-all"
            >
              Войти
            </button>
          </form>
          <a href="/" className="block mt-4 text-center text-xs text-foreground/40 hover:text-foreground">
            ← Назад на сайт
          </a>
        </motion.div>
      </div>
    );
  }

  // Loading state
  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-amber-400 animate-pulse text-lg font-mono">Загрузка аналитики...</div>
      </div>
    );
  }

  const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) => (
    <div className="panel clip-corner p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={color}>{icon}</span>
        <span className="text-xs uppercase tracking-wider text-foreground/50 font-mono">{label}</span>
      </div>
      <div className="text-2xl font-bold text-foreground font-mono">{value}</div>
    </div>
  );

  const BarRow = ({ label, count, max }: { label: string; count: number; max: number }) => (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs text-foreground/70 w-32 truncate font-mono">{label || "—"}</span>
      <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400" style={{ width: `${max > 0 ? (count / max) * 100 : 0}%` }} />
      </div>
      <span className="text-xs font-mono text-amber-300 w-10 text-right">{count}</span>
    </div>
  );

  const maxBrowser = Math.max(...data.browsers.map(b => b._count), 1);
  const maxOs = Math.max(...data.oss.map(o => o._count), 1);
  const maxDevice = Math.max(...data.devices.map(d => d._count), 1);
  const maxCountry = Math.max(...data.countries.map(c => c._count), 1);
  const maxCity = Math.max(...data.cities.map(c => c._count), 1);
  const maxIp = Math.max(...data.ips.map(i => i._count), 1);

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-amber-400/15 panel backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-amber-400" />
          <h1 className="text-sm font-mono uppercase tracking-wider text-amber-300/80">Star Courier · Analytics</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchData(ADMIN_TOKEN)} className="text-foreground/60 hover:text-amber-300 p-1.5" title="Обновить">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={handleLogout} className="text-rose-400/70 hover:text-rose-400 p-1.5" title="Выйти">
            <LogOut className="w-4 h-4" />
          </button>
          <a href="/" className="text-foreground/60 hover:text-foreground p-1.5" title="На сайт">
            <ArrowLeft className="w-4 h-4" />
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 flex-wrap">
          {([["overview","Обзор"], ["devices","Устройства"], ["hardware","Железо"], ["geo","Гео"], ["events","События"], ["ips","IP-адреса"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider font-mono clip-corner border transition-all ${
                activeTab === key ? "bg-amber-500 text-zinc-950 border-amber-500 font-semibold" : "bg-zinc-900/40 border-amber-400/20 hover:border-amber-400/50 text-foreground/60"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <StatCard icon={<Activity className="w-4 h-4" />} label="Всего событий" value={data.total} color="text-amber-400" />
              <StatCard icon={<Users className="w-4 h-4" />} label="Уникальных IP" value={data.uniqueIps} color="text-emerald-400" />
              <StatCard icon={<Eye className="w-4 h-4" />} label="Сессий" value={data.uniqueSessions} color="text-sky-400" />
              <StatCard icon={<Clock className="w-4 h-4" />} label="За 24 часа" value={data.hourlyActivity.reduce((s, h) => s + h.count, 0)} color="text-rose-400" />
              <StatCard icon={<Activity className="w-4 h-4" />} label="Ср. событий/сессия" value={data.avgSessionEvents || 0} color="text-amber-400" />
            </div>

            {/* Hourly activity */}
            <div className="panel clip-corner p-4">
              <h3 className="text-xs uppercase tracking-wider text-amber-300/70 font-mono mb-3">Активность за 24 часа</h3>
              <div className="flex items-end gap-1 h-32">
                {data.hourlyActivity.map(({ hour, count }) => {
                  const maxH = Math.max(...data.hourlyActivity.map(h => h.count), 1);
                  return (
                    <div key={hour} className="flex-1 flex flex-col items-center gap-1" title={`${hour}: ${count}`}>
                      <div className="w-full bg-amber-500/60 rounded-t" style={{ height: `${(count / maxH) * 100}%`, minHeight: "2px" }} />
                      <span className="text-[8px] text-foreground/30 -rotate-45 origin-left">{hour.slice(11, 13)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Timezones */}
              <div className="panel clip-corner p-4">
                <div className="flex items-center gap-2 mb-3"><Globe className="w-4 h-4 text-amber-400" /><h3 className="text-xs uppercase tracking-wider text-amber-300/70 font-mono">Часовые пояса</h3></div>
                {data.timezones?.map((tz) => <BarRow key={tz.timezone} label={tz.timezone} count={tz._count} max={Math.max(...data.timezones.map((t: any) => t._count), 1)} />) || <p className="text-xs text-foreground/40 italic">Нет данных</p>}
              </div>
              {/* Languages */}
              <div className="panel clip-corner p-4">
                <div className="flex items-center gap-2 mb-3"><Globe className="w-4 h-4 text-emerald-400" /><h3 className="text-xs uppercase tracking-wider text-amber-300/70 font-mono">Языки</h3></div>
                {data.languages?.map((lang) => <BarRow key={lang.language} label={lang.language} count={lang._count} max={Math.max(...data.languages.map((l: any) => l._count), 1)} />) || <p className="text-xs text-foreground/40 italic">Нет данных</p>}
              </div>
              {/* Screen resolutions */}
              <div className="panel clip-corner p-4">
                <div className="flex items-center gap-2 mb-3"><Monitor className="w-4 h-4 text-sky-400" /><h3 className="text-xs uppercase tracking-wider text-amber-300/70 font-mono">Разрешения экранов</h3></div>
                {data.screenResolutions?.map((sr) => <BarRow key={sr.screenRes} label={sr.screenRes} count={sr._count} max={Math.max(...data.screenResolutions.map((s: any) => s._count), 1)} />) || <p className="text-xs text-foreground/40 italic">Нет данных</p>}
              </div>
            </div>

            {/* Referrers */}
            {data.referrerStats && data.referrerStats.length > 0 && (
              <div className="panel clip-corner p-4">
                <div className="flex items-center gap-2 mb-3"><Activity className="w-4 h-4 text-amber-400" /><h3 className="text-xs uppercase tracking-wider text-amber-300/70 font-mono">Источники трафика (Referrers)</h3></div>
                {data.referrerStats.map((r) => <BarRow key={r.referrer} label={r.referrer} count={r.count} max={Math.max(...data.referrerStats.map(x => x.count), 1)} />)}
              </div>
            )}

            {/* Actions */}
            <div className="panel clip-corner p-4">
              <h3 className="text-xs uppercase tracking-wider text-amber-300/70 font-mono mb-3">Типы действий</h3>
              {data.actions.map(a => <BarRow key={a.action} label={a.action} count={a._count} max={Math.max(...data.actions.map(x => x._count), 1)} />)}
            </div>
          </div>
        )}

        {/* Devices tab */}
        {activeTab === "devices" && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="panel clip-corner p-4">
                <div className="flex items-center gap-2 mb-3"><Monitor className="w-4 h-4 text-amber-400" /><h3 className="text-xs uppercase tracking-wider text-amber-300/70 font-mono">Браузеры</h3></div>
                {data.browsers.map(b => <BarRow key={b.browser} label={b.browser} count={b._count} max={maxBrowser} />)}
              </div>
              <div className="panel clip-corner p-4">
                <div className="flex items-center gap-2 mb-3"><Monitor className="w-4 h-4 text-emerald-400" /><h3 className="text-xs uppercase tracking-wider text-amber-300/70 font-mono">ОС</h3></div>
                {data.oss.map(o => <BarRow key={o.os} label={o.os} count={o._count} max={maxOs} />)}
              </div>
              <div className="panel clip-corner p-4">
                <div className="flex items-center gap-2 mb-3"><Smartphone className="w-4 h-4 text-sky-400" /><h3 className="text-xs uppercase tracking-wider text-amber-300/70 font-mono">Устройства</h3></div>
                {data.devices.map(d => <BarRow key={d.device} label={d.device} count={d._count} max={maxDevice} />)}
              </div>
            </div>
            {/* Device details from metadata */}
            <div className="panel clip-corner p-4">
              <h3 className="text-xs uppercase tracking-wider text-amber-300/70 font-mono mb-3">Детали устройства (из последних событий)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-foreground/50 border-b border-amber-400/15">
                      <th className="py-2 px-2">Платформа</th>
                      <th className="py-2 px-2">Vendor</th>
                      <th className="py-2 px-2">CPU cores</th>
                      <th className="py-2 px-2">RAM</th>
                      <th className="py-2 px-2">GPU</th>
                      <th className="py-2 px-2">Тач</th>
                      <th className="py-2 px-2">Ориентация</th>
                      <th className="py-2 px-2">Color depth</th>
                      <th className="py-2 px-2">Pixel ratio</th>
                      <th className="py-2 px-2">Cookies</th>
                      <th className="py-2 px-2">DNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentEvents.filter((e: any) => e.platform || e.cpuCores || e.gpu).slice(0, 30).map((e: any) => (
                      <tr key={e.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/30">
                        <td className="py-1.5 px-2 font-mono text-amber-300/70">{e.platform || "—"}</td>
                        <td className="py-1.5 px-2">{e.vendor || "—"}</td>
                        <td className="py-1.5 px-2 text-foreground/70">{e.cpuCores || "—"}</td>
                        <td className="py-1.5 px-2 text-foreground/70">{e.deviceMemory ? `${e.deviceMemory} GB` : "—"}</td>
                        <td className="py-1.5 px-2 text-foreground/70 max-w-32 truncate" title={e.gpu}>{e.gpu || "—"}</td>
                        <td className="py-1.5 px-2">{e.hasTouch ? `✓ (${e.touchPoints})` : "—"}</td>
                        <td className="py-1.5 px-2">{e.orientation || "—"}</td>
                        <td className="py-1.5 px-2">{e.colorDepth ? `${e.colorDepth}-bit` : "—"}</td>
                        <td className="py-1.5 px-2">{e.pixelRatio || "—"}</td>
                        <td className="py-1.5 px-2">{e.cookiesEnabled ? "✓" : "✗"}</td>
                        <td className="py-1.5 px-2">{e.dnt === "1" ? "✓" : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Hardware tab */}
        {activeTab === "hardware" && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="panel clip-corner p-4">
                <div className="flex items-center gap-2 mb-3"><Cpu className="w-4 h-4 text-amber-400" /><h3 className="text-xs uppercase tracking-wider text-amber-300/70 font-mono">GPU (видеокарты)</h3></div>
                {data.gpuStats?.length > 0 ? data.gpuStats.map((g, i) => <BarRow key={i} label={g.gpu?.slice(0, 40)} count={g.count} max={Math.max(...data.gpuStats.map(x => x.count), 1)} />) : <p className="text-xs text-foreground/40 italic">Нет данных</p>}
              </div>
              <div className="panel clip-corner p-4">
                <div className="flex items-center gap-2 mb-3"><Cpu className="w-4 h-4 text-emerald-400" /><h3 className="text-xs uppercase tracking-wider text-amber-300/70 font-mono">CPU cores</h3></div>
                {data.cpuStats?.length > 0 ? data.cpuStats.map((c, i) => <BarRow key={i} label={c.cpu} count={c.count} max={Math.max(...data.cpuStats.map(x => x.count), 1)} />) : <p className="text-xs text-foreground/40 italic">Нет данных</p>}
              </div>
              <div className="panel clip-corner p-4">
                <div className="flex items-center gap-2 mb-3"><Cpu className="w-4 h-4 text-sky-400" /><h3 className="text-xs uppercase tracking-wider text-amber-300/70 font-mono">Оперативная память</h3></div>
                {data.memStats?.length > 0 ? data.memStats.map((m, i) => <BarRow key={i} label={m.mem} count={m.count} max={Math.max(...data.memStats.map(x => x.count), 1)} />) : <p className="text-xs text-foreground/40 italic">Нет данных</p>}
              </div>
              <div className="panel clip-corner p-4">
                <div className="flex items-center gap-2 mb-3"><Wifi className="w-4 h-4 text-rose-400" /><h3 className="text-xs uppercase tracking-wider text-amber-300/70 font-mono">Тип соединения</h3></div>
                {data.connStats?.length > 0 ? data.connStats.map((c, i) => <BarRow key={i} label={c.conn} count={c.count} max={Math.max(...data.connStats.map(x => x.count), 1)} />) : <p className="text-xs text-foreground/40 italic">Нет данных</p>}
              </div>
            </div>
            {/* Battery + connection details */}
            <div className="panel clip-corner p-4">
              <h3 className="text-xs uppercase tracking-wider text-amber-300/70 font-mono mb-3">Батарея и соединение (детали)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-foreground/50 border-b border-amber-400/15">
                      <th className="py-2 px-2">Время</th>
                      <th className="py-2 px-2">IP</th>
                      <th className="py-2 px-2">Батарея</th>
                      <th className="py-2 px-2">Зарядка</th>
                      <th className="py-2 px-2">Тип сети</th>
                      <th className="py-2 px-2">Downlink</th>
                      <th className="py-2 px-2">RTT</th>
                      <th className="py-2 px-2">Save-Data</th>
                      <th className="py-2 px-2">Тёмная тема</th>
                      <th className="py-2 px-2">Reduced motion</th>
                      <th className="py-2 px-2">PDF viewer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentEvents.filter((e: any) => e.battery || e.connection).slice(0, 30).map((e: any) => (
                      <tr key={e.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/30">
                        <td className="py-1.5 px-2 font-mono text-foreground/50 whitespace-nowrap">{new Date(e.createdAt).toLocaleTimeString()}</td>
                        <td className="py-1.5 px-2 font-mono text-amber-300/70">{e.ip}</td>
                        <td className="py-1.5 px-2">{e.battery ? `${e.battery.level}%` : "—"}</td>
                        <td className="py-1.5 px-2">{e.battery ? (e.battery.charging ? "⚡" : "🔋") : "—"}</td>
                        <td className="py-1.5 px-2 text-foreground/70">{e.connection?.type || "—"}</td>
                        <td className="py-1.5 px-2 text-foreground/70">{e.connection?.downlink ? `${e.connection.downlink} Mbps` : "—"}</td>
                        <td className="py-1.5 px-2 text-foreground/70">{e.connection?.rtt ? `${e.connection.rtt}ms` : "—"}</td>
                        <td className="py-1.5 px-2">{e.connection?.saveData ? "✓" : "—"}</td>
                        <td className="py-1.5 px-2">{e.prefersDark ? "🌙" : "☀"}</td>
                        <td className="py-1.5 px-2">{e.prefersReducedMotion ? "✓" : "—"}</td>
                        <td className="py-1.5 px-2">{e.pdfViewer ? "✓" : "✗"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Geo tab */}
        {activeTab === "geo" && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="panel clip-corner p-4">
              <div className="flex items-center gap-2 mb-3"><Globe className="w-4 h-4 text-amber-400" /><h3 className="text-xs uppercase tracking-wider text-amber-300/70 font-mono">Страны</h3></div>
              {data.countries.map(c => <BarRow key={c.country} label={c.country} count={c._count} max={maxCountry} />)}
            </div>
            <div className="panel clip-corner p-4">
              <div className="flex items-center gap-2 mb-3"><MapPin className="w-4 h-4 text-emerald-400" /><h3 className="text-xs uppercase tracking-wider text-amber-300/70 font-mono">Города</h3></div>
              {data.cities.map(c => <BarRow key={c.city} label={c.city} count={c._count} max={maxCity} />)}
            </div>
          </div>
        )}

        {/* Events tab */}
        {activeTab === "events" && (
          <div className="panel clip-corner p-4">
            <h3 className="text-xs uppercase tracking-wider text-amber-300/70 font-mono mb-3">Последние 50 событий</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-foreground/50 border-b border-amber-400/15">
                    <th className="py-2 px-2">Время</th>
                    <th className="py-2 px-2">IP</th>
                    <th className="py-2 px-2">Браузер</th>
                    <th className="py-2 px-2">ОС</th>
                    <th className="py-2 px-2">Устр.</th>
                    <th className="py-2 px-2">Страна</th>
                    <th className="py-2 px-2">Город</th>
                    <th className="py-2 px-2">Действие</th>
                    <th className="py-2 px-2">Путь</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentEvents.map((e: any) => (
                    <tr key={e.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/30">
                      <td className="py-1.5 px-2 font-mono text-foreground/50 whitespace-nowrap">{new Date(e.createdAt).toLocaleString()}</td>
                      <td className="py-1.5 px-2 font-mono text-amber-300/70">{e.ip}</td>
                      <td className="py-1.5 px-2">{e.browser}</td>
                      <td className="py-1.5 px-2">{e.os}</td>
                      <td className="py-1.5 px-2">{e.device}</td>
                      <td className="py-1.5 px-2">{e.country || "—"}</td>
                      <td className="py-1.5 px-2">{e.city || "—"}</td>
                      <td className="py-1.5 px-2 text-amber-300">{e.action}</td>
                      <td className="py-1.5 px-2 font-mono text-foreground/40">{e.path}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* IPs tab */}
        {activeTab === "ips" && (
          <div className="panel clip-corner p-4">
            <h3 className="text-xs uppercase tracking-wider text-amber-300/70 font-mono mb-3">IP-адреса (топ 50)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-foreground/50 border-b border-amber-400/15">
                    <th className="py-2 px-2">IP</th>
                    <th className="py-2 px-2">Событий</th>
                    <th className="py-2 px-2">Доля</th>
                  </tr>
                </thead>
                <tbody>
                  {data.ips.map((ip: any) => (
                    <tr key={ip.ip} className="border-b border-zinc-800/40 hover:bg-zinc-800/30">
                      <td className="py-1.5 px-2 font-mono text-amber-300/70">{ip.ip}</td>
                      <td className="py-1.5 px-2 text-foreground/70">{ip._count}</td>
                      <td className="py-1.5 px-2 text-foreground/40">{((ip._count / data.total) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
