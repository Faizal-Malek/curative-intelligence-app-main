# Performance & Responsiveness Audit (Nov 25, 2025)

## Scope & Approach
- Focused on the highest traffic surfaces: `AppLayout`, `src/app/(app)/dashboard/page.tsx`, `src/features/owner/OwnerDashboardV2.tsx`, `src/app/(app)/profile/page.tsx`, and shared chrome components (`UserMenu`, `ContentVaultModal`).
- Used the existing lint report plus manual render tracing to spot re-computation, stale effect dependencies, and over-eager network calls.
- Prioritized fixes that improve responsiveness without broad refactors so we can keep shipping while continuing deeper optimization work later.

## Key Findings
1. **Repeated asynchronous calls**: Components such as `UserMenu` recreated Supabase clients every render, triggering `getUser()` on each paint and spamming the network.
2. **Unstable memo dependencies**: Derived dashboard data was created inline, forcing `useMemo` hooks to re-run and re-render expensive sections even when the underlying API response had not changed yet.
3. **Incomplete effect dependency lists**: Core routing logic in `AppLayout` and profile fetching logic ignored dynamic dependencies, causing missed state updates (e.g., onboarding redirects) and stale profile data after edits.
4. **General lint drift**: The lint output highlighted dozens of unused values and `any` types. These inflate bundle size and hide real issues, so they were used as a checklist during the pass.

## Fixes Delivered This Pass
- **Supabase client memoization in `UserMenu`** to eliminate redundant `getUser()` calls and keep the visible email synced via `onAuthStateChange`.
- **Stable dashboard stats memoization** (`src/app/(app)/dashboard/page.tsx`) to stop recomputing momentum/insight blocks unnecessarily.
- **Dependency-complete effects** in `AppLayout` and `ProfilePage` so authentication, onboarding routing, and profile refetching react instantly to route/user changes.
- **Warning cleanup**: cleared the noisy `react-hooks/exhaustive-deps` violations around the areas above so future regressions are easier to spot during CI linting.

## Remaining Opportunities (Next Iteration)
1. **Media optimization**: Replace static `<img>` usage in profile, onboarding, and marketing components with `next/image` (lint already flags the hot spots) to cut LCP and bandwidth.
2. **Bundle trims**: Many admin/onboarding modules import icons/components they never render. Prune those to reduce client JS weight.
3. **API typing**: Several server routes rely on `any`, blocking type-driven dead code elimination. Converging on shared DTOs will help both safety and tree shaking.
4. **CSS animation gating**: Consider honoring `prefers-reduced-motion` for gradient/animation heavy dashboards to avoid layout thrash on lower-end devices.

## Verification Checklist
- Rerun `npm run lint` after the rest of the backlog items are handled; the remaining failures are now concentrated in admin/onboarding code paths and should no longer include the hotspots addressed above.
- Smoke-test both `/dashboard` and `/owner/dashboard` to ensure stats cards load once, profile editing still works, and the header user menu updates immediately after signing in/out.
