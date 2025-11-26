"use client";

import React from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { AUTH_SESSION_CACHE_KEY } from "@/lib/auth-constants";
import type { Session } from "@supabase/supabase-js";

type UserMenuVariant = "inline" | "hover-card";

interface UserMenuProps {
  displayName?: string;
  subtitle?: string;
  className?: string;
  avatarUrl?: string | null;
  variant?: UserMenuVariant;
}

const cx = (...classes: Array<string | undefined | null | false>) =>
  classes.filter(Boolean).join(" ");

export default function UserMenu({
  displayName,
  subtitle,
  className,
  avatarUrl,
  variant = "inline",
}: UserMenuProps) {
  const supabase = React.useMemo(() => getSupabaseBrowser(), []);
  const [email, setEmail] = React.useState<string>("");
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    let active = true;

    const hydrateUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !active) {
          return;
        }
        setEmail(data.user?.email ?? "");
      } catch (err) {
        console.warn("Unable to read Supabase user", err);
      }
    };

    hydrateUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session: Session | null) => {
        if (!active) return;
        setEmail(session?.user?.email ?? "");
      }
    );

    return () => {
      active = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(AUTH_SESSION_CACHE_KEY);
    }
    window.location.href = "/sign-in";
  };

  const primaryLabel = displayName || email || "Workspace user";
  const secondaryLabel = subtitle ?? "Online";
  const identifier = displayName || email;
  const initial = identifier?.charAt(0)?.toUpperCase() || "U";

  const renderAvatar = (customClass?: string) => {
    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt={primaryLabel}
          className={cx("rounded-full object-cover", customClass)}
        />
      );
    }
    return (
      <div
        className={cx(
          "flex items-center justify-center rounded-full bg-[#D2B193] text-sm font-semibold text-white",
          customClass
        )}
      >
        {initial}
      </div>
    );
  };

  const handleBlurCapture = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setMenuOpen(false);
    }
  };

  if (variant === "hover-card") {
    return (
      <div
        className={cx("relative inline-flex", className)}
        onMouseEnter={() => setMenuOpen(true)}
        onMouseLeave={() => setMenuOpen(false)}
        onFocusCapture={() => setMenuOpen(true)}
        onBlurCapture={handleBlurCapture}
      >
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={menuOpen}
          aria-label={`${primaryLabel} account menu`}
          className={cx(
            "flex h-11 w-11 items-center justify-center rounded-full border border-[#EADCCE] bg-white text-[#2F2626] shadow-sm transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D2B193]",
            menuOpen && "border-[#D2B193] shadow-md"
          )}
        >
          {renderAvatar("h-9 w-9 border border-[#EADCCE]")}
        </button>

        <div
          className={cx(
            "absolute right-0 top-full mt-3 w-72 origin-top-right rounded-2xl border border-[#EADCCE] bg-white/95 p-4 text-left shadow-xl transition-all duration-200",
            menuOpen
              ? "pointer-events-auto opacity-100 translate-y-0 scale-100"
              : "pointer-events-none opacity-0 -translate-y-2 scale-95"
          )}
        >
          <div className="flex items-center gap-3 border-b border-[#F0E3D2] pb-4">
            {renderAvatar("h-10 w-10 border border-[#EADCCE]")}
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#2F2626]">{primaryLabel}</p>
              {secondaryLabel ? (
                <p className="text-xs text-[#7A6F6F]">{secondaryLabel}</p>
              ) : null}
            </div>
          </div>
          <button
            onClick={signOut}
            className="mt-4 w-full rounded-xl bg-[#2F2626] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#463737]"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  const containerClass = cx(
    "flex items-center gap-3 rounded-full border border-[#EADCCE] bg-white/80 px-3 py-2 shadow-sm backdrop-blur",
    className
  );

  return (
    <div className={containerClass}>
      {renderAvatar("h-10 w-10 border border-[#EADCCE]")}
      <div className="hidden min-w-[120px] flex-col text-left text-[#2F2626] sm:flex">
        <span className="text-sm font-medium truncate">
          {primaryLabel}
        </span>
        {secondaryLabel ? (
          <span className="text-xs text-[#7A6F6F]">{secondaryLabel}</span>
        ) : null}
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
