"use client";

import { useState, useEffect, useCallback } from "react";
import { User, Mail, Phone, MapPin, Building, Calendar, Camera, Save, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";

export default function ProfilePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    location: "",
    bio: "",
    imageUrl: "",
    plan: "free",
    userType: "business",
    createdAt: "",
  });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/profile");
      if (!response.ok) {
        // Fallback to user/status if profile endpoint doesn't exist yet
        const statusResponse = await fetch("/api/user/status");
        if (!statusResponse.ok) throw new Error("Failed to fetch profile");
        const data = await statusResponse.json();
        setProfile({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: "",
          company: "",
          location: "",
          bio: "",
          imageUrl: data.imageUrl || "",
          plan: data.plan || "free",
          userType: data.userType || "business",
          createdAt: data.createdAt || new Date().toISOString(),
        });
      } else {
        const data = await response.json();
        setProfile({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          company: data.company || "",
          location: data.location || "",
          bio: data.bio || "",
          imageUrl: data.imageUrl || "",
          plan: data.plan || "free",
          userType: data.userType || "business",
          createdAt: data.createdAt || new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to load profile data",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "error",
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
        });
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // TODO: Upload to storage service (S3, Cloudinary, etc.)
      // For now, just show preview
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // TODO: Implement actual API call to update profile
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          company: profile.company,
          location: profile.location,
          bio: profile.bio,
          imageUrl: imagePreview || profile.imageUrl,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      toast({
        title: "Success",
        description: "Your profile has been updated",
        variant: "default",
      });

      // Refresh profile data
      await fetchProfile();
      setImagePreview(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to update profile. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setImagePreview(null);
    fetchProfile(); // Reset to original values
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#2D2424] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6B5E5E]">Loading profile...</p>
        </div>
      </div>
    );
  }

  const displayImage = imagePreview || profile.imageUrl;
  const memberSince = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2D2424]">Profile Settings</h1>
          <p className="text-[#6B5E5E] mt-1">Manage your personal information and preferences</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header Section with Background */}
        <div className="h-32 bg-gradient-to-r from-[#D2B193] to-[#B89B7B]"></div>
        
        {/* Profile Image Section */}
        <div className="px-8 pb-8">
          <div className="flex items-end gap-6 -mt-16">
            {/* Profile Image */}
            <div className="relative group">
              <div className="h-32 w-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#D2B193] to-[#B89B7B]">
                    <User className="h-16 w-16 text-white" />
                  </div>
                )}
              </div>
              
              {/* Upload Button */}
              <label
                htmlFor="profile-image"
                className="absolute bottom-0 right-0 bg-[#D2B193] hover:bg-[#C2A183] text-white rounded-full p-2.5 cursor-pointer shadow-lg transition-all hover:scale-110"
                title="Upload profile picture"
              >
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  id="profile-image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* User Info */}
            <div className="flex-1 pt-8">
              <h2 className="text-2xl font-bold text-[#2D2424]">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-[#6B5E5E] mt-1">{profile.email}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="inline-flex items-center rounded-full bg-[#D2B193]/20 border border-[#D2B193]/30 px-4 py-1.5 text-sm font-semibold text-[#D2B193] capitalize shadow-sm">
                  {profile.plan} Plan
                </span>
                <span className="flex items-center gap-1.5 text-sm text-[#6B5E5E] bg-white/60 px-3 py-1.5 rounded-full border border-gray-200">
                  <Calendar className="h-4 w-4" />
                  Member since {memberSince}
                </span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="mt-8 space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#2D2424] mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#6B5E5E]" />
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-[#2D2424] focus:border-[#D2B193] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/20"
                    placeholder="John"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2D2424] mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#6B5E5E]" />
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-[#2D2424] focus:border-[#D2B193] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/20"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-[#2D2424] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#6B5E5E]" />
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-[#6B5E5E] cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-xs text-[#6B5E5E]">Email cannot be changed</p>
            </div>

            {/* Phone & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#2D2424] mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#6B5E5E]" />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-[#2D2424] focus:border-[#D2B193] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/20"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2D2424] mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#6B5E5E]" />
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-[#2D2424] focus:border-[#D2B193] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/20"
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-[#2D2424] mb-2">
                Company
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#6B5E5E]" />
                <input
                  type="text"
                  value={profile.company}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-[#2D2424] focus:border-[#D2B193] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/20"
                  placeholder="Acme Inc."
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-[#2D2424] mb-2">
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    setProfile({ ...profile, bio: e.target.value });
                  }
                }}
                rows={4}
                maxLength={500}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-[#2D2424] focus:border-[#D2B193] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/20 resize-none"
                placeholder="Tell us about yourself..."
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-[#6B5E5E]">
                  Brief description for your profile
                </p>
                <p className={`text-xs font-medium ${profile.bio.length > 450 ? 'text-amber-600' : 'text-[#6B5E5E]'}`}>
                  {profile.bio.length}/500
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={handleCancel}
              className="border border-gray-300 bg-white text-[#2D2424] hover:bg-gray-50"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#D2B193] hover:bg-[#C2A183] text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#F8F2EA] to-[#FDF9F3] px-8 py-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-[#2D2424]">Account Settings</h3>
          <p className="text-sm text-[#6B5E5E] mt-1">Manage your subscription and account preferences</p>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#D2B193]/20 to-[#B89B7B]/20 flex items-center justify-center">
                <User className="h-6 w-6 text-[#D2B193]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#2D2424]">User Type</h4>
                <p className="text-sm text-[#6B5E5E] capitalize">{profile.userType} Account</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#D2B193] to-[#B89B7B] flex items-center justify-center shadow-md">
                <span className="text-white text-lg font-bold">{profile.plan.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h4 className="font-semibold text-[#2D2424]">Current Plan</h4>
                <p className="text-sm text-[#6B5E5E] capitalize">{profile.plan} Plan - {profile.plan === 'free' ? 'Limited features' : 'Full access'}</p>
              </div>
            </div>
            <Button
              className="bg-gradient-to-r from-[#D2B193] to-[#B89B7B] text-white hover:from-[#C2A183] hover:to-[#A88B6B] shadow-md"
              onClick={() => window.location.href = "/pricing"}
            >
              {profile.plan === 'free' ? 'Upgrade Plan' : 'Manage Plan'}
            </Button>
          </div>

          <div className="flex items-center justify-between py-4 bg-red-50 rounded-lg px-4 -mx-2">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-red-900">Danger Zone</h4>
                <p className="text-sm text-red-700">Permanently delete your account and all data</p>
              </div>
            </div>
            <Button
              variant="secondary"
              className="border border-red-300 bg-white text-red-600 hover:bg-red-600 hover:text-white transition-colors"
              onClick={() => {
                if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                  toast({
                    variant: "error",
                    title: "Account Deletion",
                    description: "Please contact support at support@curative.ai to proceed with account deletion.",
                  });
                }
              }}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
