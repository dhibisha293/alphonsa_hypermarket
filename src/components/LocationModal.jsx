import React, { useState } from 'react';
import { X, MapPin, Check, Search, Building2 } from 'lucide-react';
import { LOCATIONS } from '../data/mockData';

export default function LocationModal({ isOpen, onClose, onSelectLocation, selectedLocation }) {
  const [pinCode, setPinCode] = useState('');
  const [pinMessage, setPinMessage] = useState('');

  if (!isOpen) return null;

  const handleCheckPin = () => {
    if (pinCode.length === 6) {
      setPinMessage(`✅ Great news! Same-day delivery available for PIN ${pinCode}.`);
    } else {
      setPinMessage('❌ Please enter a valid 6-digit PIN code.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 p-6 relative animate-fade-in space-y-5">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 font-heading">Choose Store Location</h3>
              <p className="text-xs text-slate-400">Select your nearest Alphonsa Hypermarket branch</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIN Code Check Input */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
          <label className="text-xs font-bold text-slate-700 block">Check Delivery Availability by PIN Code</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={pinCode}
              maxLength={6}
              onChange={(e) => setPinCode(e.target.value)}
              placeholder="Enter 6-digit PIN (e.g. 682001)"
              className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
            />
            <button 
              onClick={handleCheckPin}
              className="btn-neon text-xs py-2 px-4 shrink-0 font-bold"
            >
              Check
            </button>
          </div>
          {pinMessage && (
            <p className="text-xs font-semibold mt-1">{pinMessage}</p>
          )}
        </div>

        {/* Store Branches List */}
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Our Hypermarket Branches</div>
          <div className="space-y-2.5">
            {LOCATIONS.map(loc => {
              const isSelected = selectedLocation?.id === loc.id;
              return (
                <div 
                  key={loc.id}
                  onClick={() => {
                    onSelectLocation(loc);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected 
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20' 
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className={`w-5 h-5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-bold text-xs text-slate-900">{loc.name}</div>
                      <div className="text-[11px] text-slate-500">{loc.city} • {loc.status}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
