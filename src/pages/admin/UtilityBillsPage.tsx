import { useState } from "react";
import { useStore, genId, formatDate, formatINR, type UtilityBill } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Zap, Trash2, CheckCircle2 } from "lucide-react";

export default function UtilityBillsPage() {
  const { properties, tenants, utilityBills, addUtilityBill, updateUtilityBill, deleteUtilityBill, addDue, addLog } = useStore();
  const { toast } = useToast();

  const allFlats = properties.flatMap((p) => p.flats.map((f) => ({ ...f, propertyName: p.name })));
  const occupiedFlats = allFlats.filter((f) => f.status === "Occupied");

  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    flatId: "", period: new Date().toISOString().slice(0, 7), previousReading: "", currentReading: "", ratePerUnit: "8",
  });

  const units = form.currentReading && form.previousReading
    ? Math.max(0, parseFloat(form.currentReading) - parseFloat(form.previousReading))
    : 0;
  const amount = units * parseFloat(form.ratePerUnit || "8");

  function submit() {
    if (!form.flatId || !form.previousReading || !form.currentReading) {
      toast({ title: "Error", description: "Fill all fields", variant: "destructive" }); return;
    }
    const flat = occupiedFlats.find((f) => f.id === form.flatId);
    const tenantId = flat?.tenantId || "";
    addUtilityBill({
      id: genId(), flatId: form.flatId, tenantId, period: form.period,
      previousReading: parseFloat(form.previousReading), currentReading: parseFloat(form.currentReading),
      ratePerUnit: parseFloat(form.ratePerUnit), amount, status: "Pending",
      date: new Date().toISOString().split("T")[0],
    });
    addLog("Utility Bill Added", `${flat?.name} — ${units} units = ${formatINR(amount)}`);
    toast({ title: "Bill Added", description: `${units} units = ${formatINR(amount)}` });
    setOpen(false);
    setForm({ flatId: "", period: new Date().toISOString().slice(0, 7), previousReading: "", currentReading: "", ratePerUnit: "8" });
  }

  function generateDue(bill: UtilityBill) {
    addDue({ id: genId(), tenantId: bill.tenantId, category: "Electricity Bill", amount: bill.amount, dueDate: bill.date, status: "Pending" });
    updateUtilityBill(bill.id, { status: "Pending" });
    const tenant = tenants.find((t) => t.id === bill.tenantId);
    addLog("EB Due Generated", `EB due ${formatINR(bill.amount)} for ${tenant?.name}`);
    toast({ title: "Due Generated", description: `Electricity due added for tenant` });
  }

  function markPaid(id: string) {
    updateUtilityBill(id, { status: "Paid" });
    toast({ title: "Marked as Paid" });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)} className="gap-2" data-testid="button-add-utility-bill">
          <Plus className="w-4 h-4" /> Add Reading
        </Button>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Flat</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Prev Reading</TableHead>
                <TableHead>Curr Reading</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Bill Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {utilityBills.length === 0 && (
                <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">No utility bills yet</TableCell></TableRow>
              )}
              {[...utilityBills].reverse().map((bill) => {
                const flat = allFlats.find((f) => f.id === bill.flatId);
                const tenant = tenants.find((t) => t.id === bill.tenantId);
                const units = bill.currentReading - bill.previousReading;
                return (
                  <TableRow key={bill.id} data-testid={`row-utility-${bill.id}`}>
                    <TableCell className="text-sm font-medium">{flat?.name || "-"}</TableCell>
                    <TableCell className="text-sm">{tenant?.name || "-"}</TableCell>
                    <TableCell className="text-sm">{bill.period}</TableCell>
                    <TableCell className="text-sm">{bill.previousReading}</TableCell>
                    <TableCell className="text-sm">{bill.currentReading}</TableCell>
                    <TableCell className="text-sm font-medium">{units}</TableCell>
                    <TableCell className="text-sm">₹{bill.ratePerUnit}/unit</TableCell>
                    <TableCell className="text-sm font-bold text-indigo-600">{formatINR(bill.amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={bill.status === "Paid" ? "border-green-300 text-green-700 bg-green-50" : "border-orange-300 text-orange-600 bg-orange-50"}>
                        {bill.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {bill.status === "Pending" && (
                          <>
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-indigo-300 text-indigo-600" onClick={() => generateDue(bill)}>
                              <Zap className="w-3 h-3" /> Gen Due
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600" onClick={() => markPaid(bill.id)} title="Mark Paid">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:bg-red-50" onClick={() => setDeleteId(bill.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Reading Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Meter Reading</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Flat *</Label>
              <Select value={form.flatId} onValueChange={(v) => setForm({ ...form, flatId: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select Occupied Flat" /></SelectTrigger>
                <SelectContent>
                  {occupiedFlats.map((f) => {
                    const t = tenants.find((tn) => tn.id === f.tenantId);
                    return <SelectItem key={f.id} value={f.id}>{f.name} — {t?.name}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Period (Month)</Label><Input type="month" className="mt-1" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Previous Reading</Label><Input type="number" className="mt-1" value={form.previousReading} onChange={(e) => setForm({ ...form, previousReading: e.target.value })} /></div>
              <div><Label>Current Reading</Label><Input type="number" className="mt-1" value={form.currentReading} onChange={(e) => setForm({ ...form, currentReading: e.target.value })} /></div>
            </div>
            <div><Label>Rate per Unit (₹)</Label><Input type="number" className="mt-1" value={form.ratePerUnit} onChange={(e) => setForm({ ...form, ratePerUnit: e.target.value })} /></div>
            {units > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm">
                <div className="flex justify-between">
                  <span>Units Consumed:</span><strong>{units} units</strong>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Bill Amount:</span><strong className="text-indigo-600">{formatINR(amount)}</strong>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}><Zap className="w-4 h-4 mr-2" /> Add Reading</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Reading</AlertDialogTitle><AlertDialogDescription>Remove this utility bill record?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => { if (deleteId) { deleteUtilityBill(deleteId); toast({ title: "Deleted" }); setDeleteId(null); } }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
