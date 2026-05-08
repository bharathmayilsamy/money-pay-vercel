import { useState } from "react";
import { useStore, genId, formatINR, formatDate, type Payment, type Expense } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Receipt, Trash2, Plus, TrendingUp, TrendingDown, DollarSign, Clock, Zap } from "lucide-react";

const DUE_CATS = ["Rent", "Electricity Bill", "Water Bill", "WiFi", "Maintenance", "Security Deposit", "Gas Bill", "Parking", "Late Fee", "Other"];
const EXP_CATS = ["Maintenance", "Repairs", "Utilities", "Taxes", "Insurance", "Cleaning", "Other"];

export default function MoneyPage() {
  const { tenants, payments, expenses, dues, addPayment, deletePayment, addExpense, deleteExpense, updateDue, addDue, addLog } = useStore();
  const { toast } = useToast();

  const [colOpen, setColOpen] = useState(false);
  const [expOpen, setExpOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [deleteColId, setDeleteColId] = useState<string | null>(null);
  const [deleteExpId, setDeleteExpId] = useState<string | null>(null);

  const [colForm, setColForm] = useState({ tenantId: "", amount: "", date: new Date().toISOString().split("T")[0], category: "Rent", remark: "" });
  const [expForm, setExpForm] = useState({ description: "", amount: "", date: new Date().toISOString().split("T")[0], category: "Maintenance", remark: "" });
  const [bulkMonth, setBulkMonth] = useState(new Date().toISOString().slice(0, 7));

  const totalCollections = payments.reduce((s, p) => s + p.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalCollections - totalExpenses;
  const pendingCollections = dues.filter((d) => d.status === "Pending").reduce((s, d) => s + d.amount, 0);

  function submitCollection() {
    if (!colForm.tenantId || !colForm.amount) { toast({ title: "Error", description: "Select tenant and enter amount", variant: "destructive" }); return; }
    addPayment({ id: genId(), tenantId: colForm.tenantId, amount: parseFloat(colForm.amount), date: colForm.date, category: colForm.category, remark: colForm.remark });
    const t = tenants.find((t) => t.id === colForm.tenantId);
    addLog("Collection Added", `${formatINR(parseFloat(colForm.amount))} collected from ${t?.name}`);
    toast({ title: "Collection Added" });
    setColOpen(false);
    setColForm({ tenantId: "", amount: "", date: new Date().toISOString().split("T")[0], category: "Rent", remark: "" });
  }

  function submitExpense() {
    if (!expForm.description || !expForm.amount) { toast({ title: "Error", description: "Enter description and amount", variant: "destructive" }); return; }
    addExpense({ id: genId(), description: expForm.description, amount: parseFloat(expForm.amount), date: expForm.date, category: expForm.category, remark: expForm.remark });
    addLog("Expense Added", `${expForm.description} - ${formatINR(parseFloat(expForm.amount))}`);
    toast({ title: "Expense Added" });
    setExpOpen(false);
    setExpForm({ description: "", amount: "", date: new Date().toISOString().split("T")[0], category: "Maintenance", remark: "" });
  }

  function generateBulkRent() {
    const activeTenants = tenants.filter((t) => t.status === "Active" && t.rent > 0);
    const dueDate = `${bulkMonth}-05`;
    let added = 0;
    activeTenants.forEach((t) => {
      // Check if rent due already exists for this month
      const exists = dues.some((d) => d.tenantId === t.id && d.category === "Rent" && d.dueDate.startsWith(bulkMonth));
      if (!exists) {
        addDue({ id: genId(), tenantId: t.id, category: "Rent", amount: t.rent, dueDate, status: "Pending" });
        added++;
      }
    });
    addLog("Bulk Rent Generated", `Rent dues generated for ${added} tenants for ${bulkMonth}`);
    toast({ title: "Bulk Rent Generated", description: `${added} rent dues created for ${bulkMonth}` });
    setBulkOpen(false);
  }

  const activeTenantPreviews = tenants.filter((t) => t.status === "Active" && t.rent > 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Collections", value: formatINR(totalCollections), icon: <TrendingUp className="w-5 h-5 text-green-600" />, color: "text-green-600", bg: "bg-green-100" },
          { label: "Total Expenses", value: formatINR(totalExpenses), icon: <TrendingDown className="w-5 h-5 text-red-500" />, color: "text-red-500", bg: "bg-red-100" },
          { label: "Net Profit", value: formatINR(netProfit), icon: <DollarSign className="w-5 h-5 text-indigo-600" />, color: "text-indigo-600", bg: "bg-indigo-100" },
          { label: "Pending Collections", value: formatINR(pendingCollections), icon: <Clock className="w-5 h-5 text-orange-500" />, color: "text-orange-500", bg: "bg-orange-100" },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                </div>
                <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center`}>{s.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bulk rent button */}
      <div className="flex justify-end">
        <Button variant="outline" className="gap-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50" onClick={() => setBulkOpen(true)}>
          <Zap className="w-4 h-4" /> Generate Bulk Rent Dues
        </Button>
      </div>

      {/* Tabs */}
      <div className="bg-card rounded-xl border shadow-sm">
        <Tabs defaultValue="collection">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
            <TabsTrigger value="collection" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-6 py-3 gap-2">
              <Receipt className="w-4 h-4" /> Collections
            </TabsTrigger>
            <TabsTrigger value="expense" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-6 py-3 gap-2">
              <Wallet className="w-4 h-4" /> Expenses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collection" className="p-6 m-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Collection History</h3>
              <Button onClick={() => setColOpen(true)} className="gap-2" data-testid="button-add-collection">
                <Plus className="w-4 h-4" /> Add Collection
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Date</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Remark</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No collections yet</TableCell></TableRow>}
                  {[...payments].reverse().map((p) => {
                    const t = tenants.find((tn) => tn.id === p.tenantId);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="text-sm">{formatDate(p.date)}</TableCell>
                        <TableCell className="text-sm font-medium">{t?.name || "-"}</TableCell>
                        <TableCell className="text-sm">{p.category}</TableCell>
                        <TableCell className="text-sm font-bold text-green-600">{formatINR(p.amount)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{p.remark || "-"}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:bg-red-50" onClick={() => setDeleteColId(p.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="expense" className="p-6 m-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Expense History</h3>
              <Button onClick={() => setExpOpen(true)} className="gap-2 bg-red-600 hover:bg-red-700" data-testid="button-add-expense">
                <Plus className="w-4 h-4" /> Add Expense
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Remark</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No expenses yet</TableCell></TableRow>}
                  {[...expenses].reverse().map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="text-sm">{formatDate(e.date)}</TableCell>
                      <TableCell className="text-sm font-medium">{e.description}</TableCell>
                      <TableCell className="text-sm">{e.category}</TableCell>
                      <TableCell className="text-sm font-bold text-red-500">{formatINR(e.amount)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{e.remark || "-"}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:bg-red-50" onClick={() => setDeleteExpId(e.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Collection Modal */}
      <Dialog open={colOpen} onOpenChange={setColOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Collection</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Tenant</Label>
              <Select value={colForm.tenantId} onValueChange={(v) => setColForm({ ...colForm, tenantId: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select Tenant" /></SelectTrigger>
                <SelectContent>{tenants.map((t) => <SelectItem key={t.id} value={t.id}>{t.name} ({t.phone})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Amount (₹)</Label><Input type="number" className="mt-1" value={colForm.amount} onChange={(e) => setColForm({ ...colForm, amount: e.target.value })} /></div>
            <div><Label>Date</Label><Input type="date" className="mt-1" value={colForm.date} onChange={(e) => setColForm({ ...colForm, date: e.target.value })} /></div>
            <div><Label>Category</Label>
              <Select value={colForm.category} onValueChange={(v) => setColForm({ ...colForm, category: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{DUE_CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Remark</Label><Input className="mt-1" value={colForm.remark} onChange={(e) => setColForm({ ...colForm, remark: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setColOpen(false)}>Cancel</Button>
            <Button onClick={submitCollection}>Add Collection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expense Modal */}
      <Dialog open={expOpen} onOpenChange={setExpOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Description *</Label><Input className="mt-1" value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} /></div>
            <div><Label>Amount (₹) *</Label><Input type="number" className="mt-1" value={expForm.amount} onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })} /></div>
            <div><Label>Date</Label><Input type="date" className="mt-1" value={expForm.date} onChange={(e) => setExpForm({ ...expForm, date: e.target.value })} /></div>
            <div><Label>Category</Label>
              <Select value={expForm.category} onValueChange={(v) => setExpForm({ ...expForm, category: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{EXP_CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Remark</Label><Textarea className="mt-1" rows={2} value={expForm.remark} onChange={(e) => setExpForm({ ...expForm, remark: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExpOpen(false)}>Cancel</Button>
            <Button onClick={submitExpense} className="bg-red-600 hover:bg-red-700">Add Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Rent Modal */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Generate Bulk Rent Dues</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Month</Label><Input type="month" className="mt-1" value={bulkMonth} onChange={(e) => setBulkMonth(e.target.value)} /></div>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader><TableRow className="bg-muted/50"><TableHead>Tenant</TableHead><TableHead>Rent</TableHead><TableHead>Already Exists</TableHead></TableRow></TableHeader>
                <TableBody>
                  {activeTenantPreviews.map((t) => {
                    const exists = dues.some((d) => d.tenantId === t.id && d.category === "Rent" && d.dueDate.startsWith(bulkMonth));
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="text-sm">{t.name}</TableCell>
                        <TableCell className="text-sm font-medium text-indigo-600">{formatINR(t.rent)}</TableCell>
                        <TableCell><span className={`text-xs ${exists ? "text-orange-500" : "text-green-600"}`}>{exists ? "Exists" : "Will create"}</span></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)}>Cancel</Button>
            <Button onClick={generateBulkRent} className="gap-2"><Zap className="w-4 h-4" /> Generate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirms */}
      <AlertDialog open={!!deleteColId} onOpenChange={() => setDeleteColId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Collection</AlertDialogTitle><AlertDialogDescription>Remove this collection record?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => { if (deleteColId) { deletePayment(deleteColId); toast({ title: "Deleted" }); setDeleteColId(null); } }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={!!deleteExpId} onOpenChange={() => setDeleteExpId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Expense</AlertDialogTitle><AlertDialogDescription>Remove this expense record?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => { if (deleteExpId) { deleteExpense(deleteExpId); toast({ title: "Deleted" }); setDeleteExpId(null); } }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
