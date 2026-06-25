interface CircularGaugeProps {
  percent: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  label: string;
  valueLabel: string;
}

export function CircularGauge({
  percent,
  color,
  size = 110,
  strokeWidth = 9,
  label,
  valueLabel,
}: CircularGaugeProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const center = size / 2;

  return (
    <div className="gauge" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
          className="gauge-ring"
          style={{ color }}
        />
      </svg>
      <div className="gauge-center">
        <span className="gauge-value">{valueLabel}</span>
        <span className="gauge-label">{label}</span>
      </div>
    </div>
  );
}
