import React from "react";

export function Skeleton({ className = "", style }) {
  return (
    <span
      className={`kz-skeleton ${className}`.trim()}
      style={style}
      aria-hidden
    />
  );
}

export function SkeletonKpiGrid({ count = 5 }) {
  return (
    <div className={`grid gap-4 ${count >= 5 ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-5" : "grid-cols-2 md:grid-cols-3"}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="kz-skeleton-kpi">
          <div className="flex items-center gap-3">
            <Skeleton className="kz-skeleton-kpi__icon" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-16 mt-3" />
          <Skeleton className="h-2.5 w-28 mt-2" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonWidget({ lines = 4 }) {
  return (
    <div className="kz-skeleton-widget">
      <Skeleton className="h-4 w-36 mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 mb-3">
          <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-full max-w-[220px]" />
            <Skeleton className="h-2.5 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 8, cols = 5 }) {
  return (
    <div className="kz-skeleton-table" role="status" aria-busy="true" aria-label="Loading table">
      <div className="kz-skeleton-table__head">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="kz-skeleton-table__row">
          {Array.from({ length: cols }).map((_, col) => (
            <Skeleton
              key={col}
              className={`h-3 flex-1 ${col === 0 ? "max-w-[180px]" : ""}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="kz-skeleton-detail p-5 md:p-8 max-w-[1400px] mx-auto space-y-6">
      <Skeleton className="h-4 w-28" />
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-2/3 max-w-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function PageSkeleton({ type = "default" }) {
  if (type === "home") {
    return (
      <div className="kz-skeleton-page p-5 md:p-8 max-w-[1440px] mx-auto space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <SkeletonKpiGrid count={5} />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid lg:grid-cols-2 gap-6">
          <SkeletonWidget lines={5} />
          <SkeletonWidget lines={4} />
        </div>
      </div>
    );
  }

  if (type === "dashboard") {
    return (
      <div className="kz-skeleton-page p-5 md:p-8 max-w-[1440px] mx-auto space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <SkeletonKpiGrid count={6} />
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className="kz-skeleton-page p-5 md:p-8 max-w-[1440px] mx-auto space-y-6">
        <div className="flex justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
        <SkeletonKpiGrid count={4} />
        <SkeletonTable rows={10} cols={6} />
      </div>
    );
  }

  if (type === "detail") {
    return <SkeletonDetail />;
  }

  return (
    <div className="kz-skeleton-page p-5 md:p-8 max-w-[1440px] mx-auto space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  );
}
