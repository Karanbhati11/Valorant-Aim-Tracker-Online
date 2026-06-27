'use client';

import React, { useMemo } from 'react';

export interface SessionDataPoint {
  /** ISO timestamp of when the session was completed */
  completedAt: string;
  /** Normalized score (0–1000) */
  score: number;
}

export interface PerformanceGraphProps {
  /** Array of session data points (score per session over last 30 days) */
  data: SessionDataPoint[];
  /** Exercise name displayed as graph title */
  exerciseName: string;
  /** Width of the graph in pixels (default: 400) */
  width?: number;
  /** Height of the graph in pixels (default: 200) */
  height?: number;
}

/**
 * Plots score per session over the last 30 days for a given exercise.
 * Displays "insufficient data" message when fewer than 2 data points exist.
 *
 * Validates: Requirements 5.5, 5.6
 */
export function PerformanceGraph({
  data,
  exerciseName,
  width = 400,
  height = 200,
}: PerformanceGraphProps) {
  // Filter data to last 30 days
  const filteredData = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return data
      .filter((d) => new Date(d.completedAt) >= thirtyDaysAgo)
      .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
  }, [data]);

  // Insufficient data check
  if (filteredData.length < 2) {
    return (
      <div className="w-full max-w-md mx-auto bg-gray-900/80 border border-gray-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">{exerciseName}</h3>
        <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
          <p>Insufficient data — complete at least 2 sessions in the last 30 days to see your performance graph.</p>
        </div>
      </div>
    );
  }

  // Calculate graph dimensions
  const padding = { top: 20, right: 20, bottom: 30, left: 45 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Compute scales
  const scores = filteredData.map((d) => d.score);
  const minScore = Math.max(0, Math.min(...scores) - 50);
  const maxScore = Math.min(1000, Math.max(...scores) + 50);
  const scoreRange = maxScore - minScore || 1;

  const timestamps = filteredData.map((d) => new Date(d.completedAt).getTime());
  const minTime = timestamps[0];
  const maxTime = timestamps[timestamps.length - 1];
  const timeRange = maxTime - minTime || 1;

  // Convert data points to SVG coordinates
  const points = filteredData.map((d) => {
    const x = padding.left + ((new Date(d.completedAt).getTime() - minTime) / timeRange) * graphWidth;
    const y = padding.top + graphHeight - ((d.score - minScore) / scoreRange) * graphHeight;
    return { x, y, score: d.score, date: d.completedAt };
  });

  // Generate polyline path
  const polylinePath = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Generate area path (filled below the line)
  const areaPath = `M ${points[0].x},${padding.top + graphHeight} ` +
    points.map((p) => `L ${p.x},${p.y}`).join(' ') +
    ` L ${points[points.length - 1].x},${padding.top + graphHeight} Z`;

  // Y-axis labels (5 ticks)
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const value = minScore + (scoreRange * i) / 4;
    const y = padding.top + graphHeight - (graphHeight * i) / 4;
    return { value: Math.round(value), y };
  });

  // X-axis labels (first, middle, last dates)
  const xLabels = [
    { time: minTime, x: padding.left },
    { time: minTime + timeRange / 2, x: padding.left + graphWidth / 2 },
    { time: maxTime, x: padding.left + graphWidth },
  ];

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gray-900/80 border border-gray-700 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">{exerciseName}</h3>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        role="img"
        aria-label={`Performance graph for ${exerciseName} showing scores over the last 30 days`}
      >
        {/* Grid lines */}
        {yTicks.map((tick) => (
          <line
            key={tick.value}
            x1={padding.left}
            y1={tick.y}
            x2={padding.left + graphWidth}
            y2={tick.y}
            stroke="#374151"
            strokeDasharray="4 4"
          />
        ))}

        {/* Y-axis labels */}
        {yTicks.map((tick) => (
          <text
            key={`label-${tick.value}`}
            x={padding.left - 8}
            y={tick.y + 4}
            textAnchor="end"
            className="text-[10px] fill-gray-500"
          >
            {tick.value}
          </text>
        ))}

        {/* X-axis labels */}
        {xLabels.map((label, i) => (
          <text
            key={`x-${i}`}
            x={label.x}
            y={padding.top + graphHeight + 18}
            textAnchor="middle"
            className="text-[10px] fill-gray-500"
          >
            {formatDate(label.time)}
          </text>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGradient)" opacity="0.3" />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00f3ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00f3ff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Line */}
        <polyline
          points={polylinePath}
          fill="none"
          stroke="#00f3ff"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="#00f3ff"
            stroke="#0f1217"
            strokeWidth="1.5"
          >
            <title>{`Score: ${p.score} — ${new Date(p.date).toLocaleDateString()}`}</title>
          </circle>
        ))}
      </svg>
      <p className="text-xs text-gray-500 mt-2 text-center">
        {filteredData.length} sessions over the last 30 days
      </p>
    </div>
  );
}

export default PerformanceGraph;
