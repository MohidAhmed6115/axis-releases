import React from 'react';

interface AxisLogoProps {
  className?: string;
  size?: number;
}

/**
 * Axis Compass Brandmark:
 * 5-Color Evaluation Palette Mapping:
 * - North Arm (Top): Red (#ef4444) - Restraint relapse, high friction, emergency reset
 * - West Arm (Left): Green (#10b981) - Solid discipline, habits executed, steady progress
 * - East Arm (Right): Gold (#eab308) - Pinnacle day, milestone achieved, exceptional execution
 * - South Arm (Bottom): Orange (#f97316) - Maintenance, minor slippage, correction required
 * - Central Hub: Yellow (#f59e0b) - Neutral baseline axis / hesitation / midpoint of self-evaluation
 */
export const AxisLogo: React.FC<AxisLogoProps> = ({ 
  className = "w-6 h-6", 
  size 
}) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      {/* Dark container base with slight rounded corners */}
      <rect width="100" height="100" rx="20" fill="#12161f" />
      
      {/* North Arm (Top) - Red (#ef4444) pointing UP */}
      <path 
        d="M45.5 44V22L50 16L54.5 22V44H45.5Z" 
        fill="#ef4444" 
      />

      {/* South Arm (Bottom) - Orange (#f97316) pointing DOWN */}
      <path 
        d="M45.5 56V78L50 84L54.5 78V56H45.5Z" 
        fill="#f97316" 
      />

      {/* West Arm (Left) - Green (#10b981) pointing LEFT */}
      <path 
        d="M44 45.5H22L16 50L22 54.5H44V45.5Z" 
        fill="#10b981" 
      />

      {/* East Arm (Right) - Gold (#eab308) pointing RIGHT */}
      <path 
        d="M56 45.5H78L84 50L78 54.5H56V45.5Z" 
        fill="#eab308" 
      />

      {/* Central Hub - Yellow (#f59e0b) with crisp dark outline */}
      <circle 
        cx="50" 
        cy="50" 
        r="8" 
        fill="#f59e0b" 
        stroke="#12161f" 
        strokeWidth="2.5" 
      />
    </svg>
  );
};
