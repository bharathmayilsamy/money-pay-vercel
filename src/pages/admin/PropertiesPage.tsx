import { useState } from "react";
import { useStore, genId, formatINR, type Property, type Flat } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Building2, Home, Pencil, Trash2, UserPlus, UserMinus } from "lucide-react";

export default function PropertiesPage() {
  const { properties, tenants, addProperty, updateProperty, deleteProperty, updateFlat, updateTenant, addLog } = useStore();
  const { toast } = useToast();

  const [propOpen, setPropOpen] = useState(false);
  const [editPropOpen, setEditPropOpen] = useState(false);
  const [deletePropOpen, setDeletePropOpen] = useState(false);
  const [editFlatOpen, setEditFlatOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [vacateOpen, setVacateOpen] = useState(false);

  const [propForm, setPropForm] = useState({ name: "", address: "", numFlats: "4" });
  const [editPropForm, setEditPropForm] = useState({ id: "", name: "", address: "" });
  const [editFlatForm, setEditFlatForm] = useState({ propertyId: "", flatId: "", name: "", rent: "" });
  const [assignForm, setAssignForm] = useState({ propertyId: "", flatId: "", tenantId: "", rent: "", moveInDate: new Date().toISOString().split("T")[0], deposit: "" });
  const [vacateTarget, setVacateTarget] = useState<{ propertyId: string; flatId: string; flatName: string } | null>(null);
  const [deletePropId, setDeletePropId] = useState<string | null>(null);

  const unassignedTenants = tenants.filter((t) => t.status === "Active" && !t.flatId);

  function createProperty() {
    if (!propForm.name) { toast({ title: "Error", description: "Property name required", variant: "destructive" }); return; }
    const n = parseInt(propForm.numFlats) || 4;
    const flats: Flat[] = Array.from({ length: n }, (_, i) => ({
      id: genId(), name: `Flat ${String.fromCharCode(65 + i)}`, rent: 12000, status: "Vacant",
    }));
    addProperty({ id: genId(), name: propForm.name, address: propForm.address, flats });
    addLog("Property Added", `${propForm.name} added with ${n} flats`);
    toast({ title: "Property Created", description: `${propForm.name} with ${n} flats` });
    setPropOpen(false);
    setPropForm({ name: "", address: "", numFlats: "4" });
  }

  function saveEditProperty() {
    updateProperty(editPropForm.id, { name: editPropForm.name, address: editPropForm.address });
    toast({ title: "Updated" });
    setEditPropOpen(false);
  }

  function saveEditFlat() {
    updateFlat(editFlatForm.propertyId, editFlatForm.flatId, { name: editFlatForm.name, rent: parseFloat(editFlatForm.rent) || 0 });
    toast({ title: "Flat Updated" });
    setEditFlatOpen(false);
  }

  function confirmAssign() {
    if (!assignForm.tenantId) { toast({ title: "Select a tenant", variant: "destructive" }); return; }
    const rent = parseFloat(assignForm.rent) || 0;
    const deposit = parseFloat(assignForm.deposit) || 0;
    updateFlat(assignForm.propertyId, assignForm.flatId, { status: "Occupied", tenantId: assignForm.tenantId });
    updateTenant(assignForm.tenantId, { flatId: assignForm.flatId, propertyId: assignForm.propertyId, rent, deposit, moveInDate: assignForm.moveInDate });
    const flat = properties.find((p) => p.id === assignForm.propertyId)?.flats.find((f) => f.id === assignForm.flatId);
    const tenant = tenants.find((t) => t.id === assignForm.tenantId);
    addLog("Tenant Assigned", `${tenant?.name} assigned to ${flat?.name}`);
    toast({ title: "Assigned", description: `${tenant?.name} assigned to flat` });
    setAssignOpen(false);
  }

  function confirmVacate() {
    if (!vacateTarget) return;
    const flat = properties.find((p) => p.id === vacateTarget.propertyId)?.flats.find((f) => f.id === vacateTarget.flatId);
    if (flat?.tenantId) {
      updateTenant(flat.tenantId, { flatId: "", propertyId: "" });
    }
    updateFlat(vacateTarget.propertyId, vacateTarget.flatId, { status: "Vacant", tenantId: undefined });
    addLog("Flat Vacated", `${vacateTarget.flatName} vacated`);
    toast({ title: "Flat Vacated" });
    setVacateOpen(false);
  }

  function confirmDeleteProp() {
    if (!deletePropId) return;
    const p = properties.find((p) => p.id === deletePropId);
    deleteProperty(deletePropId);
    addLog("Property Deleted", `${p?.name} deleted`);
    toast({ title: "Deleted" });
    setDeletePropOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setPropOpen(true)} className="gap-2" data-testid="button-add-property">
          <Plus className="w-4 h-4" /> Add Property
        </Button>
      </div>

      {properties.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No properties yet. Add your first property.</p>
        </div>
      )}

      {properties.map((prop) => {
        const occupied = prop.flats.filter((f) => f.status === "Occupied").length;
        return (
          <Card key={prop.id} className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    {prop.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">{prop.address}</p>
                  <div className="flex gap-3 mt-2 text-xs">
                    <span className="text-muted-foreground">{prop.flats.length} total</span>
                    <span className="text-green-600 font-medium">{occupied} occupied</span>
                    <span className="text-orange-500 font-medium">{prop.flats.length - occupied} vacant</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => { setEditPropForm({ id: prop.id, name: prop.name, address: prop.address }); setEditPropOpen(true); }}>
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-red-500 border-red-200 hover:bg-red-50 gap-1" onClick={() => { setDeletePropId(prop.id); setDeletePropOpen(true); }}>
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {prop.flats.map((flat) => {
                  const tenant = flat.tenantId ? tenants.find((t) => t.id === flat.tenantId) : null;
                  return (
                    <div key={flat.id} className={`border rounded-xl p-3 ${flat.status === "Occupied" ? "bg-green-50 border-green-200 dark:bg-green-950/20" : "bg-card"}`} data-testid={`flat-card-${flat.id}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Home className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium">{flat.name}</span>
                        </div>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => { setEditFlatForm({ propertyId: prop.id, flatId: flat.id, name: flat.name, rent: flat.rent.toString() }); setEditFlatOpen(true); }}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-indigo-600 font-medium">{formatINR(flat.rent)}/mo</p>
                      {tenant ? (
                        <p className="text-xs text-green-700 mt-1 font-medium">{tenant.name}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1 italic">Vacant</p>
                      )}
                      <Badge variant="outline" className={`mt-2 text-xs ${flat.status === "Occupied" ? "border-green-300 text-green-700" : "border-orange-300 text-orange-600"}`}>
                        {flat.status}
                      </Badge>
                      <div className="mt-2">
                        {flat.status === "Vacant" ? (
                          <Button size="sm" className="w-full h-7 text-xs gap-1" variant="outline" onClick={() => {
                            setAssignForm({ propertyId: prop.id, flatId: flat.id, tenantId: "", rent: flat.rent.toString(), moveInDate: new Date().toISOString().split("T")[0], deposit: "" });
                            setAssignOpen(true);
                          }}>
                            <UserPlus className="w-3 h-3" /> Assign Tenant
                          </Button>
                        ) : (
                          <Button size="sm" className="w-full h-7 text-xs gap-1 border-red-200 text-red-500 hover:bg-red-50" variant="outline" onClick={() => { setVacateTarget({ propertyId: prop.id, flatId: flat.id, flatName: flat.name }); setVacateOpen(true); }}>
                            <UserMinus className="w-3 h-3" /> Vacate Flat
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Add Property Modal */}
      <Dialog open={propOpen} onOpenChange={setPropOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Property</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Property Name *</Label><Input className="mt-1" placeholder="Sunrise Residency" value={propForm.name} onChange={(e) => setPropForm({ ...propForm, name: e.target.value })} /></div>
            <div><Label>Address</Label><Input className="mt-1" placeholder="Andheri East, Mumbai" value={propForm.address} onChange={(e) => setPropForm({ ...propForm, address: e.target.value })} /></div>
            <div><Label>Number of Flats</Label><Input type="number" className="mt-1" value={propForm.numFlats} onChange={(e) => setPropForm({ ...propForm, numFlats: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPropOpen(false)}>Cancel</Button>
            <Button onClick={createProperty}>Create Property</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Property */}
      <Dialog open={editPropOpen} onOpenChange={setEditPropOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Property</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input className="mt-1" value={editPropForm.name} onChange={(e) => setEditPropForm({ ...editPropForm, name: e.target.value })} /></div>
            <div><Label>Address</Label><Input className="mt-1" value={editPropForm.address} onChange={(e) => setEditPropForm({ ...editPropForm, address: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPropOpen(false)}>Cancel</Button>
            <Button onClick={saveEditProperty}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Flat */}
      <Dialog open={editFlatOpen} onOpenChange={setEditFlatOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Flat</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Flat Name</Label><Input className="mt-1" value={editFlatForm.name} onChange={(e) => setEditFlatForm({ ...editFlatForm, name: e.target.value })} /></div>
            <div><Label>Monthly Rent (₹)</Label><Input type="number" className="mt-1" value={editFlatForm.rent} onChange={(e) => setEditFlatForm({ ...editFlatForm, rent: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditFlatOpen(false)}>Cancel</Button>
            <Button onClick={saveEditFlat}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Tenant Modal */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Tenant to Flat</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Select Tenant</Label>
              <Select value={assignForm.tenantId} onValueChange={(v) => setAssignForm({ ...assignForm, tenantId: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select unassigned tenant" /></SelectTrigger>
                <SelectContent>
                  {unassignedTenants.length === 0 ? <SelectItem value="_none" disabled>No unassigned tenants</SelectItem> : unassignedTenants.map((t) => <SelectItem key={t.id} value={t.id}>{t.name} ({t.phone})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Monthly Rent (₹)</Label><Input type="number" className="mt-1" value={assignForm.rent} onChange={(e) => setAssignForm({ ...assignForm, rent: e.target.value })} /></div>
            <div><Label>Move-In Date</Label><Input type="date" className="mt-1" value={assignForm.moveInDate} onChange={(e) => setAssignForm({ ...assignForm, moveInDate: e.target.value })} /></div>
            <div><Label>Security Deposit (₹)</Label><Input type="number" className="mt-1" value={assignForm.deposit} onChange={(e) => setAssignForm({ ...assignForm, deposit: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button onClick={confirmAssign} disabled={unassignedTenants.length === 0}>Confirm Assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vacate Alert */}
      <AlertDialog open={vacateOpen} onOpenChange={setVacateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Vacate Flat</AlertDialogTitle><AlertDialogDescription>Vacate {vacateTarget?.flatName}? The tenant will be unassigned.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-orange-600 hover:bg-orange-700" onClick={confirmVacate}>Vacate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Property Alert */}
      <AlertDialog open={deletePropOpen} onOpenChange={setDeletePropOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Property</AlertDialogTitle><AlertDialogDescription>Delete this property and all its flats? Tenants will be unassigned.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDeleteProp}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
