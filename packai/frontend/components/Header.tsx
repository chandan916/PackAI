import React from 'react';
import { Package, Sparkles, Cpu } from 'lucide-react';

export default function Header() {
  return (
    <header className="w-full glass-panel border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                PackAI
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Sparkles className="w-3 h-3" /> Hackathon MVP
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-normal">
              AI-assisted 3D container packing optimization
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Deterministic 3D Engine</span>
          </div>
        </div>
      </div>
    </header>
  );
}
