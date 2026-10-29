# Travety — Delhi NCR Safety-First Group Hangouts & Commute Shield

**Travety** is a safety-first group outing planner and Delhi NCR metro commute coordinator built for student squads across **NSUT (Dwarka)**, **IGDTUW (Kashmere Gate)**, **IIT Delhi**, and the wider **Delhi NCR** region. It combines a **full 8-line interactive DMRC Metro schematic**, **live Google Maps visualization**, **curfew & departure synchronization**, **Pink Saheli safety layers**, and **equal/custom expense splitting** in a single cohesive web and mobile experience.

---

## Key Features

### 1. Full 8-Line Interactive DMRC Metro Map & Live Google Maps
- **Complete Delhi NCR DMRC Network Schematic**: Interactive SVG network covering **46+ stations** and **16 multi-line interchanges** across all 8 corridors:
  - **Blue Line** (Dwarka Sec 21 ↔ Noida Electronic City & Vaishali branch)
  - **Yellow Line** (Samaypur Badli ↔ Millennium City Centre Gurugram)
  - **Red Line** (Rithala ↔ Shaheed Sthal)
  - **Pink Line Ring** (Majlis Park ↔ Shiv Vihar)
  - **Magenta Line** (Janakpuri West ↔ Botanical Garden)
  - **Violet Line** (Kashmere Gate ↔ Raja Nahar Singh / Escorts Mujesar)
  - **Airport Express Orange Line** (New Delhi ↔ Yashobhoomi Dwarka Sec 25)
  - **Green Line** (Brig. Hoshiar Singh ↔ Inderlok / Kirti Nagar)
- **Live Google Maps Integration (`@vis.gl/react-google-maps`)**:
  - Real-time `<AdvancedMarker>` squad avatar pins (`Saumay`, `Devika`, `Vansh`, `Rimisha`, `Pragya`), campus hubs, and Delhi NCR destinations.
  - Geodesic route polylines connecting each member's origin station to the active meetup hub.
  - Interactive squad commute cards that pan and zoom the Google Map camera on click.

### 2. Safe Case vs. Best Fun Case Dual-Mode Engine
- **Safe Case Mode**: Prioritizes verified CISF/DMRC interchanges, **Pink Saheli** women's safety booths, high street-lighting scores, PCR van proximity, and strict hostel curfew buffers.
- **Best Fun Case Mode**: Prioritizes central equidistance, student cafes, cultural hubs (*Connaught Place*, *Dilli Haat INA*, *Hauz Khas Village*, *CyberHub*, *Majnu Ka Tilla*, *Lodhi Art District*), and budget fit.

### 3. Curfew & Synchronized "Leave-By" Calculator
- Computes individual metro travel times, fares, and interchange counts for every squad member.
- Automatically calculates each member's **"Leave Home By"** and **"Wrap Up By"** times so everyone reaches their campus or hostel before curfew.

### 4. Safety Shield & SOS Dispatch
- Toggleable safety layers for **Women's Help Desks (Pink Saheli)**, **Police / PCR Booths**, **24×7 Pharmacies & Clinics**, **Verified Lighting**, and **Safe Restrooms**.
- One-tap **Emergency SOS Modal** with live squad alert broadcasting and Delhi NCR emergency helplines (`112`, `1091` Women Helpline, `155370` DMRC Security).

### 5. Group Lobby, Polls, Expense Splitter & Bilingual UI
- **Group Lobby**: Shareable invite code (`TRV-8492`), member readiness tracker, live group chat, and venue polls.
- **Expense Splitter**: Track food, metro, auto, and ticket expenses with instant net settlement calculations.
- **Bilingual & Accessible**: Instant **English / हिन्दी (Hindi)** language toggle and **Light / Dark** theme support.

---

## Hosting on GitHub Pages

This repository is pre-configured to deploy directly to **GitHub Pages** with relative asset paths (`./`), SPA `404.html` routing fallback, `.nojekyll`, and an automated GitHub Actions workflow.

### Option A: Automatic Deployment via GitHub Actions (Recommended)

1. **Push this repository to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Travety Delhi NCR Group Hangout & Metro App"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. **Enable GitHub Pages in Repository Settings**:
   - Open your repository on GitHub and go to **Settings → Pages**.
   - Under **Build and deployment → Source**, select **GitHub Actions**.

3. *(Optional)* **Configure your Google Maps API Key for Live Google Maps**:
   - Go to **Settings → Secrets and variables → Actions**.
   - Add a **Repository Secret** (or **Variable**) named `VITE_GOOGLE_MAPS_API_KEY` with your Google Maps JavaScript API key.
   - *(Note: The interactive 8-line DMRC Metro Map works 100% offline without any API key!)*

4. **Trigger Deployment**:
   - Every push to `main` (or manual run from the **Actions** tab → **Deploy Travety to GitHub Pages**) automatically builds `./dist` and publishes your live site at:
     `https://<your-username>.github.io/<your-repo-name>/`

---

### Option B: Manual Deployment from CLI (`gh-pages` branch)

If you prefer to build and push the `dist` folder manually:

```bash
# 1. Install dependencies
npm install

# 2. Build static bundle with 404.html SPA fallback & .nojekyll
npm run build:gh-pages

# 3. Preview locally
npm run preview
```

You can then deploy the `./dist` directory using `npx gh-pages -d dist` or any static host (Vercel, Netlify, Cloudflare Pages, Firebase Hosting).

---

## Local Development (Full-Stack & Frontend)

### Prerequisites
- **Node.js** v20+ (or **Bun** v1.1+)
- **npm** v10+

### 1. Clone & Install
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in any optional keys you want to use locally:
```bash
cp .env.example .env
```

| Variable | Description | Required for Static/Demo? |
| :--- | :--- | :--- |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key for the live Google Maps view | Optional (DMRC Metro Map works without key) |
| `GEMINI_API_KEY` | Server-side Gemini API key for `/api/gemini/chat` & Search Grounding | Optional (includes built-in offline commute advisor fallback) |
| `DATABASE_URL` | PostgreSQL connection URL (or Cloud SQL socket configuration) | Optional (falls back to Firestore / localStorage) |

### 3. Start the Development Server
```bash
npm run dev
```
The app will start on **`http://localhost:3000`**.

---

## Project Structure

```text
├── .github/workflows/
│   └── deploy-pages.yml          # Automated GitHub Pages CI/CD workflow
├── public/
│   ├── .nojekyll                 # Bypass Jekyll processing on GitHub Pages
│   └── assets/aistudio/          # Travis mascot illustrations & static assets
├── src/
│   ├── components/
│   │   ├── travity/
│   │   │   ├── TravityBits.tsx       # Shared UI primitives, FriendAvatar, MetroMap SVG
│   │   │   ├── TravityPages.tsx      # Core pages (Dashboard, Plan, Lobby, Map, Safety, Explore)
│   │   │   └── TravityMorePages.tsx  # Calendar, Invitations, Expenses, Reviews, Profile, Help
│   │   ├── DmrcMetroMap.tsx          # Interactive 8-line Delhi NCR DMRC Metro schematic
│   │   ├── LobbyMapWidget.tsx        # Live Google Maps & squad geodesic route visualizer
│   │   ├── GeminiChatDrawer.tsx      # Travis AI Commute Assistant drawer
│   │   └── SosModal.tsx              # Emergency SOS broadcast & helpline modal
│   ├── data/
│   │   ├── travityData.ts            # 46+ DMRC stations, 8 lines, destinations, safety markers
│   │   └── ncrMetroData.ts           # Squad roster, curfew schedules, hub ranking engine
│   ├── db/                           # Drizzle ORM & Cloud SQL PostgreSQL schema
│   ├── lib/
│   │   └── ui-prefs.tsx              # Theme (Light/Dark) & Bilingual (EN/HI) context
│   ├── App.tsx                       # Root application shell, navigation & state sync
│   └── main.tsx                      # React 19 entry point
├── server.ts                     # Express full-stack server (API routes + Vite middleware)
├── vite.config.ts                # Vite configuration with relative build base for GitHub Pages
└── package.json
```

---

## Scripts Reference

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the full-stack Express + Vite server on port `3000` |
| `npm run build` | Builds the production Vite bundle into `./dist` |
| `npm run build:gh-pages` | Builds `./dist`, creates `dist/404.html` SPA fallback and `dist/.nojekyll` |
| `npm run preview` | Previews the built `./dist` bundle locally |
| `npm run lint` | Runs TypeScript type-checking (`tsc --noEmit`) |

---

## License

Application code in this repository is licensed under the **Apache License 2.0** (`SPDX-License-Identifier: Apache-2.0`).
