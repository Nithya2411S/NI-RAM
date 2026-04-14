/**
 * EastChart.tsx
 * Single Responsibility: Renders the East Indian (Bengali) birth chart.
 *
 * East Indian layout — similar to North Indian but:
 * - Square grid (not diamond), 3×3 outer ring with center empty
 * - House 1 (Lagna) always at top-left corner
 * - Houses go clockwise: 1(TL), 2(TM), 3(TR), 4(MR), 5(BR), 6(BM),
 *                        7(BL), 8(ML), then diagonals fill corners
 * - Signs rotate based on Lagna
 *
 * SOLID — Single Responsibility.
 */

import { clientLogger } from '../../lib/clientLogger';
import type { ChartData } from '../../types/vedic';

interface EastChartProps {
  chart: ChartData;
}

// 12 house positions in a 4×4 grid (corners only, no center 2×2)
// Clockwise from top-left
const HOUSE_LAYOUT: { house: number; row: number; col: number }[] = [
  { house: 1,  row: 0, col: 0 },
  { house: 2,  row: 0, col: 1 },
  { house: 3,  row: 0, col: 2 },
  { house: 4,  row: 0, col: 3 },
  { house: 5,  row: 1, col: 3 },
  { house: 6,  row: 2, col: 3 },
  { house: 7,  row: 3, col: 3 },
  { house: 8,  row: 3, col: 2 },
  { house: 9,  row: 3, col: 1 },
  { house: 10, row: 3, col: 0 },
  { house: 11, row: 2, col: 0 },
  { house: 12, row: 1, col: 0 },
];

const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const SIGN_NAMES   = ['Ari','Tau','Gem','Can','Leo','Vir','Lib','Sco','Sag','Cap','Aqu','Pis'];

const CELL = 100;
const PAD  = 10;
const SIZE = CELL * 4 + PAD * 2;

export default function EastChart({ chart }: EastChartProps) {
  clientLogger.fn('EastChart render', { lagna: chart.ascendant.sign });

  const lagnaSignIndex = chart.ascendant.signIndex;

  // Build house → planets map
  const housePlanets: Record<number, string[]> = {};
  for (let i = 1; i <= 12; i++) housePlanets[i] = [];
  chart.planets.forEach((p) => {
    if (p.house >= 1 && p.house <= 12) housePlanets[p.house].push(p.symbol);
  });

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" style={{ maxWidth: SIZE, display: 'block', margin: '0 auto' }}>
      <defs>
        <radialGradient id="ebg" cx="50%" cy="50%" r="70%">
          <stop offset="0%"   stopColor="#0d0b24" />
          <stop offset="100%" stopColor="#050410" />
        </radialGradient>
      </defs>

      <rect width={SIZE} height={SIZE} rx="12" fill="url(#ebg)" />
      <rect width={SIZE} height={SIZE} rx="12" fill="none" stroke="rgba(245,197,24,0.25)" strokeWidth="1" />

      {/* Full 4×4 grid lines */}
      {[1,2,3].map((i) => (
        <g key={i}>
          <line x1={PAD + i*CELL} y1={PAD} x2={PAD + i*CELL} y2={SIZE-PAD} stroke="rgba(245,197,24,0.18)" strokeWidth="0.8" />
          <line x1={PAD} y1={PAD + i*CELL} x2={SIZE-PAD} y2={PAD + i*CELL} stroke="rgba(245,197,24,0.18)" strokeWidth="0.8" />
        </g>
      ))}

      {/* Center 2×2 */}
      <rect x={PAD+CELL} y={PAD+CELL} width={CELL*2} height={CELL*2}
        fill="rgba(245,197,24,0.03)" stroke="rgba(245,197,24,0.12)" strokeWidth="1" />
      <text x={PAD+CELL*2} y={PAD+CELL*2-8} textAnchor="middle" fontSize="9"  fill="rgba(245,197,24,0.4)">NIRAM</text>
      <text x={PAD+CELL*2} y={PAD+CELL*2+6} textAnchor="middle" fontSize="8"  fill="rgba(245,197,24,0.3)">East Indian</text>

      {/* Cells */}
      {HOUSE_LAYOUT.map(({ house, row, col }) => {
        const signIndex = (lagnaSignIndex + house - 1) % 12;
        const x         = PAD + col * CELL;
        const y         = PAD + row * CELL;
        const cx        = x + CELL / 2;
        const cy        = y + CELL / 2;
        const isLagna   = house === 1;
        const planets   = housePlanets[house] ?? [];

        return (
          <g key={house}>
            {/* Cell background for lagna */}
            <rect
              x={x} y={y} width={CELL} height={CELL}
              fill={isLagna ? 'rgba(245,197,24,0.07)' : 'transparent'}
            />

            {/* House number */}
            <text
              x={x + 8} y={y + 14}
              fontSize="9"
              fill={isLagna ? '#f5c518' : 'rgba(245,197,24,0.4)'}
              fontWeight={isLagna ? 'bold' : 'normal'}
            >
              {house}{isLagna ? ' ©' : ''}
            </text>

            {/* Sign info */}
            <text x={cx} y={y + 20} textAnchor="middle" fontSize="11"
              fill={isLagna ? '#f5c518' : 'rgba(180,170,220,0.55)'}>
              {SIGN_SYMBOLS[signIndex]} {SIGN_NAMES[signIndex]}
            </text>

            {/* Planets */}
            <text x={cx} y={cy + 8} textAnchor="middle" fontSize="13" fill="#f5c518">
              {planets.slice(0, 3).join(' ')}
            </text>
            {planets.length > 3 && (
              <text x={cx} y={cy + 22} textAnchor="middle" fontSize="11" fill="#f5c518">
                {planets.slice(3).join(' ')}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
