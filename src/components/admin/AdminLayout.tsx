import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard, Users, UserCheck, UserCog, Wallet, Building2,
  Wrench, Megaphone, FileText, Zap, CarFront, BarChart3,
  LogOut, Bell, MessageCircle, Menu, X, Moon, Sun,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const { logout, currentUserPhone, pendingRegistrations, dues, tenants } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(false);

  const pendingDueCount = dues.filter((d) => {
    const days = Math.ceil((new Date(d.dueDate).getTime() - Date.now()) / 86400000);
    return d.status === "Pending" && days <= 3;
  }).length;

  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Tenant Dashboard", href: "/admin/tenants", icon: <Users className="w-4 h-4" /> },
    { label: "Pending Approvals", href: "/admin/pending", icon: <UserCheck className="w-4 h-4" />, badge: pendingRegistrations.length },
    { label: "All Tenants", href: "/admin/all-tenants", icon: <UserCog className="w-4 h-4" /> },
    { label: "Money", href: "/admin/money", icon: <Wallet className="w-4 h-4" /> },
    { label: "Properties & Flats", href: "/admin/properties", icon: <Building2 className="w-4 h-4" /> },
    { label: "Maintenance", href: "/admin/maintenance", icon: <Wrench className="w-4 h-4" /> },
    { label: "Notice Board", href: "/admin/notices", icon: <Megaphone className="w-4 h-4" /> },
    { label: "Agreements", href: "/admin/agreements", icon: <FileText className="w-4 h-4" /> },
    { label: "Utility Bills", href: "/admin/utility-bills", icon: <Zap className="w-4 h-4" /> },
    { label: "Visitor Log", href: "/admin/visitors", icon: <CarFront className="w-4 h-4" /> },
    { label: "Reports", href: "/admin/reports", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const pageTitle = navItems.find((n) => location.startsWith(n.href))?.label || "Dashboard";

  function handleLogout() {
    logout();
    setLocation("/");
  }

  function toggleDark() {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  }

  function whatsappAll() {
    window.open("https://wa.me/?text=Reminder: Your rent payment is due. Please login to Money Pay portal to pay.", "_blank");
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Money Pay</h2>
            <p className="text-xs text-white/60">Owner Dashboard</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                    isActive
                      ? "bg-white/15 text-white font-medium"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                  data-testid={`nav-${item.href.replace("/admin/", "")}`}
                >
                  {item.icon}
                  <span className="text-sm flex-1">{item.label}</span>
                  {item.badge ? (
                    <Badge className="bg-red-500 text-white text-xs px-1.5 py-0 h-5">
                      {item.badge}
                    </Badge>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{currentUserPhone}</p>
            <p className="text-xs text-white/50">Owner / Admin</p>
          </div>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10 w-8 h-8"
              onClick={toggleDark}
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-red-300 hover:text-red-200 hover:bg-white/10 w-8 h-8"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col flex-shrink-0 shadow-xl">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 flex flex-col">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold text-foreground">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            {pendingDueCount > 0 && (
              <Badge variant="destructive" className="text-xs flex items-center gap-1">
                <Bell className="w-3 h-3" />
                {pendingDueCount} dues due soon
              </Badge>
            )}
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white text-xs gap-1"
              onClick={whatsappAll}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Message All
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
