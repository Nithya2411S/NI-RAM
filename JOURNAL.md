# NIRAM — Development Journal

## Project Overview
An astrology app where users generate birth charts by entering their birth details.
Target users: beginners and learners who want to explore astrology on their own.

---

## Stack
| Layer | Choice |
|-------|--------|
| Framework | Astro 6.1.5 |
| UI | React (inside Astro) |
| Styling | Tailwind CSS |
| Astrology calculations | swisseph (Swiss Ephemeris) |
| Geocoding | node-geocoder + OpenStreetMap |
| Date/time | luxon |
| Testing | Playwright |
| Deployment | Vercel (Phase 6) |

---

## Journal Entries

### Entry 001 — 2026-04-13
**Phase:** Foundation Setup

**What was done:**
- Initialized Astro project in `/Users/nithyas/Desktop/NIRAM`
- Installed React integration via `npx astro add react`
- Installed Tailwind CSS via `npx astro add tailwind`
- Installed `ephemeris` for planetary calculations
- Installed `node-geocoder` for city → coordinates conversion
- Installed `luxon` for timezone-aware date/time handling
- Created `src/lib/logger.ts` — centralized logger with debug log rotation (debug1/2/3.log)
- Created `logs/` directory for debug log files
- Created `src/lib/`, `tests/` directories
- Connected local repo to GitHub at `https://github.com/Nithya2411S/NI-RAM`

**Files created:**
- `src/lib/logger.ts` — Logger with rotation logic
- `logs/` — Log output directory
- `JOURNAL.md` — This file

**Rules applied:**
- Maintain a Detailed Development Journal ✅
- Track All Changes in the Journal ✅
- Debug-Level Logging with File Rotation ✅
- SOLID Principles ✅ (Single Responsibility — logger does one job)

---

### Entry 002 — 2026-04-14
**Phase:** Phase 1 Complete — Full Vedic App Rebuild

**Reason for rebuild:** Previous build used Tropical (Western) zodiac. App is now purely Vedic — Lahiri Ayanamsa, True Nodes (Meeus), Whole Sign houses.

**What was done:**

*Config & Types:*
- Updated `astro.config.mjs` — added `output: 'server'` for SSR API routes
- Created `src/types/vedic.ts` — all shared TypeScript types (ChartData, PlanetPosition, HouseCusp, ChartStyle, SidebarSection, etc.)
- Created `src/types/ephemeris.d.ts` — TypeScript declarations for ephemeris package
- Updated `src/styles/global.css` — full dark cosmic theme, CSS starfield with twinkling gold/silver stars, sidebar layout, cosmic card/input/button/tab styles

*Calculation Engine:*
- Created `src/lib/clientLogger.ts` — browser-safe console logger (same interface as server logger)
- Created `src/lib/ayanamsa.ts` — Lahiri Ayanamsa formula (IAU/Astronomical Almanac), tropical→sidereal conversion, Julian Day calculation
- Created `src/lib/nodes.ts` — True Rahu/Ketu using Meeus "Astronomical Algorithms" Ch.47 formula
- Created `src/lib/geocoding.ts` — city → coordinates via OpenStreetMap (free, no API key)
- Created `src/lib/astrology.ts` — complete Vedic chart: tropical positions via ephemeris → Lahiri ayanamsa subtraction → sidereal longitudes → True Rahu/Ketu → sidereal Lagna (RAMC formula) → Whole Sign houses → Nakshatra assignment (27 lunar mansions with pada)

*Layout:*
- Created `src/components/layout/Sidebar.tsx` — collapsible sidebar with 8 sections (Birth Chart active, others "Coming Soon")
- Created `src/components/layout/AppShell.tsx` — layout coordinator: sidebar + main content, holds collapse state

*Chart Components:*
- Created `src/components/charts/NorthChart.tsx` — North Indian diamond layout (houses fixed, signs rotate)
- Created `src/components/charts/SouthChart.tsx` — South Indian 4×4 grid (signs fixed, houses rotate)
- Created `src/components/charts/EastChart.tsx` — East Indian (Bengali) clockwise square layout

*UI Components:*
- Created `src/components/BirthForm.tsx` — 4-field birth details form with loading/error state
- Created `src/components/PlanetTable.tsx` — planet positions table with nakshatra, house, retrograde
- Created `src/components/ChartViewer.tsx` — tab switcher (North/South/East) + active chart + planet table + chart details
- Created `src/components/BirthChartApp.tsx` — state coordinator (chart/loading/error), API call, form ↔ viewer routing

*API & Pages:*
- Created `src/pages/api/chart.ts` — POST endpoint: validate → geocode → calculateVedicChart → JSON response
- Updated `src/layouts/Layout.astro` — imports global.css, renders starfield div
- Updated `src/pages/index.astro` — mounts AppShell + BirthChartApp with client:load

**Files created (14):**
`src/types/vedic.ts`, `src/types/ephemeris.d.ts`, `src/lib/clientLogger.ts`,
`src/lib/ayanamsa.ts`, `src/lib/nodes.ts`, `src/lib/geocoding.ts`, `src/lib/astrology.ts`,
`src/components/layout/Sidebar.tsx`, `src/components/layout/AppShell.tsx`,
`src/components/charts/NorthChart.tsx`, `src/components/charts/SouthChart.tsx`, `src/components/charts/EastChart.tsx`,
`src/components/BirthForm.tsx`, `src/components/PlanetTable.tsx`,
`src/components/ChartViewer.tsx`, `src/components/BirthChartApp.tsx`,
`src/pages/api/chart.ts`

**Files modified (4):**
`astro.config.mjs`, `src/styles/global.css`, `src/layouts/Layout.astro`, `src/pages/index.astro`

**Rules applied:**
- Maintain a Detailed Development Journal ✅
- Track All Changes in the Journal ✅
- Ensure Code Quality and Avoid Redundancy ✅ (read all files before writing, one types file, one logger)
- Comprehensive Activity Logging ✅ (clientLogger in every component)
- Centralized Error Logging ✅ (structured errors in API + components)
- Function-Level Logging ✅ (logger.fn() at every function entry)
- Debug-Level Logging with File Rotation ✅ (server logger writes to logs/)
- Mandatory E2E Testing ⏳ (next step)
- SOLID Principles ✅ (each file has exactly one job, dependencies injected)

---
### Entry 003 — 2026-04-11
**Phase:** Calculation Engine Upgrade — Swiss Ephemeris

**Reason for upgrade:** All planet positions, ascendant, and nodes were incorrect.
Root cause: the `ephemeris` package uses Moshier's semi-analytical theory (~1–2 arc-minute error).
User confirmed mismatch against Jagannatha Hora software which uses **Swiss Ephemeris** (DE431 — arc-second accuracy).

**Investigation:**
- Tested both engines against a known chart: Nov 24 2003, 14:31 IST (09:01 UTC), Chennai (13.0827°N, 80.2707°E)
- `ephemeris` results: incorrect sign for multiple planets, wrong Lagna
- `swisseph` results: Sun Scorpio 7°44' ✅, Moon Scorpio 13°41' ✅, Lagna Pisces 16°17' ✅, Moon Nakshatra Anuradha Pada 4 ✅ — exact match with Jagannatha Hora

**Changes made:**

*Packages:*
- Uninstalled `ephemeris`
- Installed `swisseph` (Swiss Ephemeris Node.js binding — same engine as Jagannatha Hora)

*New files:*
- `src/types/swisseph.d.ts` — TypeScript declarations for swisseph (not shipped with package)

*Rewrites:*
- `src/lib/ayanamsa.ts` — replaced IAU manual formula with `swe_set_sid_mode(SE_SIDM_LAHIRI)` + `swe_get_ayanamsa_ut(jd)`. Also replaced custom JD formula with `swe_julday()`.
- `src/lib/nodes.ts` — replaced Meeus Chapter 47 manual formula with `swe_calc_ut(jd, SE_TRUE_NODE, SEFLG_SWIEPH | SEFLG_SPEED)`. True Nodes now calculated directly from the ephemeris.
- `src/lib/astrology.ts` — complete rewrite. Removed `ephemeris` import entirely. Now uses:
  - `swe_julday()` for Julian Day
  - `swe_set_sid_mode(SE_SIDM_LAHIRI)` + `swe_get_ayanamsa_ut()` for ayanamsa
  - `swe_calc_ut(jd, planetId, SEFLG_SWIEPH | SEFLG_SIDEREAL | SEFLG_SPEED)` for all 7 Navagrahas
  - `swe_calc_ut(jd, SE_TRUE_NODE, SEFLG_SWIEPH | SEFLG_SPEED)` for Rahu; Ketu = Rahu + 180°
  - `swe_houses(jd, lat, lng, 'W')` for Whole Sign Lagna (tropical ascendant → subtract ayanamsa)
  - Calculates exactly 9 Navagrahas (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu) — no outer planets, matching Hora's scope

**Rules applied:**
- Maintain a Detailed Development Journal ✅
- Track All Changes in the Journal ✅
- Ensure Code Quality and Avoid Redundancy ✅
- Comprehensive Activity Logging ✅ (logger.fn/debug/info throughout)
- Function-Level Logging ✅
- Debug-Level Logging with File Rotation ✅
- SOLID Principles ✅ (each file still has single responsibility, same interfaces preserved)
- Mandatory E2E Testing ⏳ (next step)

---
<!-- New entries go below this line -->
