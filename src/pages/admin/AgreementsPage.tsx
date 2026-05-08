import { useState } from "react";
import { useStore, genId, formatDate, formatINR, daysUntil, type Agreement } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, RefreshCw } from "lucide-react";

function agreementStatus(endDate: string) {
  const days = daysUntil(endDate);
  if (days < 0) return { label: "Expired", className: "bg-red-100 text-red-700 border-red-300" };
  if (days <= 30) return { label: `Expiring in ${days}d`, className: "bg-orange-100 text-orange-700 border-orange-300" };
  return { label: "Active", className: "bg-green-100 text-green-700 border-green-300" };
}

export default function AgreementsPage() {
  const { tenants, agreements, addAgreement, updateAgreement, addLog } = useStore();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  const [renewMonths, setRenewMonths] = useState("11");

  const [form, setForm] = useState({
    tenantId: "", startDate: new Date().toISOString().split("T")[0], periodMonths: "11", lockInMonths: "6", rentAmount: "", deposit: "",
  });

  function submit() {
    if (!form.tenantId || !form.rentAmount) { toast({ title: "Error", description: "Fill required fields", variant: "destructive" }); return; }
    const start = new Date(form.startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + parseInt(form.periodMonths));
    const endDate = end.toISOString().split("T")[0];
    addAgreement({ id: genId(), tenantId: form.tenantId, startDate: form.startDate, endDate, periodMonths: parseInt(form.periodMonths), lockInMonths: parseInt(form.lockInMonths), rentAmount: parseFloat(form.rentAmount), deposit: parseFloat(form.deposit) || 0 });
    const t = tenants.find((t) => t.id === form.tenantId);
    addLog("Agreement Created", `Agreement for ${t?.name} until ${formatDate(endDate)}`);
    toast({ title: "Agreement Created" });
    setOpen(false);
    setForm({ tenantId: "", startDate: new Date().toISOString().split("T")[0], periodMonths: "11", lockInMonths: "6", rentAmount: "", deposit: "" });
  }

  function renewAgreement() {
    if (!selectedAgreement) return;
    const newStart = selectedAgreement.endDate;
    const end = new Date(newStart);
    end.setMonth(end.getMonth() + parseInt(renewMonths));
    const newEnd = end.toISOString().split("T")[0];
    updateAgreement(selectedAgreement.id, { startDate: newStart, endDate: newEnd, periodMonths: parseInt(renewMonths) });
    const t = tenants.find((t) => t.id === selectedAgreement.tenantId);
    addLog("Agreement Renewed", `${t?.name} agreement renewed until ${formatDate(newEnd)}`);
    toast({ title: "Agreement Renewed", description: `Renewed until ${formatDate(newEnd)}` });
    setRenewOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)} className="gap-2" data-testid="button-add-agreement">
          <Plus className="w-4 h-4" /> New Agreement
        </Button>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Tenant</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Lock-In</TableHead>
                <TableHead>Rent</TableHead>
                <TableHead>Deposit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agreements.length === 0 && <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No agreements found</TableCell></TableRow>}
              {agreements.map((a) => {
                const tenant = tenants.find((t) => t.id === a.tenantId);
                const status = agreementStatus(a.endDate);
                return (
                  <TableRow key={a.id} data-testid={`row-agreement-${a.id}`}>
                    <TableCell className="font-medium text-sm">{tenant?.name || "-"}</TableCell>
                    <TableCell className="text-sm">{formatDate(a.startDate)}</TableCell>
                    <TableCell className="text-sm">{formatDate(a.endDate)}</TableCell>
                    <TableCell className="text-sm">{a.periodMonths} months</TableCell>
                    <TableCell className="text-sm">{a.lockInMonths} months</TableCell>
                    <TableCell className="text-sm font-medium text-indigo-600">{formatINR(a.rentAmount)}</TableCell>
                    <TableCell className="text-sm">{formatINR(a.deposit)}</TableCell>
                    <TableCell><Badge variant="outline" className={`text-xs ${status.className}`}>{status.label}</Badge></TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => { setSelectedAgreement(a); setRenewMonths("11"); setRenewOpen(true); }}>
                        <RefreshCw className="w-3 h-3" /> Renew
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* New Agreement */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Rental Agreement</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Tenant *</Label>
              <Select value={form.tenantId} onValueChange={(v) => {
                const t = tenants.find((t) => t.id === v);
                setForm({ ...form, tenantId: v, rentAmount: t?.rent.toString() || "", deposit: t?.deposit.toString() || "" });
              }}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select Tenant" /></SelectTrigger>
                <SelectContent>{tenants.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start Date</Label><Input type="date" className="mt-1" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
              <div><Label>Period (months)</Label><Input type="number" className="mt-1" value={form.periodMonths} onChange={(e) => setForm({ ...form, periodMonths: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Lock-In (months)</Label><Input type="number" className="mt-1" value={form.lockInMonths} onChange={(e) => setForm({ ...form, lockInMonths: e.target.value })} /></div>
              <div><Label>Monthly Rent (₹)</Label><Input type="number" className="mt-1" value={form.rentAmount} onChange={(e) => setForm({ ...form, rentAmount: e.target.value })} /></div>
            </div>
            <div><Label>Security Deposit (₹)</Label><Input type="number" className="mt-1" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}><FileText className="w-4 h-4 mr-2" /> Create Agreement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Renew Modal */}
      <Dialog open={renewOpen} onOpenChange={setRenewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Renew Agreement</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Renewing for {tenants.find((t) => t.id === selectedAgreement?.tenantId)?.name}</p>
            <div><Label>Renewal Period (months)</Label><Input type="number" className="mt-1" value={renewMonths} onChange={(e) => setRenewMonths(e.target.value)} /></div>
            <p className="text-xs text-muted-foreground">New end date will be calculated from current end date: {selectedAgreement ? formatDate(selectedAgreement.endDate) : "-"}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenewOpen(false)}>Cancel</Button>
            <Button onClick={renewAgreement}><RefreshCw className="w-4 h-4 mr-2" /> Renew</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
