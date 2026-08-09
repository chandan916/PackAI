'use client';

import React, { useState } from 'react';
import { PackedContainer } from '../types/packing';
import { Layers } from 'lucide-react';

interface Props {
  container: PackedContainer;
}

export default function PackingVisualizer2D({ container }: Props) {
  // Get all unique Z (height) layer values
  const zLayers = Array.from(new Set(container.placements.map((p) => p.z))).sort((a, b) => a - b);
  const [selectedZ, setSelectedZ] = useState<number>(zLayers[0] || 0);

  // Filter packages on or overlapping selected height layer
  const activePlacements = container.placements.filter(
    (p) => p.z <= selectedZ && p.z + p.height > selectedZ
  );

  const scaleX = 100 / container.length;
  const scaleY = 100 / container.width;

  return (
    <div className="w-full rounded-xl glass-panel p-5 border border-slate-800 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Top-Down Layer View (Length × Width)</span>
        </div>

        {/* Z Layer Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Layer Height (Z):</span>
          <div className="flex gap-1 overflow-x-auto max-w-[300px]">
            {zLayers.map((z) => (
              <button
                key={z}
                onClick={() => setSelectedZ(z)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedZ === z
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {z} cm
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2D Container Canvas Box */}
      <div className="relative w-full aspect-[1.3] max-h-[420px] bg-slate-950/80 rounded-lg border-2 border-dashed border-slate-700 p-2 overflow-hidden">
        {/* Package Rectangles */}
        {activePlacements.map((p, idx) => {
          const leftPct = p.x * scaleX;
          const topPct = p.y * scaleY;
          const widthPct = p.length * scaleX;
          const heightPct = p.width * scaleY;

          return (
            <div
              key={idx}
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                width: `${widthPct}%`,
                height: `${heightPct}%`,
                backgroundColor: p.color || '#3b82f6',
              }}
              className="absolute border border-slate-900/60 rounded-sm flex items-center justify-center p-1 overflow-hidden transition-all hover:scale-[1.02] hover:z-10 group"
              title={`${p.packageName} (${p.length}×${p.width}×${p.height} cm) at (${p.x}, ${p.y}, ${p.z})`}
            >
              <div className="text-[10px] font-bold text-slate-900 truncate drop-shadow opacity-90 group-hover:opacity-100">
                {p.packageName}
              </div>
            </div>
          );
        })}

        {/* Container Dimension Labels */}
        <div className="absolute bottom-1 right-2 text-[10px] text-slate-500 font-mono">
          Container: {container.length} × {container.width} cm
        </div>
      </div>
    </div>
  );
}
