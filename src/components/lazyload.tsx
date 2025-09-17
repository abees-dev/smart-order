import React, { Suspense } from "react";

interface LazyLoadComponentProps {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

const LazyLoadComponent = ({ children, fallback }: LazyLoadComponentProps) => {
  return (
    <Suspense fallback={fallback || <div>Loading...</div>}>{children}</Suspense>
  );
};

export default LazyLoadComponent;
