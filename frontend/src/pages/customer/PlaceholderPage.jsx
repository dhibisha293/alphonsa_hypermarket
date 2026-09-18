import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Hammer } from 'lucide-react';

export default function PlaceholderPage({ title }) {
  const location = useLocation();
  const displayTitle = title || `Page: ${location.pathname}`;

  return (
    <div className="container-custom py-24 min-h-[50vh] flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-100">
        <Hammer className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 font-heading mb-4">
        {displayTitle}
      </h1>
      <p className="text-slate-500 max-w-md mx-auto mb-8">
        This section is currently under construction as part of our platform upgrades. Check back soon for exciting new features!
      </p>
      <Link to="/" className="btn-neon inline-block py-3 px-8 text-sm font-bold shadow-lg shadow-emerald-500/20 rounded-xl">
        Return Home
      </Link>
    </div>
  );
}
