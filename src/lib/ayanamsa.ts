/**
 * ayanamsa.ts
 * Single Responsibility: Lahiri Ayanamsa and Julian Day via Swiss Ephemeris.
 * Replaces the previous manual IAU formula with the same engine used by
 * Jagannatha Hora — ensuring arc-second accuracy.
 *
 * Rule 6: Function-Level Logging | SOLID — Single Responsibility.
 */

import swisseph from 'swisseph';
import { logger } from './logger';

/**
 * Returns the Lahiri Ayanamsa for a given Julian Day (UT) using Swiss Ephemeris.
 * Equivalent to Jagannatha Hora's Lahiri setting.
 */
export function getLahiriAyanamsa(julianDay: number): number {
  logger.fn('getLahiriAyanamsa', { julianDay });

  swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);
  const ayanamsa = swisseph.swe_get_ayanamsa_ut(julianDay);

  logger.debug('Lahiri Ayanamsa (swisseph)', { julianDay: julianDay.toFixed(4), ayanamsa: ayanamsa.toFixed(6) });
  return ayanamsa;
}

/**
 * Converts a tropical longitude to sidereal by subtracting the ayanamsa.
 */
export function tropicalToSidereal(tropicalLongitude: number, ayanamsa: number): number {
  logger.fn('tropicalToSidereal', { tropicalLongitude, ayanamsa });
  const sidereal = ((tropicalLongitude - ayanamsa) % 360 + 360) % 360;
  logger.debug('Tropical → Sidereal', { tropicalLongitude, sidereal });
  return sidereal;
}

/**
 * Computes Julian Day Number (UT) from a UTC Date object.
 * Uses Swiss Ephemeris swe_julday for precision.
 */
export function dateToJulianDay(date: Date): number {
  logger.fn('dateToJulianDay');

  const year  = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day   = date.getUTCDate();
  const hour  = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;

  const jd = swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL);
  logger.debug('Julian Day (swisseph)', { jd: jd.toFixed(6) });
  return jd;
}
