/**
 * ChartViewer.tsx
 * Single Responsibility: Renders the chart style switcher + the active chart.
 * Holds the selected chart style state. Composes the three chart components.
 *
 * Rule 4, 6 | SOLID — Single Responsibility, Open/Closed (add new chart style
 * by adding a new component + tab entry — no modification to existing logic).
 */

import { useState } from 'react';
import NorthChart from './charts/NorthChart';
import SouthChart from './charts/SouthChart';
import EastChart  from './charts/EastChart';
import PlanetTable from './PlanetTable';
import { clientLogger } from '../lib/clientLogger';
import type { ChartData, ChartStyle } from '../types/vedic';

interface ChartViewerProps {
  chart: ChartData;
  onReset: () => void;
}

const TABS: { id: ChartStyle; label: string }[] = [
  { id: 'north', label: 'North Indian' },
  { id: 'south', label: 'South Indian' },
  { id: 'east',  label: 'East Indian'  },
];

export default function ChartViewer({ chart, onReset }: ChartViewerProps) {
  clientLogger.fn('ChartViewer render', { name: chart.name });

  const [style, setStyle] = useState<ChartStyle>('north');

  function handleTabChange(s: ChartStyle) {
    clientLogger.fn('handleTabChange', { from: style, to: s });
    clientLogger.action(`Chart style switched to: ${s}`);
    setStyle(s);
  }

  return (
    <div style={{ maxWidth: '680px', width: '100%', margin: '0 auto' }}>

      {/* Chart header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 className="gold-glow" style={{
          color: '#f5c518', fontFamily: 'Georgia, serif',
          fontSize: '1.3rem', fontWeight: 700, letterSpacing: '0.15em',
        }}>
          {chart.name}
        </h2>
        <p style={{ color: 'rgba(245,197,24,0.5)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
          Lagna: {chart.ascendant.sign} {chart.ascendant.degreeInSign}° {chart.ascendant.minuteInSign}'
          &nbsp;·&nbsp; {chart.location.city}
          &nbsp;·&nbsp; Ayanamsa: {chart.ayanamsa.toFixed(4)}°
        </p>
      </div>

      {/* Style tabs */}
      <div className="chart-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`chart-tab ${style === tab.id ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active chart */}
      <div className="cosmic-card cosmic-card-glow" style={{ padding: '1.5rem' }}>
        {style === 'north' && <NorthChart chart={chart} />}
        {style === 'south' && <SouthChart chart={chart} />}
        {style === 'east'  && <EastChart  chart={chart} />}
      </div>

      {/* Planet table */}
      <PlanetTable planets={chart.planets} />

      {/* Ascendant info */}
      <div className="cosmic-card" style={{ marginTop: '1.25rem', padding: '1.25rem' }}>
        <p style={{ color: 'rgba(245,197,24,0.6)', fontSize: '0.7rem', letterSpacing: '0.15em',
                    textTransform: 'uppercase', textAlign: 'center', marginBottom: '0.75rem' }}>
          Chart Details
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem' }}>
          {[
            { label: 'Lagna (Ascendant)', value: `${chart.ascendant.sign} ${chart.ascendant.degreeInSign}°${chart.ascendant.minuteInSign}'` },
            { label: 'Lahiri Ayanamsa',   value: `${chart.ayanamsa.toFixed(6)}°` },
            { label: 'House System',       value: 'Whole Sign' },
            { label: 'Node Type',          value: 'True Nodes' },
            { label: 'Location',           value: `${chart.location.lat.toFixed(4)}°, ${chart.location.lng.toFixed(4)}°` },
            { label: 'Birth (UTC)',        value: new Date(chart.birthDateTime).toUTCString() },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ color: 'rgba(245,197,24,0.5)', fontSize: '0.7rem', letterSpacing: '0.08em', marginBottom: '0.15rem' }}>
                {label}
              </p>
              <p style={{ color: '#e2e8f0' }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reset */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button onClick={onReset} className="cosmic-btn" style={{ maxWidth: '280px' }}>
          ← Generate Another Chart
        </button>
      </div>
    </div>
  );
}
