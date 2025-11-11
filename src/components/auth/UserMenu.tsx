"use client";

import React from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { AUTH_SESSION_CACHE_KEY } from "@/lib/auth";

export default function UserMenu() {
  const supabase = getSupabaseBrowser();
  const [email, setEmail] = React.useState<string>("");

  React.useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then((response) => {
      if (!mounted) {
        return;
      }
      setEmail(response.data.user?.email ?? "");
    });

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(AUTH_SESSION_CACHE_KEY);
    }
    window.location.href = "/sign-in";
  };

  const initial = email?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="flex items-center gap-3 rounded-full border border-[#EADCCE] bg-white/80 px-3 py-2 shadow-sm backdrop-blur">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D2B193] text-sm font-semibold text-white">
        {initial}
      </div>
      <div className="hidden min-w-[120px] flex-col text-left text-[#2F2626] sm:flex">
        <span className="text-sm font-medium truncate">
          {email || "Workspace user"}
        </span>
        <span className="text-xs text-[#7A6F6F]">Online</span>
      </div>
      <button
        onClick={signOut}
        className="text-sm font-semibold text-[#C2671B] transition-colors hover:text-[#9f5417]"
      >
        Logout
      </button>
    </div>
  );
}
