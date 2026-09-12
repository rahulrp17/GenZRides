import React from 'react';

const Skeleton = ({ className = '', count = 1 }) => (
  <div className="animate-pulse space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`bg-white/10 rounded-lg ${className}`} />
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 animate-pulse">
    <div className="h-4 bg-white/10 rounded w-1/3 mb-4" />
    <div className="h-8 bg-white/10 rounded w-1/2 mb-2" />
    <div className="h-3 bg-white/10 rounded w-2/3" />
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10">
    <div className="animate-pulse">
      <div className="h-12 bg-white/5 flex">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="flex-1 px-4 py-3">
            <div className="h-4 bg-white/10 rounded" />
          </div>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex border-t border-white/5">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="flex-1 px-4 py-4">
              <div className="h-4 bg-white/10 rounded w-3/4" />
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const ListSkeleton = ({ count = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10 animate-pulse flex items-center gap-4">
        <div className="h-12 w-12 bg-white/10 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/10 rounded w-1/3" />
          <div className="h-3 bg-white/10 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;
