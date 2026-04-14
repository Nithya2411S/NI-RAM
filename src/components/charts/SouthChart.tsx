/**
 * SouthChart.tsx
 * Single Responsibility: Renders the South Indian (fixed sign grid) birth chart.
 *
 * South Indian layout — 4×4 grid, signs are FIXED to positions, houses rotate.
 * Signs always occupy the same cell. The house number shown in each cell
 * depends on which house that sign is (relative to the Lagna sign).
 *
 * Fixed sign grid (row, col → 0-indexed):
 *  Pis  Ari  Tau  Gem
 *  Aqu  [    CENTER    ]  Can
 *  Cap  [    CENTER    ]  Leo
 *  Sag  Sco  Lib  Vir
 *
 * SOLID — Single Responsibility.
 */

import { clientLogger } from '../../lib/clientLogger';
import type { ChartData } from '../../types/vedic';

interface SouthChartProps {
  chart: ChartData;
}

// Fixed sign positions in the 4×4 grid (row, col) — 0-indexed
// Signs go counter-clockwise from top-left
const SIGN_GRID: { signIndex: number; row: number; col: number }[] = [
  { signIndex: 11, row: 0, col: 0 }, // Pisces
  { signIndex: 0,  row: 0, col: 1 }, // Aries
  { signIndex: 1,  row: 0, col: 2 }, // Taurus
  { signIndex: 2,  row: 0, col: 3 }, // Gemini
  { signIndex: 10, row: 1, col: 0 }, // Aquarius
  { signIndex: 3,  row: 1, col: 3 }, // Cancer
  { signIndex: 9,  row: 2, col: 0 }, // Capricorn
  { signIndex: 4,  row: 2, col: 3 }, // Leo
  { signIndex: 8,  row: 3, col: 0 }, // Sagittarius
  { signIndex: 7,  row: 3, col: 1 }, // Scorpio
  { signIndex: 6,  row: 3, col: 2 }, // Libra
  { signIndex: 5,  row: 3, col: 3 }, // Virgo
];

const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const SIGN_NAMES   = ['Ari','Tau','Gem','Can','Leo','Vir','Lib','Sco','Sag','Cap','Aqu','Pis'];

const CELL = 100;
const PAD  = 10;
const SIZE = CELL * 4 + PAD * 2;

export default function SouthChart({ chart }: SouthChartProps) {
  clientLogger.fn('SouthChart render', { lagna: chart.ascendant.sign });

  const lagnaSignIndex = chart.ascendant.signIndex;

  // Build signIndex → planets map
  const signPlanets: Record<number, string[]> = {};
  for (let i = 0; i < 12; i++) signPlanets[i] = [];
  chart.planets.forEach((p) => {
    signPlanets[p.signIndex] = signPlanets[p.signIndex] ?? [];
    signPlanets[p.signIndex].push(p.symbol);
  });

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" style={{ maxWidth: SIZE, display: 'block', margin: '0 auto' }}>
      <defs>
        <radialGradient id="sbg" cx="50%" cy="50%" r="70%">
          <stop offset="0%"   stopColor="#0d0b24" />
          <stop offset="100%" stopColor="#050410" />
        </radialGradient>
      </defs>

      <rect width={SIZE} height={SIZE} rx="12" fill="url(#sbg)" />
      <rect width={SIZE} height={SIZE} rx="12" fill="none" stroke="rgba(245,197,24,0.25)" strokeWidth="1" />

      {/* Grid lines */}
      {[1,2,3].map((i) => (
        <g key={i}>
          <line
            x1={PAD + i * CELL} y1={PAD}
            x2={PAD + i * CELL} y2={SIZE - PAD}
            stroke="rgba(245,197,24,0.2)" strokeWidth="0.8"
          />
          <line
            x1={PAD}         y1={PAD + i * CELL}
            x2={SIZE - PAD}  y2={PAD + i * CELL}
            stroke="rgba(245,197,24,0.2)" strokeWidth="0.8"
          />
        </g>
      ))}
      {/* Center empty area border */}
      <rect
        x={PAD + CELL} y={PAD + CELL}
        width={CELL * 2} height={CELL * 2}
        fill="rgba(245,197,24,0.03)"
        stroke="rgba(245,197,24,0.15)"
        strokeWidth="1"
      />
      {/* Center text */}
      <text x={PAD + CELL * 2} y={PAD + CELL * 2 - 8} textAnchor="middle" fontSize="9"  fill="rgba(245,197,24,0.4)">NIRAM</text>
      <text x={PAD + CELL * 2} y={PAD + CELL * 2 + 6} textAnchor="middle" fontSize="8"  fill="rgba(245,197,24,0.3)">South Indian</text>

      {/* Cells */}
      {SIGN_GRID.map(({ signIndex, row, col }) => {
        const x       = PAD + col * CELL;
        const y       = PAD + row * CELL;
        const cx      = x + CELL / 2;
        const cy      = y + CELL / 2;
        const houseNo = ((signIndex - lagnaSignIndex + 12) % 12) + 1;
        const isLagna = signIndex === lagnaSignIndex;
        const planets = signPlanets[signIndex] ?? [];

        return (
          <g key={signIndex}>
            {/* Cell background */}
            <rect
              x={x} y={y} width={CELL} height={CELL}
              fill={isLagna ? 'rgba(245,197,24,0.06)' : 'transparent'}
            />

            {/* Sign symbol top-left */}
            <text x={x + 8} y={y + 14} fontSize="13" fill={isLagna ? '#f5c518' : 'rgba(180,170,220,0.5)'}>
              {SIGN_SYMBOLS[signIndex]}
            </text>

            {/* Sign abbreviation */}
            <text x={x + 22} y={y + 14} fontSize="8" fill={isLagna ? 'rgba(245,197,24,0.8)' : 'rgba(180,170,220,0.35)'}>
              {SIGN_NAMES[signIndex]}
            </text>

            {/* House number top-right */}
            <text
              x={x + CELL - 8} y={y + 14}
              textAnchor="end"
              fontSize="9"
              fill={isLagna ? '#f5c518' : 'rgba(245,197,24,0.35)'}
              fontWeight={isLagna ? 'bold' : 'normal'}
            >
              {houseNo}
            </text>

            {/* Lagna marker */}
            {isLagna && (
              <text x={x + CELL - 8} y={y + 26} textAnchor="end" fontSize="7" fill="rgba(245,197,24,0.6)">
                Lag
              </text>
            )}

            {/* Planets */}
            <text x={cx} y={cy + 4} textAnchor="middle" fontSize="13" fill="#f5c518">
              {planets.slice(0, 3).join(' ')}
            </text>
            {planets.length > 3 && (
              <text x={cx} y={cy + 18} textAnchor="middle" fontSize="11" fill="#f5c518">
                {planets.slice(3).join(' ')}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
