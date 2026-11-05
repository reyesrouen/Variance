import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Sliders,
  Fuel,
  CloudRain,
  AlertTriangle,
  Info,
  Calendar,
  Sparkles,
  Award,
  CheckCircle2,
  Layers,
  RefreshCw,
  Scale,
  FileText,
  DollarSign,
  Activity,
  MapPin,
  Wind,
  ShieldCheck
} from 'lucide-react';
import {
  COMMODITIES_METADATA,
  HISTORICAL_SERIES,
  MODEL_ACCURACY_METRICS,
  PRICE_SPIKE_SENSITIVITY
} from '../data/commoditiesData';
import {
  WEATHER_STATIONS,
  FUEL_PAMPANGA_MUNICIPALITIES,
  COMMODITY_EXOGENOUS_SENSITIVITIES
} from '../data/weatherFuelData';
import {
  estimateMultivariatePrice,
  computeConfidenceIntervals,
  detectPriceSpike
} from '../utils/forecaster';
import {
  calculateFVLCTS,
  computeBiologicalGainLoss,
  generateIAS41DisclosureNote
} from '../utils/ias41Valuation';

export default function ForecastingView({ selectedCommodityId, onSelectCommodity }) {
  const [commodityId, setCommodityId] = useState(selectedCommodityId || 'onions_red');
  const [modelType, setModelType] = useState('sarimax');
  const [horizon, setHorizon] = useState(4); // 1 to 12 weeks
  const [valuationMode, setValuationMode] = useState('fvlcts'); // 'fvlcts' | 'gross'
  const [showDisclosureModal, setShowDisclosureModal] = useState(false);

  // Multivariate Exogenous Parameter Controls
  const [dieselPricePhp, setDieselPricePhp] = useState(65.50); // DOE baseline
  const [weatherStationId, setWeatherStationId] = useState('clark');
  const [rainfallAnomalyMm, setRainfallAnomalyMm] = useState(0); // -100 to +250 mm
  const [typhoonSeverity, setTyphoonSeverity] = useState('NORMAL'); // 'NORMAL' | 'WARNING' | 'SEVERE'

  React.useEffect(() => {
    if (selectedCommodityId && selectedCommodityId !== commodityId) {
      setCommodityId(selectedCommodityId);
    }
  }, [selectedCommodityId]);

  const commodity = COMMODITIES_METADATA.find(c => c.id === commodityId) || COMMODITIES_METADATA[0];
  const rawSeries = HISTORICAL_SERIES[commodityId] || HISTORICAL_SERIES.onions_red;
  const station = WEATHER_STATIONS.find(s => s.id === weatherStationId) || WEATHER_STATIONS[0];
  const sensitivities = COMMODITY_EXOGENOUS_SENSITIVITIES[commodityId] || COMMODITY_EXOGENOUS_SENSITIVITIES.onions_red;

  // Compute Multivariate Estimation
  const {
    chartData,
    estimationResult,
    currentPrice,
    finalForecastPrice,
    spikeInfo,
    valuationBreakdown,
    bioGainLoss
  } = useMemo(() => {
    const historicalPrices = rawSeries.map(item => 
      valuationMode === 'fvlcts' ? (item.fvlcts || item.price * 0.94) : item.price
    );

    const result = estimateMultivariatePrice({
      series: historicalPrices,
      commodityId,
      commodityName: commodity.name,
      horizon,
      modelType,
      dieselPricePhp,
      baseDieselPricePhp: 65.50,
      weatherStationId,
      typhoonSeverity,
      rainfallAnomalyMm
    });

    const activeProjected = valuationMode === 'fvlcts' ? result.fvlctsPoints : result.projectedPoints;
    const intervals = computeConfidenceIntervals(historicalPrices, activeProjected);

    const points = [];

    // Historical Points
    rawSeries.forEach((item) => {
      const displayPrice = valuationMode === 'fvlcts' ? (item.fvlcts || item.price * 0.94) : item.price;
      points.push({
        period: item.period,
        date: item.date,
        historical: Number(displayPrice.toFixed(2)),
        forecast: null,
        baseline: null,
        lower95: null,
        upper95: null,
        isForecast: false,
        dieselLag7: item.dieselLag7,
        rainfallLag14: item.rainfallLag14
      });
    });

    // Anchor connection
    const lastHist = points[points.length - 1];
    const currP = historicalPrices[historicalPrices.length - 1];
    lastHist.forecast = lastHist.historical;
    lastHist.baseline = lastHist.historical;
    lastHist.lower95 = lastHist.historical;
    lastHist.upper95 = lastHist.historical;

    // Projected Forecast Points
    result.componentAttribution.forEach((attr, idx) => {
      const step = idx + 1;
      const fVal = valuationMode === 'fvlcts' ? attr.fvlcts : attr.finalMultivariate;
      const bVal = valuationMode === 'fvlcts' ? (attr.basePrice * 0.94) : attr.basePrice;
      const interval = intervals[idx];

      points.push({
        period: `+${step}w`,
        date: `Forecast W+${step}`,
        historical: null,
        forecast: Number(fVal.toFixed(2)),
        baseline: Number(bVal.toFixed(2)),
        lower95: interval.lower95,
        upper95: interval.upper95,
        fuelDelta: attr.fuelDeltaPhp,
        weatherDelta: attr.weatherDeltaPhp,
        isForecast: true
      });
    });

    const finalP = activeProjected[activeProjected.length - 1];
    const spike = detectPriceSpike(currP, finalP);

    const valBreakdown = calculateFVLCTS(commodityId, commodity.currentPrice, 10000);
    const bioGL = computeBiologicalGainLoss({
      quantityKg: 10000,
      initialFVLCTSPerKg: currP,
      currentFVLCTSPerKg: finalP,
      stage: commodity.ias41Classification
    });

    return {
      chartData: points,
      estimationResult: result,
      currentPrice: currP,
      finalForecastPrice: finalP,
      spikeInfo: spike,
      valuationBreakdown: valBreakdown,
      bioGainLoss: bioGL
    };
  }, [
    commodityId, 
    modelType, 
    horizon, 
    dieselPricePhp, 
    weatherStationId, 
    rainfallAnomalyMm, 
    typhoonSeverity, 
    valuationMode, 
    rawSeries, 
    commodity
  ]);

  const resetExogenousDefaults = () => {
    setDieselPricePhp(65.50);
    setWeatherStationId('clark');
    setRainfallAnomalyMm(0);
    setTyphoonSeverity('NORMAL');
    setHorizon(4);
  };

  const disclosureNote = generateIAS41DisclosureNote({
    commodityName: commodity.name,
    stage: commodity.ias41Classification,
    quantityKg: 10000,
    grossMarketPrice: commodity.currentPrice,
    fvlctsPerKg: valuationBreakdown.fvlctsPerKg,
    fairValueAdjustment: bioGainLoss.totalFairValueAdjustment
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Core Selectors */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100">{commodity.name} Multivariate Price Estimation</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              DOE Fuel + PAGASA Weather Integrated
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Simulates future price trajectories driven by 7-day lagged fuel pump inflation, regional weather anomalies, and IAS 41 Fair Value Less Costs to Sell (FVLCTS).
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Dual Valuation Mode Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setValuationMode('fvlcts')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-semibold ${
                valuationMode === 'fvlcts'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              IAS 41 FVLCTS (Net)
            </button>
            <button
              onClick={() => setValuationMode('gross')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-semibold ${
                valuationMode === 'gross'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              DA/PSA Spot (Gross)
            </button>
          </div>

          {/* Commodity Dropdown */}
          <select
            value={commodityId}
            onChange={(e) => {
              setCommodityId(e.target.value);
              onSelectCommodity && onSelectCommodity(e.target.value);
            }}
            className="bg-slate-950 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer font-medium"
          >
            {COMMODITIES_METADATA.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.variety})
              </option>
            ))}
          </select>

          {/* Model Selector */}
          <select
            value={modelType}
            onChange={(e) => setModelType(e.target.value)}
            className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer font-medium"
          >
            <option value="sarimax">SARIMAX (auto.arima + xreg)</option>
            <option value="prophet">Meta Prophet (Additive GAM)</option>
            <option value="holt_winters">Holt-Winters Double Exponential</option>
            <option value="naive">Naive Baseline (y[t-1])</option>
          </select>
        </div>
      </div>

      {/* Driver Summary & Exogenous Metric Ribbons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Current vs Multivariate Projected */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Projected {horizon}w Rate</span>
            <span className="text-[10px] font-mono text-emerald-400">Multivariate</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            PHP {finalForecastPrice.toFixed(2)}
            <span className="text-xs font-normal text-slate-400 font-sans ml-1">/kg</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className={finalForecastPrice >= currentPrice ? 'text-amber-400' : 'text-emerald-400'}>
              {finalForecastPrice >= currentPrice ? '+' : ''}
              {(((finalForecastPrice - currentPrice) / currentPrice) * 100).toFixed(1)}%
            </span>
            <span className="text-slate-500 text-[10px]">vs observed ₱{currentPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Metric 2: Fuel Freight Pass-Through Driver */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5 text-amber-400" />
              Fuel Pass-Through
            </span>
            <span className="text-[10px] font-mono text-amber-400">r = {sensitivities.correlationFuel}</span>
          </div>
          <div className={`text-2xl font-bold font-mono ${
            estimationResult.driverSummary.netFuelEffectPhp > 0 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {estimationResult.driverSummary.netFuelEffectPhp > 0 ? '+' : ''}
            PHP {estimationResult.driverSummary.netFuelEffectPhp.toFixed(2)}
            <span className="text-xs font-normal text-slate-400 font-sans ml-1">/kg</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Diesel: ₱{dieselPricePhp.toFixed(2)}/L (β = {sensitivities.fuelElasticityBeta})
          </div>
        </div>

        {/* Metric 3: Weather Disruption Driver */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
              Weather Disruption
            </span>
            <span className="text-[10px] font-mono text-cyan-400">r = {sensitivities.correlationRainfall}</span>
          </div>
          <div className={`text-2xl font-bold font-mono ${
            estimationResult.driverSummary.netWeatherEffectPhp > 0 ? 'text-cyan-400' : 'text-slate-300'
          }`}>
            {estimationResult.driverSummary.netWeatherEffectPhp > 0 ? '+' : ''}
            PHP {estimationResult.driverSummary.netWeatherEffectPhp.toFixed(2)}
            <span className="text-xs font-normal text-slate-400 font-sans ml-1">/kg</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {station.name.split(' ')[0]} ({typhoonSeverity})
          </div>
        </div>

        {/* Metric 4: Spike Risk Alert Status */}
        <div className={`rounded-2xl p-4 border backdrop-blur-sm space-y-1 ${
          spikeInfo.alert
            ? spikeInfo.severity === 'CRITICAL'
              ? 'bg-red-950/40 border-red-500/50 text-red-200'
              : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
            : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
        }`}>
          <div className="text-[11px] flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1.5">
              {spikeInfo.alert ? <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Spike Risk
            </span>
            <span className="font-mono text-xs">{spikeInfo.severity}</span>
          </div>
          <div className="text-xl font-bold font-mono">
            {spikeInfo.pctChange}%
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            F1 Confidence: {spikeInfo.f1Score || 0.90} (10% Rule)
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Multivariate Chart + Parameter Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Cols: Interactive Chart with Component Decomposition */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm space-y-4">
            {/* Chart Legend & Toggles */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-200">
                  {commodity.name} Projection Curve
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {valuationMode === 'fvlcts' ? 'IAS 41 FVLCTS (Net)' : 'Spot Market Price (Gross)'}
                </span>
              </div>

              {/* Chart Legend Tags */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-3 h-0.5 bg-cyan-400 rounded-full" /> Observed Historical
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-400" /> Multivariate Projection
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-3 h-0.5 border-t border-dotted border-slate-500" /> Unadjusted Baseline
                </span>
                <span className="flex items-center gap-1.5 text-emerald-500/60">
                  <span className="w-3 h-2 bg-emerald-500/20 border border-emerald-500/40 rounded" /> 95% CI
                </span>
              </div>
            </div>

            {/* Recharts Canvas */}
            <div className="h-[360px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="multiCiGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  
                  <XAxis 
                    dataKey="period" 
                    stroke="#64748b" 
                    tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                    tickLine={{ stroke: '#334155' }}
                  />
                  
                  <YAxis 
                    domain={['auto', 'auto']} 
                    stroke="#64748b" 
                    tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                    tickLine={{ stroke: '#334155' }}
                    tickFormatter={(val) => `₱${val}`}
                  />

                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950/95 border border-slate-700/80 rounded-xl p-3.5 shadow-xl backdrop-blur-md text-xs font-mono space-y-2 min-w-[220px]">
                          <div className="text-slate-400 font-semibold border-b border-slate-800 pb-1 flex justify-between">
                            <span>Period: {data.period}</span>
                            <span>{data.date}</span>
                          </div>
                          
                          {data.historical !== null && (
                            <div className="text-cyan-300 flex justify-between">
                              <span>Observed:</span>
                              <span className="font-bold">₱{Number(data.historical).toFixed(2)}/kg</span>
                            </div>
                          )}

                          {data.forecast !== null && data.isForecast && (
                            <div className="space-y-1">
                              <div className="text-emerald-400 flex justify-between font-bold">
                                <span>Multivariate Estimate:</span>
                                <span>₱{Number(data.forecast).toFixed(2)}/kg</span>
                              </div>
                              <div className="text-slate-400 flex justify-between text-[11px]">
                                <span>Base Trend (no shock):</span>
                                <span>₱{Number(data.baseline).toFixed(2)}/kg</span>
                              </div>
                              <div className="text-amber-400 flex justify-between text-[10px] pt-1 border-t border-slate-800">
                                <span>Fuel Pass-through:</span>
                                <span>{data.fuelDelta >= 0 ? '+' : ''}₱{data.fuelDelta}/kg</span>
                              </div>
                              <div className="text-cyan-400 flex justify-between text-[10px]">
                                <span>Weather & Typhoon:</span>
                                <span>{data.weatherDelta >= 0 ? '+' : ''}₱{data.weatherDelta}/kg</span>
                              </div>
                              <div className="text-emerald-500/80 flex justify-between text-[10px]">
                                <span>95% CI Range:</span>
                                <span>₱{data.lower95} – ₱{data.upper95}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }}
                  />

                  {/* 95% Confidence Interval Band */}
                  <Area
                    type="monotone"
                    dataKey="upper95"
                    stroke="transparent"
                    fill="url(#multiCiGradient)"
                    fillOpacity={1}
                  />
                  <Area
                    type="monotone"
                    dataKey="lower95"
                    stroke="transparent"
                    fill="#020617"
                    fillOpacity={1}
                  />

                  {/* Baseline Projection Line (Without Exogenous Shocks) */}
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    stroke="#475569"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />

                  {/* Historical Observed Line */}
                  <Line
                    type="monotone"
                    dataKey="historical"
                    stroke="#22d3ee"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: '#0891b2', stroke: '#22d3ee', strokeWidth: 1.5 }}
                    activeDot={{ r: 6, fill: '#06b6d4', stroke: '#cffafe' }}
                  />

                  {/* Multivariate Forecast Line */}
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#10b981"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ r: 4, fill: '#059669', stroke: '#34d399', strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: '#10b981', stroke: '#ecfdf5' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Impact Decomposition & Attribution Table */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Exogenous Driver Attribution Decomposition Table
              </h3>
              <span className="text-[10px] font-mono text-slate-400">DOE Diesel & PAGASA Lag Integration</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px]">
                    <th className="pb-2">Horizon</th>
                    <th className="pb-2">Base Autoregressive Price</th>
                    <th className="pb-2 text-amber-400">Fuel Freight Shift (7d)</th>
                    <th className="pb-2 text-cyan-400">Weather & Typhoon (14d)</th>
                    <th className="pb-2 font-bold text-emerald-400">Multivariate Price</th>
                    <th className="pb-2 text-right">Net IAS 41 FVLCTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {estimationResult.componentAttribution.map((attr) => (
                    <tr key={attr.horizonWeek} className="hover:bg-slate-800/30 transition">
                      <td className="py-2.5 font-bold text-slate-200">W+{attr.horizonWeek}</td>
                      <td className="py-2.5 text-slate-400">₱{attr.basePrice.toFixed(2)}/kg</td>
                      <td className="py-2.5 text-amber-400">
                        {attr.fuelDeltaPhp >= 0 ? '+' : ''}₱{attr.fuelDeltaPhp.toFixed(2)}/kg
                      </td>
                      <td className="py-2.5 text-cyan-400">
                        {attr.weatherDeltaPhp >= 0 ? '+' : ''}₱{attr.weatherDeltaPhp.toFixed(2)}/kg
                      </td>
                      <td className="py-2.5 font-bold text-emerald-400">₱{attr.finalMultivariate.toFixed(2)}/kg</td>
                      <td className="py-2.5 text-right font-mono text-emerald-300">₱{attr.fvlcts.toFixed(2)}/kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Interactive Multivariate Controls Sandbox */}
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Exogenous Simulator
              </h3>
              <button
                onClick={resetExogenousDefaults}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Control 1: Forecast Horizon Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Forecast Horizon ($h$)</span>
                <span className="font-mono font-bold text-emerald-400">{horizon} Weeks</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                step="1"
                value={horizon}
                onChange={(e) => setHorizon(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1w (Spot)</span>
                <span>4w (Monthly)</span>
                <span>12w (Quarterly)</span>
              </div>
            </div>

            {/* Control 2: Fuel / Diesel Pump Price Slider */}
            <div className="space-y-2 border-t border-slate-800/80 pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Fuel className="w-3.5 h-3.5 text-amber-400" />
                  Pampanga Diesel Rate
                </span>
                <span className="font-mono font-bold text-amber-400">
                  PHP {dieselPricePhp.toFixed(2)}/L
                </span>
              </div>
              <input
                type="range"
                min="50.00"
                max="85.00"
                step="0.50"
                value={dieselPricePhp}
                onChange={(e) => setDieselPricePhp(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  onClick={() => setDieselPricePhp(65.50)}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"
                >
                  Base ₱65.50
                </button>
                <button
                  onClick={() => setDieselPricePhp(75.00)}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                >
                  +Shock ₱75
                </button>
                <button
                  onClick={() => setDieselPricePhp(58.00)}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                >
                  -Relief ₱58
                </button>
              </div>
            </div>

            {/* Control 3: Weather Station Selector */}
            <div className="space-y-2 border-t border-slate-800/80 pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  Regional PAGASA Station
                </span>
                <span className="font-mono text-[11px] text-cyan-300">
                  {station.annualRainfallMm} mm/yr
                </span>
              </div>
              <select
                value={weatherStationId}
                onChange={(e) => setWeatherStationId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-3 py-2 font-medium"
              >
                {WEATHER_STATIONS.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.annualRainfallMm} mm)
                  </option>
                ))}
              </select>
            </div>

            {/* Control 4: Rainfall Anomaly Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                  Monsoon Anomaly
                </span>
                <span className={`font-mono font-bold ${
                  rainfallAnomalyMm > 0 ? 'text-cyan-400' : rainfallAnomalyMm < 0 ? 'text-amber-400' : 'text-slate-400'
                }`}>
                  {rainfallAnomalyMm > 0 ? '+' : ''}{rainfallAnomalyMm} mm
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="250"
                step="25"
                value={rainfallAnomalyMm}
                onChange={(e) => setRainfallAnomalyMm(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Control 5: Typhoon Warning Severity Toggle */}
            <div className="space-y-2 border-t border-slate-800/80 pt-3">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-red-400" />
                  Typhoon Warning Level
                </span>
                <span className="font-mono text-[10px] text-red-400">
                  +₱{sensitivities.typhoonSpikeFlatPhp}/kg cap
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
                {[
                  { id: 'NORMAL', label: 'Normal' },
                  { id: 'WARNING', label: 'Signal 1-2' },
                  { id: 'SEVERE', label: 'Signal 3+' }
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => setTyphoonSeverity(lvl.id)}
                    className={`py-1.5 px-2 rounded-lg border text-center transition cursor-pointer font-medium text-[11px] ${
                      typhoonSeverity === lvl.id
                        ? lvl.id === 'SEVERE'
                          ? 'bg-red-500/20 border-red-500/50 text-red-300 font-bold'
                          : lvl.id === 'WARNING'
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                          : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Correlation Coefficients Card */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1.5">
              <div className="text-slate-400 text-[10px] uppercase font-semibold flex justify-between">
                <span>Correlation & Beta Statistics</span>
                <span className="text-emerald-400">R² ≈ {estimationResult.correlationIndicators.rSquaredEstimate}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Fuel Elasticity (β):</span>
                <span className="text-amber-400 font-bold">{sensitivities.fuelElasticityBeta} (r = {sensitivities.correlationFuel})</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Rain Elasticity (β):</span>
                <span className="text-cyan-400 font-bold">{sensitivities.rainfallElasticityBeta} (r = {sensitivities.correlationRainfall})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
