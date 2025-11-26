"use client";

import { useState } from "react";
import { Shield, Bell, User, Link as LinkIcon } from "lucide-react";
import SocialMediaConnections from "@/components/settings/SocialMediaConnections";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("social-media");

  const tabs = [
    {
      id: "social-media",
      label: "Social Media",
      icon: <LinkIcon className="h-4 w-4" />,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="h-4 w-4" />,
    },
    {
      id: "privacy",
      label: "Privacy & Security",
      icon: <Shield className="h-4 w-4" />,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2D2424] mb-2">Settings</h1>
        <p className="text-[#6B5E5E]">
          Manage your account preferences and integrations
        </p>
      </div>

      <div className="bg-white/90 backdrop-blur border border-[#EFE8D8] rounded-2xl overflow-hidden">
        <div className="flex border-b border-[#EFE8D8]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? "text-[#2D2424] bg-white border-b-2 border-[#2D2424]"
                  : "text-[#6B5E5E] hover:text-[#2D2424] hover:bg-white/50"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "social-media" && (
            <div>
              <h2 className="text-xl font-semibold text-[#2D2424] mb-4">
                Social Media Integrations
              </h2>
              <p className="text-[#6B5E5E] mb-6">
                Connect your social media accounts to automatically import
                analytics and track your content performance across platforms.
              </p>
              <SocialMediaConnections />
            </div>
          )}

          {activeTab === "notifications" && (
            <div>
              <h2 className="text-xl font-semibold text-[#2D2424] mb-4">
                Notification Preferences
              </h2>
              <p className="text-[#6B5E5E] mb-6">
                Choose how and when you want to receive notifications about your
                content and account activity.
              </p>
              <div className="bg-white/50 rounded-xl p-6 border border-[#EFE8D8]">
                <p className="text-[#6B5E5E]">
                  Notification settings coming soon...
                </p>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div>
              <h2 className="text-xl font-semibold text-[#2D2424] mb-4">
                Privacy & Security
              </h2>
              <p className="text-[#6B5E5E] mb-6">
                Control your privacy settings and manage account security
                options.
              </p>
              <div className="bg-white/50 rounded-xl p-6 border border-[#EFE8D8]">
                <p className="text-[#6B5E5E]">
                  Privacy and security settings coming soon...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
