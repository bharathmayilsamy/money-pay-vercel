import { useMemo } from "react";
import { useStore, formatINR, formatDate, daysUntil } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Wallet, AlertTriangle, Building2, TrendingUp, Activity } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#06b6d4"];

export default function DashboardPage() {
  const { tenants, payments, dues, expenses, properties, activityLogs, agreements } = useStore();

  const activeTenants = tenants.filter((t) => t.status === "Active").length;
  const pendingDuesTotal = dues.filter((d) => d.status === "Pending").reduce((s, d) => s + d.amount, 0);
  const vacantFlats = properties.flatMap((p) => p.flats).filter((f) => f.status === "Vacant").length;

  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthCollection = payments
    .filter((p) => p.date.startsWith(thisMonth))
    .reduce((s, p) => s + p.amount, 0);

  // Monthly collection trend (last 6 months)
  const monthlyData = useMemo(() => {
    const months: { month: string; collection: number; expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      const col = payments.filter((p) => p.date.startsWith(key)).reduce((s, p) => s + p.amount, 0);
      const exp = expenses.filter((e) => e.date.startsWith(key)).reduce((s, e) => s + e.amount, 0);
      months.push({ month: label, collection: col, expense: exp });
    }
    return months;
  }, [payments, expenses]);

  // Dues by category
  const duesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    dues.filter((d) => d.status === "Pending").forEach((d) => {
      map[d.category] = (map[d.category] || 0) + d.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [dues]);

  // Upcoming dues (next 7 days)
  const upcomingDues = dues
    .filter((d) => d.status === "Pending" && daysUntil(d.dueDate) <= 7 && daysUntil(d.dueDate) >= 0)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  // Agreement expiry alerts (next 30 days)
  const expiringAgreements = agreements
    .filter((a) => daysUntil(a.endDate) <= 30 && daysUntil(a.endDate) >= 0)
    .map((a) => ({ ...a, tenant: tenants.find((t) => t.id === a.tenantId) }));

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Tenants</p>
                <p className="text-3xl font-bold text-foreground mt-1" data-testid="stat-active-tenants">{activeTenants}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-green-600 mt-1" data-testid="stat-collection">{formatINR(thisMonthCollection)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Dues</p>
                <p className="text-2xl font-bold text-red-500 mt-1" data-testid="stat-dues">{formatINR(pendingDuesTotal)}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vacant Flats</p>
                <p className="text-3xl font-bold text-orange-500 mt-1" data-testid="stat-vacant">{vacantFlats}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Collection trend */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Monthly Collection vs Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatINR(v)} />
                <Legend />
                <Bar dataKey="collection" fill="#6366f1" name="Collection" radius={[3, 3, 0, 0]} />
                <Bar dataKey="expense" fill="#f87171" name="Expense" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Dues by category */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Dues Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {duesByCategory.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">No pending dues</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={duesByCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {duesByCategory.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatINR(v)} />
                  <Legend iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Activity */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Upcoming dues */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Upcoming Dues (Next 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDues.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No dues in next 7 days</p>
            ) : (
              <div className="space-y-2">
                {upcomingDues.map((due) => {
                  const tenant = tenants.find((t) => t.id === due.tenantId);
                  const days = daysUntil(due.dueDate);
                  return (
                    <div key={due.id} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{tenant?.name}</p>
                        <p className="text-xs text-muted-foreground">{due.category} — {formatDate(due.dueDate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-500">{formatINR(due.amount)}</p>
                        <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">
                          {days === 0 ? "Today" : `${days}d left`}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Agreement expiry + Recent activity */}
        <div className="space-y-4">
          {expiringAgreements.length > 0 && (
            <Card className="border-0 shadow-sm border-l-4 border-l-orange-400">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-orange-600">Agreements Expiring Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {expiringAgreements.map((a) => (
                    <div key={a.id} className="flex items-center justify-between">
                      <p className="text-sm font-medium">{a.tenant?.name}</p>
                      <Badge variant="outline" className="text-orange-500 border-orange-300 text-xs">
                        {daysUntil(a.endDate)}d left
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activityLogs.slice(0, 6).map((log) => (
                  <div key={log.id} className="flex items-start gap-2 py-1 border-b last:border-0">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">{log.details}</p>
                      <p className="text-xs text-muted-foreground">{new Date(log.date).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
