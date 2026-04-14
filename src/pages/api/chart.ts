/**
 * api/chart.ts
 * Single Responsibility: HTTP contract — receives request, returns response.
 * Orchestrates geocoding → Vedic chart calculation. Zero business logic here.
 *
 * Rule 4, 5, 6 | SOLID — Single Responsibility, Dependency Inversion.
 */

import type { APIRoute } from 'astro';
import { DateTime } from 'luxon';
import { geocodeCity } from '../../lib/geocoding';
import { calculateVedicChart } from '../../lib/astrology';
import { logger } from '../../lib/logger';
import type { ChartRequest } from '../../types/vedic';

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(body: Partial<ChartRequest>): string | null {
  logger.fn('validate');
  if (!body.name?.trim())         return 'Name is required.';
  if (!body.dateOfBirth?.trim())  return 'Date of birth is required.';
  if (!body.timeOfBirth?.trim())  return 'Time of birth is required.';
  if (!body.placeOfBirth?.trim()) return 'Place of birth is required.';
  const dt = DateTime.fromISO(`${body.dateOfBirth}T${body.timeOfBirth}`);
  if (!dt.isValid) return 'Invalid date or time. Use YYYY-MM-DD and HH:MM format.';
  return null;
}

// ─── POST /api/chart ──────────────────────────────────────────────────────────

export const POST: APIRoute = async ({ request }) => {
  logger.fn('POST /api/chart');

  try {
    // Parse
    let body: Partial<ChartRequest>;
    try {
      body = await request.json();
      logger.info('Request received', { name: body.name, place: body.placeOfBirth });
    } catch {
      logger.error('POST /api/chart | Failed to parse JSON body');
      return json({ success: false, error: 'Invalid request body.' }, 400);
    }

    // Validate
    const err = validate(body);
    if (err) {
      logger.warn('Validation failed', { err });
      return json({ success: false, error: err }, 422);
    }

    const { name, dateOfBirth, timeOfBirth, placeOfBirth } = body as ChartRequest;

    // Geocode
    const coords = await geocodeCity(placeOfBirth);

    // Parse birth date/time as UTC
    const birthDate = DateTime.fromISO(`${dateOfBirth}T${timeOfBirth}`, { zone: 'utc' }).toJSDate();
    logger.info('Birth datetime (UTC)', { iso: birthDate.toISOString() });

    // Calculate Vedic chart
    const chart = calculateVedicChart(name, birthDate, coords.lat, coords.lng, placeOfBirth);

    logger.info('POST /api/chart | Success', { name, lagna: chart.ascendant.sign });
    return json({ success: true, data: chart }, 200);

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected server error.';
    logger.error('POST /api/chart | Unhandled error', { msg });
    return json({ success: false, error: msg }, 500);
  }
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function json(body: object, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
