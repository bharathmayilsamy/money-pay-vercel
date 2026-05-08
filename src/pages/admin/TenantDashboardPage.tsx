import { useState } from "react";
import { useStore, genId, formatINR, formatDate, daysUntil, type Tenant, type Due } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Search, MessageCircle, MoreHorizontal, UserMinus, Plus, Receipt, Eye, UserCheck2, HelpCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const DUE_CATEGORIES = ["Rent", "Electricity Bill", "Water Bill", "WiFi", "Maintenance", "Security Deposit", "Gas Bill", "Parking", "Late Fee", "Custom"];

export default function TenantDashboardPage() {
  const { tenants, dues, payments, properties, addDue, addPayment, updateTenant, updateFlat, addLog } = useStore();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [kycFilter, setKycFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [addDueOpen, setAddDueOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [evictOpen, setEvictOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const [dueForm, setDueForm] = useState({ category: "Rent", customCategory: "", amount: "", dueDate: new Date().toISOString().split("T")[0] });
  const [payForm, setPayForm] = useState({ amount: "", date: new Date().toISOString().split("T")[0], category: "Rent", remark: "" });

  const allFlats = properties.flatMap((p) => p.flats);
  const kycCreditsLeft = tenants.filter((t) => t.kycStatus !== "Verified").length;

  const filtered = tenants.filter((t) => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.phone.includes(search)) return false;
    if (propertyFilter !== "all" && t.propertyId !== propertyFilter) return false;
    if (kycFilter !== "all" && t.kycStatus !== kycFilter) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    return true;
  });

  function getTenantFlat(tenant: Tenant) {
    return allFlats.find((f) => f.id === tenant.flatId);
  }
  function getTenantProperty(tenant: Tenant) {
    return properties.find((p) => p.id === tenant.propertyId);
  }
  function getTenantDues(tenantId: string) {
    return dues.filter((d) => d.tenantId === tenantId && d.status === "Pending");
  }

  function openAddDue(t: Tenant) {
    setSelectedTenant(t);
    setDueForm({ category: "Rent", customCategory: "", amount: "", dueDate: new Date().toISOString().split("T")[0] });
    setAddDueOpen(true);
  }

  function submitDue() {
    if (!selectedTenant) return;
    const cat = dueForm.category === "Custom" ? dueForm.customCategory : dueForm.category;
    if (!cat || !dueForm.amount) { toast({ title: "Error", description: "Fill all fields", variant: "destructive" }); return; }
    addDue({ id: genId(), tenantId: selectedTenant.id, category: cat, amount: parseFloat(dueForm.amount), dueDate: dueForm.dueDate, status: "Pending" });
    addLog("Due Added", `${cat} ₹${dueForm.amount} added for ${selectedTenant.name}`);
    setAddDueOpen(false);
    toast({ title: "Due Added", description: `${cat} due added for ${selectedTenant.name}` });
  }

  function openPayment(t: Tenant) {
    setSelectedTenant(t);
    setPayForm({ amount: t.rent.toString(), date: new Date().toISOString().split("T")[0], category: "Rent", remark: "" });
    setPaymentOpen(true);
  }

  function submitPayment() {
    if (!selectedTenant || !payForm.amount) { toast({ title: "Error", description: "Enter amount", variant: "destructive" }); return; }
    addPayment({ id: genId(), tenantId: selectedTenant.id, amount: parseFloat(payForm.amount), date: payForm.date, category: payForm.category, remark: payForm.remark });
    addLog("Payment Recorded", `${formatINR(parseFloat(payForm.amount))} received from ${selectedTenant.name}`);
    setPaymentOpen(false);
    toast({ title: "Payment Recorded", description: `${formatINR(parseFloat(payForm.amount))} from ${selectedTenant.name}` });
  }

  function confirmEvict() {
    if (!selectedTenant) return;
    updateTenant(selectedTenant.id, { status: "Evicted" });
    // Vacate flat
    const flat = allFlats.find((f) => f.id === selectedTenant.flatId);
    if (flat) updateFlat(selectedTenant.propertyId, flat.id, { status: "Vacant", tenantId: undefined });
    addLog("Tenant Evicted", `${selectedTenant.name} evicted`);
    setEvictOpen(false);
    toast({ title: "Tenant Evicted", description: `${selectedTenant.name} has been evicted` });
  }

  function sendWhatsApp(phone: string, amount: number) {
    window.open(`https://wa.me/91${phone}?text=Reminder%3A%20Your%20rent%20payment%20of%20%E2%82%B9${amount}%20is%20due.%20Please%20pay%20on%20time.`, "_blank");
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" data-testid="input-search-tenants" />
        </div>
        <Select value={propertyFilter} onValueChange={setPropertyFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Properties" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {properties.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={kycFilter} onValueChange={setKycFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="KYC Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All KYC</SelectItem>
            <SelectItem value="Verified">Verified</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Evicted">Evicted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KYC Credits */}
      <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
        <div className="flex items-center gap-2 text-sm text-amber-700">
          <UserCheck2 className="w-4 h-4" />
          <span>KYC Credits Left: <strong>{kycCreditsLeft}</strong> tenants awaiting verification</span>
        </div>
        <div className="flex gap-2 text-xs text-muted-foreground items-center">
          <HelpCircle className="w-3.5 h-3.5" />
          Total: {tenants.length} tenants | Dues: {formatINR(dues.filter((d) => d.status === "Pending").reduce((s, d) => s + d.amount, 0))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead>Room / Property</TableHead>
                <TableHead>Rent</TableHead>
                <TableHead>Check-Out Date</TableHead>
                <TableHead>Dues</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No tenants found</TableCell>
                </TableRow>
              )}
              {filtered.map((t) => {
                const flat = getTenantFlat(t);
                const prop = getTenantProperty(t);
                const tenantDues = getTenantDues(t.id);
                const totalDue = tenantDues.reduce((s, d) => s + d.amount, 0);
                const days = t.agreementEndDate ? daysUntil(t.agreementEndDate) : null;
                return (
                  <TableRow key={t.id} data-testid={`row-tenant-${t.id}`} className={t.status === "Evicted" ? "opacity-50" : ""}>
                    <TableCell>
                      <div className="font-medium text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.phone}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{flat?.name || <span className="text-muted-foreground italic">Not assigned</span>}</div>
                      <div className="text-xs text-muted-foreground">{prop?.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-indigo-600">{formatINR(flat?.rent || 0)}</div>
                      <div className="text-xs text-muted-foreground">per month</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{t.agreementEndDate ? formatDate(t.agreementEndDate) : "-"}</div>
                      {days !== null && (
                        <div className={`text-xs ${days < 0 ? "text-red-500" : days <= 30 ? "text-orange-500" : "text-green-600"}`}>
                          {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-bold text-red-500">{formatINR(totalDue)}</div>
                      <div className="text-xs text-muted-foreground">{tenantDues.length} item(s)</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={t.kycStatus === "Verified" ? "border-green-300 text-green-600 bg-green-50" : "border-orange-300 text-orange-600 bg-orange-50"}
                      >
                        {t.kycStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => sendWhatsApp(t.phone, totalDue)}
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" data-testid={`button-actions-${t.id}`}>
                              <MoreHorizontal className="w-3.5 h-3.5" />
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => { setSelectedTenant(t); setProfileOpen(true); }}>
                              <Eye className="w-3.5 h-3.5 mr-2" /> View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openAddDue(t)}>
                              <Plus className="w-3.5 h-3.5 mr-2" /> Add Due
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openPayment(t)}>
                              <Receipt className="w-3.5 h-3.5 mr-2" /> Record Payment
                            </DropdownMenuItem>
                            {t.status === "Active" && (
                              <DropdownMenuItem className="text-red-600" onClick={() => { setSelectedTenant(t); setEvictOpen(true); }}>
                                <UserMinus className="w-3.5 h-3.5 mr-2" /> Evict Tenant
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Due Modal */}
      <Dialog open={addDueOpen} onOpenChange={setAddDueOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Due for {selectedTenant?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Category</Label>
              <Select value={dueForm.category} onValueChange={(v) => setDueForm({ ...dueForm, category: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{DUE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {dueForm.category === "Custom" && (
              <div>
                <Label>Custom Category Name</Label>
                <Input className="mt-1" value={dueForm.customCategory} onChange={(e) => setDueForm({ ...dueForm, customCategory: e.target.value })} />
              </div>
            )}
            <div>
              <Label>Amount (₹)</Label>
              <Input type="number" className="mt-1" value={dueForm.amount} onChange={(e) => setDueForm({ ...dueForm, amount: e.target.value })} />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" className="mt-1" value={dueForm.dueDate} onChange={(e) => setDueForm({ ...dueForm, dueDate: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDueOpen(false)}>Cancel</Button>
            <Button onClick={submitDue}>Add Due</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Modal */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Payment from {selectedTenant?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Amount (₹)</Label>
              <Input type="number" className="mt-1" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" className="mt-1" value={payForm.date} onChange={(e) => setPayForm({ ...payForm, date: e.target.value })} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={payForm.category} onValueChange={(v) => setPayForm({ ...payForm, category: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{DUE_CATEGORIES.filter((c) => c !== "Custom").map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Remark</Label>
              <Input className="mt-1" value={payForm.remark} onChange={(e) => setPayForm({ ...payForm, remark: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentOpen(false)}>Cancel</Button>
            <Button onClick={submitPayment}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Evict Confirmation */}
      <AlertDialog open={evictOpen} onOpenChange={setEvictOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Evict Tenant</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to evict {selectedTenant?.name}? This will vacate their flat.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmEvict}>Evict</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Profile Modal */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Tenant Profile — {selectedTenant?.name}</DialogTitle></DialogHeader>
          {selectedTenant && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Name", selectedTenant.name], ["Phone", selectedTenant.phone], ["Email", selectedTenant.email],
                ["Aadhaar", selectedTenant.aadhaar], ["Occupation", selectedTenant.occupation],
                ["Gender", selectedTenant.gender], ["DOB", formatDate(selectedTenant.dob)],
                ["Joining Date", formatDate(selectedTenant.joiningDate)], ["Move-In", formatDate(selectedTenant.moveInDate)],
                ["Agreement End", formatDate(selectedTenant.agreementEndDate)],
                ["Monthly Rent", formatINR(selectedTenant.rent)], ["Deposit", formatINR(selectedTenant.deposit)],
                ["KYC Status", selectedTenant.kycStatus], ["Status", selectedTenant.status],
                ["Vehicle No", selectedTenant.vehicleNo], ["Emergency Contact", selectedTenant.emergencyContact],
                ["Current Address", selectedTenant.currentAddress], ["Permanent Address", selectedTenant.permanentAddress],
              ].map(([label, value]) => (
                <div key={label} className="bg-muted/40 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-medium">{value || "-"}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
