import { useState } from "react";
import { useStore, genId, formatDate, formatINR, type Tenant } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Pencil, Trash2 } from "lucide-react";

type TenantFormData = Omit<Tenant, "id" | "status">;

const emptyForm = (): TenantFormData => ({
  name: "", phone: "", email: "", aadhaar: "", altPhone: "", dob: "", gender: "Male",
  currentAddress: "", permanentAddress: "", govtId: "", vehicleNo: "", remarks: "",
  flatId: "", propertyId: "", rent: 0, deposit: 0, kycStatus: "Pending",
  joiningDate: new Date().toISOString().split("T")[0], moveInDate: "",
  agreementEndDate: "", occupation: "", emergencyContact: "",
});

export default function AllTenantsPage() {
  const { tenants, dues, properties, addTenant, updateTenant, deleteTenant, addLog } = useStore();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<TenantFormData>(emptyForm());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const allFlats = properties.flatMap((p) => p.flats);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm());
    setOpen(true);
  }

  function openEdit(t: Tenant) {
    setEditing(t.id);
    const { id, status, ...rest } = t;
    setForm(rest);
    setOpen(true);
  }

  function submit() {
    if (!form.name || !form.phone) { toast({ title: "Error", description: "Name and Phone required", variant: "destructive" }); return; }
    if (editing) {
      updateTenant(editing, form);
      addLog("Tenant Updated", `${form.name} details updated`);
      toast({ title: "Updated", description: `${form.name} updated successfully` });
    } else {
      addTenant({ id: genId(), ...form, status: "Active" });
      addLog("Tenant Added", `${form.name} added manually`);
      toast({ title: "Added", description: `${form.name} added. Assign them to a flat from Properties.` });
    }
    setOpen(false);
  }

  function confirmDelete() {
    if (!selectedId) return;
    const t = tenants.find((t) => t.id === selectedId);
    deleteTenant(selectedId);
    addLog("Tenant Deleted", `${t?.name} deleted`);
    toast({ title: "Deleted", description: `${t?.name} removed` });
    setDeleteOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openAdd} className="gap-2" data-testid="button-add-tenant">
          <UserPlus className="w-4 h-4" /> Add Tenant
        </Button>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Flat</TableHead>
                <TableHead>Joining Date</TableHead>
                <TableHead>Rent</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dues</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No tenants found</TableCell></TableRow>
              )}
              {tenants.map((t) => {
                const flat = allFlats.find((f) => f.id === t.flatId);
                const prop = properties.find((p) => p.id === t.propertyId);
                const totalDue = dues.filter((d) => d.tenantId === t.id && d.status === "Pending").reduce((s, d) => s + d.amount, 0);
                return (
                  <TableRow key={t.id} data-testid={`row-all-tenant-${t.id}`}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell className="text-sm">{t.phone}</TableCell>
                    <TableCell className="text-sm">
                      <div>{flat?.name || <span className="text-muted-foreground italic">Unassigned</span>}</div>
                      {prop && <div className="text-xs text-muted-foreground">{prop.name}</div>}
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(t.joiningDate)}</TableCell>
                    <TableCell className="text-sm font-medium text-indigo-600">{formatINR(t.rent)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={t.kycStatus === "Verified" ? "border-green-300 text-green-600" : "border-orange-300 text-orange-600"}>
                        {t.kycStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={t.status === "Active" ? "border-green-300 text-green-600" : "border-red-300 text-red-600"}>
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-bold text-red-500">{formatINR(totalDue)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(t)} data-testid={`button-edit-tenant-${t.id}`}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => { setSelectedId(t.id); setDeleteOpen(true); }}>
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

      {/* Add/Edit Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit Tenant" : "Add New Tenant"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {([
              ["name", "Full Name *", "text"], ["phone", "Phone *", "tel"], ["email", "Email", "email"],
              ["aadhaar", "Aadhaar", "text"], ["altPhone", "Alt Phone", "tel"], ["occupation", "Occupation", "text"],
              ["currentAddress", "Current Address", "text"], ["permanentAddress", "Permanent Address", "text"],
              ["govtId", "Govt ID", "text"], ["vehicleNo", "Vehicle No", "text"],
              ["emergencyContact", "Emergency Contact", "tel"],
            ] as [keyof TenantFormData, string, string][]).map(([field, label, type]) => (
              <div key={field}>
                <Label className="text-xs">{label}</Label>
                <Input type={type} className="mt-1" value={String(form[field] || "")} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
              </div>
            ))}
            <div>
              <Label className="text-xs">Date of Birth</Label>
              <Input type="date" className="mt-1" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Gender</Label>
              <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Joining Date</Label>
              <Input type="date" className="mt-1" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Monthly Rent (₹)</Label>
              <Input type="number" className="mt-1" value={form.rent || ""} onChange={(e) => setForm({ ...form, rent: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <Label className="text-xs">Security Deposit (₹)</Label>
              <Input type="number" className="mt-1" value={form.deposit || ""} onChange={(e) => setForm({ ...form, deposit: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <Label className="text-xs">Move-In Date</Label>
              <Input type="date" className="mt-1" value={form.moveInDate} onChange={(e) => setForm({ ...form, moveInDate: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Agreement End Date</Label>
              <Input type="date" className="mt-1" value={form.agreementEndDate} onChange={(e) => setForm({ ...form, agreementEndDate: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">KYC Status</Label>
              <Select value={form.kycStatus} onValueChange={(v) => setForm({ ...form, kycStatus: v as any })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Verified">Verified</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}>{editing ? "Update" : "Add Tenant"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tenant</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to permanently delete this tenant? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
