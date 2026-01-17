import React from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number;
  color?: 'green' | 'yellow' | 'blue' | 'gray';
  icon?: React.ReactNode;
}

export function StatsCard({ title, value, color = 'gray', icon }: StatsCardProps) {
  const colorClasses = {
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    blue: 'bg-blue-50 text-blue-700',
    gray: 'bg-gray-50 text-gray-700',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        {icon && (
          <div className={cn('p-3 rounded-full', colorClasses[color])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
