'use client';

import React from 'react';
import { HistoricalRun } from '../types/packing';
import { History, Calendar, Container, PieChart, Box, ArrowRight } from 'lucide-react';

interface Props {
  history: HistoricalRun[];
  onSelectRun: (run: HistoricalRun) => void;
}

export default function HistoryPanel({ history, onSelectRun }: Props) {
  if (!history || history.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-xl border border-slate-800 text-center text-slate-400 text-sm">
        <History className="w-8 h-8 mx-auto mb-2 text-slate-600" />
        No previous optimization runs saved yet. Run your first optimization above!
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
      <div className="flex items-center gap-2 text-slate-200 font-semibold text-lg pb-2 border-b border-slate-800">
        <History className="w-5 h-5 text-blue-400" />
        <span>Previous Optimizations (PostgreSQL History)</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm text-slate-300">
          <thead className="bg-slate-900/80 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4">Containers</th>
              <th className="py-3 px-4">Utilization</th>
              <th className="py-3 px-4">Packages</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {history.map((run) => {
              const dateStr = new Date(run.createdAt).toLocaleString();
              const totalPkgs = run.resultData?.summary?.totalPackages || 0;

              return (
                <tr
                  key={run.id}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  onClick={() => onSelectRun(run)}
                >
                  <td className="py-3 px-4 font-mono text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {dateStr}
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Container className="w-3 h-3" />
                      {run.containerCount} Container(s)
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-emerald-400">
                    {run.averageUtilization}%
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {totalPkgs} items
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRun(run);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 transition-colors text-xs"
                    >
                      Load <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
