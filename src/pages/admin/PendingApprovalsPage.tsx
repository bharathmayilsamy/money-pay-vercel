import { useStore, formatDate } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, UserX, CheckCircle2, Clock } from "lucide-react";

export default function PendingApprovalsPage() {
  const { pendingRegistrations, approvePendingRegistration, rejectPendingRegistration, addLog } = useStore();
  const { toast } = useToast();

  function approve(id: string, name: string) {
    approvePendingRegistration(id);
    addLog("Tenant Approved", `${name} registration approved`);
    toast({ title: "Approved", description: `${name} has been approved as a tenant` });
  }

  function reject(id: string, name: string) {
    rejectPendingRegistration(id);
    addLog("Registration Rejected", `${name} registration rejected`);
    toast({ title: "Rejected", description: `${name}'s registration has been rejected`, variant: "destructive" });
  }

  if (pendingRegistrations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No Pending Approvals</h3>
        <p className="text-sm text-muted-foreground mt-1">All registration requests have been processed</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="destructive">{pendingRegistrations.length} pending</Badge>
        <span className="text-sm text-muted-foreground">Tenant registration requests awaiting your approval</span>
      </div>

      <div className="space-y-4">
        {pendingRegistrations.map((reg) => (
          <Card key={reg.id} className="border-l-4 border-l-orange-400 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{reg.name}</h3>
                    <Badge variant="outline" className="border-orange-300 text-orange-600">
                      <Clock className="w-3 h-3 mr-1" /> Pending
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-sm">
                    <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{reg.phone}</span></div>
                    {reg.email && <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{reg.email}</span></div>}
                    {reg.aadhaar && <div><span className="text-muted-foreground">Aadhaar:</span> <span className="font-medium">{reg.aadhaar}</span></div>}
                    {reg.gender && <div><span className="text-muted-foreground">Gender:</span> <span className="font-medium">{reg.gender}</span></div>}
                    {reg.dob && <div><span className="text-muted-foreground">DOB:</span> <span className="font-medium">{formatDate(reg.dob)}</span></div>}
                    {reg.vehicleNo && <div><span className="text-muted-foreground">Vehicle:</span> <span className="font-medium">{reg.vehicleNo}</span></div>}
                    {reg.govtId && <div><span className="text-muted-foreground">Govt ID:</span> <span className="font-medium">{reg.govtId}</span></div>}
                    {reg.currentAddress && <div className="col-span-2"><span className="text-muted-foreground">Current Address:</span> <span className="font-medium">{reg.currentAddress}</span></div>}
                    {reg.remarks && <div className="col-span-2"><span className="text-muted-foreground">Remarks:</span> <span className="font-medium">{reg.remarks}</span></div>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Registered on: {new Date(reg.registeredDate).toLocaleString("en-IN")}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white gap-1"
                    onClick={() => approve(reg.id, reg.name)}
                    data-testid={`button-approve-${reg.id}`}
                  >
                    <UserCheck className="w-4 h-4" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 gap-1"
                    onClick={() => reject(reg.id, reg.name)}
                    data-testid={`button-reject-${reg.id}`}
                  >
                    <UserX className="w-4 h-4" /> Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
