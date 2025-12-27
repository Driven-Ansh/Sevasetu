import React from 'react';
import logoImage from 'figma:asset/06c56fe0ebff97dd4d8e64e922ca4c9cb19b3211.png';

interface SevaSetuLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function SevaSetuLogo({ className = '', size = 'md' }: SevaSetuLogoProps) {
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  return (
    <div className={`relative ${sizes[size]} ${className}`}>
      {/* Logo Image */}
      <img 
        src={logoImage} 
        alt="SevaSetu Logo" 
        className="w-full h-full object-contain drop-shadow-lg"
      />
    </div>
  );
}