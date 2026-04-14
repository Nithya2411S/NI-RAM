/**
 * astrology.ts
 * Single Responsibility: Full Vedic birth chart calculation via Swiss Ephemeris.
 * Uses the same engine as Jagannatha Hora — Lahiri Ayanamsa, True Nodes,
 * Whole Sign houses — producing arc-second accurate results.
 *
 * Process:
 *  1. Compute Julian Day (UT) with swe_julday
 *  2. Set Lahiri sidereal mode with swe_set_sid_mode
 *  3. Calculate sidereal positions for 7 classical planets via swe_calc_ut
 *  4. Calculate True Rahu/Ketu via swe_calc_ut with SE_TRUE_NODE
 *  5. Obtain sidereal Lagna (Ascendant) via swe_houses → subtract ayanamsa
 *  6. Assign Whole Sign houses
 *  7. Assign Nakshatras (27 lunar mansions) with pada
 *
 * Rule 4, 5, 6 | SOLID — Single Responsibility, Open/Closed.
 */

import swisseph from 'swisseph';
import { logger } from './logger';
import type {
  ChartData, PlanetPosition, HouseCusp,
  ZodiacSign, PlanetName, ZodiacInfo,
} from '../types/vedic';

// ─── Swiss Ephemeris flags ────────────────────────────────────────────────────

// SEFLG_SWIEPH (2) | SEFLG_SIDEREAL (64) | SEFLG_SPEED (256)
const SIDEREAL_FLAGS = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SIDEREAL | swisseph.SEFLG_SPEED;
// Tropical flags (for nodes — we subtract ayanamsa manually to match Hora)
const TROPICAL_FLAGS = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED;

// ─── Zodiac Table ─────────────────────────────────────────────────────────────

const ZODIAC: ZodiacInfo[] = [
  { index:0,  name:'Aries',       symbol:'♈', shortName:'Ari', element:'Fire',  quality:'Cardinal', ruler:'Mars'    },
  { index:1,  name:'Taurus',      symbol:'♉', shortName:'Tau', element:'Earth', quality:'Fixed',    ruler:'Venus'   },
  { index:2,  name:'Gemini',      symbol:'♊', shortName:'Gem', element:'Air',   quality:'Mutable',  ruler:'Mercury' },
  { index:3,  name:'Cancer',      symbol:'♋', shortName:'Can', element:'Water', quality:'Cardinal', ruler:'Moon'    },
  { index:4,  name:'Leo',         symbol:'♌', shortName:'Leo', element:'Fire',  quality:'Fixed',    ruler:'Sun'     },
  { index:5,  name:'Virgo',       symbol:'♍', shortName:'Vir', element:'Earth', quality:'Mutable',  ruler:'Mercury' },
  { index:6,  name:'Libra',       symbol:'♎', shortName:'Lib', element:'Air',   quality:'Cardinal', ruler:'Venus'   },
  { index:7,  name:'Scorpio',     symbol:'♏', shortName:'Sco', element:'Water', quality:'Fixed',    ruler:'Mars'    },
  { index:8,  name:'Sagittarius', symbol:'♐', shortName:'Sag', element:'Fire',  quality:'Mutable',  ruler:'Jupiter' },
  { index:9,  name:'Capricorn',   symbol:'♑', shortName:'Cap', element:'Earth', quality:'Cardinal', ruler:'Saturn'  },
  { index:10, name:'Aquarius',    symbol:'♒', shortName:'Aqu', element:'Air',   quality:'Fixed',    ruler:'Saturn'  },
  { index:11, name:'Pisces',      symbol:'♓', shortName:'Pis', element:'Water', quality:'Mutable',  ruler:'Jupiter' },
];

// ─── 27 Nakshatras ────────────────────────────────────────────────────────────

const NAKSHATRAS = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha',
  'Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati',
];

// ─── Navagraha (9 classical Vedic planets) ────────────────────────────────────

const NAVAGRAHA: Array<{ id: number; name: PlanetName; symbol: string }> = [
  { id: swisseph.SE_SUN,     name: 'Sun',     symbol: '☉' },
  { id: swisseph.SE_MOON,    name: 'Moon',    symbol: '☽' },
  { id: swisseph.SE_MARS,    name: 'Mars',    symbol: '♂' },
  { id: swisseph.SE_MERCURY, name: 'Mercury', symbol: '☿' },
  { id: swisseph.SE_JUPITER, name: 'Jupiter', symbol: '♃' },
  { id: swisseph.SE_VENUS,   name: 'Venus',   symbol: '♀' },
  { id: swisseph.SE_SATURN,  name: 'Saturn',  symbol: '♄' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalise(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function getZodiacFromLongitude(lon: number): ZodiacInfo {
  return ZODIAC[Math.floor(normalise(lon) / 30)];
}

function getDegreeInSign(lon: number): { deg: number; min: number } {
  const inSign = normalise(lon) % 30;
  return { deg: Math.floor(inSign), min: Math.floor((inSign % 1) * 60) };
}

function getNakshatra(siderealLon: number): { nakshatra: string; pada: number } {
  const norm = normalise(siderealLon);
  const span = 360 / 27; // 13.333...° per nakshatra
  const index = Math.floor(norm / span);
  const pada  = Math.floor((norm % span) / (span / 4)) + 1;
  return { nakshatra: NAKSHATRAS[index % 27], pada: Math.min(pada, 4) };
}

// ─── Whole Sign Houses ────────────────────────────────────────────────────────

function calculateWholeSigns(lagnaSignIndex: number): HouseCusp[] {
  logger.fn('calculateWholeSigns', { lagnaSignIndex });
  return Array.from({ length: 12 }, (_, i) => {
    const signIdx = (lagnaSignIndex + i) % 12;
    const sign    = ZODIAC[signIdx];
    return {
      house:      i + 1,
      sign:       sign.name,
      signIndex:  sign.index,
      signSymbol: sign.symbol,
    };
  });
}

// ─── Planet builder ───────────────────────────────────────────────────────────

function buildPlanet(
  name: PlanetName,
  symbol: string,
  siderealLon: number,
  isRetrograde: boolean,
): Omit<PlanetPosition, 'house'> {
  const zodiac = getZodiacFromLongitude(siderealLon);
  const { deg, min } = getDegreeInSign(siderealLon);
  const { nakshatra, pada } = getNakshatra(siderealLon);
  return {
    name, symbol,
    siderealLongitude: siderealLon,
    sign:        zodiac.name,
    signIndex:   zodiac.index,
    signSymbol:  zodiac.symbol,
    degreeInSign: deg,
    minuteInSign: min,
    isRetrograde,
    nakshatra,
    nakshatraPada: pada,
  };
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function calculateVedicChart(
  name: string,
  date: Date,         // must be UTC
  lat: number,
  lng: number,
  cityName: string,
): ChartData {
  logger.fn('calculateVedicChart', { name, lat, lng, cityName });

  try {
    // ── 1. Julian Day (UT) ────────────────────────────────────────────────────
    const year  = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day   = date.getUTCDate();
    const hour  = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
    const JD = swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL);
    logger.info('Julian Day', { JD: JD.toFixed(6) });

    // ── 2. Lahiri sidereal mode ───────────────────────────────────────────────
    swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);
    const ayanamsa = swisseph.swe_get_ayanamsa_ut(JD);
    logger.info('Lahiri Ayanamsa', { ayanamsa: ayanamsa.toFixed(6) });

    // ── 3. Seven classical planets (sidereal) ─────────────────────────────────
    const planets: PlanetPosition[] = NAVAGRAHA.map(({ id, name: pName, symbol }) => {
      const r = swisseph.swe_calc_ut(JD, id, SIDEREAL_FLAGS);
      if (r.error) throw new Error(`${pName}: ${r.error}`);

      const siderealLon = normalise(r.longitude);
      const isRetro     = r.longitudeSpeed < 0;

      logger.debug(`${pName}`, { siderealLon: siderealLon.toFixed(4), speed: r.longitudeSpeed.toFixed(4) });

      return { ...buildPlanet(pName, symbol, siderealLon, isRetro), house: 0 };
    });

    // ── 4. True Rahu & Ketu (tropical → subtract ayanamsa → sidereal) ─────────
    const rahuRaw = swisseph.swe_calc_ut(JD, swisseph.SE_TRUE_NODE, TROPICAL_FLAGS);
    if (rahuRaw.error) throw new Error(`Rahu: ${rahuRaw.error}`);

    const rahuTropical  = normalise(rahuRaw.longitude);
    const rahuSidereal  = normalise(rahuTropical - ayanamsa);
    const ketuSidereal  = normalise(rahuSidereal + 180);

    logger.debug('Rahu/Ketu sidereal', {
      rahuTropical: rahuTropical.toFixed(4),
      rahuSidereal: rahuSidereal.toFixed(4),
      ketuSidereal: ketuSidereal.toFixed(4),
    });

    // Rahu always moves retrograde (decreasing longitude)
    planets.push({ ...buildPlanet('Rahu', '☊', rahuSidereal, true),  house: 0 });
    planets.push({ ...buildPlanet('Ketu', '☋', ketuSidereal, true),  house: 0 });

    logger.info(`Total grahas: ${planets.length}`); // Should be 9

    // ── 5. Sidereal Lagna (Ascendant) ─────────────────────────────────────────
    // swe_houses returns TROPICAL ascendant; we subtract ayanamsa for sidereal.
    const houseResult = swisseph.swe_houses(JD, lat, lng, 'W');
    if (houseResult.error) throw new Error(`Houses: ${houseResult.error}`);

    const tropicalAsc  = houseResult.ascendant;
    const siderealAsc  = normalise(tropicalAsc - ayanamsa);
    const lagnaZodiac  = getZodiacFromLongitude(siderealAsc);
    const { deg: lDeg, min: lMin } = getDegreeInSign(siderealAsc);

    logger.info('Lagna', {
      tropicalAsc:  tropicalAsc.toFixed(4),
      siderealAsc:  siderealAsc.toFixed(4),
      sign:         lagnaZodiac.name,
      degree:       `${lDeg}°${lMin}'`,
    });

    // ── 6. Whole Sign houses ──────────────────────────────────────────────────
    const houses = calculateWholeSigns(lagnaZodiac.index);

    // ── 7. Assign house number to each planet ─────────────────────────────────
    planets.forEach((p) => {
      const houseIndex = ((p.signIndex - lagnaZodiac.index) % 12 + 12) % 12;
      p.house = houseIndex + 1;
    });

    const chart: ChartData = {
      name,
      birthDateTime: date.toISOString(),
      location: { city: cityName, lat, lng },
      ayanamsa,
      planets,
      ascendant: {
        siderealLongitude: siderealAsc,
        sign:              lagnaZodiac.name,
        signIndex:         lagnaZodiac.index,
        degreeInSign:      lDeg,
        minuteInSign:      lMin,
      },
      houses,
    };

    logger.info('Vedic chart complete', {
      name,
      lagna:    `${lagnaZodiac.name} ${lDeg}°${lMin}'`,
      ayanamsa: ayanamsa.toFixed(4),
      grahas:   planets.length,
    });

    return chart;

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error('calculateVedicChart | Failed', { msg });
    throw new Error(`Chart calculation failed: ${msg}`);
  }
}

// Re-export for single-import convenience
export type { ChartData, PlanetPosition, ZodiacSign };
