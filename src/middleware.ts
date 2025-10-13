// Temporary middleware during migration from Clerk to Supabase.
// We will enforce auth at the route level via Supabase tokens.
export default function middleware() {}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

