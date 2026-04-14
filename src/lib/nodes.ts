/**
 * nodes.ts
 * Single Responsibility: True Rahu (North Node) and Ketu via Swiss Ephemeris.
 * Replaces the previous Meeus manual formula with the same engine used by
 * Jagannatha Hora — ensuring arc-second accuracy on True Nodes.
 *
 * Rahu = True North Node (SE_TRUE_NODE)
 * Ketu = Rahu + 180° (always exactly opposite)
 *
 * Rule 6: Function-Level Logging | SOLID — Single Responsibility.
 */

import swisseph from 'swisseph';
import { logger } from './logger';

/**
 * Returns the True North Node (Rahu) in tropical degrees for a given Julian Day (UT).
 * Uses Swiss Ephemeris SE_TRUE_NODE with SEFLG_SWIEPH for precision.
 */
export function getTrueRahuTropical(julianDay: number): number {
  logger.fn('getTrueRahuTropical', { julianDay });

  const flags = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED;
  const result = swisseph.swe_calc_ut(julianDay, swisseph.SE_TRUE_NODE, flags);

  if (result.error) {
    logger.error('getTrueRahuTropical | swisseph error', { error: result.error });
    throw new Error(`True Node calculation failed: ${result.error}`);
  }

  const trueNode = ((result.longitude % 360) + 360) % 360;
  logger.debug('True Rahu (tropical, swisseph)', { trueNode: trueNode.toFixed(4) });
  return trueNode;
}

/**
 * Ketu is always exactly 180° opposite to Rahu.
 */
export function getKetuTropical(rahuLongitude: number): number {
  logger.fn('getKetuTropical');
  const ketu = (rahuLongitude + 180) % 360;
  logger.debug('Ketu (tropical)', { ketu: ketu.toFixed(4) });
  return ketu;
}
