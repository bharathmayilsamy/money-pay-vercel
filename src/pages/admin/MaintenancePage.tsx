import { useState } from "react";
import { useStore, genId, formatDate, type MaintenanceRequest } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Wrench, Trash2, MoreHorizontal, CheckCircle2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const CATEGORIES = ["Plumbing", "Electrical", "Carpentry", "AC / Cooling", "Pest Control", "Cleaning", "Internet", "Other"];
const STATUSES: MaintenanceRequest["status"][] = ["Open", "In Progress", "Resolved"];

function priorityBadge(p: string) {
  const map: Record<string, string> = { High: "bg-red-100 text-red-700 border-red-300", Medium: "bg-orange-100 text-orange-700 border-orange-300", Low: "bg-blue-100 text-blue-700 border-blue-300" };
  return map[p] || "";
}
function statusBadge(s: string) {
  const map: Record<string, string> = { Open: "bg-gray-100 text-gray-700 border-gray-300", "In Progress": "bg-yellow-100 text-yellow-700 border-yellow-300", Resolved: "bg-green-100 text-green-700 border-green-300" };
  return map[s] || "";
}

export default function MaintenancePage() {
  const { tenants, maintenanceRequests, addMaintenanceRequest, updateMaintenanceRequest, deleteMaintenanceRequest, addLog } = useStore();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<MaintenanceRequest | null>(null);
  const [noteText, setNoteText] = useState("");

  const [form, setForm] = useState({ tenantId: "", category: "Plumbing", description: "", priority: "Medium" as MaintenanceRequest["priority"] });

  function submit() {
    if (!form.tenantId || !form.description) { toast({ title: "Error", description: "Select tenant and describe the issue", variant: "destructive" }); return; }
    addMaintenanceRequest({ id: genId(), tenantId: form.tenantId, category: form.category, description: form.description, priority: form.priority, status: "Open", dateRaised: new Date().toISOString().split("T")[0] });
    const t = tenants.find((t) => t.id === form.tenantId);
    addLog("Maintenance Request", `${form.category} request from ${t?.name}`);
    toast({ title: "Request Added" });
    setOpen(false);
    setForm({ tenantId: "", category: "Plumbing", description: "", priority: "Medium" });
  }

  function changeStatus(id: string, status: MaintenanceRequest["status"]) {
    const updates: Partial<MaintenanceRequest> = { status };
    if (status === "Resolved") updates.dateResolved = new Date().toISOString().split("T")[0];
    updateMaintenanceRequest(id, updates);
    toast({ title: `Status updated to ${status}` });
  }

  function saveNote() {
    if (!selectedReq) return;
    updateMaintenanceRequest(selectedReq.id, { adminNote: noteText });
    toast({ title: "Note Saved" });
    setNoteOpen(false);
  }

  function filterByStatus(status: string) {
    if (status === "all") return maintenanceRequests;
    return maintenanceRequests.filter((r) => r.status === status);
  }

  const RequestTable = ({ requests }: { requests: MaintenanceRequest[] }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Tenant</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date Raised</TableHead>
            <TableHead>Resolved</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 && <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No requests</TableCell></TableRow>}
          {[...requests].reverse().map((req) => {
            const tenant = tenants.find((t) => t.id === req.tenantId);
            return (
              <TableRow key={req.id} data-testid={`row-maintenance-${req.id}`}>
                <TableCell className="text-sm font-medium">{tenant?.name || "-"}</TableCell>
                <TableCell className="text-sm">{req.category}</TableCell>
                <TableCell className="text-sm max-w-[200px]">
                  <p className="truncate">{req.description}</p>
                  {req.adminNote && <p className="text-xs text-indigo-600 mt-0.5 italic truncate">Note: {req.adminNote}</p>}
                </TableCell>
                <TableCell><Badge variant="outline" className={`text-xs ${priorityBadge(req.priority)}`}>{req.priority}</Badge></TableCell>
                <TableCell><Badge variant="outline" className={`text-xs ${statusBadge(req.status)}`}>{req.status}</Badge></TableCell>
                <TableCell className="text-sm">{formatDate(req.dateRaised)}</TableCell>
                <TableCell className="text-sm">{req.dateResolved ? formatDate(req.dateResolved) : "-"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {STATUSES.filter((s) => s !== req.status).map((s) => (
                        <DropdownMenuItem key={s} onClick={() => changeStatus(req.id, s)}>
                          {s === "Resolved" && <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-green-600" />}
                          Mark as {s}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem onClick={() => { setSelectedReq(req); setNoteText(req.adminNote || ""); setNoteOpen(true); }}>
                        Add / Edit Note
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(req.id)}>
                        <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)} className="gap-2" data-testid="button-add-maintenance">
          <Plus className="w-4 h-4" /> Add Request
        </Button>
      </div>

      <div className="bg-card rounded-xl border shadow-sm">
        <Tabs defaultValue="all">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
            {(["all", "Open", "In Progress", "Resolved"] as const).map((s) => (
              <TabsTrigger key={s} value={s} className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-5 py-3 gap-2 capitalize">
                {s === "all" ? "All" : s}
                <Badge variant="secondary" className="text-xs">{filterByStatus(s).length}</Badge>
              </TabsTrigger>
            ))}
          </TabsList>
          {(["all", "Open", "In Progress", "Resolved"] as const).map((s) => (
            <TabsContent key={s} value={s} className="m-0">
              <RequestTable requests={filterByStatus(s)} />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Add Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Maintenance Request</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Tenant</Label>
              <Select value={form.tenantId} onValueChange={(v) => setForm({ ...form, tenantId: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select Tenant" /></SelectTrigger>
                <SelectContent>{tenants.filter((t) => t.status === "Active").map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as any })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Description</Label><Textarea className="mt-1" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}><Wrench className="w-4 h-4 mr-2" /> Add Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Note Modal */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Admin Note</DialogTitle></DialogHeader>
          <Textarea rows={4} value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a note about this request..." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteOpen(false)}>Cancel</Button>
            <Button onClick={saveNote}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Request</AlertDialogTitle><AlertDialogDescription>Remove this maintenance request?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => { if (deleteId) { deleteMaintenanceRequest(deleteId); toast({ title: "Deleted" }); setDeleteId(null); } }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
