/**
 * BirthChartApp.tsx
 * Single Responsibility: Top-level state coordinator for the birth chart feature.
 * Holds chart/loading/error state. Orchestrates form → API → chart viewer.
 *
 * Rule 4, 5, 6 | SOLID — Single Responsibility, Dependency Inversion.
 */

import { useState } from 'react';
import BirthForm   from './BirthForm';
import ChartViewer from './ChartViewer';
import { clientLogger } from '../lib/clientLogger';
import type { ChartData, ChartRequest, ChartResponse } from '../types/vedic';

export default function BirthChartApp() {
  clientLogger.fn('BirthChartApp render');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [chart, setChart]         = useState<ChartData | null>(null);

  async function handleFormSubmit(data: ChartRequest) {
    clientLogger.fn('handleFormSubmit', { name: data.name });
    clientLogger.action('Submitting to /api/chart', { name: data.name });

    setIsLoading(true);
    setError(null);
    setChart(null);

    try {
      const res = await fetch('/api/chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: ChartResponse = await res.json();

      if (!result.success || !result.data) {
        const msg = result.error ?? 'Something went wrong. Please try again.';
        clientLogger.error('API returned error', { msg });
        setError(msg);
        return;
      }

      clientLogger.info('Chart received', { lagna: result.data.ascendant.sign });
      setChart(result.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error. Check your connection.';
      clientLogger.error('handleFormSubmit | Fetch failed', { msg });
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    clientLogger.fn('handleReset');
    clientLogger.action('User reset — returning to form');
    setChart(null);
    setError(null);
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '2rem' }}>
      {!chart && (
        <BirthForm onSubmit={handleFormSubmit} isLoading={isLoading} error={error} />
      )}
      {chart && (
        <ChartViewer chart={chart} onReset={handleReset} />
      )}
    </div>
  );
}
