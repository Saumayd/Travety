# Travity — Build Roadmap

Frontend prototype now moving onto a real backend (Lovable Cloud). Aqua Lagoon theme default, Hindi on key UI, dark mode + selector wired.

## Phase 1 — Foundation (done)
- [x] Design system (light/dark, tokens, animations) — src/styles.css
- [x] Travis assets (wave / think / celebrate) + FriendAvatar SVG system
- [x] Demo state, i18n (en/hi), UI primitives, mock Delhi NCR data

## Phase 2 — Core journey (done, demo data)
- [x] Login / sign-up (/)
- [x] App shell + navigation (sidebar, mobile)
- [x] Home dashboard (/dashboard)
- [x] Create outing multi-step flow (/plan)
- [x] Join a plan (/join)
- [x] Group lobby (/lobby) — start points, invite code, chat
- [x] Destination recommendations (/recommendations) — trade-off + compare
- [x] Destination details + nearby discovery (/destination/$slug)
- [x] Map experience + globe intro (/map)
- [x] Safety map + honest data cards (/safety)
- [x] Explore, outings, past, reviews, saved, expenses, notifications, profile, help

## Phase 4 — Verify (demo era, done)
- [x] Build clean, Playwright walkthrough of core flow, fix findings

## Phase 5 — Real backend (Lovable Cloud, in progress)
- [x] Enable Lovable Cloud
- [x] Enable email/password auth
- [x] Schema migration: profiles (auto-created on signup), plans, plan_members, chat_messages, expenses, saved_places, outings + RLS
- [ ] Auth UI: real sign-up / sign-in on (/) — email/password + Google + Sign in with Lovable; /reset-password page
- [ ] Replace demo-state with cloud-backed data (plans, members, chat, expenses, saved)
- [ ] Realtime chat in the lobby
- [ ] Seed demo content per-user where it improves first-run (mock destinations stay static)

## Phase 6 — Aqua Lagoon theme (in progress)
- [x] styles.css tokens reskinned from purple Midnight Galaxy to aqua
- [ ] Travis artwork recolour to aqua (wave / think / celebrate)
- [ ] design.md palette section update

## Pending from user
- [x] Fix dashboard context identity mismatch during preview updates; verified guest navigation, three tests, and the restored dashboard in the user's live preview.
- [x] Add sign-in-free Continue preview navigation and remove Google demo from welcome.
- [x] Verify signed-out preview entry, Home/Explore navigation, reload, exit and Hindi entry; no private cloud data requests. Three tests passed.
- [x] Refine welcome layout: top-right preferences menu, larger existing waving Travis and bilingual welcome, authentication below.
- [x] Remove Continue with Lovable from welcome authentication options.
- [x] Verify theme/language, form validation and response states, and Home/Explore access using a real signed-in session; mobile/tablet/desktop checks passed.
- Verification limitation: password sign-in and signup confirmation were checked with simulated responses, not live credentials or email delivery; Google OAuth was not completed.
