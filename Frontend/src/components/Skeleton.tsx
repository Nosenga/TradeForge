import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width, 
  height,
  rounded = false 
}) => {
  return (
    <div
      className={`skeleton ${rounded ? 'rounded-full' : ''} ${className}`}
      style={{ width, height }}
    />
  );
};

// Pre-built skeleton layouts
export const SkeletonStats: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="glass p-5 space-y-3">
        <Skeleton height="12px" width="60%" />
        <Skeleton height="32px" width="40%" />
      </div>
    ))}
  </div>
);

export const SkeletonBotRow: React.FC = () => (
  <div className="bg-trade-bg/50 rounded-lg p-4 border border-trade-border flex justify-between items-center">
    <div className="flex items-center gap-4 flex-1">
      <Skeleton width="8px" height="8px" rounded />
      <div className="space-y-2 flex-1">
        <Skeleton height="16px" width="120px" />
        <Skeleton height="12px" width="200px" />
      </div>
    </div>
    <div className="flex gap-2">
      <Skeleton width="80px" height="32px" />
      <Skeleton width="40px" height="32px" />
    </div>
  </div>
);

export const SkeletonTableRow: React.FC<{ columns?: number }> = ({ columns = 6 }) => (
  <tr className="border-b border-trade-border/50">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="py-3 px-2">
        <Skeleton height="16px" width={i === 0 ? '80%' : '60%'} />
      </td>
    ))}
  </tr>
);

export const SkeletonSignalCard: React.FC = () => (
  <div className="glass p-6 space-y-4">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <Skeleton height="24px" width="80px" />
        <Skeleton height="16px" width="100px" />
      </div>
      <Skeleton height="32px" width="80px" rounded />
    </div>
    <div className="space-y-2">
      <div className="flex justify-between">
        <Skeleton height="12px" width="80px" />
        <Skeleton height="12px" width="40px" />
      </div>
      <Skeleton height="8px" width="100%" />
    </div>
    <div className="space-y-1 pt-4 border-t border-trade-border/50">
      <Skeleton height="12px" width="80%" />
      <Skeleton height="12px" width="70%" />
      <Skeleton height="12px" width="90%" />
    </div>
  </div>
);

export const SkeletonStrategyCard: React.FC = () => (
  <div className="glass p-6 space-y-4">
    <div className="flex items-center gap-2">
      <Skeleton height="20px" width="20px" rounded />
      <Skeleton height="20px" width="60%" />
    </div>
    <Skeleton height="14px" width="100%" />
    <Skeleton height="14px" width="80%" />
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-trade-bg/50 rounded-lg p-2 space-y-1">
          <Skeleton height="10px" width="60%" />
          <Skeleton height="16px" width="40%" />
        </div>
      ))}
    </div>
    <div className="flex gap-2">
      <Skeleton height="32px" width="100%" />
    </div>
  </div>
);