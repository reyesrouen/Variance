/**
 * IAS 41 Agriculture & Fair Value Valuation Engine
 * Adheres strictly to:
 * - IAS 41 (Agriculture): Biological assets & agricultural produce at point of harvest
 * - IAS 2 (Inventories): Deemed cost post-harvest & Lower of Cost and Net Realizable Value (NRV)
 * - IFRS 13 (Fair Value Measurement): Level 1/2 active wholesale spot market hierarchy
 * - IAS 36 (Impairment of Assets): Spoilage and cold-chain breach write-downs
 */

// Standard cost-to-sell benchmarks for Philippine agricultural supply chains (Central Luzon / Pampanga)
export const IAS41_COSTS_TO_SELL_CONFIG = {
  onions_red: {
    brokerageCommissionPct: 2.5,   // Broker / wholesale trading post commission
    regulatoryLevyPct: 1.0,         // DA Bureau of Plant Industry & LGU market fees
    handlingCostPerKgPhp: 3.50,     // Sorting, grading, and mandatory mesh bagging
    wasteAllowancePct: 2.0          // Standard biological post-harvest moisture shrink
  },
  onions_white: {
    brokerageCommissionPct: 2.5,
    regulatoryLevyPct: 1.0,
    handlingCostPerKgPhp: 3.20,
    wasteAllowancePct: 2.2
  },
  rice_regular: {
    brokerageCommissionPct: 1.5,
    regulatoryLevyPct: 0.8,
    handlingCostPerKgPhp: 1.80,     // Milling, destoning, and 50kg poly-sack bagging
    wasteAllowancePct: 1.0
  },
  rice_premium: {
    brokerageCommissionPct: 2.0,
    regulatoryLevyPct: 1.0,
    handlingCostPerKgPhp: 2.20,
    wasteAllowancePct: 0.8
  },
  tomatoes: {
    brokerageCommissionPct: 3.5,
    regulatoryLevyPct: 1.2,
    handlingCostPerKgPhp: 4.50,     // Plastic crate handling, sanitization, moisture padding
    wasteAllowancePct: 4.5          // Perishable post-harvest spoilage allowance
  },
  garlic: {
    brokerageCommissionPct: 2.0,
    regulatoryLevyPct: 1.0,
    handlingCostPerKgPhp: 2.80,
    wasteAllowancePct: 1.5
  }
};

/**
 * Calculates IAS 41 Fair Value Less Costs to Sell (FVLCTS) per kg and total
 * Enforces non-negative floor at 0.00
 */
export function calculateFVLCTS(commodityId, grossMarketPrice, quantityKg = 1000) {
  const config = IAS41_COSTS_TO_SELL_CONFIG[commodityId] || IAS41_COSTS_TO_SELL_CONFIG.onions_red;

  const validPrice = Math.max(0, grossMarketPrice);
  const brokeragePerKg = validPrice * (config.brokerageCommissionPct / 100);
  const regulatoryPerKg = validPrice * (config.regulatoryLevyPct / 100);
  const directHandlingPerKg = config.handlingCostPerKgPhp;

  const totalCostsToSellPerKg = Number((brokeragePerKg + regulatoryPerKg + directHandlingPerKg).toFixed(2));
  // Under IFRS, Fair Value cannot be negative
  const fvlctsPerKg = Math.max(0, Number((validPrice - totalCostsToSellPerKg).toFixed(2)));

  const totalGrossMarketValue = Number((validPrice * quantityKg).toFixed(2));
  const totalCostsToSell = Number((totalCostsToSellPerKg * quantityKg).toFixed(2));
  const totalFVLCTS = Number((fvlctsPerKg * quantityKg).toFixed(2));

  return {
    commodityId,
    grossMarketPrice: Number(validPrice.toFixed(2)),
    fvlctsPerKg,
    totalGrossMarketValue,
    totalCostsToSell,
    totalFVLCTS,
    costsBreakdown: {
      brokerageCommissionPhp: Number((brokeragePerKg * quantityKg).toFixed(2)),
      brokerageRatePct: config.brokerageCommissionPct,
      regulatoryLevyPhp: Number((regulatoryPerKg * quantityKg).toFixed(2)),
      regulatoryRatePct: config.regulatoryLevyPct,
      handlingPackagingPhp: Number((directHandlingPerKg * quantityKg).toFixed(2)),
      totalCostsToSellPerKg
    }
  };
}

/**
 * Computes IAS 41 Biological Transformation Gain or Loss
 * Recognized in Profit & Loss (P&L) under IAS 41 paragraph 26
 */
export function computeBiologicalGainLoss({
  quantityKg,
  initialFVLCTSPerKg,
  currentFVLCTSPerKg,
  stage = 'BIOLOGICAL_ASSET'
}) {
  const deltaPerKg = currentFVLCTSPerKg - initialFVLCTSPerKg;
  const totalFairValueAdjustment = Number((deltaPerKg * quantityKg).toFixed(2));
  const safeInitial = Math.max(0.01, initialFVLCTSPerKg);
  const pctChange = ((deltaPerKg / safeInitial) * 100).toFixed(2);

  return {
    quantityKg,
    initialFVLCTSPerKg: Number(initialFVLCTSPerKg.toFixed(2)),
    currentFVLCTSPerKg: Number(currentFVLCTSPerKg.toFixed(2)),
    deltaPerKg: Number(deltaPerKg.toFixed(2)),
    totalFairValueAdjustment,
    isGain: totalFairValueAdjustment >= 0,
    pctChange,
    accountingClassification: stage === 'BIOLOGICAL_ASSET'
      ? 'IAS 41 Unrealized Biological Transformation Gain/Loss (P&L)'
      : stage === 'AGRICULTURAL_PRODUCE'
      ? 'IAS 41 Harvest Fair Value Realization (Deemed Cost to IAS 2)'
      : 'IAS 2 Inventory Valuation at Lower of Cost and Net Realizable Value'
  };
}

/**
 * Evaluates Post-Harvest Impairment under IAS 2.9 and IAS 36
 * Used during cold-chain temperature breaches or physical decay
 */
export function testImpairmentAndNRV({
  carryingCostPerKg,
  currentMarketPricePerKg,
  coldChainBreach = false,
  decayPct = 0,
  commodityId = 'onions_red',
  quantityKg = 1000
}) {
  const fvlcts = calculateFVLCTS(commodityId, currentMarketPricePerKg, quantityKg);
  let estimatedNRVPerKg = fvlcts.fvlctsPerKg;

  // Cold chain breach causes biological deterioration
  if (coldChainBreach) {
    estimatedNRVPerKg *= 0.65; // 35% distress discount for rapid post-breach liquidation
  } else if (decayPct > 0) {
    estimatedNRVPerKg *= (1 - decayPct / 100);
  }

  estimatedNRVPerKg = Number(Math.max(0, estimatedNRVPerKg).toFixed(2));
  const isImpaired = estimatedNRVPerKg < carryingCostPerKg;
  const writeDownPerKg = isImpaired ? Number((carryingCostPerKg - estimatedNRVPerKg).toFixed(2)) : 0;
  const totalWriteDownPhp = Number((writeDownPerKg * quantityKg).toFixed(2));

  return {
    carryingCostPerKg,
    estimatedNRVPerKg,
    isImpaired,
    writeDownPerKg,
    totalWriteDownPhp,
    finalCarryingAmountPerKg: isImpaired ? estimatedNRVPerKg : carryingCostPerKg,
    totalCarryingAmountPhp: isImpaired ? Number((estimatedNRVPerKg * quantityKg).toFixed(2)) : Number((carryingCostPerKg * quantityKg).toFixed(2)),
    standardNote: isImpaired 
      ? 'IAS 2.9 Write-down to Net Realizable Value recognized in P&L due to biological decay or cold-chain compromise.' 
      : 'No impairment detected; carrying value preserved.'
  };
}

/**
 * Generates an official IAS 41 / IFRS 13 Disclosure Note
 */
export function generateIAS41DisclosureNote({
  entityName = 'Central Luzon Agricultural Producers Cooperative Federation',
  commodityName,
  stage,
  quantityKg,
  grossMarketPrice,
  fvlctsPerKg,
  fairValueAdjustment
}) {
  const isBio = stage === 'BIOLOGICAL_ASSET';
  const standard = isBio ? 'IAS 41: Biological Assets' : 'IAS 41: Agricultural Produce / IAS 2: Inventories';

  return {
    title: `Note on Valuation of ${commodityName} (${standard})`,
    entity: entityName,
    standardReferenced: standard,
    valuationTechnique: 'Level 1/2 Fair Value Hierarchy (Active Wholesale Spot Market - DA/PSA Central Luzon)',
    valuationInputs: {
      principalMarket: 'Balintawak / San Fernando Central Agricultural Exchange',
      quotedGrossPrice: `PHP ${grossMarketPrice.toFixed(2)}/kg`,
      fvlctsApplied: `PHP ${fvlctsPerKg.toFixed(2)}/kg`,
      physicalQuantity: `${quantityKg.toLocaleString()} kg`
    },
    carryingAmount: `PHP ${(fvlctsPerKg * quantityKg).toLocaleString()}`,
    unrealizedGainLoss: fairValueAdjustment 
      ? `PHP ${fairValueAdjustment >= 0 ? '+' : ''}${fairValueAdjustment.toLocaleString()} (Recognized in P&L)`
      : 'PHP 0.00 (At Inception)',
    complianceStatement: 'The biological assets and agricultural produce are measured in accordance with IAS 41 Agriculture at fair value less estimated costs to sell. Costs to sell include sales commissions, transport regulatory fees, and direct handling.'
  };
}
