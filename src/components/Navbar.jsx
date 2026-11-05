import React from 'react';
import { 
  ShieldCheck, 
  BarChart3, 
  LineChart, 
  Truck, 
  FileCheck2, 
  Activity, 
  Lock,
  AlertTriangle,
  XCircle,
  Cpu
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, circuitBreakerStatus }) {
  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: BarChart3 },
    { id: 'forecasting', label: 'Forecasting Studio', icon: LineChart },
    { id: 'provenance', label: 'Provenance Ledger', icon: Truck },
    { id: 'audit', label: 'Cryptographic Audit', icon: FileCheck2 },
  ];

  // Map circuit breaker / data quality status to Capstone Section E specification
  const getStatusBadge = () => {
    if (circuitBreakerStatus === 'HALTED') {
      return {
        label: 'UPDATE BLOCKED',
        classes: 'bg-red-500/15 text-red-400 border-red-500/40 animate-pulse',
        dotClass: 'bg-red-500',
        icon: XCircle
      };
    } else if (circuitBreakerStatus === 'WARNING') {
      return {
        label: 'DATA QUALITY WARNING',
        classes: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
        dotClass: 'bg-amber-400',
        icon: AlertTriangle
      };
    }
    return {
      label: 'INTEGRITY VERIFIED',
      classes: 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30',
      dotClass: 'bg-emerald-400 animate-ping',
      icon: ShieldCheck
    };
  };

  const status = getStatusBadge();
  const StatusIcon = status.icon;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-100 tracking-tight">AgriTrace</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  P-256 Provenance
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Multivariate Price Forecasting & Supply Chain Security
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Capstone Section E Tri-State Status Badge: 'INTEGRITY VERIFIED' | 'DATA QUALITY WARNING' | 'UPDATE BLOCKED' */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs font-mono border transition-colors ${status.classes}`}>
              <span className={`w-2 h-2 rounded-full ${status.dotClass}`} />
              <StatusIcon className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{status.label}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
