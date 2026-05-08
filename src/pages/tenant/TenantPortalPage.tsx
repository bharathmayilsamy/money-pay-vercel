import { useState } from "react";
import { useLocation } from "wouter";
import { useStore, genId, formatINR, formatDate, daysUntil, type MaintenanceRequest } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Building2, LogOut, Home, CreditCard, Wrench, Megaphone, FileText, QrCode, Phone, User, CalendarDays, IndianRupee } from "lucide-react";

const MAINT_CATEGORIES = ["Plumbing", "Electrical", "Carpentry", "AC / Cooling", "Pest Control", "Cleaning", "Internet", "Other"];

export default function TenantPortalPage() {
  const [, setLocation] = useLocation();
  const { currentUserPhone, tenants, properties, dues, payments, maintenanceRequests, notices, agreements, addMaintenanceRequest, updateDue, addLog, logout } = useStore();
  const { toast } = useToast();

  const tenant = tenants.find((t) => t.phone === currentUserPhone);
  const allFlats = properties.flatMap((p) => p.flats);
  const flat = allFlats.find((f) => f.id === tenant?.flatId);
  const property = properties.find((p) => p.id === tenant?.propertyId);
  const tenantDues = dues.filter((d) => d.tenantId === tenant?.id && d.status === "Pending");
  const tenantPayments = payments.filter((p) => p.tenantId === tenant?.id);
  const tenantMaint = maintenanceRequests.filter((r) => r.tenantId === tenant?.id);
  const tenantAgreement = agreements.find((a) => a.tenantId === tenant?.id);
  const today = new Date().toISOString().split("T")[0];
  const activeNotices = notices.filter((n) => n.expiryDate >= today);
  const totalDue = tenantDues.reduce((s, d) => s + d.amount, 0);

  const [upiOpen, setUpiOpen] = useState(false);
  const [upiApp, setUpiApp] = useState("");
  const [customUpi, setCustomUpi] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [maintOpen, setMaintOpen] = useState(false);
  const [maintForm, setMaintForm] = useState({ category: "Plumbing", description: "", priority: "Medium" as MaintenanceRequest["priority"] });

  function handleLogout() {
    logout();
    setLocation("/");
  }

  function openUpiPayment(app: string) {
    setUpiApp(app);
    setPayAmount(totalDue.toString());
    setUpiOpen(true);
  }

  function processUpiPayment() {
    const upiId = customUpi || "owner@okhdfcbank";
    window.open(`upi://pay?pa=${upiId}&pn=MoneyPay&am=${payAmount}&cu=INR&tn=Rent`, "_blank");
    toast({ title: "UPI App Opened", description: "Complete payment in your UPI app" });
    setUpiOpen(false);
  }

  function submitMaintenance() {
    if (!tenant || !maintForm.description) { toast({ title: "Error", description: "Describe the issue", variant: "destructive" }); return; }
    addMaintenanceRequest({ id: genId(), tenantId: tenant.id, category: maintForm.category, description: maintForm.description, priority: maintForm.priority, status: "Open", dateRaised: new Date().toISOString().split("T")[0] });
    addLog("Maintenance Request", `${maintForm.category} request from ${tenant.name}`);
    toast({ title: "Request Submitted", description: "Owner has been notified" });
    setMaintOpen(false);
    setMaintForm({ category: "Plumbing", description: "", priority: "Medium" });
  }

  function priorityBadge(p: string) {
    if (p === "High") return "border-red-300 text-red-700 bg-red-50";
    if (p === "Medium") return "border-orange-300 text-orange-700 bg-orange-50";
    return "border-blue-300 text-blue-700 bg-blue-50";
  }

  function statusBadge(s: string) {
    if (s === "Resolved") return "border-green-300 text-green-700 bg-green-50";
    if (s === "In Progress") return "border-yellow-300 text-yellow-700 bg-yellow-50";
    return "border-gray-300 text-gray-700 bg-gray-50";
  }

  if (!tenant) {
    return <div className="flex items-center justify-center h-screen"><p>Tenant not found. Please login again.</p></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-indigo-700">Tenant Portal</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <User className="w-4 h-4" /> {tenant.name}
            </span>
            <Button size="sm" variant="ghost" className="text-red-500 gap-1" onClick={handleLogout} data-testid="button-tenant-logout">
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-start gap-4">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-7 h-7 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold">{tenant.name}</h2>
                <div className="flex flex-wrap gap-4 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {tenant.phone}</span>
                  <span className="flex items-center gap-1"><Home className="w-3.5 h-3.5" /> {flat?.name || "Not assigned"}</span>
                  {property && <span className="text-xs">{property.name}</span>}
                </div>
                <div className="flex flex-wrap gap-4 mt-2 text-sm">
                  <span><span className="text-muted-foreground">Rent:</span> <strong className="text-indigo-600">{formatINR(flat?.rent || tenant.rent)}/mo</strong></span>
                  <span><span className="text-muted-foreground">Deposit:</span> <strong>{formatINR(tenant.deposit)}</strong></span>
                  {tenant.agreementEndDate && (
                    <span><span className="text-muted-foreground">Agreement ends:</span> <strong>{formatDate(tenant.agreementEndDate)}</strong></span>
                  )}
                </div>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center flex-shrink-0">
                <p className="text-xs text-muted-foreground">Total Dues</p>
                <p className="text-2xl font-bold text-red-500">{formatINR(totalDue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Card className="border-0 shadow-lg">
          <Tabs defaultValue="dues">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto overflow-x-auto">
              {[
                { value: "dues", label: "My Dues", icon: <IndianRupee className="w-3.5 h-3.5" /> },
                { value: "payments", label: "History", icon: <CreditCard className="w-3.5 h-3.5" /> },
                { value: "maintenance", label: "Maintenance", icon: <Wrench className="w-3.5 h-3.5" /> },
                { value: "notices", label: "Notices", icon: <Megaphone className="w-3.5 h-3.5" /> },
                { value: "agreement", label: "Agreement", icon: <FileText className="w-3.5 h-3.5" /> },
                { value: "joining", label: "Joining Form", icon: <FileText className="w-3.5 h-3.5" /> },
              ].map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-4 py-3 gap-1.5 text-xs whitespace-nowrap">
                  {t.icon} {t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Dues Tab */}
            <TabsContent value="dues" className="p-5 m-0">
              <h3 className="font-semibold text-lg mb-4">Pending Dues</h3>
              {tenantDues.length === 0 ? (
                <div className="text-center py-10 text-green-600 font-medium">No pending dues! You are all clear.</div>
              ) : (
                <div className="space-y-3">
                  {tenantDues.map((due) => (
                    <div key={due.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-xl">
                      <div>
                        <p className="font-medium">{due.category}</p>
                        <p className="text-xs text-muted-foreground">Due: {formatDate(due.dueDate)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-red-500">{formatINR(due.amount)}</span>
                        <Button size="sm" onClick={() => openUpiPayment("UPI")} className="gap-1" data-testid={`button-pay-due-${due.id}`}>
                          <QrCode className="w-3.5 h-3.5" /> Pay
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Payment History Tab */}
            <TabsContent value="payments" className="p-5 m-0">
              <h3 className="font-semibold text-lg mb-4">Payment History</h3>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50"><TableHead>Date</TableHead><TableHead>Category</TableHead><TableHead>Amount</TableHead><TableHead>Remark</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {tenantPayments.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No payments recorded yet</TableCell></TableRow>}
                  {[...tenantPayments].reverse().map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-sm">{formatDate(p.date)}</TableCell>
                      <TableCell className="text-sm">{p.category}</TableCell>
                      <TableCell className="text-sm font-bold text-green-600">{formatINR(p.amount)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.remark || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Maintenance Tab */}
            <TabsContent value="maintenance" className="p-5 m-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Maintenance Requests</h3>
                <Button size="sm" onClick={() => setMaintOpen(true)} className="gap-1" data-testid="button-raise-maintenance">
                  <Wrench className="w-3.5 h-3.5" /> Raise Request
                </Button>
              </div>
              {tenantMaint.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No maintenance requests yet</p>
              ) : (
                <div className="space-y-3">
                  {[...tenantMaint].reverse().map((req) => (
                    <div key={req.id} className="border rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{req.category}</p>
                            <Badge variant="outline" className={`text-xs ${priorityBadge(req.priority)}`}>{req.priority}</Badge>
                            <Badge variant="outline" className={`text-xs ${statusBadge(req.status)}`}>{req.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{req.description}</p>
                          {req.adminNote && <p className="text-xs text-indigo-600 mt-1">Admin: {req.adminNote}</p>}
                          <p className="text-xs text-muted-foreground mt-1">Raised: {formatDate(req.dateRaised)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Notices Tab */}
            <TabsContent value="notices" className="p-5 m-0">
              <h3 className="font-semibold text-lg mb-4">Notices from Owner</h3>
              {activeNotices.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No active notices</p>
              ) : (
                <div className="space-y-3">
                  {activeNotices.map((n) => (
                    <Card key={n.id} className={`border-l-4 ${n.priority === "Urgent" ? "border-l-red-500" : n.priority === "Important" ? "border-l-orange-400" : "border-l-blue-400"}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{n.title}</h4>
                          <Badge variant="outline" className={`text-xs ${n.priority === "Urgent" ? "border-red-300 text-red-700" : n.priority === "Important" ? "border-orange-300 text-orange-700" : "border-blue-300 text-blue-700"}`}>{n.priority}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{n.content}</p>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" /> Expires: {formatDate(n.expiryDate)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Agreement Tab */}
            <TabsContent value="agreement" className="p-5 m-0">
              <h3 className="font-semibold text-lg mb-4">My Agreement</h3>
              {!tenantAgreement ? (
                <p className="text-center py-8 text-muted-foreground">No agreement on record</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Start Date", formatDate(tenantAgreement.startDate)],
                    ["End Date", formatDate(tenantAgreement.endDate)],
                    ["Period", `${tenantAgreement.periodMonths} months`],
                    ["Lock-In", `${tenantAgreement.lockInMonths} months`],
                    ["Monthly Rent", formatINR(tenantAgreement.rentAmount)],
                    ["Security Deposit", formatINR(tenantAgreement.deposit)],
                    ["Days Remaining", (() => { const d = daysUntil(tenantAgreement.endDate); return d < 0 ? `Expired ${Math.abs(d)} days ago` : `${d} days left`; })()],
                    ["Status", (() => { const d = daysUntil(tenantAgreement.endDate); return d < 0 ? "Expired" : d <= 30 ? "Expiring Soon" : "Active"; })()],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-muted/40 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="font-medium text-sm mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Joining Form Tab */}
            <TabsContent value="joining" className="p-5 m-0">
              <h3 className="font-semibold text-lg mb-4">My Joining Form</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Full Name", tenant.name], ["Phone", tenant.phone], ["Email", tenant.email],
                  ["Aadhaar", tenant.aadhaar], ["Gender", tenant.gender], ["Date of Birth", formatDate(tenant.dob)],
                  ["Occupation", tenant.occupation], ["Vehicle No", tenant.vehicleNo],
                  ["Flat", flat?.name], ["Property", property?.name],
                  ["Monthly Rent", formatINR(flat?.rent || tenant.rent)], ["Security Deposit", formatINR(tenant.deposit)],
                  ["Move-In Date", formatDate(tenant.moveInDate)], ["Agreement End", formatDate(tenant.agreementEndDate)],
                  ["Emergency Contact", tenant.emergencyContact], ["Govt ID", tenant.govtId],
                  ["Current Address", tenant.currentAddress], ["Permanent Address", tenant.permanentAddress],
                ].map(([label, value]) => (
                  <div key={label} className="border rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-medium text-sm mt-0.5">{value || "-"}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Payment Options */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <QrCode className="w-4 h-4 text-indigo-600" /> Make a Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[
                { name: "Google Pay", color: "text-blue-600" },
                { name: "PhonePe", color: "text-purple-600" },
                { name: "Paytm", color: "text-blue-500" },
                { name: "Amazon Pay", color: "text-orange-500" },
              ].map((app) => (
                <button
                  key={app.name}
                  onClick={() => openUpiPayment(app.name)}
                  className="border rounded-xl p-3 text-center hover:shadow-md transition-all hover:bg-gray-50"
                  data-testid={`button-pay-${app.name.toLowerCase().replace(" ", "-")}`}
                >
                  <CreditCard className={`w-6 h-6 mx-auto mb-1 ${app.color}`} />
                  <p className="text-xs font-medium">{app.name}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Enter UPI ID (e.g. name@bank)" value={customUpi} onChange={(e) => setCustomUpi(e.target.value)} data-testid="input-custom-upi" />
              <Button onClick={() => { if (customUpi) openUpiPayment("Custom"); }} variant="outline" className="flex-shrink-0">
                Pay Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* UPI Modal */}
      <Dialog open={upiOpen} onOpenChange={setUpiOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>UPI Payment — {upiApp}</DialogTitle></DialogHeader>
          <div className="text-center p-4 bg-muted rounded-xl mb-4">
            <QrCode className="w-16 h-16 mx-auto text-muted-foreground" />
            <p className="mt-2 text-sm">Pay to: <strong>{customUpi || "owner@okhdfcbank"}</strong></p>
          </div>
          <div className="space-y-3">
            <div><Label>Amount (₹)</Label><Input type="number" className="mt-1" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpiOpen(false)}>Cancel</Button>
            <Button onClick={processUpiPayment} className="bg-green-600 hover:bg-green-700">Open UPI App</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Maintenance Modal */}
      <Dialog open={maintOpen} onOpenChange={setMaintOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Raise Maintenance Request</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Category</Label>
              <Select value={maintForm.category} onValueChange={(v) => setMaintForm({ ...maintForm, category: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{MAINT_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Priority</Label>
              <Select value={maintForm.priority} onValueChange={(v) => setMaintForm({ ...maintForm, priority: v as any })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Describe the Issue *</Label><Textarea className="mt-1" rows={3} value={maintForm.description} onChange={(e) => setMaintForm({ ...maintForm, description: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMaintOpen(false)}>Cancel</Button>
            <Button onClick={submitMaintenance}><Wrench className="w-4 h-4 mr-2" /> Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
