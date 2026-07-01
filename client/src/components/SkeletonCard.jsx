import { memo } from "react";

function SkeletonCard() {
  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 animate-pulse"
      aria-hidden="true"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="h-5 bg-gray-200 rounded w-2/3" />
        <div className="h-5 bg-gray-200 rounded-full w-16" />
      </div>
      <div className="h-4 bg-gray-100 rounded w-full" />
      <div className="h-4 bg-gray-100 rounded w-5/6" />
      <div className="h-5 bg-gray-200 rounded-full w-24" />
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="h-3 bg-gray-100 rounded w-20" />
        <div className="h-3 bg-gray-100 rounded w-20" />
      </div>
      <div className="flex gap-2 pt-1">
        <div className="h-9 bg-gray-100 rounded-lg flex-1" />
        <div className="h-9 bg-gray-100 rounded-lg flex-1" />
      </div>
    </div>
  );
}

export default memo(SkeletonCard);
