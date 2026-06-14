import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getFirestoreDashboardStats, getAnalyticsData, getFirestoreAdminPackages, getFirestoreAdminDestinations } from "@/lib/firebase-data";
import {
  LineChart,
  Line,
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
import { Search, TrendingUp } from "lucide-react";
import { DashboardPackageCard } from "@/components/admin/DashboardPackageCard";
import { CalendarWidget } from "@/components/admin/CalendarWidget";
import { UpcomingTripsWidget } from "@/components/admin/UpcomingTripsWidget";
import { TopDestinationsWidget } from "@/components/admin/TopDestinationsWidget";
import { RecentActivityWidget } from "@/components/admin/RecentActivityWidget";
import { BookingHistoryTable } from "@/components/admin/BookingHistoryTable";

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

  const { data: packages = [] } = useQuery({
    queryKey: ["admin-packages-dashboard"],
    queryFn: () => getFirestoreAdminPackages(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const { data: destinations = [] } = useQuery({
    queryKey: ["admin-destinations-dashboard"],
    queryFn: () => getFirestoreAdminDestinations(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const { data: analytics } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => getAnalyticsData(),
    staleTime: 30 * 1000,
    retry: false,
  });

  if (isLoading || !data) {
    return (
      <div className="p-6 lg:p-10 space-y-8 animate-pulse">
        <div className="h-12 w-48 rounded-xl bg-muted" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="h-80 rounded-2xl bg-muted" />
      </div>
    );
  }

  // Prepare data for widgets
  const analyticsDaily = analytics?.daily ?? [];
  const totalVisitors = analytics?.totalVisitors ?? 0;
  const totalEnquiries = analytics?.totalEnquiries ?? data.enquiries.length;
  const conversionRate = analytics?.conversionRate ?? (totalVisitors > 0 ? Math.round((totalEnquiries / totalVisitors) * 100) : 0);

  // Transform packages for dashboard cards
  const dashboardPackages = packages.slice(0, 4).map((pkg) => ({
    id: pkg.id,
    title: pkg.title,
    location: pkg.location,
    image: pkg.image_url,
    price: pkg.price,
    rating: pkg.rating || 4.7,
    duration: pkg.duration || "N/A",
  }));

  // Transform destinations for top destinations widget
  const topDestinationsData = destinations.slice(0, 3).map((dest, idx) => ({
    id: dest.id,
    name: dest.name || dest.title || "Unknown",
    bookings: Math.floor(Math.random() * 100) + 50,
    trend: Math.floor(Math.random() * 30) + 10,
    image: dest.image_url || "",
  }));

  // Transform enquiries for upcoming trips
  const upcomingTrips = data.enquiries
    .filter((e) => e.travel_date)
    .sort((a, b) => (a.travel_date || "").localeCompare(b.travel_date || ""))
    .slice(0, 3)
    .map((e) => ({
      id: e.id,
      destination: e.destination,
      date: e.travel_date || new Date().toISOString(),
      image: packages.find((p) => p.location === e.destination)?.image_url || "",
    }));

  // Recent activity
  const recentActivities = data.enquiries.slice(0, 5).map((e) => ({
    id: e.id,
    user: e.customer_name || "Unknown",
    action: "submitted enquiry for",
    subject: e.destination,
    timestamp: e.created_at,
  }));

  // Booking history
  const bookingHistory = data.enquiries.slice(0, 5).map((e) => ({
    id: e.id,
    bookingId: e.id.slice(0, 8).toUpperCase(),
    date: e.created_at,
    duration: "5N / 6D",
    amount: 12500,
    status: e.status === "solved" ? "completed" : e.status === "pending" ? "pending" : "in_progress",
    location: e.destination,
  }));

  // Revenue data for chart
  const months: Record<string, number> = {};
  data.enquiries.forEach((e) => {
    const m = new Date(e.created_at).toLocaleString("en", { month: "short" });
    months[m] = (months[m] ?? 0) + 1;
  });
  const revenueData = Object.entries(months).map(([month, leads]) => ({
    month,
    revenue: leads * 12500,
  }));

  // Trip overview data
  const tripOverviewData = [
    { name: "Completed", value: data.enquiries.filter((e) => e.status === "solved").length },
    { name: "In Progress", value: data.enquiries.filter((e) => e.status === "pending").length },
    { name: "Pending", value: data.enquiries.filter((e) => e.status === "admin_review").length },
  ];
  const COLORS = ["oklch(0.55 0.21 27)", "oklch(0.78 0.17 70)", "oklch(0.45 0.15 270)"];

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-linear-to-b from-secondary/20 to-transparent min-h-screen">
      {/* Header with search */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-charcoal">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Travel Packages, Enquiries and Team Performance
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-white border border-border rounded-xl px-4 py-2.5 shadow-soft">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search packages..."
            className="bg-transparent text-sm outline-none flex-1 text-charcoal placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Top KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Visitors"
          value={totalVisitors}
          color="from-indigo-500 to-violet-600"
          icon="👥"
        />
        <StatCard
          label="Total Enquiries"
          value={totalEnquiries}
          color="from-emerald-500 to-emerald-600"
          icon="📧"
        />
        <StatCard
          label="Conversion Rate"
          value={`${conversionRate}%`}
          color="from-fuchsia-500 to-pink-600"
          icon="📈"
        />
        <StatCard
          label="Total Packages"
          value={data.packageCount}
          color="from-charcoal to-slate-700"
          icon="✈️"
        />
      </div>

      {/* Travel Packages Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold text-charcoal">Travel Packages</h2>
          <button className="text-sm text-primary font-bold hover:underline">View All</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardPackages.map((pkg) => (
            <DashboardPackageCard key={pkg.id} {...pkg} />
          ))}
        </div>
      </div>

      {/* Calendar and Upcoming Trips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CalendarWidget />
        <UpcomingTripsWidget trips={upcomingTrips} />
      </div>

      {/* Trip Overview and Top Destinations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white border border-border shadow-soft p-6">
          <h3 className="font-display font-bold text-lg text-charcoal mb-6">Trip Overview</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={tripOverviewData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {tripOverviewData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <TopDestinationsWidget destinations={topDestinationsData} />
      </div>

      {/* Revenue Overview */}
      <div className="rounded-2xl bg-white border border-border shadow-soft p-6">
        <h3 className="font-display font-bold text-lg text-charcoal mb-6">Revenue Overview</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={revenueData.length ? revenueData : analyticsDaily}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.005 270)" />
            <XAxis dataKey="month" stroke="oklch(0.45 0.01 270)" fontSize={12} />
            <YAxis stroke="oklch(0.45 0.01 270)" fontSize={12} />
            <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="oklch(0.55 0.21 27)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Booking History */}
      <BookingHistoryTable bookings={bookingHistory} />

      {/* Recent Activity */}
      <RecentActivityWidget activities={recentActivities} />
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  color: string;
  icon: string;
}) {
  return (
    <div className={`rounded-2xl bg-linear-to-br ${color} text-white p-6 shadow-soft relative overflow-hidden`}>
      <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      <div className="relative">
        <span className="text-3xl">{icon}</span>
        <p className="text-xs text-white/70 uppercase tracking-widest mt-2">{label}</p>
        <p className="text-3xl font-display font-bold mt-2">{value}</p>
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
      <div className={`absolute -top-6 -right-6 h-24 w-24 rounded-full bg-linear-to-br ${color} opacity-30 blur-3xl`} />
      <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-linear-to-br ${color} text-white shadow-elegant`}>{Icon()}</div>
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
        className={`absolute -top-6 -right-6 h-20 w-20 rounded-full bg-linear-to-br ${color} opacity-20 blur-2xl`}
      />
      <div
        className={`inline-flex items-center justify-center h-10 w-10 rounded-xl bg-linear-to-br ${color} text-white shadow-elegant`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-3 text-3xl font-display font-bold text-charcoal">{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}
