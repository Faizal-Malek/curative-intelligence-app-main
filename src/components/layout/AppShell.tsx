"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  FolderKanban,
  BarChart3,
  Settings,
  Sparkles,
  Menu,
  X,
  CreditCard,
  User,
  Shield,
  MessageSquare,
} from "lucide-react";

import { cn } from "@/lib/utils";
import UserMenu from "@/components/auth/UserMenu";
import { NotificationBell } from "@/components/NotificationBell";
import { useUser } from "@/hooks/useUser";
import { DEFAULT_ALLOWED_NAVIGATION } from "@/lib/navigation";

import type { LucideIcon } from "lucide-react";

type NavChild = {
  label: string;
  href: string;
  disabled?: boolean;
};

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  children?: NavChild[];
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: CalendarDays,
    children: [
      { label: "Reminders", href: "/calendar" },
      { label: "Posts", href: "/calendar/posts", disabled: true },
      { label: "Goals", href: "/calendar/goals", disabled: true },
      { label: "Events", href: "/calendar/events", disabled: true },
    ],
  },
  {
    label: "Content Vault",
    href: "/vault",
    icon: FolderKanban,
  },
  {
    label: "Support",
    href: "/support",
    icon: MessageSquare,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Admin",
    href: "/admin",
    icon: Shield,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    label: "Pricing",
    href: "/pricing",
    icon: CreditCard,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

function NavLink({
  item,
  isActive,
  onNavigate,
}: {
  item: NavItem;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors duration-200",
        isActive
          ? "bg-[#3A2F2F] text-white shadow-[0_20px_45px_rgba(58,47,47,0.25)]"
          : "text-[#6B5E5E] hover:bg-[#F2E7DA] hover:text-[#2F2626]"
      )}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  );
}

function ChildLink({
  child,
  isActive,
  onNavigate,
}: {
  child: NavChild;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  if (child.disabled) {
    return (
      <span className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[#B5A7A7]">
        <span>{child.label}</span>
        <span className="text-[10px] uppercase">Soon</span>
      </span>
    );
  }

  return (
    <Link
      href={child.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors",
        isActive
          ? "bg-[#F2E7DA] text-[#2F2626]"
          : "text-[#6B5E5E] hover:bg-[#F7EFE4] hover:text-[#2F2626]"
      )}
    >
      <span>{child.label}</span>
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAdmin, isOwner } = useUser();

  // Filter navigation items based on user role and permissions
  const visibleNavItems = useMemo(() => {
    // Owners see owner-specific navigation - they don't use AppShell
    // They use OwnerNavbar instead, so redirect to owner dashboard
    if (isOwner) {
      return [];
    }

    // Admins see admin navigation
    if (isAdmin) {
      return NAV_ITEMS.filter((item) => {
        // Hide Owner Dashboard
        if (item.href === '/owner') return false;
        // Show Admin
        if (item.href === '/admin') return true;
        // Hide Pricing for admins
        if (item.href === '/pricing') return false;
        return true;
      });
    }

    // Regular users see navigation based on permissions set by owner
    const allowedNavigation =
      user?.navigation?.allowed ||
      user?.allowedNavigation ||
      [...DEFAULT_ALLOWED_NAVIGATION];

    const hasRoute = (route: string) =>
      user?.navigation?.lookup?.[route] ?? allowedNavigation.includes(route);

    return NAV_ITEMS.filter((item) => {
      // Hide Admin and Owner links
      if (item.href === '/admin' || item.href === '/owner') return false;
      
      // Check if user has permission for this route
      const route = item.href.replace('/', '');
      return hasRoute(route);
    });
  }, [isAdmin, isOwner, user]);

  const activeNav = useMemo(() => {
    for (const item of visibleNavItems) {
      if (pathname.startsWith(item.href)) {
        if (item.children) {
          const child = item.children.find((child) => pathname === child.href);
          return { parent: item, child };
        }
        return { parent: item, child: undefined };
      }
    }
    return { parent: undefined, child: undefined };
  }, [pathname, visibleNavItems]);

  const sidebarContent = (
    <div className="flex h-full flex-col border-r border-[#EADCCE] bg-white/75 px-5 py-6 backdrop-blur">
      <div className="flex items-center gap-3 pb-10">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#5D4037] to-[#3E2723] shadow">
          <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-[#2F2626]">
            Curative
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] text-[#B89B7B]">
            Command Center
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {visibleNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <div key={item.href} className="space-y-2">
              <NavLink
                item={item}
                isActive={isActive}
                onNavigate={() => setMobileOpen(false)}
              />
              {isActive && item.children && (
                <div className="ml-3 space-y-1">
                  {item.children.map((child) => (
                    <ChildLink
                      key={child.href}
                      child={child}
                      isActive={pathname === child.href}
                      onNavigate={() => setMobileOpen(false)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="pt-6 text-xs text-[#9C8B8B]">
        <p className="font-medium text-[#2F2626]">Workspace Tips</p>
        <p className="mt-1 leading-relaxed">
          Automate content across your channels and review performance in one
          place.
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#FBFAF8] text-[#2F2626]">
      <aside className="relative hidden h-full w-72 shrink-0 md:block">
        {sidebarContent}
      </aside>

      <div className="flex h-full flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#EADCCE] bg-white/85 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#EADCCE] bg-white text-[#3A2F2F] shadow-sm md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[#B89B7B]">
                Workspace View
              </p>
              <h2 className="text-lg font-semibold sm:text-xl">
                {activeNav.child?.label ??
                  activeNav.parent?.label ??
                  "Workspace"}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <UserMenu />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#F8F2EA] via-[#FDF9F3] to-[#F0E3D2]">
          <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <button
            type="button"
            className="flex-1 bg-black/30"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-72 bg-white shadow-xl">
            <button
              type="button"
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#EADCCE] text-[#3A2F2F]"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <div className="h-full overflow-y-auto pt-16">{sidebarContent}</div>
          </div>
        </div>
      )}
    </div>
  );
}
