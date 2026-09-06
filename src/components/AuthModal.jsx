import React, { useState } from 'react';
import { X, User, Lock, Mail, Phone, ShoppingBag, ArrowRight } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onTriggerToast }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onTriggerToast(isRegister ? 'Account created successfully! Welcome to Alphonsa!' : 'Welcome back to Alphonsa Hypermarket!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200 p-6 sm:p-8 relative animate-fade-in space-y-5">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold mx-auto mb-2 shadow-lg shadow-emerald-500/20">
            <User className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h3 className="font-extrabold text-xl text-slate-900 font-heading">
            {isRegister ? 'Create Alphonsa Account' : 'Welcome Back'}
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            {isRegister ? 'Sign up for exclusive supermarket member deals' : 'Access your saved cart, wishlist and order history'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          {isRegister && (
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name</label>
              <input 
                type="text" 
                required
                placeholder="Priya Sharma"
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Mobile Number or Email</label>
            <input 
              type="text" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. +91 9876543210 or name@email.com"
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <button type="submit" className="w-full btn-neon py-3.5 text-xs font-bold shadow-lg shadow-emerald-500/20 mt-2">
            {isRegister ? 'Create Free Account' : 'Sign In To Account'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          {isRegister ? (
            <span>Already have an account? <button onClick={() => setIsRegister(false)} className="text-emerald-600 font-bold hover:underline">Sign In</button></span>
          ) : (
            <span>Don't have an account yet? <button onClick={() => setIsRegister(true)} className="text-emerald-600 font-bold hover:underline">Register Now</button></span>
          )}
        </div>

      </div>
    </div>
  );
}
