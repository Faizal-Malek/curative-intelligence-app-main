'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  MessageSquare,
  Settings,
  Bell,
  Menu,
  X,
  DollarSign,
  Activity,
  FileText,
  Shield,
  Database,
} from 'lucide-react';
import UserMenu from '@/components/auth/UserMenu';
import { OwnerNotificationBell } from '@/components/OwnerNotificationBell';

const ownerNavigation = [
  { name: 'Dashboard', href: '/owner/dashboard', icon: LayoutDashboard },
  { name: 'User Management', href: '/owner/users', icon: Users },
  { name: 'Profiles', href: '/owner/profiles', icon: Database },
  { name: 'Analytics', href: '/owner/analytics', icon: BarChart3 },
  { name: 'Revenue', href: '/owner/revenue', icon: DollarSign },
  { name: 'Support Tickets', href: '/owner/support', icon: MessageSquare },
  { name: 'Reports', href: '/owner/reports', icon: FileText },
  { name: 'System Health', href: '/owner/system', icon: Activity },
  { name: 'Settings', href: '/owner/settings', icon: Settings },
];

const formatRoleLabel = (role?: string | null) => {
  if (!role) return 'Owner';
  return role
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(' ');
};

interface OwnerNavbarProps {
  user: {
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    imageUrl?: string | null;
    role: string;
  };
  unreadNotifications?: number;
}

export default function OwnerNavbar({ user, unreadNotifications = 0 }: OwnerNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const ownerDisplayName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  const ownerRoleLabel = formatRoleLabel(user.role);

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#EADCCE] bg-white/85 backdrop-blur shadow-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#5D4037] to-[#3E2723] shadow">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-[#2F2626]">Admin Portal</h1>
                <p className="text-xs uppercase tracking-[0.2em] text-[#B89B7B]">Owner Access</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-0.5">
              {ownerNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`
                      group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide uppercase transition-all duration-200
                      ${active 
                        ? 'bg-[#3A2F2F] text-white shadow-[0_8px_20px_rgba(58,47,47,0.25)]' 
                        : 'text-[#6B5E5E] hover:bg-[#F2E7DA] hover:text-[#2F2626]'
                      }
                    `}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <OwnerNotificationBell />

              {/* User Menu with logout */}
              <UserMenu
                displayName={ownerDisplayName || user.email}
                subtitle={ownerRoleLabel}
                avatarUrl={user.imageUrl}
                variant="hover-card"
              />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-[#6B5E5E] hover:text-[#2F2626] hover:bg-[#F2E7DA] rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur border-t border-[#EADCCE]">
            <div className="px-4 py-4 space-y-2">
              {ownerNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                      ${active 
                        ? 'bg-[#3A2F2F] text-white shadow-[0_8px_20px_rgba(58,47,47,0.25)]' 
                        : 'text-[#6B5E5E] hover:bg-[#F2E7DA] hover:text-[#2F2626]'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16" />
    </>
  );
}
