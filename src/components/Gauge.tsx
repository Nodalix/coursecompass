interface GaugeProps {
  /** 0-100 for percentage gauges */
  percent: number;
  /** Large value shown in center */
  value: string;
  /** Small label below value */
  label: string;
  /** Optional sub-label (e.g. "32/120 units") */
  sub?: string;
  /** Diameter in px */
  size?: number;
  /** Override arc color */
  color?: string;
}

/**
 * Speedometer-style half-arc gauge.
 * 240-degree arc (from 150° to 390°), open at the bottom.
 */
export default function Gauge({ percent, value, label, sub, size = 140, color }: GaugeProps) {
  const strokeWidth = size * 0.06;
  const radius = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // 240-degree arc: starts at 150°, ends at 390° (= 30°)
  const arcDeg = 240;
  const startAngle = 150;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  // Arc path using SVG arc commands
  const arcPath = (angleDeg: number) => {
    const endAngle = startAngle + angleDeg;
    const x1 = cx + radius * Math.cos(toRad(startAngle));
    const y1 = cy + radius * Math.sin(toRad(startAngle));
    const x2 = cx + radius * Math.cos(toRad(endAngle));
    const y2 = cy + radius * Math.sin(toRad(endAngle));
    const largeArc = angleDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const clamped = Math.max(0, Math.min(100, percent));
  const fillAngle = (clamped / 100) * arcDeg;

  // Color based on percentage (or override)
  const arcColor = color ?? (clamped >= 100 ? '#378DBD' : clamped >= 50 ? '#FBBF24' : '#AB0520');

  // Tick marks at 0%, 25%, 50%, 75%, 100%
  const ticks = [0, 25, 50, 75, 100];
  const tickLength = size * 0.06;
  const tickOuter = radius + strokeWidth * 0.5;
  const tickInner = tickOuter - tickLength;

  // Scale font sizes relative to gauge size
  const valueFontSize = size * 0.17;
  const labelFontSize = size * 0.078;
  const subFontSize = size * 0.065;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size * 0.8 }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="absolute top-0 left-0"
          style={{ marginBottom: -(size * 0.2) }}
        >
          {/* Background arc */}
          <path
            d={arcPath(arcDeg)}
            fill="none"
            stroke="#1E3A5F"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Filled arc */}
          {fillAngle > 0 && (
            <path
              d={arcPath(fillAngle)}
              fill="none"
              stroke={arcColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          )}

          {/* Glow effect on filled arc */}
          {fillAngle > 0 && (
            <path
              d={arcPath(fillAngle)}
              fill="none"
              stroke={arcColor}
              strokeWidth={strokeWidth * 2.5}
              strokeLinecap="round"
              opacity={0.15}
              className="transition-all duration-700 ease-out"
            />
          )}

          {/* Tick marks */}
          {ticks.map((t) => {
            const angle = startAngle + (t / 100) * arcDeg;
            const rad = toRad(angle);
            const x1 = cx + tickOuter * Math.cos(rad);
            const y1 = cy + tickOuter * Math.sin(rad);
            const x2 = cx + tickInner * Math.cos(rad);
            const y2 = cy + tickInner * Math.sin(rad);
            return (
              <line
                key={t}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={clamped >= t ? arcColor : '#2B4A72'}
                strokeWidth={1.5}
                opacity={clamped >= t ? 0.8 : 0.4}
              />
            );
          })}

          {/* Needle dot at current position */}
          {(() => {
            const angle = startAngle + (clamped / 100) * arcDeg;
            const rad = toRad(angle);
            const dotX = cx + radius * Math.cos(rad);
            const dotY = cy + radius * Math.sin(rad);
            return (
              <>
                <circle cx={dotX} cy={dotY} r={strokeWidth * 0.8} fill={arcColor} className="transition-all duration-700 ease-out" />
                <circle cx={dotX} cy={dotY} r={strokeWidth * 1.5} fill={arcColor} opacity={0.2} className="transition-all duration-700 ease-out" />
              </>
            );
          })()}

          {/* Center hub dot */}
          <circle cx={cx} cy={cy} r={size * 0.025} fill="#2B4A72" />
        </svg>

        {/* Center text overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ paddingTop: size * 0.1 }}
        >
          <span className="font-bold text-white leading-none" style={{ fontSize: valueFontSize }}>
            {value}
          </span>
          <span className="text-gray-400 mt-0.5" style={{ fontSize: labelFontSize }}>
            {label}
          </span>
          {sub && (
            <span className="text-gray-500 mt-0.5" style={{ fontSize: subFontSize }}>
              {sub}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
