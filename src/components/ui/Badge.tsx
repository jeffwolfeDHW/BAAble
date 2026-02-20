/**
 * Badge component - Reusable badge/chip component for tags and status indicators
 * Supports multiple color variants and sizes
 */

import React from 'react';

type BadgeVariant = 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'orange' | 'gray';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant: BadgeVariant;
  size?: BadgeSize;
}

const Badge: React.FC<BadgeProps> = ({ children, variant, size = 'md' }) => {
  const variantClasses: Record<BadgeVariant, string> = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    orange: 'bg-orange-100 text-orange-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  const sizeClasses: Record<BadgeSize, string> = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-block rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {children}
    </span>
  );
};

export default Badge;
