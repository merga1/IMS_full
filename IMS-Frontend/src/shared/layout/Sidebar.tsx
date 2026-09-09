import { Link } from "wouter";
import { cn } from "@/shared/utils/utils";
import { useAuthStore } from "@/state/auth.store";
import {
  LayoutDashboard,
  Package,
  FileText,
  CheckSquare,
  Truck,
  Wrench,
  Building2,
  ShieldCheck,
  MapPin,
  DollarSign,
  Bell,
  ArrowRightLeft,
  Shield,
  Briefcase,
  Server,
  PackagePlus,
  Users,

  Send,
  Armchair
} from "lucide-react";

// ... imports
import { useLanguage } from "@/app/providers/LanguageProvider";

interface SidebarProps {
  collapsed: boolean;
  mobileOpen?: boolean;
}

export function Sidebar({ collapsed, mobileOpen = false }: SidebarProps) {
  const { user } = useAuthStore();
  const { t } = useLanguage();

  let activeLinks: any[] = [];

  if (user?.role === 'SYSTEM_ADMIN') {
    activeLinks = [
      { href: "/admin", label: t('nav.dashboard'), icon: LayoutDashboard },
      { href: "/admin/branch-new", label: t('nav.create_branch'), icon: Building2 },
      { href: "/admin/hierarchy", label: t('nav.system_hierarchy'), icon: MapPin },
      { href: "/admin/onboarding", label: t('nav.create_user'), icon: ShieldCheck },
    ];
  } else {
    // Dynamic dashboard label based on role
    const dashboardLabel = user?.role === 'TEAM_LEADER' ? t('nav.personal_dashboard') : t('nav.command_dashboard');

    const links = [
      { href: "/", label: dashboardLabel, icon: LayoutDashboard, roles: ['GD', 'DGD_SERVICE', 'DGD_DIGITALIZATION', 'DIRECTOR', 'TEAM_LEADER', 'STOREKEEPER', 'MAINTENANCE', 'EMPLOYEE', 'THIRD_PARTY'] },
      { href: "/dgd/service", label: t('nav.service_sector'), icon: Briefcase, roles: ['DGD_SERVICE'] },
      { href: "/dgd/digital", label: t('nav.digital_sector'), icon: Server, roles: ['DGD_DIGITALIZATION'] },
      { href: "/inventory", label: t('nav.master_catalog'), icon: Package, roles: ['STOREKEEPER'] },
      { href: "/inventory/stock-in", label: t('nav.receive_stock'), icon: PackagePlus, roles: ['STOREKEEPER'] },
      { href: "/requests", label: t('nav.my_requests'), icon: FileText, roles: ['GD', 'DGD_SERVICE', 'DGD_DIGITALIZATION', 'DIRECTOR', 'TEAM_LEADER', 'MAINTENANCE', 'EMPLOYEE', 'THIRD_PARTY'] },
      { href: "/approvals", label: t('nav.auth_queue'), icon: CheckSquare, roles: ['DGD_SERVICE', 'DGD_DIGITALIZATION', 'DIRECTOR', 'TEAM_LEADER'] },
      { href: "/dispatch", label: t('nav.secure_handover'), icon: Truck, roles: ['STOREKEEPER'] },
      { href: "/maintenance", label: t('nav.dept_overview'), icon: Wrench, roles: ['MAINTENANCE'] },
      { href: "/hq-inventory", label: t('nav.hq_warehouse'), icon: Building2, roles: ['STOREKEEPER'] },

      { href: "/inventory/branch-dispatch", label: t('nav.inter_branch'), icon: Send, roles: ['STOREKEEPER'] },
      { href: "/inventory/placement", label: t('nav.stationary'), icon: Armchair, roles: ['STOREKEEPER'] },
      { href: "/inventory/map", label: t('nav.floor_map'), icon: MapPin, roles: ['STOREKEEPER'] },
      { href: "/inventory/transfer", label: t('nav.local_transfer'), icon: ArrowRightLeft, roles: ['STOREKEEPER'] },
      { href: "/director", label: t('nav.my_directorate'), icon: Briefcase, roles: ['DIRECTOR'] },
      { href: "/team-lead", label: t('nav.manager_workspace'), icon: Users, roles: ['TEAM_LEADER'] },
      { href: "/hq-dashboard", label: t('nav.exec_heatmap'), icon: Building2, roles: ['GD', 'DGD_SERVICE', 'DGD_DIGITALIZATION'] },
      { href: "/gd/procurement", label: t('nav.procurement'), icon: DollarSign, roles: ['GD'] },
      { href: "/gd/alerts", label: t('nav.threshold_alerts'), icon: Bell, roles: ['GD'] },
      { href: "/gd/transfers", label: t('nav.transfer_vis'), icon: ArrowRightLeft, roles: ['GD'] },
      { href: "/gd/audit", label: t('nav.compliance'), icon: Shield, roles: ['GD'] },
    ];
    activeLinks = links.filter(link => {
      if (!user || !link.roles.includes(user.role)) return false;
      // Special guard for HQ Inventory and HQ Operations
      if (['/hq-inventory', '/inventory/branch-dispatch'].includes(link.href) && user.branch !== 'HQ') return false;
      return true;
    });

  }

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0",
        // Mobile behavior: Fixed positioning when open
        mobileOpen
          ? "fixed inset-y-0 left-0 z-50 w-64 shadow-2xl md:static md:z-0 md:shadow-none"
          : "hidden md:flex md:relative",

        // Desktop behavior: Handle copyapsed state
        // Note: We use md: prefixes for collapsed states to ensure they don't affect mobile valid open state
        collapsed
          ? "md:w-0 md:opacity-0 md:pointer-events-none md:border-none"
          : "md:w-72 md:opacity-100 md:border-r md:border-sidebar-border"
      )}
    >

      {/* Animation Overlay */}
      <div
        className="absolute inset-0 animate-moving-background pointer-events-none"
        style={{
          backgroundImage: `url(/finger.png)`,
          backgroundBlendMode: 'overlay',
          backgroundSize: '500px',
          backgroundRepeat: 'repeat',
          filter: 'blur(8px)',
          opacity: 0.15,
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        <div className="p-6 flex items-center gap-4 border-b border-primary-foreground/10 bg-primary-foreground/5 transition-all">
          <img src="/Logo.png" alt="Logo" className="w-10 h-10 object-contain transition-all" />
          <div className="text-left flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h1 className="font-bold text-xl tracking-wide text-white leading-tight truncate drop-shadow-md">
                {t('app.name')} <span className="text-gold">IMS</span>
              </h1>
            </div>
            <p className="text-xs uppercase font-bold text-primary-foreground/90 tracking-widest leading-tight whitespace-normal mt-1">
              {t('app.subtitle')}
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {activeLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 py-3 rounded-xl text-sm font-bold transition-all duration-200 group relative",
                "px-4 mx-2",
                window.location.pathname === link.href
                  ? "bg-white/15 text-primary-foreground shadow-sm"
                  : "hover:bg-primary-foreground/10 hover:text-gold text-primary-foreground/90"
              )}
            >
              <link.icon className={cn("w-4 h-4", window.location.pathname === link.href ? "text-gold" : "text-primary-foreground/50 group-hover:text-gold")} />
              {!collapsed && <span>{link.label}</span>}
              {window.location.pathname === link.href && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-gold rounded-r-full shadow-[0_0_8px_rgba(244,182,26,0.5)]" />
              )}
            </Link>
          ))}
        </nav>

        {user?.role === 'SYSTEM_ADMIN' && (
          <div className="mt-2 px-4 pb-4 border-t border-primary-foreground/10 pt-4 overflow-y-auto max-h-[40vh]">
          </div>
        )}

      </div>
    </aside >
  );
}
