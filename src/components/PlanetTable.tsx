/**
 * PlanetTable.tsx
 * Single Responsibility: Renders the planet positions table.
 * Pure display component — takes planets as props, renders a table.
 *
 * SOLID — Single Responsibility.
 */

import { clientLogger } from '../lib/clientLogger';
import type { PlanetPosition } from '../types/vedic';

interface PlanetTableProps {
  planets: PlanetPosition[];
}

export default function PlanetTable({ planets }: PlanetTableProps) {
  clientLogger.fn('PlanetTable render', { count: planets.length });

  const COL = {
    label:   { color: 'rgba(245,197,24,0.55)', fontSize: '0.7rem', letterSpacing: '0.12em',
                textTransform: 'uppercase' as const, fontWeight: 'normal', padding: '0.45rem 0.7rem' },
    cell:    { padding: '0.5rem 0.7rem', fontSize: '0.82rem', borderBottom: '1px solid rgba(245,197,24,0.07)' },
  };

  return (
    <div className="cosmic-card" style={{ marginTop: '1.25rem', padding: '1.25rem' }}>
      <p style={{ color: 'rgba(245,197,24,0.6)', fontSize: '0.7rem', letterSpacing: '0.15em',
                  textTransform: 'uppercase', textAlign: 'center', marginBottom: '1rem' }}>
        Planetary Positions
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(245,197,24,0.15)' }}>
              {['Planet', 'Sign', 'Degree', 'House', 'Nakshatra', 'Status'].map((h) => (
                <th key={h} style={COL.label}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {planets.map((p, i) => (
              <tr key={p.name} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent' }}>
                <td style={{ ...COL.cell, color: '#f5c518' }}>{p.symbol} {p.name}</td>
                <td style={{ ...COL.cell, color: '#e2e8f0' }}>{p.signSymbol} {p.sign}</td>
                <td style={{ ...COL.cell, color: 'rgba(200,190,230,0.7)' }}>
                  {p.degreeInSign}° {p.minuteInSign}'
                </td>
                <td style={{ ...COL.cell, color: 'rgba(245,197,24,0.7)', textAlign: 'center' }}>
                  {p.house}
                </td>
                <td style={{ ...COL.cell, color: 'rgba(180,170,220,0.65)', fontSize: '0.78rem' }}>
                  {p.nakshatra} {p.nakshatraPada}
                </td>
                <td style={{ ...COL.cell }}>
                  {p.isRetrograde ? (
                    <span style={{ color: 'rgba(180,100,255,0.85)', fontSize: '0.75rem' }}>℞ Retro</span>
                  ) : (
                    <span style={{ color: 'rgba(100,210,100,0.7)', fontSize: '0.75rem' }}>Direct</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
