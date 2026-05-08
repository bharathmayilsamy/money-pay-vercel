import { useStore, formatINR } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FileSpreadsheet, Users, Receipt, Wallet, FileText, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import * as XLSX from "xlsx";

export default function ReportsPage() {
  const { tenants, payments, expenses, dues, properties, agreements } = useStore();
  const { toast } = useToast();

  const totalCollections = payments.reduce((s, p) => s + p.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalCollections - totalExpenses;
  const pendingDues = dues.filter((d) => d.status === "Pending").reduce((s, d) => s + d.amount, 0);
  const activeTenants = tenants.filter((t) => t.status === "Active").length;
  const allFlats = properties.flatMap((p) => p.flats);
  const vacantFlats = allFlats.filter((f) => f.status === "Vacant").length;

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

  function downloadXLSX(data: Record<string, unknown>[], filename: string) {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${filename}.xlsx`);
    toast({ title: "Downloaded", description: `${filename}.xlsx saved` });
  }

  function downloadDuesReport() {
    const data = dues.map((d) => {
      const t = tenants.find((tn) => tn.id === d.tenantId);
      return { Tenant: t?.name, Phone: t?.phone, Category: d.category, Amount: d.amount, DueDate: d.dueDate, Status: d.status };
    });
    downloadXLSX(data, "Dues_Report");
  }

  function downloadCollectionReport() {
    const data = payments.map((p) => {
      const t = tenants.find((tn) => tn.id === p.tenantId);
      return { Tenant: t?.name, Phone: t?.phone, Category: p.category, Amount: p.amount, Date: p.date, Remark: p.remark };
    });
    downloadXLSX(data, "Collection_Report");
  }

  function downloadExpenseReport() {
    const data = expenses.map((e) => ({
      Description: e.description, Category: e.category, Amount: e.amount, Date: e.date, Remark: e.remark,
    }));
    downloadXLSX(data, "Expense_Report");
  }

  function downloadTenantList() {
    const allFlatsMap = Object.fromEntries(allFlats.map((f) => [f.id, f]));
    const propMap = Object.fromEntries(properties.map((p) => [p.id, p]));
    const data = tenants.map((t) => ({
      Name: t.name, Phone: t.phone, Email: t.email,
      Flat: allFlatsMap[t.flatId]?.name || "",
      Property: propMap[t.propertyId]?.name || "",
      Rent: t.rent, Deposit: t.deposit,
      JoiningDate: t.joiningDate, AgreementEnd: t.agreementEndDate,
      Status: t.status, KYC: t.kycStatus, Occupation: t.occupation,
    }));
    downloadXLSX(data, "Tenant_List");
  }

  function downloadAgreementReport() {
    const data = agreements.map((a) => {
      const t = tenants.find((tn) => tn.id === a.tenantId);
      const days = Math.ceil((new Date(a.endDate).getTime() - Date.now()) / 86400000);
      const status = days < 0 ? "Expired" : days <= 30 ? "Expiring Soon" : "Active";
      return { Tenant: t?.name, Phone: t?.phone, StartDate: a.startDate, EndDate: a.endDate, Period: `${a.periodMonths} months`, LockIn: `${a.lockInMonths} months`, Rent: a.rentAmount, Deposit: a.deposit, Status: status };
    });
    downloadXLSX(data, "Agreement_Report");
  }

  const reports = [
    { label: "Dues Report", desc: "All pending & paid dues", icon: <FileText className="w-5 h-5 text-red-500" />, bg: "bg-red-50", action: downloadDuesReport, testId: "button-download-dues" },
    { label: "Collection Report", desc: "All rent collections", icon: <Receipt className="w-5 h-5 text-green-600" />, bg: "bg-green-50", action: downloadCollectionReport, testId: "button-download-collections" },
    { label: "Expense Report", desc: "All property expenses", icon: <Wallet className="w-5 h-5 text-orange-500" />, bg: "bg-orange-50", action: downloadExpenseReport, testId: "button-download-expenses" },
    { label: "Tenant List", desc: "Complete tenant data", icon: <Users className="w-5 h-5 text-indigo-600" />, bg: "bg-indigo-50", action: downloadTenantList, testId: "button-download-tenants" },
    { label: "Agreement Report", desc: "Agreement status & expiry", icon: <FileText className="w-5 h-5 text-purple-600" />, bg: "bg-purple-50", action: downloadAgreementReport, testId: "button-download-agreements" },
  ];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Collections", value: formatINR(totalCollections), color: "text-green-600" },
          { label: "Total Expenses", value: formatINR(totalExpenses), color: "text-red-500" },
          { label: "Net Profit", value: formatINR(netProfit), color: "text-indigo-600" },
          { label: "Pending Dues", value: formatINR(pendingDues), color: "text-orange-500" },
          { label: "Active Tenants", value: activeTenants.toString(), color: "text-foreground" },
          { label: "Vacant Flats", value: vacantFlats.toString(), color: "text-orange-500" },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" /> Monthly Financial Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatINR(v)} />
              <Legend />
              <Bar dataKey="collection" fill="#6366f1" name="Collection" radius={[3, 3, 0, 0]} />
              <Bar dataKey="expense" fill="#f87171" name="Expense" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Downloads */}
      <div>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-indigo-600" /> Download Reports (Excel)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {reports.map((r) => (
            <button
              key={r.label}
              onClick={r.action}
              data-testid={r.testId}
              className={`${r.bg} border rounded-xl p-4 text-left hover:shadow-md transition-all flex items-center gap-3 cursor-pointer`}
            >
              <div className="flex-shrink-0">{r.icon}</div>
              <div>
                <p className="font-semibold text-sm">{r.label}</p>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </div>
              <FileSpreadsheet className="w-4 h-4 ml-auto text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
