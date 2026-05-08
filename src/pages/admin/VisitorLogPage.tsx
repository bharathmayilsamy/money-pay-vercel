import { useState } from "react";
import { useStore, genId, type Visitor } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, CarFront, Trash2, LogOut as CheckOut, Search } from "lucide-react";

export default function VisitorLogPage() {
  const { tenants, visitors, addVisitor, updateVisitor, deleteVisitor, addLog } = useStore();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "", phone: "", tenantId: "", purpose: "", vehicleNo: "",
    checkInTime: new Date().toISOString().slice(0, 16),
  });

  function submit() {
    if (!form.name || !form.tenantId || !form.purpose) {
      toast({ title: "Error", description: "Fill required fields", variant: "destructive" }); return;
    }
    addVisitor({ id: genId(), name: form.name, phone: form.phone, tenantId: form.tenantId, purpose: form.purpose, vehicleNo: form.vehicleNo, checkInTime: form.checkInTime });
    const t = tenants.find((t) => t.id === form.tenantId);
    addLog("Visitor Logged", `${form.name} visiting ${t?.name}`);
    toast({ title: "Visitor Logged" });
    setOpen(false);
    setForm({ name: "", phone: "", tenantId: "", purpose: "", vehicleNo: "", checkInTime: new Date().toISOString().slice(0, 16) });
  }

  function checkOut(id: string) {
    updateVisitor(id, { checkOutTime: new Date().toISOString() });
    toast({ title: "Check-out recorded" });
  }

  const filtered = visitors.filter((v) => {
    if (!search) return true;
    const tenant = tenants.find((t) => t.id === v.tenantId);
    return v.name.toLowerCase().includes(search.toLowerCase()) ||
      tenant?.name.toLowerCase().includes(search.toLowerCase()) ||
      v.purpose.toLowerCase().includes(search.toLowerCase());
  });

  function formatDateTime(dt: string) {
    if (!dt) return "-";
    return new Date(dt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search visitors..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2 ml-auto" data-testid="button-log-visitor">
          <Plus className="w-4 h-4" /> Log Visitor
        </Button>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Visitor Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Visiting Tenant</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Check-In</TableHead>
                <TableHead>Check-Out</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No visitors logged</TableCell></TableRow>}
              {[...filtered].reverse().map((v) => {
                const tenant = tenants.find((t) => t.id === v.tenantId);
                return (
                  <TableRow key={v.id} data-testid={`row-visitor-${v.id}`}>
                    <TableCell className="font-medium text-sm">{v.name}</TableCell>
                    <TableCell className="text-sm">{v.phone || "-"}</TableCell>
                    <TableCell className="text-sm">
                      <div>{tenant?.name || "-"}</div>
                    </TableCell>
                    <TableCell className="text-sm">{v.purpose}</TableCell>
                    <TableCell className="text-sm">{formatDateTime(v.checkInTime)}</TableCell>
                    <TableCell>
                      {v.checkOutTime ? (
                        <span className="text-sm">{formatDateTime(v.checkOutTime)}</span>
                      ) : (
                        <Badge variant="outline" className="border-green-300 text-green-700 text-xs">Inside</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{v.vehicleNo || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {!v.checkOutTime && (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-orange-300 text-orange-600 hover:bg-orange-50" onClick={() => checkOut(v.id)}>
                            <CheckOut className="w-3 h-3" /> Check Out
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:bg-red-50" onClick={() => setDeleteId(v.id)}>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log New Visitor</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Visitor Name *</Label><Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Phone</Label><Input type="tel" className="mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div><Label>Visiting Tenant *</Label>
              <Select value={form.tenantId} onValueChange={(v) => setForm({ ...form, tenantId: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select Tenant" /></SelectTrigger>
                <SelectContent>{tenants.filter((t) => t.status === "Active").map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Purpose *</Label><Input className="mt-1" placeholder="Personal Visit / Delivery / Work" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Vehicle Number</Label><Input className="mt-1" value={form.vehicleNo} onChange={(e) => setForm({ ...form, vehicleNo: e.target.value })} /></div>
              <div><Label>Check-In Time</Label><Input type="datetime-local" className="mt-1" value={form.checkInTime} onChange={(e) => setForm({ ...form, checkInTime: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}><CarFront className="w-4 h-4 mr-2" /> Log Visitor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Visitor Log</AlertDialogTitle><AlertDialogDescription>Remove this visitor record?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => { if (deleteId) { deleteVisitor(deleteId); toast({ title: "Deleted" }); setDeleteId(null); } }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
