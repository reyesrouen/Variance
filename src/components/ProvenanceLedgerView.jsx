import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Truck, 
  Search, 
  Filter, 
  QrCode, 
  ArrowRight, 
  Lock, 
  Unlock, 
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Thermometer,
  Layers,
  Sparkles,
  MapPin,
  RefreshCw,
  Scale,
  Calendar,
  Building
} from 'lucide-react';
import BatchDetailModal from './BatchDetailModal';

export default function ProvenanceLedgerView({ 
  batches, 
  onTamperToggle, 
  circuitBreakerStatus, 
  tamperedInfo 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Filter batches
  const filteredBatches = batches.filter((b) => {
    const matchesSearch = 
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.destination.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === 'ALL' || b.status.toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Circuit Breaker Interactive Lab */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100">Supply Chain Provenance & IAS 41 Ledger</h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                IAS 41 / IAS 2 + ECDSA P-256 Gate
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Verifiable chain-of-custody tracking. Binds biological asset harvest transitions to immutable SHA-256 hash digests and authorized ECDSA signatures. Unauthorized changes immediately trip the circuit breaker.
            </p>
          </div>

          {/* Quick Stats Pills */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
              Total: {batches.length}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
              Verified: {batches.filter(b => b.status === 'verified' || b.status === 'delivered').length}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400">
              Transit: {batches.filter(b => b.status === 'in_transit').length}
            </span>
            {batches.some(b => b.tampered) && (
              <span className="px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 animate-pulse font-bold">
                Blocked: {batches.filter(b => b.tampered).length}
              </span>
            )}
          </div>
        </div>

        {/* Live Circuit Breaker Alert Banner */}
        {circuitBreakerStatus === 'HALTED' && tamperedInfo && (
          <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/60 text-red-200 animate-in fade-in duration-200 space-y-2 shadow-lg shadow-red-950/30">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 shrink-0">
                <ShieldAlert className="w-5 h-5 animate-bounce" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs uppercase px-2 py-0.5 rounded bg-red-500 text-slate-950">
                    UPDATE BLOCKED (CIRCUIT HALT)
                  </span>
                  <span className="text-xs font-mono text-red-300">Target: {tamperedInfo.batchId}</span>
                </div>
                <div className="font-semibold text-sm text-red-100">
                  [SECURITY HALT] Data payload hash mismatch! File has been tampered with or corrupted.
                </div>
                <p className="text-xs text-red-300/90 leading-relaxed">
                  The verification gate intercepted an unauthorized modification to financial or cold-chain values. Expected manifest hash does not match re-computed payload hash. Model ingestion frozen.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 text-[11px] font-mono">
                  <div className="bg-slate-950/80 p-2 rounded border border-red-500/30">
                    <span className="text-slate-400 block">Expected Manifest SHA-256:</span>
                    <span className="text-emerald-400 break-all">{tamperedInfo.expectedHash}</span>
                  </div>
                  <div className="bg-slate-950/80 p-2 rounded border border-red-500/30">
                    <span className="text-slate-400 block">Computed Payload SHA-256:</span>
                    <span className="text-red-400 break-all font-bold">{tamperedInfo.computedHash}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Batch ID, commodity, cooperative..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 p-1 rounded-xl text-xs font-mono">
          {['ALL', 'VERIFIED', 'IN_TRANSIT', 'FLAGGED', 'DELIVERED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-medium ${
                statusFilter === st
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Batch Cards Grid */}
      <div className="grid grid-cols-1 gap-5">
        {filteredBatches.map((batch) => {
          return (
            <div
              key={batch.id}
              className={`bg-slate-900/60 border rounded-2xl p-5 backdrop-blur-sm transition-all duration-200 space-y-4 shadow-sm ${
                batch.tampered
                  ? 'border-red-500/50 bg-red-950/15'
                  : 'border-slate-800/80 hover:border-slate-700/80'
              }`}
            >
              {/* Batch Card Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl border mt-0.5 ${
                    batch.tampered
                      ? 'bg-red-500/15 border-red-500/30 text-red-400'
                      : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  }`}>
                    {batch.tampered ? <ShieldAlert className="w-5 h-5 animate-pulse" /> : <ShieldCheck className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-100 text-sm">{batch.id}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        batch.tampered
                          ? 'bg-red-500/15 text-red-400 border-red-500/40 font-bold'
                          : batch.status === 'verified'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : batch.status === 'in_transit'
                          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {batch.tampered ? 'UPDATE BLOCKED' : batch.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                        {batch.ias41Classification}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-medium mt-0.5">
                      {batch.commodity} • <span className="text-slate-400">{batch.variety}</span> • Harvest: <span className="text-emerald-400 font-mono">{batch.harvestTimestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    onClick={() => setSelectedBatch(batch)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-950 border border-slate-700/80 text-slate-200 hover:border-slate-600 transition cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                    <span>QR & Financial Ledger</span>
                  </button>

                  <button
                    onClick={() => onTamperToggle(batch.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                      batch.tampered
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                        : 'bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30'
                    }`}
                  >
                    {batch.tampered ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Restore Authentic</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Simulate Tamper (R Halt)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Batch Metadata Row with IAS 41 FVLCTS metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                  <span className="text-[11px] text-slate-400 block">Origin Farm:</span>
                  <span className="font-semibold text-slate-200 truncate block mt-0.5">{batch.origin.split(',')[0]}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{batch.originCoords}</span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                  <span className="text-[11px] text-slate-400 block">Destination Terminal:</span>
                  <span className="font-semibold text-slate-200 truncate block mt-0.5">{batch.destination.split(',')[0]}</span>
                  <span className="text-[10px] text-slate-500">QC / Pampanga Route</span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                  <span className="text-[11px] text-slate-400 block">IAS 41 Net Carrying Value:</span>
                  <span className="font-mono font-bold text-emerald-400 block mt-0.5">
                    PHP {batch.totalCarryingValuePhp?.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500">@ ₱{batch.fvlctsPerKg}/kg FVLCTS</span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                  <span className="text-[11px] text-slate-400 block">Gross Spot & Tonnage:</span>
                  <span className="font-mono font-bold text-slate-200 block mt-0.5">
                    {batch.quantityKg.toLocaleString()} kg
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Gross: PHP {batch.totalGrossValuePhp?.toLocaleString()}</span>
                </div>
              </div>

              {/* Step-by-Step Chain of Custody Timeline */}
              <div className="pt-2">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                  <span>Chain-of-Custody Progression (Farm → Processing → Logistics → Market)</span>
                  <span className="text-emerald-400">Point of Harvest Timestamp Recorded</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {batch.stages.map((stg) => {
                    const isDone = stg.status === 'completed';
                    const isInProg = stg.status === 'in_progress';
                    const isFlagged = stg.status === 'flagged';

                    return (
                      <div
                        key={stg.stageNumber}
                        className={`p-3 rounded-xl border text-xs font-mono space-y-1.5 transition ${
                          isFlagged
                            ? 'bg-red-950/30 border-red-500/40'
                            : isInProg
                            ? 'bg-cyan-950/20 border-cyan-500/40 ring-1 ring-cyan-500/30'
                            : isDone
                            ? 'bg-slate-950/60 border-slate-800/80'
                            : 'bg-slate-950/30 border-slate-900 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between font-sans">
                          <span className="font-bold text-slate-200">
                            {stg.stageNumber}. {stg.title.split(' ')[0]}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                            {stg.regulatoryBody?.split(' ')[0] || 'INSP'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans truncate">
                          {stg.location.split(',')[0]}
                        </div>
                        <div className="text-[10px] text-emerald-400 flex justify-between pt-1 border-t border-slate-900">
                          <span>FVLCTS:</span>
                          <span>₱{stg.valuationAtStage?.fvlctsPerKg || batch.fvlctsPerKg}/kg</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cryptographic Manifest Hash Snippet */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>SHA-256 Digest:</span>
                  <span className={`truncate max-w-[280px] ${batch.tampered ? 'text-red-400 font-bold' : 'text-slate-300'}`}>
                    {batch.manifestHash}
                  </span>
                </div>
                <div className="text-slate-500 text-[10px]">
                  ECDSA NIST P-256 Validated • Certifier: {batch.signerAuthority}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Batch Details Drawer / Modal */}
      {selectedBatch && (
        <BatchDetailModal
          batch={selectedBatch}
          onClose={() => setSelectedBatch(null)}
          onTamperToggle={(id) => {
            onTamperToggle(id);
            const updated = batches.find(b => b.id === id);
            if (updated) setSelectedBatch(updated);
          }}
        />
      )}
    </div>
  );
}
