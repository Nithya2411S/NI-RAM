/**
 * vedic.ts
 * Single Responsibility: All shared TypeScript types for the Vedic astrology app.
 * SOLID — Interface Segregation: small focused interfaces, not one giant object.
 */

// ─── Zodiac ───────────────────────────────────────────────────────────────────

export type ZodiacSign =
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer'
  | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio'
  | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export interface ZodiacInfo {
  index: number;        // 0–11
  name: ZodiacSign;
  symbol: string;       // Unicode glyph
  shortName: string;    // 3-letter abbreviation
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  quality: 'Cardinal' | 'Fixed' | 'Mutable';
  ruler: string;        // Traditional Vedic ruler
}

// ─── Planets ──────────────────────────────────────────────────────────────────

export type PlanetName =
  | 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter'
  | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu'
  | 'Uranus' | 'Neptune' | 'Pluto';

export interface PlanetPosition {
  name: PlanetName;
  symbol: string;
  siderealLongitude: number;  // 0–360 after Lahiri Ayanamsa applied
  sign: ZodiacSign;
  signIndex: number;          // 0–11
  signSymbol: string;
  degreeInSign: number;       // 0–29
  minuteInSign: number;       // 0–59
  isRetrograde: boolean;
  house: number;              // 1–12 (Whole Sign)
  nakshatra: string;          // lunar mansion
  nakshatraPada: number;      // 1–4
}

// ─── Chart ────────────────────────────────────────────────────────────────────

export interface ChartData {
  name: string;
  birthDateTime: string;      // ISO string
  location: {
    city: string;
    lat: number;
    lng: number;
  };
  ayanamsa: number;           // Lahiri ayanamsa value used
  planets: PlanetPosition[];
  ascendant: {
    siderealLongitude: number;
    sign: ZodiacSign;
    signIndex: number;
    degreeInSign: number;
    minuteInSign: number;
  };
  houses: HouseCusp[];        // 12 Whole Sign houses
}

export interface HouseCusp {
  house: number;              // 1–12
  sign: ZodiacSign;
  signIndex: number;
  signSymbol: string;
}

// ─── Chart Style ──────────────────────────────────────────────────────────────

export type ChartStyle = 'north' | 'south' | 'east';

// ─── Sidebar Sections ─────────────────────────────────────────────────────────

export type SidebarSection =
  | 'birthChart'
  | 'navamsa'
  | 'dashamsa'
  | 'mahadasha'
  | 'ashtakavarga'
  | 'transits'
  | 'yogas'
  | 'panchanga';

// ─── API ──────────────────────────────────────────────────────────────────────

export interface ChartRequest {
  name: string;
  dateOfBirth: string;    // YYYY-MM-DD
  timeOfBirth: string;    // HH:MM
  placeOfBirth: string;
}

export interface ChartResponse {
  success: boolean;
  data?: ChartData;
  error?: string;
}
