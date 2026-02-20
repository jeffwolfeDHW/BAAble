/**
 * StatCard component - Reusable card for displaying statistics
 * Shows a title, value, and icon with hover effects
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  colorClass: string;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, colorClass }) => {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 flex justify-between items-center">
      <div>
        <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`${colorClass} p-4 rounded-lg`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
    </div>
  );
};

export default StatCard;
