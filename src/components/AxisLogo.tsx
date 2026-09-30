import React, { useState } from 'react';

interface AxisLogoProps {
  className?: string;
  size?: number;
  alt?: string;
}

/**
 * Axis App Logo:
 * Displays the authentic brand logo provided for Axis (/axis_logo.png).
 * Includes graceful fallback in case of loading issues.
 */
export const AxisLogo: React.FC<AxisLogoProps> = ({ 
  className = "w-6 h-6", 
  size,
  alt = "Axis"
}) => {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div 
        className={`shrink-0 flex items-center justify-center font-bold font-mono text-xs bg-[#12161f] border border-[#8b7bff]/40 text-[#8b7bff] rounded-md ${className}`}
        style={size ? { width: size, height: size } : undefined}
      >
        A
      </div>
    );
  }

  return (
    <img 
      src="/axis_logo.png" 
      alt={alt}
      onError={() => setImgError(true)}
      className={`shrink-0 object-contain rounded-md select-none ${className}`}
      style={size ? { width: size, height: size } : undefined}
    />
  );
};

