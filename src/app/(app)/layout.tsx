"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

import AppShell from "@/components/layout/AppShell";
import { AUTH_SESSION_CACHE_KEY } from "@/lib/auth";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

const AUTH_ROUTES = ["/sign-in", "/sign-up"] as const;
const SHELL_EXCLUDE_PREFIXES = ["/onboarding"] as const;

const LoadingScreen = () => (
  <div className="relative min-h-screen w-full overflow-hidden bg-brand-alabaster">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -top-48 -left-48 h-[40rem] w-[40rem] rounded-full bg-[#D2B193]/[var(--glow-opacity-1)] blur-3xl" />
      <div className="absolute -bottom-56 -right-40 h-[32rem] w-[32rem] rounded-full bg-[#EFE8D8]/[var(--glow-opacity-2)] blur-3xl" />
    </div>
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_500px_at_0%_0%,rgba(210,177,147,var(--radial-opacity)),transparent_60%)]" />
    <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(58,47,47,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(58,47,47,0.04)_1px,transparent_1px)] [background-size:28px_28px]" />

    <div className="relative flex min-h-screen items-center justify-center p-6">
      <div className="group relative mx-auto w-full max-w-md">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#D2B193]/40 to-[#EFE8D8]/40 opacity-60 blur-2xl transition duration-500 group-hover:opacity-80" />
        <div className="relative rounded-2xl border border-white/20 bg-white/10 p-8 text-center text-[#3A2F2F] shadow-[0_6px_30px_rgba(58,47,47,0.10)] backdrop-blur-xl">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-white/30 bg-white/20 shadow-inner backdrop-blur">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#D2B193]/60 border-t-transparent" />
          </div>
          <h2 className="font-display text-2xl tracking-wide">
            Preparing your workspace
          </h2>
          <p className="mt-2 text-sm text-[#7A6F6F]">
            Checking your session and settings…
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const supabase = useMemo(() => getSupabaseBrowser(), []);
  const isOnboardingRoute = pathname.startsWith("/onboarding");

  const [authorized, setAuthorized] = useState(
    () => (isOnboardingRoute ? true : false)
  );
  const [status, setStatus] = useState<"checking" | "ready">(
    () => (isOnboardingRoute ? "ready" : "checking")
  );

  const STATUS_CACHE_KEY = "user_status_cache_v1";

  useEffect(() => {
    // Skip auth gate entirely on onboarding routes to avoid blocking when session cookies are in flux.
    if (isOnboardingRoute) {
      setAuthorized(true);
      setStatus("ready");
      return;
    }

    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
    if (isAuthRoute) {
      setStatus("ready");
      setAuthorized(false);
      return;
    }

    let cancelled = false;

    const readCachedSession = () => {
      if (typeof window === "undefined") {
        return;
      }
      const cached = sessionStorage.getItem(AUTH_SESSION_CACHE_KEY);
      if (!cached) {
        return;
      }
      try {
        const parsed = JSON.parse(cached) as { expires_at?: number };
        if (parsed?.expires_at && parsed.expires_at * 1000 > Date.now()) {
          setAuthorized(true);
          setStatus("ready");
        }
      } catch (error) {
        console.warn("Unable to read cached session", error);
        sessionStorage.removeItem(AUTH_SESSION_CACHE_KEY);
      }
    };

    const clearCachedSession = () => {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(AUTH_SESSION_CACHE_KEY);
      }
    };

    const persistSession = (session: Session) => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          AUTH_SESSION_CACHE_KEY,
          JSON.stringify({
            expires_at: session.expires_at,
            user: {
              id: session.user?.id,
              email: session.user?.email,
            },
          })
        );
      }
    };

    const redirectTo = (destination: string) => {
      router.replace(destination);
    };

    const readStatusCache = () => {
      if (typeof window === "undefined") return null;
      try {
        const cached = sessionStorage.getItem(STATUS_CACHE_KEY);
        if (!cached) return null;
        return JSON.parse(cached) as { onboardingComplete?: boolean };
      } catch {
        sessionStorage.removeItem(STATUS_CACHE_KEY);
        return null;
      }
    };

    const writeStatusCache = (payload: { onboardingComplete: boolean; userType: string | null }) => {
      if (typeof window === "undefined") return;
      try {
        sessionStorage.setItem(STATUS_CACHE_KEY, JSON.stringify(payload));
      } catch {
        // ignore
      }
    };

    const ensureOnboardingComplete = async (): Promise<boolean> => {
      // If cache already knows onboarding is done, return immediately and refresh in background.
      const cached = readStatusCache();
      if (cached?.onboardingComplete) {
        // Background refresh
        fetch("/api/user/status", { cache: "no-store" })
          .then((res) => (res.ok ? res.json() : null))
          .then((json) => {
            if (json?.onboardingComplete) {
              writeStatusCache(json);
            }
          })
          .catch(() => {});
        return true;
      }

      if (pathname.startsWith("/onboarding")) {
        return true;
      }
      try {
        const response = await fetch("/api/user/status", { cache: "no-store" });
        if (cancelled) {
          return false;
        }
        if (response.ok) {
          const json = await response.json();
          writeStatusCache(json);
          if (json.onboardingComplete) {
            return true;
          }
        }
      } catch (error) {
        console.error("Failed to fetch onboarding status", error);
      }
      redirectTo("/onboarding");
      return false;
    };

    const verifySession = async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) {
        return;
      }

      const session = data.session;
      if (!session) {
        clearCachedSession();
        setAuthorized(false);
        setStatus("ready");
        redirectTo("/sign-in");
        return;
      }

      persistSession(session);
      const onboardingOk = await ensureOnboardingComplete();
      if (!onboardingOk) {
        return;
      }

      setAuthorized(true);
      setStatus("ready");
    };

    readCachedSession();
    verifySession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (cancelled) {
          return;
        }
        if (session) {
          persistSession(session);
          setAuthorized(true);
        } else {
          clearCachedSession();
          setAuthorized(false);
          redirectTo("/sign-in");
        }
      }
    );

    return () => {
      cancelled = true;
      listener.subscription?.unsubscribe?.();
    };
  }, [pathname, router, supabase]);

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (status !== "ready" || !authorized) {
    return <LoadingScreen />;
  }

  const shouldUseShell = SHELL_EXCLUDE_PREFIXES.every(
    (prefix) => !pathname.startsWith(prefix)
  );

  if (!shouldUseShell) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
