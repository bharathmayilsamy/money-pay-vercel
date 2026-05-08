import { useState } from "react";
import { useLocation } from "wouter";
import { useStore, genId, type PendingRegistration } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Building2, Lock, UserPlus, Phone, Shield } from "lucide-react";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login, tenants, addPendingRegistration } = useStore();
  const { toast } = useToast();

  const [userType, setUserType] = useState<"Admin" | "Tenant">("Admin");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loginMsg, setLoginMsg] = useState("");

  const [reg, setReg] = useState({
    name: "", phone: "", email: "", aadhaar: "", altPhone: "",
    dob: "", gender: "", currentAddress: "", permanentAddress: "",
    govtId: "", vehicleNo: "", remarks: "",
  });

  function handleSendOtp() {
    if (!phone) { setLoginMsg("Enter phone number"); return; }
    setOtpSent(true);
    setLoginMsg("Demo OTP: 123456");
  }

  function handleVerifyOtp() {
    if (otp !== "123456") { setLoginMsg("Invalid OTP. Use 123456"); return; }
    if (userType === "Admin") {
      login("Admin", phone);
      setLocation("/admin/dashboard");
    } else {
      const tenant = tenants.find((t) => t.phone === phone);
      if (!tenant) {
        setLoginMsg("No tenant account found. Demo: 9876543210 / 9988776655 / 9876543212");
        return;
      }
      if (tenant.status === "Evicted") {
        setLoginMsg("Your account has been deactivated.");
        return;
      }
      login("Tenant", phone);
      setLocation("/tenant");
    }
  }

  function handleRegister() {
    if (!reg.name || !reg.phone) {
      toast({ title: "Error", description: "Name and Phone are required", variant: "destructive" });
      return;
    }
    const newReg: PendingRegistration = {
      id: genId(), ...reg, registeredDate: new Date().toISOString(),
    };
    addPendingRegistration(newReg);
    toast({ title: "Registration Submitted", description: "Owner will review and approve your registration." });
    setReg({ name: "", phone: "", email: "", aadhaar: "", altPhone: "", dob: "", gender: "", currentAddress: "", permanentAddress: "", govtId: "", vehicleNo: "", remarks: "" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-indigo-700">Money Pay</h1>
          </div>
          <p className="text-gray-500 text-lg">India's Complete Rental Management Platform</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Login Card */}
          <Card className="shadow-xl border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Lock className="w-5 h-5 text-indigo-600" />
                Login to Dashboard
              </CardTitle>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="text-xs text-gray-500">Admin: any number</Badge>
                <Badge variant="outline" className="text-xs text-gray-500">OTP: 123456</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>User Type</Label>
                <Select value={userType} onValueChange={(v) => setUserType(v as "Admin" | "Tenant")}>
                  <SelectTrigger className="mt-1" data-testid="select-user-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Property Owner / Admin</SelectItem>
                    <SelectItem value="Tenant">Tenant / Resident</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Phone Number</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    data-testid="input-phone"
                  />
                  {!otpSent && (
                    <Button onClick={handleSendOtp} data-testid="button-send-otp">
                      Send OTP
                    </Button>
                  )}
                </div>
              </div>
              {otpSent && (
                <div>
                  <Label>OTP</Label>
                  <Input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="mt-1 text-center text-xl tracking-widest"
                    data-testid="input-otp"
                  />
                </div>
              )}
              {loginMsg && (
                <p className={`text-sm ${loginMsg.includes("Invalid") || loginMsg.includes("No tenant") ? "text-red-500" : "text-green-600"}`}>
                  {loginMsg}
                </p>
              )}
              <Button
                className="w-full"
                onClick={otpSent ? handleVerifyOtp : handleSendOtp}
                data-testid="button-login"
              >
                {otpSent ? "Verify OTP & Login" : "Continue"}
              </Button>
              <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
                <p className="font-medium mb-1">Demo Tenant Credentials:</p>
                <p>Chandan: 9876543210 | Sunil: 9988776655 | Santhosh: 9876543212</p>
              </div>
            </CardContent>
          </Card>

          {/* Registration Card */}
          <Card className="shadow-xl border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <UserPlus className="w-5 h-5 text-green-600" />
                New Tenant Registration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Full Name *</Label>
                    <Input placeholder="Full Name" value={reg.name} onChange={(e) => setReg({ ...reg, name: e.target.value })} className="mt-1" data-testid="input-reg-name" />
                  </div>
                  <div>
                    <Label className="text-xs">Phone *</Label>
                    <Input type="tel" placeholder="Phone" value={reg.phone} onChange={(e) => setReg({ ...reg, phone: e.target.value })} className="mt-1" data-testid="input-reg-phone" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input type="email" placeholder="Email" value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Aadhaar Number</Label>
                    <Input placeholder="XXXX-XXXX-XXXX" value={reg.aadhaar} onChange={(e) => setReg({ ...reg, aadhaar: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Alternate Phone</Label>
                    <Input placeholder="Alt Phone" value={reg.altPhone} onChange={(e) => setReg({ ...reg, altPhone: e.target.value })} className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Date of Birth</Label>
                    <Input type="date" value={reg.dob} onChange={(e) => setReg({ ...reg, dob: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Gender</Label>
                    <Select value={reg.gender} onValueChange={(v) => setReg({ ...reg, gender: v })}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Current Address</Label>
                  <Input placeholder="Current Address" value={reg.currentAddress} onChange={(e) => setReg({ ...reg, currentAddress: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Permanent Address</Label>
                  <Input placeholder="Permanent Address" value={reg.permanentAddress} onChange={(e) => setReg({ ...reg, permanentAddress: e.target.value })} className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Govt ID</Label>
                    <Input placeholder="PAN / Voter ID" value={reg.govtId} onChange={(e) => setReg({ ...reg, govtId: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Vehicle Number</Label>
                    <Input placeholder="MH01AB1234" value={reg.vehicleNo} onChange={(e) => setReg({ ...reg, vehicleNo: e.target.value })} className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Remarks</Label>
                  <Textarea placeholder="Any remarks" rows={2} value={reg.remarks} onChange={(e) => setReg({ ...reg, remarks: e.target.value })} className="mt-1" />
                </div>
              </div>
              <Button className="w-full mt-4 bg-green-600 hover:bg-green-700" onClick={handleRegister} data-testid="button-register">
                Submit Registration
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
