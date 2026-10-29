import React from 'react';

/**
 * Deterministic pseudo-QR matrix generator for visual fidelity and styling.
 * Creates clean geometric QR-like SVG patterns with 3 standard finder eyes.
 */
export function QRCodeSVG({
  value,
  size = 180,
  fgColor = '#0F172A',
  bgColor = '#FFFFFF',
}: {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
}) {
  // Generate a 25x25 grid matrix based on hash of string
  const gridSize = 25;
  const hash = Array.from(value).reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1) * 31, 1337);

  const isFinder = (r: number, c: number) => {
    // Top-left finder: 0..6, 0..6
    if (r <= 6 && c <= 6) return true;
    // Top-right finder: 0..6, 18..24
    if (r <= 6 && c >= gridSize - 7) return true;
    // Bottom-left finder: 18..24, 0..6
    if (r >= gridSize - 7 && c <= 6) return true;
    return false;
  };

  const isFinderFilled = (r: number, c: number) => {
    // Normalize to 7x7 box
    let nr = r;
    let nc = c;
    if (r <= 6 && c >= gridSize - 7) nc = c - (gridSize - 7);
    if (r >= gridSize - 7 && c <= 6) nr = r - (gridSize - 7);

    // Border or center square
    if (nr === 0 || nr === 6 || nc === 0 || nc === 6) return true;
    if (nr >= 2 && nr <= 4 && nc >= 2 && nc <= 4) return true;
    return false;
  };

  const cells: boolean[][] = [];
  for (let r = 0; r < gridSize; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < gridSize; c++) {
      if (isFinder(r, c)) {
        row.push(isFinderFilled(r, c));
      } else if (r === 6 || c === 6) {
        // Timing patterns
        row.push((r + c) % 2 === 0);
      } else {
        // Data pseudo-random based on hash + coordinates
        const cellHash = (hash ^ (r * 73 + c * 37)) % 100;
        row.push(cellHash > 45);
      }
    }
    cells.push(row);
  }

  const cellSize = size / gridSize;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-xl overflow-hidden shadow-inner">
      <rect width={size} height={size} fill={bgColor} />
      {cells.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize + 0.2}
              height={cellSize + 0.2}
              fill={fgColor}
              rx={cellSize * 0.15}
            />
          ) : null
        )
      )}
    </svg>
  );
}
