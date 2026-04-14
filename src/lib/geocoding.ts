/**
 * geocoding.ts
 * Single Responsibility: Converts city name → geographic coordinates.
 * Uses node-geocoder with OpenStreetMap (Nominatim) — free, no API key.
 * Server-side only.
 *
 * Rule 4, 5, 6 | SOLID — Single Responsibility.
 */

import NodeGeocoder from 'node-geocoder';
import { logger } from './logger';

export interface Coordinates {
  lat: number;
  lng: number;
  formattedAddress: string;
}

const geocoder = NodeGeocoder({ provider: 'openstreetmap' });

export async function geocodeCity(cityName: string): Promise<Coordinates> {
  logger.fn('geocodeCity', { cityName });

  if (!cityName?.trim()) {
    logger.error('geocodeCity | Empty city name');
    throw new Error('Place of birth cannot be empty.');
  }

  try {
    logger.info('Geocoding via OpenStreetMap', { cityName });
    const results = await geocoder.geocode(cityName.trim());

    if (!results?.length) {
      logger.error('geocodeCity | No results', { cityName });
      throw new Error(
        `Could not find "${cityName}". Try a more specific name (e.g. "Chennai, India").`
      );
    }

    const best = results[0];
    const coords: Coordinates = {
      lat: best.latitude!,
      lng: best.longitude!,
      formattedAddress: best.formattedAddress ?? cityName,
    };

    logger.info('Geocoding success', coords);
    return coords;
  } catch (err: unknown) {
    if (err instanceof Error && err.message.startsWith('Could not find')) throw err;
    const msg = err instanceof Error ? err.message : String(err);
    logger.error('geocodeCity | Unexpected failure', { msg });
    throw new Error(`Geocoding failed for "${cityName}". Check the place name and try again.`);
  }
}
