import React from "react";

const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-200">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        <p className="text-base text-primary font-semibold animate-pulse">
          Loading, please wait...
        </p>
      </div>
    </div>
  );
};

export default PageLoader;
