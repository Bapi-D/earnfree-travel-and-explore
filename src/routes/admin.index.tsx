import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getFirestoreDashboardStats, getAnalyticsData } from "@/lib/firebase-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { LineChart, Line } from "recharts";
import { Package, MessageSquare, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => getFirestoreDashboardStats(),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: false,
  });

  if (isLoading || !data) {
    return (
      <div className="p-6 lg:p-10 space-y-8 animate-pulse">
        <div>
          <div className="h-10 w-48 rounded bg-muted" />
          <div className="mt-3 h-4 w-80 max-w-full rounded bg-muted/70" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-2xl bg-card border border-border p-5 shadow-soft">
              <div className="h-10 w-10 rounded-xl bg-muted" />
              <div className="mt-4 h-8 w-16 rounded bg-muted" />
              <div className="mt-2 h-3 w-20 rounded bg-muted/70" />
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-6 shadow-soft">
            <div className="h-5 w-40 rounded bg-muted" />
            <div className="mt-6 h-[280px] rounded-2xl bg-muted/40" />
          </div>
          <div className="rounded-2xl bg-card border border-border p-6 shadow-soft">
            <div className="h-5 w-32 rounded bg-muted" />
            <div className="mt-6 h-[280px] rounded-2xl bg-muted/40" />
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="h-5 w-40 rounded bg-muted" />
            <div className="h-3 w-16 rounded bg-muted/70" />
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="h-3 w-24 rounded bg-muted" />
                <div className="h-5 w-20 rounded-full bg-muted" />
                <div className="h-3 w-20 rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const total = data.enquiries.length;
  const solved = data.enquiries.filter((e) => e.status === "solved").length;
  const pending = data.enquiries.filter((e) => e.status === "pending").length;
  const bypassed = data.enquiries.filter(
    (e) => e.status === "admin_review" || e.status === "bypassed",
  ).length;

  // Monthly chart
  const months: Record<string, number> = {};
  data.enquiries.forEach((e) => {
    const m = new Date(e.created_at).toLocaleString("en", { month: "short" });
    months[m] = (months[m] ?? 0) + 1;
  });
  const chartData = Object.entries(months).map(([month, leads]) => ({ month, leads }));

  // Staff pie
  const staffCounts = [1, 2, 3].map((n) => ({
    name: `Staff ${n}`,
    value: data.enquiries.filter((e) => e.assigned_staff_number === n).length,
  }));
  const COLORS = ["oklch(0.55 0.21 27)", "oklch(0.78 0.17 70)", "oklch(0.45 0.15 270)"];

  const recent = data.enquiries.slice(0, 8);

  const { data: analytics } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => getAnalyticsData(),
    staleTime: 30 * 1000,
    retry: false,
  });

  const analyticsDaily = analytics?.daily ?? [];
  const totalVisitors = analytics?.totalVisitors ?? 0;
  const totalEnquiries = analytics?.totalEnquiries ?? total;
  const deviceCounts = analytics?.deviceCounts ?? {};
  const deviceData = Object.entries(deviceCounts).map(([name, value]) => ({ name, value }));
  const returningCount = analytics?.returningCount ?? 0;
  const newCount = analytics?.newCount ?? Math.max(0, totalVisitors - returningCount);
  const conversionRate = analytics?.conversionRate ?? (totalVisitors > 0 ? Math.round((totalEnquiries / totalVisitors) * 100) : 0);

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-charcoal">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of leads, packages and team performance.
        </p>
      </div>

      {/* Analytics stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsKPI label="Total Visitors" value={totalVisitors} color="from-indigo-500 to-violet-600" icon={() => <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M12 12a5 5 0 100-10 5 5 0 000 10z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
        <AnalyticsKPI label="Total Enquiries" value={totalEnquiries} color="from-emerald-500 to-emerald-600" icon={() => <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 10l5 5 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
        <AnalyticsKPI label="Conversion Rate" value={conversionRate} color="from-fuchsia-500 to-pink-600" icon={() => <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M12 2v10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 12l7 7 7-7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
        <div />
      </div>

      {/* Existing KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI
          icon={MessageSquare}
          label="Total Leads"
          value={total}
          color="from-primary to-[oklch(0.62_0.21_30)]"
        />
        <KPI
          icon={CheckCircle2}
          label="Solved"
          value={solved}
          color="from-emerald-500 to-emerald-600"
        />
        <KPI icon={Clock} label="Pending" value={pending} color="from-gold to-orange-500" />
        <KPI
          icon={Package}
          label="Packages"
          value={data.packageCount}
          color="from-charcoal to-slate-700"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-6 shadow-soft backdrop-blur-sm bg-white/5">
          <h3 className="font-display font-bold text-lg mb-4">Visitors & Enquiries (This month)</h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={analyticsDaily.length ? analyticsDaily : chartData.map((c, idx) => ({ date: `Day ${idx + 1}`, visitors: 0, enquiries: c.leads }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.005 270)" />
              <XAxis dataKey={analyticsDaily.length ? 'date' : 'date'} stroke="oklch(0.45 0.01 270)" fontSize={12} />
              <YAxis stroke="oklch(0.45 0.01 270)" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="visitors" stroke="#7c3aed" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="enquiries" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl bg-card border border-border p-6 shadow-soft">
          <h3 className="font-display font-bold text-lg mb-4">Visitors breakdown</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="h-36">
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={deviceData.length ? deviceData : [{ name: 'unknown', value: totalVisitors }]} dataKey="value" nameKey="name" innerRadius={30} outerRadius={60} paddingAngle={3}>
                    {(deviceData.length ? deviceData : [{ name: 'unknown', value: totalVisitors }]).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
            </ResponsiveContainer>
            </div>
            <div className="h-36">
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={[{ name: 'Returning', value: returningCount }, { name: 'New', value: newCount }]} dataKey="value" nameKey="name" innerRadius={24} outerRadius={50} paddingAngle={3}>
                    <Cell fill="oklch(0.55 0.21 27)" />
                    <Cell fill="oklch(0.10 0.80 140)" />
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-display font-bold text-lg">Recent enquiries</h3>
          <span className="text-xs text-muted-foreground">Last {recent.length}</span>
        </div>
        <div className="divide-y divide-border">
          {recent.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              No enquiries yet.
            </div>
          )}
          {recent.map((e) => (
            <div key={e.id} className="px-6 py-3 flex items-center justify-between text-sm">
              <span className="font-mono text-xs text-muted-foreground">{e.id.slice(0, 8)}</span>
              <span className="text-charcoal">{e.customer_name || e.email || "Unknown customer"}</span>
              <span className="text-muted-foreground">{e.phone || "No phone provided"}</span>
              <StatusBadge status={e.status} />
              <span className="text-xs text-muted-foreground">
                {new Date(e.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Counter({ value }: { value: number }) {
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = v;
    const to = value;
    // respect reduce motion cookie or user preference
    let reduce = false;
    try {
      const m = document.cookie.match('(^|;)\\s*' + 'earnfree_reduce_motion' + '\\s*=\\s*([^;]+)');
      if (m) reduce = m[2] === '1';
      if (!m && window.matchMedia) reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {}
    const duration = reduce ? 0 : 800;
    function step(now: number) {
      const t = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = Math.round(from + (to - from) * eased);
      setV(cur);
      if (t < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <div className="mt-3 text-3xl font-display font-bold text-charcoal">{v}</div>;
}

function AnalyticsKPI({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: any }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-soft relative overflow-hidden transform transition-all hover:scale-[1.02] hover:shadow-elevated">
      <div className={`absolute -top-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br ${color} opacity-30 blur-3xl`} />
      <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${color} text-white shadow-elegant`}>{Icon()}</div>
      <Counter value={value} />
      <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}

function KPI({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-soft relative overflow-hidden">
      <div
        className={`absolute -top-6 -right-6 h-20 w-20 rounded-full bg-gradient-to-br ${color} opacity-20 blur-2xl`}
      />
      <div
        className={`inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br ${color} text-white shadow-elegant`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-3 text-3xl font-display font-bold text-charcoal">{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}
