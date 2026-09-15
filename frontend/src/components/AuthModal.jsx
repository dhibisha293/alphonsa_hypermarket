import React, { useState } from 'react';
import { X, User, Lock, Mail, Eye, EyeOff, ArrowRight, LogOut } from 'lucide-react';
import * as api from '../services/api';

export default function AuthModal({ isOpen, onClose, onTriggerToast, onLoginSuccess, currentUser, onLogout }) {
  const [isRegister, setIsRegister] = useState(false);
  const [fullName,   setFullName]   = useState('');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPwd,    setShowPwd]    = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail(''); setPassword(''); setFullName(''); setError('');
  };

  // ── Already logged in — show profile + logout ──────────────────────────────
  if (currentUser) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200 p-6 sm:p-8 relative animate-fade-in space-y-5">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold mx-auto shadow-lg shadow-emerald-500/20">
              <User className="w-7 h-7 stroke-[2]" />
            </div>
            <h3 className="font-extrabold text-xl text-slate-900 font-heading">
              {currentUser.full_name || 'My Account'}
            </h3>
            <p className="text-xs text-slate-400">{currentUser.email}</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs space-y-1 text-slate-600">
            <div className="flex justify-between"><span className="font-bold">Email</span><span>{currentUser.email}</span></div>
            {currentUser.full_name && <div className="flex justify-between"><span className="font-bold">Name</span><span>{currentUser.full_name}</span></div>}
          </div>

          <button
            onClick={() => { onLogout(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 font-bold text-sm hover:bg-rose-100 transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // ── Sign In / Register form ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let res;
      if (isRegister) {
        res = await api.register(email, password, fullName);
        if (res.success && res.data?.access_token) {
          api.saveToken(res.data.access_token);
          onLoginSuccess(res.data);
          onTriggerToast('Account created! Welcome to Alphonsa!');
          onClose();
          resetForm();
        } else if (res.success) {
          // Email confirmation required
          onTriggerToast('Account created! Please check your email to confirm.');
          onClose();
          resetForm();
        }
      } else {
        res = await api.login(email, password);
        if (res.success) {
          api.saveToken(res.data.access_token);
          onLoginSuccess(res.data);
          onTriggerToast(`Welcome back to Alphonsa Hypermarket!`);
          onClose();
          resetForm();
        }
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200 p-6 sm:p-8 relative animate-fade-in space-y-5">

        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white transition">
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

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium px-4 py-2.5 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          {isRegister && (
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Priya Sharma"
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. priya@example.com"
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {isRegister && <p className="text-[10px] text-slate-400 mt-1">Minimum 6 characters</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-neon py-3.5 text-xs font-bold shadow-lg shadow-emerald-500/20 mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                {isRegister ? 'Creating Account...' : 'Signing In...'}
              </span>
            ) : (
              <>
                <span>{isRegister ? 'Create Free Account' : 'Sign In To Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          {isRegister ? (
            <span>Already have an account?{' '}
              <button onClick={() => { setIsRegister(false); setError(''); }} className="text-emerald-600 font-bold hover:underline">Sign In</button>
            </span>
          ) : (
            <span>Don't have an account yet?{' '}
              <button onClick={() => { setIsRegister(true); setError(''); }} className="text-emerald-600 font-bold hover:underline">Register Now</button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
