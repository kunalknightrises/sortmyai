import React from 'react';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count: number;
  className?: string;
  maxCount?: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  className,
  maxCount = 99
}) => {
  if (count <= 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <div
      className={cn(
        "absolute -top-1 -right-1 flex items-center justify-center",
        "min-w-5 h-5 px-1 rounded-full text-xs font-medium",
        "bg-sortmy-blue text-white",
        "animate-pulse-subtle",
        className
      )}
    >
      {displayCount}
    </div>
  );
};

export default NotificationBadge;
