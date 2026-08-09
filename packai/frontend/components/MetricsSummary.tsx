import React from 'react';
import { OptimizationSummary } from '../types/packing';
import { Container, PieChart, Box, Percent } from 'lucide-react';

interface Props {
  summary: OptimizationSummary;
}

export default function MetricsSummary({ summary }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* Containers Required Card */}
      <div className="glass-panel glass-panel-hover p-5 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Containers Required
          </p>
          <p className="text-3xl font-extrabold text-white mt-1">
            {summary.containersRequired}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Container className="w-6 h-6" />
        </div>
      </div>

      {/* Average Utilization Card */}
      <div className="glass-panel glass-panel-hover p-5 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Avg Utilization
          </p>
          <p className="text-3xl font-extrabold text-emerald-400 mt-1">
            {summary.averageUtilization}%
          </p>
        </div>
        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <PieChart className="w-6 h-6" />
        </div>
      </div>

      {/* Empty Space Card */}
      <div className="glass-panel glass-panel-hover p-5 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Empty Space
          </p>
          <p className="text-3xl font-extrabold text-amber-400 mt-1">
            {summary.emptySpacePercentage}%
          </p>
        </div>
        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Percent className="w-6 h-6" />
        </div>
      </div>

      {/* Packages Packed Card */}
      <div className="glass-panel glass-panel-hover p-5 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Packages Packed
          </p>
          <p className="text-3xl font-extrabold text-indigo-400 mt-1">
            {summary.packedPackages} <span className="text-sm text-slate-500 font-normal">/ {summary.totalPackages}</span>
          </p>
        </div>
        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Box className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
