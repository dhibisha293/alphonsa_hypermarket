import React from 'react';
import { PackageOpen } from 'lucide-react';

export default function PlaceholderPage({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
      <div className="p-6 bg-slate-50 rounded-full mb-6">
        <PackageOpen className="w-16 h-16 text-slate-300" />
      </div>
      <h2 className="text-2xl font-bold font-heading text-slate-800 mb-2">{title}</h2>
      <p className="text-slate-500 max-w-md text-center">
        This module is currently under development as part of the system upgrade. It will be available soon.
      </p>
    </div>
  );
}
