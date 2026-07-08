interface HistoryChartProps {
  data: number[];
  color: string;
  label: string;
  width?: number;
  height?: number;
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function HistoryChart({
  data,
  color,
  label,
  width = 520,
  height = 150,
}: HistoryChartProps) {
  const values = data.length > 0 ? data.map(clampPercent) : [0];
  const stepX = values.length > 1 ? width / (values.length - 1) : width;
  const points = values
    .map((value, index) => {
      const x = index * stepX;
      const y = height - (value / 100) * height;
      return `${x},${y}`;
    })
    .join(" ");
  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg
      width={width}
      height={height}
      className="history-chart"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
    >
      <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} />
      <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} />
      <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} />
      <polyline
        points={areaPoints}
        className="history-chart-area"
        style={{ fill: color }}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
