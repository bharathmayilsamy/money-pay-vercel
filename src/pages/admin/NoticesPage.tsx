import { useState } from "react";
import { useStore, genId, formatDate, type Notice } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Megaphone, Trash2, CalendarDays } from "lucide-react";

function priorityStyle(p: string) {
  if (p === "Urgent") return "bg-red-100 text-red-700 border-red-300";
  if (p === "Important") return "bg-orange-100 text-orange-700 border-orange-300";
  return "bg-blue-100 text-blue-700 border-blue-300";
}

function cardBorder(p: string) {
  if (p === "Urgent") return "border-l-red-500";
  if (p === "Important") return "border-l-orange-500";
  return "border-l-blue-400";
}

export default function NoticesPage() {
  const { notices, addNotice, deleteNotice, addLog } = useStore();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "", priority: "Normal" as Notice["priority"], expiryDate: "" });

  function submit() {
    if (!form.title || !form.content || !form.expiryDate) { toast({ title: "Error", description: "Fill all fields", variant: "destructive" }); return; }
    addNotice({ id: genId(), title: form.title, content: form.content, priority: form.priority, postedDate: new Date().toISOString().split("T")[0], expiryDate: form.expiryDate });
    addLog("Notice Posted", `"${form.title}" notice posted`);
    toast({ title: "Notice Posted" });
    setOpen(false);
    setForm({ title: "", content: "", priority: "Normal", expiryDate: "" });
  }

  const today = new Date().toISOString().split("T")[0];
  const activeNotices = notices.filter((n) => n.expiryDate >= today);
  const expiredNotices = notices.filter((n) => n.expiryDate < today);

  const NoticeCard = ({ notice }: { notice: Notice }) => {
    const expired = notice.expiryDate < today;
    return (
      <Card key={notice.id} className={`border-l-4 ${cardBorder(notice.priority)} shadow-sm ${expired ? "opacity-60" : ""}`} data-testid={`notice-card-${notice.id}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{notice.title}</h3>
                <Badge variant="outline" className={`text-xs ${priorityStyle(notice.priority)}`}>{notice.priority}</Badge>
                {expired && <Badge variant="outline" className="text-xs border-gray-300 text-gray-500">Expired</Badge>}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{notice.content}</p>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Posted: {formatDate(notice.postedDate)}</span>
                <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Expires: {formatDate(notice.expiryDate)}</span>
              </div>
            </div>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 flex-shrink-0" onClick={() => setDeleteId(notice.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)} className="gap-2" data-testid="button-post-notice">
          <Plus className="w-4 h-4" /> Post Notice
        </Button>
      </div>

      {notices.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No notices yet. Post your first notice.</p>
        </div>
      )}

      {activeNotices.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Active Notices ({activeNotices.length})</h2>
          {activeNotices.map((n) => <NoticeCard key={n.id} notice={n} />)}
        </div>
      )}

      {expiredNotices.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Expired Notices ({expiredNotices.length})</h2>
          {expiredNotices.map((n) => <NoticeCard key={n.id} notice={n} />)}
        </div>
      )}

      {/* Add Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Post New Notice</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title *</Label><Input className="mt-1" placeholder="Water Supply Disruption" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Content *</Label><Textarea className="mt-1" rows={4} placeholder="Notice details..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
            <div><Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Notice["priority"] })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Important">Important</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Expiry Date *</Label><Input type="date" className="mt-1" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}><Megaphone className="w-4 h-4 mr-2" /> Post Notice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Notice</AlertDialogTitle><AlertDialogDescription>Remove this notice?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => { if (deleteId) { deleteNotice(deleteId); toast({ title: "Deleted" }); setDeleteId(null); } }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
