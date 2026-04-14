/**
 * NorthChart.tsx
 * Single Responsibility: Renders the North Indian (diamond) birth chart.
 *
 * North Indian layout — 12 fixed house boxes, signs rotate based on Lagna.
 * House 1 (Lagna) is always top-center-left diamond.
 *
 * Grid positions (house number → [row, col] in a 4×4 grid with corners cut):
 *  12  1  2
 * 11  [  ]  3
 * 10  [  ]  4
 *   9  8  7  6  5
 *
 * SOLID — Single Responsibility: only renders, zero data fetching.
 */

import { clientLogger } from '../../lib/clientLogger';
import type { ChartData } from '../../types/vedic';

interface NorthChartProps {
  chart: ChartData;
}

// Fixed house positions in SVG space (center x, center y, width, height)
// The North Indian chart is a 4×4 grid with the 4 corners cut into triangles
// and the center 2×2 cells empty.

const SIZE = 420;
const C    = SIZE / 2; // 210
const Q    = SIZE / 4; // 105

// House label positions (center of each house cell)
const HOUSE_CENTERS: Record<number, [number, number]> = {
  1:  [C, Q / 2],            // top center
  2:  [C + Q, Q],            // top right
  3:  [C + Q + Q/2, C],      // right top
  4:  [C + Q, C + Q],        // bottom right top
  5:  [C + Q + Q/2, C + Q],  // right bottom — adjust
  6:  [C + Q, C + Q * 1.6],  // bottom right
  7:  [C, C + Q * 1.75],     // bottom center
  8:  [C - Q, C + Q * 1.6],  // bottom left
  9:  [C - Q - Q/2, C + Q],  // left bottom
  10: [C - Q, C + Q],        // bottom left top
  11: [C - Q - Q/2, C],      // left top
  12: [C - Q, Q],            // top left
};

// Corrected positions for a proper North Indian diamond layout
const HOUSE_POS: Record<number, { cx: number; cy: number }> = {
  1:  { cx: C,         cy: Q * 0.7  },
  2:  { cx: C + Q,     cy: Q        },
  3:  { cx: C + Q*1.6, cy: C        },
  4:  { cx: C + Q,     cy: C + Q    },
  5:  { cx: C + Q*1.6, cy: C + Q    },
  6:  { cx: C + Q,     cy: C + Q*1.6},
  7:  { cx: C,         cy: C + Q*1.7},
  8:  { cx: C - Q,     cy: C + Q*1.6},
  9:  { cx: C - Q*1.6, cy: C + Q    },
  10: { cx: C - Q,     cy: C + Q    },
  11: { cx: C - Q*1.6, cy: C        },
  12: { cx: C - Q,     cy: Q        },
};

export default function NorthChart({ chart }: NorthChartProps) {
  clientLogger.fn('NorthChart render', { lagna: chart.ascendant.sign });

  // Build house → planets map
  const housePlanets: Record<number, string[]> = {};
  for (let i = 1; i <= 12; i++) housePlanets[i] = [];
  chart.planets.forEach((p) => {
    if (p.house >= 1 && p.house <= 12) {
      housePlanets[p.house].push(`${p.symbol}`);
    }
  });

  // Sign for each house
  const houseSign: Record<number, string> = {};
  chart.houses.forEach((h) => { houseSign[h.house] = h.signSymbol + ' ' + h.sign.slice(0, 3); });

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" style={{ maxWidth: SIZE, display: 'block', margin: '0 auto' }}>
      <defs>
        <radialGradient id="nbg" cx="50%" cy="50%" r="70%">
          <stop offset="0%"   stopColor="#0d0b24" />
          <stop offset="100%" stopColor="#050410" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width={SIZE} height={SIZE} rx="12" fill="url(#nbg)" />
      <rect width={SIZE} height={SIZE} rx="12" fill="none" stroke="rgba(245,197,24,0.25)" strokeWidth="1" />

      {/* Outer diamond */}
      <polygon
        points={`${C},8 ${SIZE-8},${C} ${C},${SIZE-8} 8,${C}`}
        fill="none"
        stroke="rgba(245,197,24,0.35)"
        strokeWidth="1.5"
      />

      {/* Inner diamond */}
      <polygon
        points={`${C},${Q} ${C+Q},${C} ${C},${C+Q} ${C-Q},${C}`}
        fill="none"
        stroke="rgba(245,197,24,0.2)"
        strokeWidth="1"
      />

      {/* Cross lines */}
      <line x1={C} y1={8}      x2={C}      y2={SIZE-8} stroke="rgba(245,197,24,0.2)" strokeWidth="1" />
      <line x1={8} y1={C}      x2={SIZE-8} y2={C}      stroke="rgba(245,197,24,0.2)" strokeWidth="1" />
      <line x1={8} y1={8}      x2={SIZE-8} y2={SIZE-8} stroke="rgba(245,197,24,0.15)" strokeWidth="0.8" />
      <line x1={SIZE-8} y1={8} x2={8}      y2={SIZE-8} stroke="rgba(245,197,24,0.15)" strokeWidth="0.8" />

      {/* House labels */}
      {Object.entries(HOUSE_POS).map(([houseStr, pos]) => {
        const house   = Number(houseStr);
        const planets = housePlanets[house] ?? [];
        const sign    = houseSign[house] ?? '';
        const isLagna = house === 1;

        return (
          <g key={house}>
            {/* House number */}
            <text
              x={pos.cx} y={pos.cy - 10}
              textAnchor="middle"
              fontSize={isLagna ? '11' : '9'}
              fill={isLagna ? '#f5c518' : 'rgba(245,197,24,0.4)'}
              fontWeight={isLagna ? 'bold' : 'normal'}
            >
              {house}{isLagna ? ' ©' : ''}
            </text>

            {/* Sign */}
            <text
              x={pos.cx} y={pos.cy + 4}
              textAnchor="middle"
              fontSize="9"
              fill={isLagna ? 'rgba(245,197,24,0.9)' : 'rgba(200,190,230,0.55)'}
            >
              {sign}
            </text>

            {/* Planets */}
            <text
              x={pos.cx} y={pos.cy + 17}
              textAnchor="middle"
              fontSize="11"
              fill="#f5c518"
            >
              {planets.slice(0, 4).join(' ')}
            </text>
            {planets.length > 4 && (
              <text x={pos.cx} y={pos.cy + 29} textAnchor="middle" fontSize="10" fill="#f5c518">
                {planets.slice(4).join(' ')}
              </text>
            )}
          </g>
        );
      })}

      {/* Center label */}
      <text x={C} y={C - 6}  textAnchor="middle" fontSize="9"  fill="rgba(245,197,24,0.5)">Lagna</text>
      <text x={C} y={C + 8}  textAnchor="middle" fontSize="10" fill="rgba(245,197,24,0.7)">{chart.ascendant.sign.slice(0,3)}</text>
    </svg>
  );
}
