'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, CalendarDays, Boxes, BarChart3, Settings as SettingsIconLucide, Sparkles, LogOut, Shield, Bell, User, Link as LinkIcon } from "lucide-react";
import UserMenu from "@/components/auth/UserMenu";
import SocialMediaConnections from "@/components/settings/SocialMediaConnections";

// Navigation icon components (lucide)
const DashboardIconNew = () => <LayoutDashboard className="h-5 w-5" />;
const CalendarIconNew = () => <CalendarDays className="h-5 w-5" />;
const VaultIconNew = () => <Boxes className="h-5 w-5" />;
const AnalyticsIconNew = () => <BarChart3 className="h-5 w-5" />;
const SettingsIconNew = () => <SettingsIconLucide className="h-5 w-5" />;

// Reusable NavLink for the sidebar
const NavLink = ({ href, icon, children, isActive = false }: { 
  href: string; 
  icon: React.ReactNode; 
  children: React.ReactNode; 
  isActive?: boolean;
}) => (
  <a 
    href={href} 
    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors duration-200 ${
      isActive 
        ? 'bg-white text-[#2D2424] border border-[#EFE8D8]' 
        : 'text-[#6B5E5E] hover:bg-white hover:text-[#2D2424] border border-transparent hover:border-[#EFE8D8]'
    }`}
  >
    {icon}
    <span className="font-medium">{children}</span>
  </a>
);

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('social-media');

  const tabs = [
    { id: 'social-media', label: 'Social Media', icon: <LinkIcon className="h-4 w-4" /> },
    { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'privacy', label: 'Privacy & Security', icon: <Shield className="h-4 w-4" /> },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-72 bg-white/90 fixed backdrop-blur border-r border-[#EFE8D8] p-6 flex flex-col">
        <div className="mb-8 flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[#5D4037] to-[#3E2723] rounded-xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-[#2D2424]">Curative</h1>
        </div>
        
        <nav className="space-y-2 flex-1">
          <NavLink href="/dashboard" icon={<DashboardIconNew />}>Dashboard</NavLink>
          <NavLink href="/calendar" icon={<CalendarIconNew />}>Calendar</NavLink>
          <NavLink href="/analytics" icon={<AnalyticsIconNew />}>Analytics</NavLink>
          <NavLink href="/settings" icon={<SettingsIconNew />} isActive>Settings</NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white/90 backdrop-blur border-b border-[#EFE8D8] px-6 flex items-center justify-end">
          <UserMenu />
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 bg-gradient-to-br from-[#FAF7F0] via-[#F5F2E8] to-[#EBE5D6] overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#2D2424] mb-2">Settings</h1>
              <p className="text-[#6B5E5E]">Manage your account preferences and integrations</p>
            </div>

            {/* Settings Tabs */}
            <div className="bg-white/90 backdrop-blur border border-[#EFE8D8] rounded-2xl overflow-hidden">
              <div className="flex border-b border-[#EFE8D8]">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'text-[#2D2424] bg-white border-b-2 border-[#2D2424]'
                        : 'text-[#6B5E5E] hover:text-[#2D2424] hover:bg-white/50'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'social-media' && (
                  <div>
                    <h2 className="text-xl font-semibold text-[#2D2424] mb-4">Social Media Integrations</h2>
                    <p className="text-[#6B5E5E] mb-6">
                      Connect your social media accounts to automatically import analytics and track your content performance across platforms.
                    </p>
                    <SocialMediaConnections />
                  </div>
                )}

                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-xl font-semibold text-[#2D2424] mb-4">Profile Settings</h2>
                    <p className="text-[#6B5E5E] mb-6">
                      Manage your personal information and account preferences.
                    </p>
                    <div className="bg-white/50 rounded-xl p-6 border border-[#EFE8D8]">
                      <p className="text-[#6B5E5E]">Profile settings coming soon...</p>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div>
                    <h2 className="text-xl font-semibold text-[#2D2424] mb-4">Notification Preferences</h2>
                    <p className="text-[#6B5E5E] mb-6">
                      Choose how and when you want to receive notifications about your content and account activity.
                    </p>
                    <div className="bg-white/50 rounded-xl p-6 border border-[#EFE8D8]">
                      <p className="text-[#6B5E5E]">Notification settings coming soon...</p>
                    </div>
                  </div>
                )}

                {activeTab === 'privacy' && (
                  <div>
                    <h2 className="text-xl font-semibold text-[#2D2424] mb-4">Privacy & Security</h2>
                    <p className="text-[#6B5E5E] mb-6">
                      Control your privacy settings and manage account security options.
                    </p>
                    <div className="bg-white/50 rounded-xl p-6 border border-[#EFE8D8]">
                      <p className="text-[#6B5E5E]">Privacy and security settings coming soon...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}