import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  Truck, 
  Fuel, 
  CloudRain, 
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Layers,
  Sparkles,
  Wheat,
  Award,
  Flame,
  Shield,
  DollarSign,
  Scale,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import { COMMODITIES_METADATA } from '../data/commoditiesData';
import { calculateFVLCTS } from '../utils/ias41Valuation';

const ICON_MAP = {
  Sparkles: Sparkles,
  Layers: Layers,
  Wheat: Wheat,
  Award: Award,
  Flame: Flame,
  Shield: Shield
};

export default function DashboardView({ 
  onSelectCommodity, 
  batches, 
  circuitBreakerStatus, 
  onNavigate 
}) {
  // Aggregate IAS 41 Statistics
  const totalCarryingValue = batches.reduce((acc, b) => acc + (b.totalCarryingValuePhp || 0), 0);
  const totalGrossValue = batches.reduce((acc, b) => acc + (b.totalGrossValuePhp || 0), 0);
  const totalBioGainLoss = batches.reduce((acc, b) => acc + (b.financialLedger?.unrealizedBioGainLoss || 0), 0);
  const totalTonnageKg = batches.reduce((acc, b) => acc + b.quantityKg, 0);

  const verifiedCount = batches.filter(b => b.status === 'verified').length;
  const inTransitCount = batches.filter(b => b.status === 'in_transit').length;
  const flaggedCount = batches.filter(b => b.status === 'flagged').length;
  const deliveredCount = batches.filter(b => b.status === 'delivered').length;

  const avgPrice = (COMMODITIES_METADATA.reduce((acc, c) => acc + c.currentPrice, 0) / COMMODITIES_METADATA.length).toFixed(1);
  const avgFvlcts = (COMMODITIES_METADATA.reduce((acc, c) => acc + c.fvlctsPerKg, 0) / COMMODITIES_METADATA.length).toFixed(1);
  const avgVolatility = (COMMODITIES_METADATA.reduce((acc, c) => acc + c.volatilityIndex, 0) / COMMODITIES_METADATA.length).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Banner: Early Warning & IAS 41 Compliance Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-900/80 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 backdrop-blur-sm relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-emerald-300">
                  IAS 41 Agriculture & Fair Value Compliance System Active
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  IFRS 13 Hierarchy: Level 1/2
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                All inventory and forward projections are measured at <strong>Fair Value Less Estimated Costs to Sell (FVLCTS)</strong>, separating biological assets (standing crops) from agricultural produce at point of harvest.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('forecasting')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer shrink-0"
          >
            <span>Fair Value Projections</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Overview Grid (IAS 41 Financial & Operational Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Fair Value (FVLCTS) */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm hover:border-slate-700/80 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Asset Carrying Value</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Scale className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-100 font-mono tracking-tight">
              PHP {(totalCarryingValue / 1000000).toFixed(2)}M
            </span>
            <span className="text-xs text-slate-400 font-mono">FVLCTS</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Gross Market: PHP {(totalGrossValue / 1000000).toFixed(2)}M</span>
            <span className="text-emerald-400">IAS 41/IAS 2</span>
          </div>
        </div>

        {/* Metric 2: Unrealized Biological Transformation Gain/Loss */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm hover:border-slate-700/80 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">IAS 41 Fair Value Gain (P&L)</span>
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono tracking-tight">
              +PHP {(totalBioGainLoss / 1000).toFixed(1)}k
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              P&L RECOGNIZED
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400 text-[11px]">
            Biological growth & point-of-harvest revaluation
          </div>
        </div>

        {/* Metric 3: Active Provenance Batches */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm hover:border-slate-700/80 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Supply Batches</span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Truck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100 font-mono tracking-tight">{batches.length}</span>
            <span className="text-xs text-slate-400 font-mono">({(totalTonnageKg / 1000).toFixed(1)} MT)</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] font-mono">
            <span className="text-emerald-400">{verifiedCount + deliveredCount} Verified</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400">{inTransitCount} Transit</span>
            {flaggedCount > 0 && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-red-400">{flaggedCount} Flagged</span>
              </>
            )}
          </div>
        </div>

        {/* Metric 4: Exogenous Regressors */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm hover:border-slate-700/80 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Exogenous Shocks</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Fuel className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400">Diesel 7d Lag</div>
              <div className="text-base font-bold text-slate-200 font-mono">PHP 65.50/L</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-400">Rainfall 14d Lag</div>
              <div className="text-base font-bold text-slate-200 font-mono">185 mm</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-amber-400 text-[11px] font-mono">
            Cost-to-sell transport impact: +₱0.45/kg
          </div>
        </div>
      </div>

      {/* Main Content: Commodity Valuation Portfolio & Provenance Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Commodity Market & Fair Value Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-100">Agricultural Asset Portfolio (IAS 41)</h2>
              <p className="text-xs text-slate-400">Gross active spot rates vs. Net Fair Value Less Costs to Sell (FVLCTS)</p>
            </div>
            <button
              onClick={() => onNavigate('forecasting')}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
            >
              <span>Forecasting & Valuation Notes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COMMODITIES_METADATA.map((com) => {
              const Icon = ICON_MAP[com.iconName] || Wheat;
              const isPositive = com.priceChange7d >= 0;

              return (
                <div
                  key={com.id}
                  onClick={() => {
                    onSelectCommodity(com.id);
                    onNavigate('forecasting');
                  }}
                  className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 hover:border-emerald-500/40 hover:bg-slate-900/90 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/40 group-hover:text-emerald-300 transition">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300 transition">
                          {com.name}
                        </h4>
                        <span className="text-[11px] text-slate-400">{com.variety}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                      {com.ias41Classification.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Dual Valuation: Gross vs Net FVLCTS */}
                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-800/60 pt-3">
                    <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
                      <div className="text-[10px] text-slate-400">Active Market Price</div>
                      <div className="text-base font-bold text-slate-200 font-mono">
                        PHP {com.currentPrice.toFixed(2)}
                      </div>
                      <div className={`text-[10px] font-mono mt-0.5 ${isPositive ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {isPositive ? '+' : ''}{com.priceChange7d}% 7d
                      </div>
                    </div>

                    <div className="bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/30">
                      <div className="text-[10px] text-emerald-400 font-medium">IAS 41 Net FVLCTS</div>
                      <div className="text-base font-bold text-emerald-300 font-mono">
                        PHP {com.fvlctsPerKg.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        -₱{com.estimatedCostsToSellPerKg.toFixed(2)} costs
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[180px]">Region: {com.regions[0]}</span>
                    <span className="text-emerald-400 font-medium group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                      Valuation Note <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Provenance Integrity & Circuit Breaker Health */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-100">Audit & Regulatory Status</h2>
            <button
              onClick={() => onNavigate('provenance')}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
            >
              <span>View Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4 backdrop-blur-sm">
            {/* Gate Circuit Breaker Card */}
            <div className={`p-4 rounded-xl border transition-all ${
              circuitBreakerStatus === 'HALTED'
                ? 'bg-red-950/40 border-red-500/50 text-red-200'
                : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${
                  circuitBreakerStatus === 'HALTED'
                    ? 'bg-red-500/20 border-red-500/40 text-red-400'
                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                }`}>
                  {circuitBreakerStatus === 'HALTED' ? (
                    <ShieldAlert className="w-5 h-5 animate-bounce" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold">
                    {circuitBreakerStatus === 'HALTED'
                      ? 'UPDATE BLOCKED (CIRCUIT HALT)'
                      : 'INTEGRITY VERIFIED'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {circuitBreakerStatus === 'HALTED'
                      ? 'Unauthorized data mutation intercepted. Model and financial ledger frozen.'
                      : 'All batch manifests validated against NIST P-256 signatures.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Batch Health List */}
            <div className="space-y-2.5">
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider flex justify-between">
                <span>Active Batches (Point of Harvest)</span>
                <span className="font-mono text-[10px] text-emerald-400">IAS 41 $\rightarrow$ IAS 2</span>
              </div>

              {batches.slice(0, 3).map((b) => (
                <div
                  key={b.id}
                  onClick={() => onNavigate('provenance')}
                  className="p-3 bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded-xl transition cursor-pointer flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-slate-200">{b.id}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                        b.status === 'verified'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : b.status === 'flagged'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      }`}>
                        {b.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                      {b.commodity} • Harvest: {b.harvestTimestamp.split(' ')[0]}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-emerald-400">₱{b.fvlctsPerKg}/kg</div>
                    <div className="text-[10px] text-slate-500">PHP {(b.totalCarryingValuePhp / 1000).toFixed(0)}k FVLCTS</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('provenance')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Test Circuit Breaker / Tampering</span>
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
