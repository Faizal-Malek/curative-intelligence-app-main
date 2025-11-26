# Brand Automation Roadmap

_Last updated: Nov 25, 2025_

This roadmap turns the current premium UI into a fully automated operating system for creators/brands. It breaks the work into three tracks so we can ship high-impact pieces incrementally while keeping quality high.

---

## 1. Google Profile Auto-Fill (Account Onboarding)

**Objective:** When a user signs in with Google, we automatically hydrate their workspace profile with every attribute Google shares (name, avatar, phone), so they land in a pre-filled profile instead of a blank form.

### Data Flow Enhancements
- **Supabase OAuth Scopes:** Confirm the Google provider in Supabase is configured with `https://www.googleapis.com/auth/userinfo.profile` and `userinfo.email`. If we need phone numbers, enable the `People API` scope (`userinfo.profile` does not provide verified phone numbers by default).
- **Server Mapping Helper:** `src/lib/user-supabase.ts` now exposes `extractProfileFromSupabaseUser()`. Every call to `ensureUserBySupabase()` should pass this payload so our Prisma `User` table receives first/last name, avatar, and phone automatically.
- **Cache Busting:** After PATCHing `/api/user/profile`, we already invalidate cache keys. Keep this so newly synced Google data is visible immediately across the dashboard and AppShell.

### UI Touchpoints
- `src/components/auth/UserMenu.tsx`: already reflects the authenticated email avatar. Once DB rows contain avatars/phone, this component should render those assets (no extra API work required).
- `src/app/(app)/profile/page.tsx`: ensure placeholder states (initials) only show if the DB truly lacks data. The form should surface a tip like “Imported from Google – edit anytime” when we pre-fill fields.

---

## 2. Automated Content Vault Population

**Objective:** Replace the placeholder vault with a real AI pipeline that writes ideas/templates directly into the database every time a generation batch runs.

### Data Model
- Add `ContentIdea` + `ContentTemplate` Prisma models (userId, title, body, tags, metadata, status, sourceBatchId, scheduledPostId, etc.).
- Link `Post` records to ideas when a draft graduates into a scheduled asset (`post.ideaId`).

### Backend API Surface
- `GET /api/vault/ideas`: paginated list filtered by status/tags.
- `POST /api/vault/ideas`: allow manual creation from the Vault page/modals.
- `DELETE /api/vault/ideas/:id`: remove stale ideas.
- `POST /api/vault/templates/generate`: call Gemini/OpenAI with brand profile inputs to craft reusable templates (store in `ContentTemplate`).

### AI Pipeline Integration
- Worker (`src/workers/generation-worker.js`) should:
  1. Fetch brand profile + user context.
  2. Generate idea briefs + ready-to-edit captions.
  3. Insert them as `ContentIdea` rows (and `Post` rows when relevant).
  4. Emit notifications via `notification-service` so the dashboard can show “3 new ideas added to your vault.”

### Frontend Wiring
- `src/components/dashboard/ContentVaultModal.tsx` and `src/app/(app)/vault/page.tsx` should fetch from the new APIs via SWR/react-query, not mock arrays.
- `onIdeaAdded` should call the POST endpoint and refetch; the modal can accept defaults (title, tags) from AI suggestions for even faster editing.
- Populate the Vault header counts with real data (server-provided totals for ideas/templates).

---

## 3. Social Media Automation & Scheduling

**Objective:** Turn the “Social Media Integrations” panel into a control center that can edit posts, queue schedules, and sync live analytics so owners see the impact instantly.

### Platform Connectivity
- **Accounts Table:** `SocialMediaAccount` already stores access tokens. Extend it with `capabilities` JSON (e.g., `{ canSchedule: true }`) so the UI can show which actions are available per platform.
- **Token Health:** Implement background jobs that refresh tokens (where applicable) and flag expired credentials in the dashboard with actionable CTAs.

### Scheduling Workflow
1. `Calendar` / `Vault` surfaces expose “Schedule” and “Edit Copy” actions. These update a `Post` row’s `scheduledAt`, `platform`, `mediaUrl`, etc.
2. A new worker (cron job) polls for `Post` entries with `status = READY_TO_SCHEDULE` and `scheduledAt <= now`, calls the relevant platform API, updates `status` to `POSTED` or `FAILED`, and logs responses.
3. For manual overrides, allow “Send now” (immediate publish) and “Cancel schedule.”

### Live Analytics & Updates
- Create `/api/social-media/analytics/sync` endpoint that fetches follower counts, reach, and engagement for each linked account. Use Supabase Edge functions or cron workers to hit this endpoint hourly and store the values in `SocialMediaAnalytics`.
- Surface the freshest numbers on:
  - Owner dashboard (mission control vitals).
  - User dashboard (momentum monitor + highlights) with timezone-friendly “last synced X minutes ago.”

### Editing & Template Support
- Introduce a reusable “Post Composer” drawer shared by Vault, Calendar, and Quick Actions. It should:
  - Load an existing idea/post.
  - Allow editing caption, assets, CTA, hashtags.
  - Offer AI assist buttons (“Rewrite for LinkedIn,” “Shorten to Reel script”).
  - Save back to the vault/post tables.

### Notifications & Auditing
- Whenever a scheduled post is published or fails, push a notification (and optionally email) with the result.
- Log every automation step in `ActivityLog` so owners have a forensic trail (who approved, when it posted, platform response).

---

## Implementation Order
1. **Week 1:** Finalize Google profile mapping + update Supabase scopes (already partially complete with `extractProfileFromSupabaseUser`). Ship UI polish on Profile page.
2. **Week 2:** Schema migration for `ContentIdea`/`ContentTemplate`, CRUD APIs, and Vault UI wiring. Begin worker upgrades to write actual ideas.
3. **Week 3-4:** Social automation: scheduling service, composer UI, analytics sync jobs, and improved integration settings page.
4. **Week 5+:** Advanced features like multi-account posting, cross-channel templates, predictive scheduling insights.

Each milestone should include automated tests (API + Prisma), seed scripts for local data, and updated README instructions so the team can reproduce flows end-to-end.
