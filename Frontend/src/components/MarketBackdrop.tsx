import React, { useEffect, useState } from 'react';

interface MarketBackdropProps {
  variant?: 'live' | 'ambient';
}

/**
 * Full-screen background:
 *   - variant="live"    → renders animated line (fake but smooth, no API calls)
 *   - variant="ambient" → renders a subtle moving sparkline in the corner
 */
const MarketBackdrop: React.FC<MarketBackdropProps> = ({ variant = 'ambient' }) => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {variant === 'live' && <LiveChartBackdrop />}
      {variant === 'ambient' && <AmbientSparkline />}
    </div>
  );
};

/**
 * Full-width animated line chart (fake price action).
 * Smoothly morphs between random states.
 */
const LiveChartBackdrop: React.FC = () => {
  const [points, setPoints] = useState<number[]>(() => generateSeries(60));

  useEffect(() => {
    const interval = setInterval(() => {
      setPoints((prev) => generateSeries(60, prev[prev.length - 1] ?? 100));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const width = 1000;
  const height = 400;
  const path = buildPath(points, width, height);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
    >
      <defs>
        <linearGradient id="backdrop-line" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="backdrop-fill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill under the line */}
      <path
        d={`${path} L ${width} ${height} L 0 ${height} Z`}
        fill="url(#backdrop-fill)"
        style={{ transition: 'all 2s ease-in-out' }}
      />
      {/* The line itself */}
      <path
        d={path}
        fill="none"
        stroke="url(#backdrop-line)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: 'all 2s ease-in-out' }}
      />
    </svg>
  );
};

/**
 * Small gradient sparkline in the bottom-right corner.
 */
const AmbientSparkline: React.FC = () => {
  const [points, setPoints] = useState<number[]>(() => generateSeries(40));

  useEffect(() => {
    const interval = setInterval(() => {
      setPoints((prev) => generateSeries(40, prev[prev.length - 1] ?? 100));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const width = 300;
  const height = 120;
  const path = buildPath(points, width, height);

  return (
    <div className="absolute bottom-8 right-8 opacity-30">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="ambient-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <path
          d={path}
          fill="none"
          stroke="url(#ambient-line)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: 'all 3s ease-in-out' }}
        />
      </svg>
    </div>
  );
};

/**
 * Generate a random-walk series with the given length.
 */
function generateSeries(length: number, start: number = 100): number[] {
  const points: number[] = [];
  let value = start;
  for (let i = 0; i < length; i++) {
    value += (Math.random() - 0.5) * 8;
    value = Math.max(20, Math.min(180, value));
    points.push(value);
  }
  return points;
}

/**
 * Convert a numeric series into an SVG path string.
 */
function buildPath(points: number[], width: number, height: number): string {
  if (points.length === 0) return '';
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const stepX = width / (points.length - 1);

  return points
    .map((p, i) => {
      const x = i * stepX;
      const y = height - ((p - min) / range) * height;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

export default MarketBackdrop;