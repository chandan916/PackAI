'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import MetricsSummary from '../components/MetricsSummary';
import PackingVisualizer3D from '../components/PackingVisualizer3D';
import PackingVisualizer2D from '../components/PackingVisualizer2D';
import AIInsightCard from '../components/AIInsightCard';
import HistoryPanel from '../components/HistoryPanel';
import {
  ContainerInput,
  PackageInput,
  OptimizationResult,
  HistoricalRun,
} from '../types/packing';
import {
  Package,
  Plus,
  Trash2,
  Sparkles,
  AlertTriangle,
  Play,
  RotateCw,
  Eye,
  Layers,
  Box,
  CheckCircle2,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const DEFAULT_CONTAINER: ContainerInput = {
  name: 'Standard Container',
  length: 120,
  width: 100,
  height: 100,
};

const DEFAULT_PACKAGES: PackageInput[] = [
  { id: '1', name: 'Box A', length: 30, width: 20, height: 15, quantity: 80, color: '#3b82f6' },
  { id: '2', name: 'Box B', length: 20, width: 20, height: 20, quantity: 40, color: '#10b981' },
];

export default function Home() {
  const [container, setContainer] = useState<ContainerInput>(DEFAULT_CONTAINER);
  const [packages, setPackages] = useState<PackageInput[]>(DEFAULT_PACKAGES);

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [activeContainerIdx, setActiveContainerIdx] = useState<number>(0);
  const [visualMode, setVisualMode] = useState<'3d' | '2d'>('3d');

  const [history, setHistory] = useState<HistoricalRun[]>([]);

  // Presets from API
  const [containerPresets, setContainerPresets] = useState<any[]>([]);
  const [packagePresets, setPackagePresets] = useState<any[]>([]);

  // Fetch presets & history on mount
  useEffect(() => {
    fetchPresets();
    fetchHistory();
  }, []);

  const fetchPresets = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/presets`);
      if (res.ok) {
        const data = await res.json();
        setContainerPresets(data.containers || []);
        setPackagePresets(data.packages || []);
      }
    } catch (err) {
      console.warn('Failed to load presets from backend API:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/optimizations`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data || []);
      }
    } catch (err) {
      console.warn('Failed to load history from backend API:', err);
    }
  };

  // Add package row
  const addPackageRow = () => {
    const newId = (packages.length + 1).toString();
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    setPackages([
      ...packages,
      {
        id: newId,
        name: `Package ${String.fromCharCode(65 + packages.length)}`,
        length: 25,
        width: 20,
        height: 15,
        quantity: 20,
        color: colors[packages.length % colors.length],
      },
    ]);
  };

  // Update package row
  const updatePackageRow = (index: number, field: keyof PackageInput, value: any) => {
    const updated = [...packages];
    updated[index] = { ...updated[index], [field]: value };
    setPackages(updated);
  };

  // Remove package row
  const removePackageRow = (index: number) => {
    if (packages.length <= 1) return;
    setPackages(packages.filter((_, idx) => idx !== index));
  };

  // Handle Preset Container Selection
  const handleContainerPresetChange = (presetName: string) => {
    const selected = containerPresets.find((c) => c.name === presetName);
    if (selected) {
      setContainer({
        name: selected.name,
        length: selected.length,
        width: selected.width,
        height: selected.height,
      });
    }
  };

  // Handle Preset Package Selection for a row
  const handlePackagePresetChange = (index: number, presetName: string) => {
    const selected = packagePresets.find((p) => p.name === presetName);
    if (selected) {
      const updated = [...packages];
      updated[index] = {
        ...updated[index],
        name: selected.name,
        length: selected.length,
        width: selected.width,
        height: selected.height,
      };
      setPackages(updated);
    }
  };

  // Run Optimization Request
  const handleOptimize = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ container, packages }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Optimization failed.');
      }

      setResult(data);
      setActiveContainerIdx(0);

      // Refresh history list
      fetchHistory();
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during optimization.');
    } finally {
      setLoading(false);
    }
  };

  // Load Test Scenarios
  const loadScenario = (type: number) => {
    setErrorMessage(null);
    if (type === 1) {
      // Test 1: Simple
      setContainer({ name: 'Standard Container', length: 120, width: 100, height: 100 });
      setPackages([
        { id: '1', name: 'Medium Box', length: 30, width: 20, height: 15, quantity: 20, color: '#3b82f6' },
      ]);
    } else if (type === 2) {
      // Test 2: Main Flow (Box A + Box B)
      setContainer({ name: 'Standard Container', length: 120, width: 100, height: 100 });
      setPackages([
        { id: '1', name: 'Box A', length: 30, width: 20, height: 15, quantity: 80, color: '#3b82f6' },
        { id: '2', name: 'Box B', length: 20, width: 20, height: 20, quantity: 40, color: '#10b981' },
      ]);
    } else if (type === 3) {
      // Test 3: Multi-Container Overflow
      setContainer({ name: 'Standard Container', length: 120, width: 100, height: 100 });
      setPackages([
        { id: '1', name: 'Large Box', length: 40, width: 30, height: 20, quantity: 150, color: '#f59e0b' },
      ]);
    } else if (type === 4) {
      // Test 4: Impossible Package
      setContainer({ name: 'Small Box Container', length: 20, width: 20, height: 20 });
      setPackages([
        { id: '1', name: 'Over-sized Cargo', length: 30, width: 30, height: 30, quantity: 1, color: '#ef4444' },
      ]);
    } else if (type === 5) {
      // Test 5: Package Rotation Test
      setContainer({ name: 'Special Container', length: 30, width: 100, height: 20 });
      setPackages([
        { id: '1', name: 'Long Beam', length: 100, width: 30, height: 20, quantity: 1, color: '#8b5cf6' },
      ]);
    }
  };

  return (
    <div className="min-h-screen pb-16 space-y-8">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Scenario Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl glass-panel border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Quick Hackathon Scenarios:</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => loadScenario(2)}
              className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 transition-colors font-medium"
            >
              Main Demo (Box A + Box B)
            </button>
            <button
              onClick={() => loadScenario(1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Test 1: Simple (20 boxes)
            </button>
            <button
              onClick={() => loadScenario(3)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Test 3: Multi-Container (150 boxes)
            </button>
            <button
              onClick={() => loadScenario(4)}
              className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/40 text-red-300 border border-red-800/40 transition-colors"
            >
              Test 4: Impossible Box
            </button>
            <button
              onClick={() => loadScenario(5)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Test 5: 3D Rotation Test
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-950/80 border border-red-600/60 text-red-200 flex items-start gap-3 shadow-lg">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-red-300">Validation Error</h4>
              <p className="text-xs text-red-200 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Container Input Card */}
          <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Box className="w-4 h-4 text-blue-400" />
                Container Specifications
              </h2>
              {containerPresets.length > 0 && (
                <select
                  onChange={(e) => handleContainerPresetChange(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-md px-2 py-1 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Load Preset...</option>
                  {containerPresets.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.length}×{c.width}×{c.height})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1">
                  Container Name
                </label>
                <input
                  type="text"
                  value={container.name || ''}
                  onChange={(e) => setContainer({ ...container, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Standard 40ft Container"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">
                    Length (cm)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={container.length || ''}
                    onChange={(e) =>
                      setContainer({ ...container, length: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">
                    Width (cm)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={container.width || ''}
                    onChange={(e) =>
                      setContainer({ ...container, width: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={container.height || ''}
                    onChange={(e) =>
                      setContainer({ ...container, height: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Total Volume:</span>
                  <span className="font-mono text-slate-200">
                    {(container.length * container.width * container.height).toLocaleString()} cm³
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Package Types Card */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-400" />
                  Package Types & Quantities
                </h2>
                <button
                  onClick={addPackageRow}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Package
                </button>
              </div>

              {/* Package Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Package Name</th>
                      <th className="py-2.5 px-3">L (cm)</th>
                      <th className="py-2.5 px-3">W (cm)</th>
                      <th className="py-2.5 px-3">H (cm)</th>
                      <th className="py-2.5 px-3">Qty</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {packages.map((pkg, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: pkg.color || '#3b82f6' }}
                            />
                            <input
                              type="text"
                              value={pkg.name}
                              onChange={(e) => updatePackageRow(idx, 'name', e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="1"
                            value={pkg.length}
                            onChange={(e) =>
                              updatePackageRow(idx, 'length', Number(e.target.value))
                            }
                            className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="1"
                            value={pkg.width}
                            onChange={(e) =>
                              updatePackageRow(idx, 'width', Number(e.target.value))
                            }
                            className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="1"
                            value={pkg.height}
                            onChange={(e) =>
                              updatePackageRow(idx, 'height', Number(e.target.value))
                            }
                            className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="1"
                            value={pkg.quantity}
                            onChange={(e) =>
                              updatePackageRow(idx, 'quantity', Number(e.target.value))
                            }
                            className="w-20 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={() => removePackageRow(idx)}
                            disabled={packages.length <= 1}
                            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Optimize Trigger Button */}
            <button
              onClick={handleOptimize}
              disabled={loading}
              className="w-full mt-4 py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-base shadow-xl shadow-blue-600/25 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="w-5 h-5 animate-spin text-white" />
                  Calculating 3D Bin Packing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  🤖 Optimize Packing
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-8 animate-fadeIn">
            {/* Metrics Summary */}
            <MetricsSummary summary={result.summary} />

            {/* Container Arrangement Visualizer */}
            <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                {/* Container Switcher Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto max-w-full">
                  {result.containers.map((c, idx) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveContainerIdx(idx)}
                      className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                        activeContainerIdx === idx
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <Box className="w-4 h-4" />
                      <span>{c.name}</span>
                      <span className="text-[11px] font-normal opacity-80">
                        ({c.utilization}%)
                      </span>
                    </button>
                  ))}
                </div>

                {/* 3D vs 2D Toggle */}
                <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setVisualMode('3d')}
                    className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all ${
                      visualMode === '3d'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    3D View
                  </button>
                  <button
                    onClick={() => setVisualMode('2d')}
                    className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all ${
                      visualMode === '2d'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    2D Layer View
                  </button>
                </div>
              </div>

              {/* Render Active Container Visualization */}
              {result.containers[activeContainerIdx] && (
                <div className="space-y-4">
                  {visualMode === '3d' ? (
                    <PackingVisualizer3D container={result.containers[activeContainerIdx]} />
                  ) : (
                    <PackingVisualizer2D container={result.containers[activeContainerIdx]} />
                  )}

                  {/* Container Placements Detail Table */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-2">
                    <div className="font-semibold text-slate-300 flex items-center justify-between">
                      <span>Placements Summary — {result.containers[activeContainerIdx].name}</span>
                      <span className="text-slate-400 font-mono">
                        Used Volume: {result.containers[activeContainerIdx].usedVolume.toLocaleString()} / {(result.containers[activeContainerIdx].length * result.containers[activeContainerIdx].width * result.containers[activeContainerIdx].height).toLocaleString()} cm³
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-400">
                      {packages.map((pkg) => {
                        const countPlacedInThisContainer = result.containers[activeContainerIdx].placements.filter(
                          (p) => p.packageName === pkg.name
                        ).length;
                        return (
                          <div key={pkg.name} className="flex items-center gap-2 p-2 rounded bg-slate-900/60">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pkg.color || '#3b82f6' }} />
                            <span className="font-medium text-slate-200">{pkg.name}:</span>
                            <span className="font-mono text-emerald-400">{countPlacedInThisContainer} units</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AI Optimization Insight */}
            {result.aiInsight && <AIInsightCard insight={result.aiInsight} />}
          </div>
        )}

        {/* Previous Optimizations (PostgreSQL History) */}
        <HistoryPanel
          history={history}
          onSelectRun={(run) => {
            if (run.resultData) {
              setResult(run.resultData);
              setActiveContainerIdx(0);
              if (run.inputData?.container) setContainer(run.inputData.container);
              if (run.inputData?.packages) setPackages(run.inputData.packages);
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }
          }}
        />
      </main>
    </div>
  );
}
