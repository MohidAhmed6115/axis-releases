import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';

interface CompassDialGaugeProps {
  value: number; // 0 to 100
  targetValue?: number; // secondary reference target (e.g. 80%)
  label?: string;
  sublabel?: string;
  isDark: boolean;
  className?: string;
  compact?: boolean;
}

export const CompassDialGauge: React.FC<CompassDialGaugeProps> = ({
  value,
  targetValue = 80,
  label = 'DAILY COMPLETION',
  sublabel,
  isDark,
  className = '',
  compact = false
}) => {
  const { calibrationTrigger } = useApp();

  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, Math.round(value)));
  const clampedTarget = Math.max(0, Math.min(100, Math.round(targetValue)));

  // Gauge angles: -120deg (0%) to +120deg (100%) -> 240 degree total sweep
  const targetAngle = -120 + (clampedValue / 100) * 240;
  const prevAngleRef = useRef(targetAngle);
  const [needleAngle, setNeedleAngle] = useState(targetAngle);
  const [isCalibrating, setIsCalibrating] = useState(false);

  // Mechanical settle calibration trigger when user logs rating or on trigger
  useEffect(() => {
    const prevAngle = prevAngleRef.current;
    prevAngleRef.current = targetAngle;
    setIsCalibrating(true);
    setNeedleAngle(targetAngle);

    const timer = setTimeout(() => {
      setIsCalibrating(false);
    }, 480);

    return () => clearTimeout(timer);
  }, [calibrationTrigger, targetAngle]);

  // Geometry
  const cx = 110;
  const cy = 105;
  const r = 74;
  const arcLength = 2 * Math.PI * r * (240 / 360); // ~309.97
  const strokeDashoffset = arcLength * (1 - clampedValue / 100);

  // Generate tick marks (every 5% -> 21 ticks)
  const ticks = [];
  for (let i = 0; i <= 20; i++) {
    const pct = i * 5;
    const tickAngle = -120 + (pct / 100) * 240;
    const rad = (tickAngle * Math.PI) / 180;
    const isMajor = i % 5 === 0; // 0, 25, 50, 75, 100
    const innerR = isMajor ? r - 8 : r - 4;
    const outerR = isMajor ? r + 5 : r + 3;

    const x1 = cx + innerR * Math.sin(rad);
    const y1 = cy - innerR * Math.cos(rad);
    const x2 = cx + outerR * Math.sin(rad);
    const y2 = cy - outerR * Math.cos(rad);

    ticks.push({
      pct,
      isMajor,
      x1,
      y1,
      x2,
      y2,
      tickAngle
    });
  }

  // Secondary reference line geometry (#2dd4bf dial teal)
  const refRad = ((-120 + (clampedTarget / 100) * 240) * Math.PI) / 180;
  const refX1 = cx + (r - 9) * Math.sin(refRad);
  const refY1 = cy - (r - 9) * Math.cos(refRad);
  const refX2 = cx + (r + 8) * Math.sin(refRad);
  const refY2 = cy - (r + 8) * Math.cos(refRad);

  // Brand colors per token spec
  const brandAccent = isDark ? '#8b7bff' : '#7c5ef0';
  const dialTeal = '#2dd4bf'; // Secondary chart-only accent
  const trackBg = isDark ? '#1c1c2e' : '#e7e4f4';
  const tickColor = isDark ? '#7d7a96' : '#9c98b6';
  const textColor = isDark ? '#ece9fb' : '#18172b';
  const textMuted = '#7d7a96';

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        <svg
          viewBox="0 0 220 160"
          className={compact ? 'w-44 h-32' : 'w-56 h-40 sm:w-64 sm:h-44'}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Outer Instrument Bezel Ring */}
          <circle
            cx={cx}
            cy={cy}
            r={r + 14}
            stroke={isDark ? 'rgba(139, 123, 255, 0.08)' : 'rgba(124, 94, 240, 0.08)'}
            strokeWidth="1"
            strokeDasharray="2 3"
          />

          {/* Compass Cardinal Marks / Degree Labels at perimeter */}
          <text
            x={cx - (r + 16) * Math.sin((60 * Math.PI) / 180)}
            y={cy + (r + 16) * Math.cos((60 * Math.PI) / 180) + 3}
            fill={textMuted}
            fontSize="7"
            fontFamily="JetBrains Mono"
            textAnchor="middle"
          >
            0%
          </text>
          <text
            x={cx}
            y={cy - (r + 14) + 2}
            fill={textMuted}
            fontSize="7"
            fontFamily="JetBrains Mono"
            textAnchor="middle"
          >
            50%
          </text>
          <text
            x={cx + (r + 16) * Math.sin((60 * Math.PI) / 180)}
            y={cy + (r + 16) * Math.cos((60 * Math.PI) / 180) + 3}
            fill={textMuted}
            fontSize="7"
            fontFamily="JetBrains Mono"
            textAnchor="middle"
          >
            100%
          </text>

          {/* Background Arc Track */}
          <path
            d={`M ${cx - r * Math.sin((60 * Math.PI) / 180)} ${cy + r * Math.cos((60 * Math.PI) / 180)} A ${r} ${r} 0 1 1 ${cx + r * Math.sin((60 * Math.PI) / 180)} ${cy + r * Math.cos((60 * Math.PI) / 180)}`}
            stroke={trackBg}
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Ticks around the dial */}
          {ticks.map((t, idx) => (
            <line
              key={idx}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.isMajor ? textColor : tickColor}
              strokeWidth={t.isMajor ? 1.5 : 1}
              opacity={t.isMajor ? 0.8 : 0.35}
            />
          ))}

          {/* Secondary Reference Target Marker (#2dd4bf Dial Teal) */}
          <line
            x1={refX1}
            y1={refY1}
            x2={refX2}
            y2={refY2}
            stroke={dialTeal}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Dial Teal Reference Label (chart-only reference) */}
          <text
            x={refX2 + 4 * Math.sin(refRad)}
            y={refY2 - 4 * Math.cos(refRad)}
            fill={dialTeal}
            fontSize="6.5"
            fontFamily="JetBrains Mono"
            fontWeight="bold"
            textAnchor={refRad > 0 ? 'start' : 'end'}
          >
            80% REF
          </text>

          {/* Active Arc Fill (Signal Violet #8b7bff) */}
          <path
            d={`M ${cx - r * Math.sin((60 * Math.PI) / 180)} ${cy + r * Math.cos((60 * Math.PI) / 180)} A ${r} ${r} 0 1 1 ${cx + r * Math.sin((60 * Math.PI) / 180)} ${cy + r * Math.cos((60 * Math.PI) / 180)}`}
            stroke={brandAccent}
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300"
          />

          {/* Compass Needle (Pivoting from Center) */}
          <g
            transform={`rotate(${needleAngle}, ${cx}, ${cy})`}
            className={isCalibrating ? 'animate-gauge-calibrate origin-center' : 'transition-transform duration-300 ease-out origin-center'}
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              // @ts-ignore
              '--needle-prev-deg': `${prevAngleRef.current}deg`,
              '--needle-target-deg': `${targetAngle}deg`
            }}
          >
            {/* North arm of needle (tapered diamond pointing outwards) */}
            <polygon
              points={`${cx - 3.5},${cy} ${cx},${cy - (r - 12)} ${cx + 3.5},${cy} ${cx},${cy + 10}`}
              fill={brandAccent}
            />
            {/* Dark contrast bevel on half of needle to give instrument depth */}
            <polygon
              points={`${cx},${cy} ${cx},${cy - (r - 12)} ${cx + 3.5},${cy}`}
              fill="rgba(0, 0, 0, 0.25)"
            />
            {/* Needle tip pointer dot */}
            <circle cx={cx} cy={cy - (r - 12)} r="1.5" fill="#ffffff" />
          </g>

          {/* Machined Center Hub Pivot (echoing Axis compass hub) */}
          <circle
            cx={cx}
            cy={cy}
            r="8"
            fill={isDark ? '#131320' : '#ffffff'}
            stroke={isDark ? '#1c1c2e' : '#e7e4f4'}
            strokeWidth="2"
          />
          <circle
            cx={cx}
            cy={cy}
            r="4"
            fill={brandAccent}
          />
        </svg>

        {/* Central / Base Instrument Digital Readout */}
        <div className="absolute bottom-1 flex flex-col items-center justify-center text-center pointer-events-none">
          <div className="flex items-baseline gap-0.5">
            <span
              className="text-2xl sm:text-3xl font-mono font-bold tabular-nums tracking-tight leading-none"
              style={{ color: textColor }}
            >
              {clampedValue}
            </span>
            <span
              className="text-xs sm:text-sm font-mono font-semibold"
              style={{ color: brandAccent }}
            >
              %
            </span>
          </div>
          {label && (
            <span
              className="text-[9px] sm:text-[10px] uppercase font-mono tracking-wider font-semibold mt-1"
              style={{ color: textMuted }}
            >
              {label}
            </span>
          )}
        </div>
      </div>

      {sublabel && (
        <span
          className="text-[11px] font-mono tabular-nums tracking-wide mt-0.5 text-center"
          style={{ color: textMuted }}
        >
          {sublabel}
        </span>
      )}
    </div>
  );
};
