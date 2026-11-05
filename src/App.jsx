import React, { useState } from 'react';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import ForecastingView from './components/ForecastingView';
import ProvenanceLedgerView from './components/ProvenanceLedgerView';
import AuditLogView from './components/AuditLogView';
import { INITIAL_BATCHES } from './data/provenanceBatches';
import { sha256Sync, verifyBatchIntegrity } from './utils/cryptoSimulator';
import { ShieldCheck, Database, GitCommit, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCommodityId, setSelectedCommodityId] = useState('onions_red');
  const [batches, setBatches] = useState(INITIAL_BATCHES);
  const [circuitBreakerStatus, setCircuitBreakerStatus] = useState('OPERATIONAL'); // 'OPERATIONAL' | 'HALTED' | 'WARNING'
  const [tamperedInfo, setTamperedInfo] = useState(null);

  // Toggle Tamper State for a Batch (Directly simulates demo_security_halt.R)
  const handleTamperToggle = (batchId) => {
    setBatches((prevBatches) => {
      const updated = prevBatches.map((batch) => {
        if (batch.id !== batchId) return batch;

        const isCurrentlyTampered = batch.tampered;

        if (!isCurrentlyTampered) {
          // Mutate payload: increase price or change temperature (e.g. 180.0 -> 999.0 as in demo_security_halt.R)
          const tamperedPrice = batch.commodity.toLowerCase().includes('onion') ? 999.0 : 350.0;
          const tamperedPayload = {
            id: batch.id,
            commodity: batch.commodity,
            price_php_kg: tamperedPrice, // Mutated!
            quantity_kg: batch.quantityKg
          };

          // Run Verification Gate
          const gateResult = verifyBatchIntegrity(
            tamperedPayload, 
            batch.manifestHash, 
            batch.signatureEcdsa, 
            batch.publicKey
          );

          setCircuitBreakerStatus('HALTED');
          setTamperedInfo({
            batchId: batch.id,
            expectedHash: batch.manifestHash,
            computedHash: gateResult.computedHash,
            error: gateResult.error
          });

          return {
            ...batch,
            tampered: true,
            status: 'flagged',
            unitPricePhp: tamperedPrice,
            currentTemperatureC: 8.5,
            tamperedField: 'unitPricePhp',
            originalValue: `PHP ${batch.unitPricePhp}/kg`,
            tamperedValue: `PHP ${tamperedPrice}/kg (TAMPERED)`
          };
        } else {
          // Restore Authentic Payload
          const restoredPrice = batch.commodity.toLowerCase().includes('onion') ? 180.0 : 48.5;
          const originalTemp = batch.commodity.toLowerCase().includes('onion') ? 1.8 : 24.2;

          // Clear circuit breaker halt if no other batch is tampered
          setCircuitBreakerStatus('OPERATIONAL');
          setTamperedInfo(null);

          return {
            ...batch,
            tampered: false,
            status: 'verified',
            unitPricePhp: restoredPrice,
            currentTemperatureC: originalTemp,
            tamperedField: null,
            originalValue: null,
            tamperedValue: null
          };
        }
      });

      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Sticky Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        circuitBreakerStatus={circuitBreakerStatus}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            onSelectCommodity={(id) => setSelectedCommodityId(id)}
            batches={batches}
            circuitBreakerStatus={circuitBreakerStatus}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'forecasting' && (
          <ForecastingView
            selectedCommodityId={selectedCommodityId}
            onSelectCommodity={(id) => setSelectedCommodityId(id)}
          />
        )}

        {activeTab === 'provenance' && (
          <ProvenanceLedgerView
            batches={batches}
            onTamperToggle={handleTamperToggle}
            circuitBreakerStatus={circuitBreakerStatus}
            tamperedInfo={tamperedInfo}
          />
        )}

        {activeTab === 'audit' && (
          <AuditLogView circuitBreakerStatus={circuitBreakerStatus} />
        )}
      </main>

      {/* Footer with Capstone Research Disclaimers & Integrity Notes */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-300">AgriTrace Capstone Framework</span>
              <span>•</span>
              <span>Tamper-Evident Agricultural Price Forecasting in Region III (Pampanga)</span>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-slate-400">
                <Database className="w-3.5 h-3.5 text-slate-500" />
                Pampanga & NCR Datasets
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <GitCommit className="w-3.5 h-3.5 text-slate-500" />
                NIST P-256 / SHA-256 Gate
              </span>
            </div>
          </div>

          {/* Explicit Capstone Section E Disclaimer */}
          <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Methodological & Integrity Safeguard Note:</strong> An integrity check confirms cryptographic non-tampering and authorized manifest signing; it does not visually imply economic correctness, guaranteed forecast accuracy, or policy efficacy. Evaluated models separate data provenance guarantees from forecast errors.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
