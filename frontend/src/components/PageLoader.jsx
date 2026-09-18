import React from 'react';
import { Loader2 } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="w-full h-full min-h-[50vh] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      <p className="text-slate-500 text-sm font-medium animate-pulse">Loading amazing things...</p>
    </div>
  );
}
