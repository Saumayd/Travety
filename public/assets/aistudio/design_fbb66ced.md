# Travity — Official Design System ("design.md")

**Version:** 2.0 · October 2026
**Status:** Foundational reference document. This file establishes the visual identity, colour system, character rules, geographic scope, map-integration architecture and interface standards for Travity.

> **How to read this document.** Each section distinguishes what is **already implemented** in the codebase from what is the **intended standard** (to be applied as the product evolves). Where the current code and this standard differ, this document wins going forward; existing designs are migrated when the affected screens are next touched, not through unrelated rewrites.

**Current codebase state (verified October 2026):**

- TanStack Start (React 19 + Vite 7 + Tailwind CSS v4), design tokens in `src/styles.css`, theme + English/Hindi switching in `src/lib/ui-prefs.tsx`, Delhi NCR mock data in `src/data/mock.ts`, shadcn/ui primitives in `src/components/ui`.
- **Midnight Galaxy tokens are implemented** in `src/styles.css` (`:root` light / `.dark` dark) with the exact hex values in §2, including the brand/semantic additions (`--brand-pink`, `--brand-cyan`, `--success`, `--warning`) and the approved gradient utilities (`grad-primary`, `grad-sky`, `text-grad`).
- **Theme switching is implemented** (light default, persists per session). **Language switching is implemented** (English default, Hindi covers key UI, graceful fallback; Devanagari wired through the `--font-hi` family).
- **Typography is loaded**: Bricolage Grotesque (display), Manrope (body) and Mukta (Devanagari) via a Google Fonts `<link>` in `src/routes/__root.tsx`.
- **All product pages are built and verified end-to-end**: home, plan creation, join, group lobby, recommendations, explore, saved, route map, safety, destination details, my outings, past outings, reviews, expenses, notifications, profile, help & privacy — matching every navigation link.
- **The stylised map is implemented**: `MetroMap` (SVG Delhi Metro coordinate space) plus the globe-to-Delhi intro overlay with a skip control on the map route. See §6.
- **Character assets implemented**: three Travis PNGs (`src/assets/travis-wave.png`, `travis-think.png`, `travis-celebrate.png`) and the `FriendAvatar` SVG character system (`src/components/travity/FriendAvatar.tsx`). The supplied character-design reference sheet is the authoritative reference (§3).
- **Real-place imagery policy implemented**: the previously AI-generated destination photographs were removed; destination cards render the `DestinationArt` branded placeholder, and the `Destination` record already carries the future Google Places photo fields (§8).

---

## 1. Product identity

Travity is a modern, social, safety-aware group travel and outing-planning application **focused exclusively on Delhi NCR**. It helps friends plan outings together, coordinate meeting points, compare destinations and individual commutes (time, cost, alternatives), explore route and safety information transparently, manage shared expenses, review outings, and discover new places within the NCR.

**Tone:** a thoughtfully designed travel companion — youthful, premium, friendly. **Not** a generic corporate dashboard, **not** a conventional security app.

**Identity anchors:**

- Travis, the friendly three-eyed alien guide mascot (§3).
- Distinct friend characters with stable identities and route colours (§4).
- A futuristic but readable map experience (§6–7).
- Practical route/expense comparisons with honest, clearly-labelled estimates.
- Transparent, responsible safety information (§7.5).

**Avoid:** excessive neon, gradients on everything, generic AI-generated artwork (especially for real places — see §8), visual clutter, decorative colour where colour carries meaning.

---

## 2. Official colour scheme: Midnight Galaxy

Deep navy surfaces as the foundation, with controlled electric-purple, pink and cyan accents. Futuristic, polished, friendly — without compromising readability.

### 2.1 Dark theme (exact tokens — implemented in `.dark` in `src/styles.css`)

| Role | Hex | Notes |
| --- | --- | --- |
| Primary background | `#0B1020` | Page canvas only |
| Secondary background | `#11152A` | Section bands, sidebar, sunk areas |
| Cards and panels | `#17172F` | Standard cards, inputs |
| Elevated surfaces | `#252541` | Popovers, menus, dialogs, selected elements |
| Primary action | `#8B5CF6` | Buttons, primary interactive elements |
| Secondary purple | `#A78BFA` | Hover/active states, secondary brand accents |
| Brand pink | `#F472B6` | Brand personality, route highlights |
| Cyan accent | `#67E8F9` | Informational highlights, selected info elements |
| Primary text | `#E5E7EB` | Body and headings |
| Secondary text | `#A1A1B5` | Supporting text, captions |
| Borders | `#252541` | Same as elevated surface colour |
| Success | `#34D399` | Positive states |
| Warning | `#FBBF24` | Caution / incomplete info |
| Danger | `#F87171` | Urgent warnings, errors |

**Surface logic:** darkest background = page canvas → slightly lighter = sections → cards/panels → elevated surfaces for overlays and selected elements. **Not every card glows and not every button is gradient-filled.**

### 2.2 Light theme (exact tokens — implemented in `:root` in `src/styles.css`)

| Role | Hex |
| --- | --- |
| Primary background | `#F8F7FF` |
| Secondary background | `#F1EEFA` |
| Cards and panels | `#FFFFFF` |
| Elevated surfaces | `#FFFFFF` |
| Primary text | `#19172B` |
| Secondary text | `#625F78` |
| Primary action | `#7041D8` |
| Brand pink | `#DB4F9B` |
| Borders | `#E7E2F2` |
| Success | `#087F5B` |
| Warning | `#925C00` |
| Danger | `#C53030` |

Light-mode text and accent colours are **not** blind reuses of dark-mode values — they are chosen for contrast (see §13). The two themes must read as two versions of the same product. Cyan (`#67E8F9`) and secondary purple (`#A78BFA`) carry into light mode only through their dark-contrast variants (`--brand-cyan: #0e7490`, `--electric: #0e7490`, accent foregrounds in the deep-purple family) so text-bearing uses stay readable.

**Theme switching status:** implemented (`ThemeProvider` in `src/lib/ui-prefs.tsx`, light default, session-persisted). Keep the mechanism; evolve the token *values*, not the wiring.

### 2.3 Brand gradients (selective use only)

- **Primary galaxy gradient:** `linear-gradient(135deg, #8B5CF6, #F472B6)` — implemented as `grad-primary` / `text-grad` utilities.
- **Map-opening gradient:** `linear-gradient(135deg, #F472B6, #A78BFA, #8B5CF6)` — implemented as `grad-sky` (pink → purple blend → violet), used by the globe intro.

Approved for: the globe-to-Delhi transition, selected brand illustrations, important onboarding/celebration moments, limited decorative accents. **Not** for all cards, navigation elements, or ordinary buttons.

### 2.4 Semantic colour rules

| Colour | Meaning |
| --- | --- |
| Green | Success, completed actions, positive states |
| Amber | Caution, incomplete information, attention required |
| Red | Urgent warnings, errors, dangerous conditions |
| Purple | Primary actions and interactive brand elements |
| Pink | Brand personality and selected route highlights |
| Cyan | Secondary highlights and informational elements |

Semantic colours are never used purely decoratively where the same colour could confuse a safety or status indicator. Meaningful colour is always paired with text, an icon, or another visible cue (§13).

### 2.5 Token mapping (implemented)

`src/styles.css` maps the Midnight Galaxy values onto the existing Tailwind v4 `@theme inline` variables — same variable names, new values. Verified mapping:

| CSS variable | Dark value | Light value |
| --- | --- | --- |
| `--background` / `--foreground` | `#0B1020` / `#E5E7EB` | `#F8F7FF` / `#19172B` |
| `--card` / `--card-foreground` | `#17172F` / `#E5E7EB` | `#FFFFFF` / `#19172B` |
| `--popover` / `--popover-foreground` | `#252541` / `#E5E7EB` | `#FFFFFF` / `#19172B` |
| `--primary` / `--primary-foreground` | `#8B5CF6` / `#FFFFFF` | `#7041D8` / `#FFFFFF` |
| `--secondary` / `--secondary-foreground` | `#11152A` / `#A78BFA` | `#F1EEFA` / `#5B3FA8` |
| `--muted` / `--muted-foreground` | `#11152A` / `#A1A1B5` | `#F1EEFA` / `#625F78` |
| `--accent` / `--accent-foreground` | `#1C1C38` / `#A78BFA` | `#EDE8FA` / `#4A2E93` |
| `--border` / `--input` | `#252541` / `#252541` | `#E7E2F2` / `#DDD7EE` |
| `--ring` | `#A78BFA` | `#7041D8` |
| `--brand-pink` | `#F472B6` | `#DB4F9B` |
| `--brand-cyan` | `#67E8F9` | `#0E7490` |
| `--success` | `#34D399` | `#087F5B` |
| `--warning` | `#FBBF24` | `#925C00` |
| `--destructive` | `#F87171` | `#C53030` |

Legacy aliases (`--electric`, `--mint`, `--glow`) remain for backwards compatibility and map to the contrast-appropriate light/dark variants. Shadows tint with purple, not pure black: `--shadow-glow`, `--shadow-soft`, `--shadow-lift` (all implemented, `color-mix` against `--primary`/`--foreground`). New colour roles must be added as `@theme`-wired variables here — never hardcoded hex values in components.

---

## 3. Travis and friend characters — preserve the original designs

**The supplied character-design reference sheet is the authoritative visual reference for Travis and all approved friend characters.** The sheet depicts: Travis in four approved poses (Front View, Happy, Thinking, Excited) with a feature callout panel, the six friend "map characters" roster, sample map usage (friend avatars as location markers, safety legend), and three speech-bubble UI moments ("Plan a day out?", "Safety matters!", "All set!").

### 3.1 Preserve character identity — hard rules

Do **not** redraw, regenerate, reinterpret, replace or redesign any supplied character. Preserve: silhouette; body shape and proportions; the exact number and arrangement of eyes; eye shapes and facial features; the number, shape and placement of antennae; mouth, expressions and distinctive details; original pose; overall identity; and the recognisable design differences between characters.

For **Travis** specifically, his defining traits per the reference sheet are:

- **Three expressive eyes** ("see more, help more") — two large upper eyes and a central lower eye. Never two, never four.
- **Two glowing antennae** ("guidance & connection") with rounded bulb tips. Never one, never three.
- **Backpack** and **compass medallion** — his travel-companion props.
- Soft, rounded, friendly proportions; open smile.
- Approved poses: **Front View, Happy, Thinking, Excited** (reference sheet) — the app currently uses three of these as `travis-wave.png` (greeting), `travis-think.png` (deliberation) and `travis-celebrate.png` (success). Additional poses may be added only by isolated extraction from the reference artwork — never by re-imagining him.

Do not simplify or change these defining details under any circumstances.

### 3.2 Colour adaptation — Midnight Galaxy palette

Character recolouring draws only from: `#8B5CF6`, `#A78BFA`, `#F472B6`, `#67E8F9`, `#17172F`, `#E5E7EB`. Combinations are chosen per character from the supplied artwork — do not force one combo onto every character.

**Travis (documented palette adaptation, intended):** the reference sheet shows a lavender-purple body in the `#8B5CF6`/`#A78BFA` family, glowing antenna bulbs suited to cyan `#67E8F9`, dark navy accessory/accent areas suited to `#17172F`, and light face/eye highlights suited to `#E5E7EB`. The current assets (`travis-wave/think/celebrate.png`) already sit in the same identity family — blue-violet body, glowing bulbs, dark backpack, compass medallion — and are **preserved as-is**; any further nudge toward the exact Midnight Galaxy hexes must be an **edit-only recolour** of the existing artwork (never a regeneration), skipped entirely if it would damage facial detail, in which case the original stays and this paragraph remains the documented intent.

**Friend characters (per the reference sheet — authoritative):** six soft, round characters, each defined by a colour + accessory pairing:

| Reference identity | Body colour family | Accessory |
| --- | --- | --- |
| Aarav | Blue | Cap |
| Riya | Pink | Bow |
| Kabir | Green | Headphones |
| Simran | Yellow | Hat |
| Meera | Purple | Glasses |
| Aditya | Teal | Sunglasses |

The demo roster in `src/data/mock.ts` (Aarav, Priya, Rohan, Sana, Kabir, Meera) uses these six accessory archetypes through the `FriendAvatar` SVG system (cap, bow, headphones, glasses, beanie, flower) with its own demo names. **Intended alignment (not yet applied):** the drawn accessory set converges on the reference sheet's six pairings, and demo names may remain as demo data — the reference sheet governs the *artwork*, the route palette (§4.1) governs the *route identity colour*, and the two are related but distinct cues. Friend avatars are implemented as the SVG character system (`FriendAvatar.tsx`) so accessory shapes stay crisp and can be tinted per member without redrawing; each avatar carries a contrasting outline/halo against the card or map surface so the character stays readable (§4.2).

### 3.3 Character use across the application

Use the approved assets consistently across: dashboard, authentication screens, outing creation, group lobby, friend invitations, route maps, journey status, empty states, loading states, success states, and past-outing recaps. Do not invent alternative character designs for different screens — the speech-bubble moments on the reference sheet ("Plan a day out?", "Safety matters!", "All set!") are the model for how Travis accompanies UI copy. Animation is allowed only where it preserves identity (§11).

---

## 4. Friend avatars and map identity

Each friend gets a distinct, recognisable avatar with a **stable visual identity across** group lobby, route comparison, map markers, journey status, notifications, expense lists and outing recaps.

### 4.1 Official route palette (implemented in `src/data/mock.ts`)

| Route | Colour | Demo member |
| --- | --- | --- |
| 1 | `#F472B6` pink | Priya |
| 2 | `#67E8F9` cyan | Aarav |
| 3 | `#A78BFA` purple | Kabir |
| 4 | `#34D399` green | Rohan |
| 5 | `#FBBF24` amber | Sana |
| 6 | `#FB923C` orange | Meera |

A friend's assigned colour never changes randomly between screens. The member `color` fields in `src/data/mock.ts` carry exactly these values. Character appearance and route colour are related identity cues, but route colour must remain readable and distinguishable from the character artwork itself — where necessary use a contrasting outline, halo, marker border or name label. Never rely on colour alone to identify a member (§13).

---

## 5. Geographic scope: Delhi NCR only

Delhi NCR exclusivity is a **fundamental product requirement, not a demo setting**. All examples, mock data, destinations, routes, metro journeys, safety facilities and reviews must be relevant to Delhi, Noida, Gurugram, Ghaziabad, Faridabad, and other relevant NCR areas. Routes may cross city boundaries when relevant.

- Current mock data (`src/data/mock.ts`) complies: 7 destinations (Connaught Place, India Gate Lawns, Hauz Khas Village, Netaji Subhash Place, Rajouri Garden, Sunder Nursery, Dilli Haat INA), a stylised Delhi Metro line map, NCR members with real station anchors, and Delhi-specific nearby places, offers and reviews. Preserve this approach.
- Never populate the app with worldwide tourist destinations or unrelated city examples.
- The globe animation (§6.4) is a visual introduction only; the interactive experience is always Delhi NCR.
- Document geographic coverage wherever a dataset (e.g. a safety layer) may not cover all of NCR, and clearly distinguish sample data from verified real-world information (§7.5, §8).

---

## 6. Map design — current phase and Google Maps future

### 6.1 Current frontend phase (implemented)

- The stylised map **is built**: `MetroMap` (`src/components/travity/MetroMap.tsx`) renders the Delhi Metro coordinate space from `src/data/mock.ts` (station `x`/`y`, `METRO_LINES`, `LINE_COLORS`), with destination markers, per-member route lines, friend highlighting and a demo legend on the map route.
- The **globe-to-Delhi intro is implemented** on the map route: a `grad-sky` globe, Travis greeting, and a skip control — matching §6.4.
- Mock locations, routes, markers and safety layers stay **in the data layer, separate from UI components**. Pages consume interfaces (`Destination`, `Member`, `RouteOption`, `MemberCommute`, `SafetyMarker`, `SafetyStatus`), never inline literals.
- All travel times, fares and geometry are deterministic illustrative estimates, always labelled as such ("Illustrative demo estimate" / "Demo preview — data is simulated").
- **Do not require a Google Maps API key** to run the frontend demo. **Do not claim** live Google Maps, live navigation or live tracking is implemented — none of it is.

### 6.2 Future Google Maps integration (intended architecture)

Google Maps Platform is the intended production provider. The integration must sit **behind a reusable map component / service boundary** so mock data can be swapped for live data without redesigning the app:

- **Map:** Google Maps JavaScript API as the web map (loaded async, callback-initialised, channel-tagged for usage tracking; browser key referrer-restricted; server-side APIs called only from the backend through the connector gateway — credentials never in client code).
- **Markers:** custom/Advanced markers rendering the approved character assets, positioned by geographic coordinates so they track correctly through zoom, pan and resize.
- **Routes:** actual route geometry from the appropriate Google routing service (Routes API), rendered as coloured polylines — never straight lines between two points.
- **Interaction:** destination and meeting-point markers, zoom/pan/viewport handling, selectable friends and destinations, route-comparison panels, toggleable safety layers, legend and responsive map controls.

Interface contract for the map service boundary: providers must expose lookups for `location(s)`, `memberRoute(member)`, `alternativeRoutes(member, destination)`, `safetyLayers()`, and selection state, so the demo implementation can be replaced by a `GoogleMapsProvider` implementing the same contract.

### 6.3 Map appearance

Support a cohesive dark map appearance where available (custom map styling in the Midnight Galaxy family), distinct route colours, character markers, selected-route emphasis, destination markers, metro/transit information when supported by the data source, toggleable safety layers, and a legend. The map itself stays readable — do not obscure roads, labels or navigation details with gradients, oversized characters or decoration. The reference sheet's map panel (friend markers, safety legend: Your Location, Friends, Hospitals, Pink Booths, Street Lights, Safe Zone, Route) is the model for the legend vocabulary.

### 6.4 Globe-to-Delhi transition (implemented)

A Travity-designed visual transition, **not** a map replacement: (1) stylised globe in the pink-purple galaxy gradient (`grad-sky`), (2) visual transition toward Delhi NCR, (3) reveal of the interactive map experience, (4) destination markers and routes introduced without overwhelming the user. Lightweight and skippable (the skip control is live on the map route). During the mock phase the destination map is illustrative — never present it as a live Google Map.

---

## 7. Route design and safety information design

### 7.1 Route visual hierarchy

Routes are a signature feature. Support: different start points per member, distinct route colours (§4.1), multiple alternatives, walking and transit segments where supported, meeting-point comparison, destination selection, selected-friend highlighting, and route details in a companion information panel. The selected route is more prominent than unselected alternatives while all remain identifiable. Avoid overly thick lines that hide map detail; use contrast, outlines or layering where routes overlap. Route colours stay consistent with member identity. During the demo phase, label simulated travel times, fares and geometry as illustrative.

### 7.2 Safety map layers (intended, not implied as available)

Planned layers: police stations & PCR facilities, Pink Booths, hospitals, mapped streetlights, lighting/visibility observations, community-reported concerns, transit access, last-mile walking segments, and other mapped safety facilities. Their existence in this design **does not imply verified data exists**. The demo data layer (`SAFETY_MARKERS`, `SAFETY_LAYER_META` in `src/data/mock.ts`) already models these categories with per-marker metadata — keep and extend it.

### 7.3 Safety marker detail requirements

Every marker/segment detail must display: what it represents; source name or type; last-updated information when known; geographic coverage or precision; confidence or verification status; and known limitations. The current data model already carries these fields — preserve them.

### 7.4 Status labels

Fixed vocabulary (already in i18n): **Official record · Mapped location · Community-reported · Satellite-derived estimate · Illustrative demo data · Unknown / insufficient information.**

### 7.5 Safety honesty rules

- Never imply a mapped streetlight is functioning, a Pink Booth is staffed, or a police facility is immediately available without evidence.
- Never label any route "guaranteed safe". **No reports ≠ proof of safety.** One isolated negative review ≠ an unsafe neighbourhood; repeated, credible, recent observations may warrant a stronger warning, noting that moderation and verification would be needed in production.
- Helpful framing examples: "Community reports suggest limited lighting here after dark." / "Consider an alternative last-mile route."
- Safety information supports decisions; it never replaces user judgement.

---

## 8. Real tourist-place imagery — Google Maps Platform Places API

### 8.1 Rule: no fabricated place imagery

Do **not** use AI-generated, self-generated, fabricated or generic illustrative images to represent real tourist destinations, monuments, landmarks, restaurants, cafes, parks, museums, markets or other real-world places (India Gate, Red Fort, Qutub Minar, Humayun's Tomb, etc.). An AI-rendered "India Gate" must never be presented as an authentic photograph of the place. **All previously generated destination JPGs were removed from `src/assets`** so this cannot regress.

### 8.2 Production source: Google Places API

Future implementation retrieves genuine place imagery via the Places API (New) place-photo flow, through the backend connector gateway (keys stay server-side):

- Retrieve the real place name, Google Maps place identifier, and available photographs; display the photo belonging to the **correct** destination.
- Retrieve address/ratings where needed and permitted.
- Preserve required Google and photographer attribution and branding; respect usage, storage, caching and display policies (photo resources are not for indefinite storage; do not scrape pages or extract images from tiles).

### 8.3 Destination record structure (implemented in `src/data/mock.ts`)

The `Destination` interface already carries the fields the future integration needs — optional, unset until the live integration exists (**never invent** place IDs or photo references):

```
placeId?: string                    // Google Maps place identifier, set only from a real API response
location?: { lat: number; lng: number }  // geographic coordinates, when available
photo?: { resource: string; attribution: string; source: "google-places" }
imageStatus: "mock-only" | "real-photo" | "placeholder"
```

`image` remains a demo image key for the mock phase. Mock data stays separate from UI so the future photo source can be swapped in without redesign. **Current phase (implemented):** destination cards and detail pages render the **`DestinationArt` branded placeholder** (Midnight Galaxy treatment + destination name, with a "no real photo yet" note) — never a fabricated image, and never a fake URL.

### 8.4 Matching rules

Every displayed image must match the actual destination on its card. Never reuse one image for unrelated destinations, assign a generic monument photo to a specific landmark, substitute a generated image for a missing photo, or show a different branch/location without clearly identifying it. Resolve places by name **and** geographic location within Delhi NCR so similarly named places in other cities never match. If no appropriate photo exists: branded placeholder with the destination name.

### 8.5 Integration boundary (future)

Documented requirements for implementation time: Places API search/details/photo endpoints behind the backend gateway; place identification with location matching; loading, missing-image and API-error states (placeholder fallback, never fabricated); secure, restricted key handling (server-side keys never in client code); compliance with Google's current API/storage/display policies.

---

## 9. Typography

**Current state (implemented and verified):** Bricolage Grotesque (display), Manrope (body) and Mukta (Devanagari) are loaded via Google Fonts `<link>` in `src/routes/__root.tsx` (never `@import` a remote font in `src/styles.css`). `--font-display` and `--font-sans` are wired in `src/styles.css`, and `[lang="hi"]` selectors switch display + body text to `--font-hi` (Mukta) so Hindi UI renders with complete Devanagari coverage.

**Hierarchy (apply consistently):**

| Level | Treatment |
| --- | --- |
| Page titles | Display font, 2xl–3xl, `--foreground` |
| Section headings | Display font, lg–xl |
| Card titles | Display font, base–lg, semibold |
| Body text | Sans, base (16px), `--foreground` |
| Supporting text | Sans, sm, `--muted-foreground` |
| Labels | Sans, xs–sm, medium weight, possibly uppercase tracking |
| Buttons | Sans, sm–base, medium/semibold |
| Numerical info (fares, times, expenses) | Sans, tabular numerals where supported |
| Map labels | Sans, sm, high-contrast, short |
| Safety notices | Sans, readable size, paired with icon + status label, semantic colour |

Never go below ~12px for readable text; fares, route details and safety text must stay legible in both themes. Do not add font dependencies without need — the three families cover Latin display, Latin body and Devanagari.

---

## 10. Spacing, shapes and components

**Existing system (implemented):** Tailwind v4 spacing scale; `--radius: 1rem` with derived radii (`--radius-sm` → `--radius-3xl`); shadcn/ui primitives in `src/components/ui`; semantic tokens wired through `@theme inline`.

**Standards:**

- **Spacing:** 4px base scale; section padding `py-10`–`py-16` desktop, `py-6`–`py-8` mobile; card padding `p-4`–`p-6`; related items 8–12px apart, groups 24–32px.
- **Containers:** max-width ~1200px content column; full-bleed allowed for maps.
- **Radii:** rounded corners consistently — cards/panels `--radius-lg`/`--radius-xl`, chips/pills fully rounded, buttons `--radius-md`/`--radius-lg`; never unrelated one-off radii.
- **Borders & elevation:** 1px `--border`; elevation via the purple-tinted shadow tokens (`--shadow-soft`, `--shadow-glow`, `--shadow-lift`), reserved for elevated/interactive surfaces — not every card.
- **Buttons:** clear primary (purple fill) / secondary (surface + border) / ghost / destructive (red, confirm-required) distinction; loading and disabled states required.
- **Inputs, dropdowns, tabs, chips, dialogs, drawers, tooltips, notifications, cards:** use the existing shadcn components, themed via variants — do not fork them.
- **Domain components (built with these rules):** map controls (top-right floating cluster, compact on mobile), route summaries (coloured route chip + member name + time + fare), expense summaries, safety information panels (status label + confidence + limitations, never colour-only).

Prefer clean layouts, balanced whitespace and restrained effects.

---

## 11. Animation and micro-interactions

**Existing motion (implemented):** keyframes and `@utility` classes in `src/styles.css` — `anim-float`, `anim-greet`, `anim-bounce-soft`, `anim-glow`, `anim-spin-slow`, `anim-twinkle`, `anim-rise`, `anim-dash`, `dot-pulse`, plus a global `prefers-reduced-motion` guard. Keep this vocabulary; add new motion through the same `@utility` pattern.

**Guidelines:**

- Purposeful only: button feedback, card selection, page transitions, dialogs/drawers, Travis's existing character animations, friend-marker selection, route highlighting, map transitions, progress indicators, loading states, success feedback.
- Motion must never alter a character's defining features (three eyes, two antennae) or obscure safety information.
- Respect `prefers-reduced-motion` (already enforced globally).
- No autoplaying sound; the interface must be fully understandable without animation.
- Lightweight: transform/opacity-based, mobile-friendly, short durations (150–400ms for UI, ambient loops ≥3s).

---

## 12. Responsive design

Targets: desktop browsers, tablets, mobile browsers — **mobile must be fully usable**, not a shrunken desktop.

Required: no horizontal overflow; readable typography; touch-friendly controls (≥44px targets); accessible forms; responsive route panels (bottom sheet on mobile, side panel on desktop); usable map controls; legible Hindi text; appropriately sized character markers; clear safety information; visible focus indicators; reduced-motion support. Use `useIsMobile` (existing hook) and the established sidebar/mobile navigation pattern.

---

## 13. Accessibility and contrast

- Maintain sufficient text contrast in **both** themes (WCAG AA for body text; the light/dark token pairs in §2 were chosen for this).
- Never use colour as the sole indicator of safety status, route identity, form errors, success states or selected states — always add text labels, icons, outlines or other cues (e.g. route lines carry the member's name label; safety markers carry status text).
- Document and maintain: keyboard focus (`:focus-visible` ring already in `src/styles.css`), accessible control labels (`aria-label` pattern used by `LanguageSelect`), touch-target sizes, and safety warnings that remain clear in dark and light modes.

---

## 14. Design tokens and implementation conventions

- **Token home:** `src/styles.css` (Tailwind v4 `@theme inline` + `:root`/`.dark`). No new styling libraries; no duplicate token systems.
- **Naming:** keep the existing semantic variable names (`--background`, `--card`, `--primary`, …) plus the brand/semantic additions (`--brand-pink`, `--brand-cyan`, `--success`, `--warning`).
- **Components:** shadcn primitives themed via variants; domain components consume data-layer interfaces; browser-only/map code behind dynamic imports (`<ClientOnly>`); server-side secrets stay in server functions.
- **Motion:** `@utility` classes + keyframes in `src/styles.css`.
- **Data hygiene:** mock data lives only in `src/data/mock.ts`; demo/estimate labelling via the existing i18n keys (`common.demo`, `common.illustrative`, `safety.status.*`).
- Never claim a feature or token is implemented without verifying it in the codebase — sections above mark implemented vs intended explicitly.

---

## 15. Explicitly out of scope for any task referencing this document

Do not: rebuild the app; delete or replace working pages; break navigation; replace supplied character artwork (or change defining character traits — three eyes, two antennae for Travis); add a live Google Maps integration or unconfigured API dependencies without instruction; invent verified safety datasets, Google place IDs, or photo references; add fake payment or emergency-service functionality; expand geographic scope beyond Delhi NCR; or introduce unrelated features. Where an existing design conflicts with this standard, update this document's mapping and migrate the affected screen — not unrelated code.

---

## 16. Acceptance checklist for design-system work

- Midnight Galaxy colour system implemented in `src/styles.css` and documented; no hardcoded hex colours in components.
- Dark and light theme tokens defined for both themes with contrast-appropriate text colours.
- Brand gradients limited to approved uses; semantic colours never purely decorative.
- Characters preserved: three-eyed, two-antennae Travis intact; friend designs per the authoritative reference sheet; only palette-compliant, edit-only colour changes when artwork changes at all.
- Delhi NCR is the only geographic scope in examples, data and copy.
- Google Maps is documented as the future provider with a clean mock → live boundary; nothing claims live data.
- Real-place imagery comes only from authorised sources; missing photos render the `DestinationArt` branded placeholder; no fabricated images.
- Route colours stable per member (§4.1 values live in the data layer); safety statuses use the fixed vocabulary with limitations shown.
- Typography (Bricolage Grotesque / Manrope / Mukta), spacing, motion, responsive and accessibility standards applied without new libraries.
