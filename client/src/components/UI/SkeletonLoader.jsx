import React from 'react';

const SkeletonLoader = () => {
    return (
        <div className="w-full space-y-4 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded w-5/6"></div>
            <div className="h-4 bg-slate-700 rounded w-2/3"></div>
            <div className="h-4 bg-slate-700 rounded w-4/5"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        </div>
    );
};

export default SkeletonLoader;
