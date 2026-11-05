/**
 * Agricultural Provenance Supply Chain Batches (IAS 41 Compliant)
 * Strictly separates Biological Assets (IAS 41) from Agricultural Produce at Point of Harvest,
 * and tracks inventory transitions (IAS 2) with Fair Value Less Costs to Sell (FVLCTS).
 */

export const INITIAL_BATCHES = [
  {
    id: 'BATCH-2026-PH-ON-0042',
    commodity: 'Red Onions',
    variety: 'Red Creole (Bermuda Red)',
    quantityKg: 14500,
    unitPricePhp: 180.0,            // Gross active market price
    fvlctsPerKg: 170.20,             // Net Fair Value Less Costs to Sell under IAS 41
    totalGrossValuePhp: 2610000,
    totalCarryingValuePhp: 2467900,  // IAS 41 balance sheet carrying amount (FVLCTS * kg)
    ias41Classification: 'INVENTORY_IAS2', // Transited at harvest from BIOLOGICAL_ASSET
    harvestTimestamp: '2026-10-02 06:30:00 PST', // Official IAS 41 -> IAS 2 cutover
    origin: 'Bongabon Onion Growers Multi-Purpose Coop, Nueva Ecija',
    originCoords: '15.6322° N, 121.1444° E',
    destination: 'Balintawak Central Wholesale Market, Quezon City',
    status: 'verified', // 'verified' | 'in_transit' | 'flagged' | 'delivered'
    currentStageIndex: 2, // 0: Farm Gate, 1: Cold Storage, 2: Transport, 3: Retail Market
    coldChainCompliance: 98.4,
    currentTemperatureC: 1.8,
    targetTempRange: '-1°C to +2°C',
    manifestHash: '3d9559a43610779de9f3ea74e327cc21dea220a264e459ef9f51405613f1f703',
    signatureEcdsa: '304402206834e59ec5677ead46e99c3ce8031a5bc017a890f3ded5a6bd9364b0548db949022078d816a92d82828c1c10a247a30319503f326b856ca2b3ad08855a674add1c35',
    signerAuthority: 'Bureau of Plant Industry (BPI) / Dept of Agriculture Region III',
    publicKey: 'PUBKEY_SECP256R1_BPI_NUEVA_ECIJA_0042',
    timestamp: '2026-10-04 23:18:27 UTC',
    tampered: false,
    tamperedField: null,
    financialLedger: {
      initialBiologicalValue: 2175000,    // Initial standing crop FVLCTS @ PHP 150/kg
      harvestFairValue: 2436000,          // Point-of-harvest deemed cost @ PHP 168/kg
      unrealizedBioGainLoss: +261000,     // Recognized in P&L under IAS 41 paragraph 26
      estimatedCostsToSellDeducted: 142100,
      reportingStandard: 'IAS 41 Agriculture / IAS 2 Inventories'
    },
    stages: [
      {
        stageNumber: 1,
        title: 'Farm Gate Harvest & Grading',
        iasCategory: 'AGRICULTURAL_PRODUCE',
        operator: 'Bongabon Coop Quality Unit',
        regulatoryBody: 'Bureau of Plant Industry (BPI)',
        location: 'Bongabon, Nueva Ecija (Farm #409)',
        timestamp: '2026-10-02 06:30:00 PST',
        status: 'completed',
        metrics: { moisture: '11.8%', grade: 'Class A Export Standard', fieldCuring: '72h Solar Tray' },
        valuationAtStage: {
          grossMarketRate: 175.0,
          costsToSellPerKg: 9.80,
          fvlctsPerKg: 165.20,
          carryingAmountTotal: 2395400
        },
        blockHash: 'fa208b04a80ec6ef1d595c27f3c4db5475ff87bb729bc489d2d4807a514d2301',
        txSignature: '3045022100d810a0...verified'
      },
      {
        stageNumber: 2,
        title: 'Central Cold Storage Blast Chill',
        iasCategory: 'INVENTORY_IAS2',
        operator: 'Central Luzon Agri-Cold Terminal',
        regulatoryBody: 'DA Region III Cold Chain Inspectorate',
        location: 'Palayan City, Nueva Ecija',
        timestamp: '2026-10-03 14:15:00 PST',
        status: 'completed',
        metrics: { chillTemp: '1.4°C', humidity: '68% RH', nitrogenPurge: 'Certified' },
        valuationAtStage: {
          grossMarketRate: 178.0,
          costsToSellPerKg: 9.80,
          fvlctsPerKg: 168.20,
          carryingAmountTotal: 2438900
        },
        blockHash: '7e41c4de4ba13df65d18d4e9d50198083863ca694d7bb7418928ce6482181cf8',
        txSignature: '3044022045e8910a...verified'
      },
      {
        stageNumber: 3,
        title: 'Cold-Chain Reefer Logistics Transit',
        iasCategory: 'INVENTORY_IAS2',
        operator: 'NLEX North-Freight Reefer Fleet (Truck #TRK-8821)',
        regulatoryBody: 'Land Transportation Franchising Board (LTFRB)',
        location: 'En Route: San Fernando Interchange, Pampanga (NLEX KM 65)',
        timestamp: '2026-10-04 22:45:00 PST',
        status: 'in_progress',
        metrics: { reeferTemp: '1.8°C', gpsSpeed: '64 km/h', doorSensor: 'Sealed (Electronic Seal #ES-992)' },
        valuationAtStage: {
          grossMarketRate: 180.0,
          costsToSellPerKg: 9.80,
          fvlctsPerKg: 170.20,
          carryingAmountTotal: 2467900
        },
        blockHash: '3d9559a43610779de9f3ea74e327cc21dea220a264e459ef9f51405613f1f703',
        txSignature: '304402206834e59e...verified'
      },
      {
        stageNumber: 4,
        title: 'Wholesale Market Ingestion & Retail Dispatch',
        iasCategory: 'INVENTORY_IAS2',
        operator: 'Balintawak Agricultural Trading Authority',
        regulatoryBody: 'Department of Agriculture / DTI Price Watch',
        location: 'Balintawak Market, Quezon City, NCR',
        timestamp: 'Scheduled: 2026-10-05 04:00:00 PST',
        status: 'pending',
        metrics: { inspectionGate: 'Bay 14 North', targetPriceCap: 'PHP 185.00/kg' },
        valuationAtStage: {
          grossMarketRate: 185.0,
          costsToSellPerKg: 9.80,
          fvlctsPerKg: 175.20,
          carryingAmountTotal: 2540400
        },
        blockHash: 'PENDING_FINAL_DISPATCH_HASH',
        txSignature: 'AWAITING_INGESTION'
      }
    ]
  },
  {
    id: 'BATCH-2026-PH-RC-0188',
    commodity: 'Regular Milled Rice',
    variety: 'RMR Well-Polished (Sinandomeng)',
    quantityKg: 30000,
    unitPricePhp: 48.50,
    fvlctsPerKg: 45.59,
    totalGrossValuePhp: 1455000,
    totalCarryingValuePhp: 1367700,
    ias41Classification: 'INVENTORY_IAS2',
    harvestTimestamp: '2026-09-28 08:00:00 PST',
    origin: 'Talavera Rice Farmers Federation, Nueva Ecija',
    originCoords: '15.5847° N, 120.9208° E',
    destination: 'San Fernando Central Agri-Depot, Pampanga',
    status: 'delivered',
    currentStageIndex: 3,
    coldChainCompliance: 100.0,
    currentTemperatureC: 24.2,
    targetTempRange: 'Ambient Dry (max 28°C)',
    manifestHash: '8cb2f085189e4726bfcfbc705fa75069a7c64a5113d09a05b382d334547b71ea',
    signatureEcdsa: '304402209914bca8210381eefc9135702bbd038237e1990c2941fa4bc88195a620b7ea020220194bc02816f194726ac8726b149b5523097b6651a221f7e02b28198f7e221389',
    signerAuthority: 'National Food Authority (NFA) Region III',
    publicKey: 'PUBKEY_SECP256R1_NFA_TALAVERA_0188',
    timestamp: '2026-10-03 11:20:15 UTC',
    tampered: false,
    tamperedField: null,
    financialLedger: {
      initialBiologicalValue: 1200000,    // Standing paddy field valuation
      harvestFairValue: 1335000,          // Raw palay at point of harvest
      unrealizedBioGainLoss: +135000,
      estimatedCostsToSellDeducted: 87300,
      reportingStandard: 'IAS 41 Agriculture / IAS 2 Inventories'
    },
    stages: [
      {
        stageNumber: 1,
        title: 'Paddy Harvesting & Threshing',
        iasCategory: 'AGRICULTURAL_PRODUCE',
        operator: 'Talavera Coop Station 02',
        regulatoryBody: 'National Food Authority (NFA)',
        location: 'Talavera, Nueva Ecija',
        timestamp: '2026-09-28 08:00:00 PST',
        status: 'completed',
        metrics: { moisture: '14.0%', foreignMatter: '< 0.5%', grainLength: 'Medium Slender' },
        valuationAtStage: { grossMarketRate: 46.0, costsToSellPerKg: 2.91, fvlctsPerKg: 43.09, carryingAmountTotal: 1292700 },
        blockHash: '0188fa90bc8e174209fae8812678bb319808a287ce884218bbca7721890cf221',
        txSignature: '304502210081a9bc...verified'
      },
      {
        stageNumber: 2,
        title: 'Milling & Destoning Facility',
        iasCategory: 'INVENTORY_IAS2',
        operator: 'Central Luzon Mega-Mill Complex',
        regulatoryBody: 'NFA Quality Standards Unit',
        location: 'Cabanatuan City, Nueva Ecija',
        timestamp: '2026-09-30 16:30:00 PST',
        status: 'completed',
        metrics: { millingRecovery: '66.4%', headRice: '82%', fortified: 'Iron + Folic Acid' },
        valuationAtStage: { grossMarketRate: 47.5, costsToSellPerKg: 2.91, fvlctsPerKg: 44.59, carryingAmountTotal: 1337700 },
        blockHash: 'bba0928e1837482910fae77c881903ba88219087c2b01984288cfa990184ca77',
        txSignature: '3044022019873bac...verified'
      },
      {
        stageNumber: 3,
        title: 'Bulk Inter-Provincial Freight Dispatch',
        iasCategory: 'INVENTORY_IAS2',
        operator: 'Luzon Grain Express Freight',
        regulatoryBody: 'DPWH / Highway Patrol Group',
        location: 'Cabanatuan to San Fernando Expressway Route',
        timestamp: '2026-10-02 09:15:00 PST',
        status: 'completed',
        metrics: { cargoTonnage: '30 MT', tarpCover: 'Weather-tight double seal' },
        valuationAtStage: { grossMarketRate: 48.0, costsToSellPerKg: 2.91, fvlctsPerKg: 45.09, carryingAmountTotal: 1352700 },
        blockHash: '8cb2f085189e4726bfcfbc705fa75069a7c64a5113d09a05b382d334547b71ea',
        txSignature: '304402209914bca8...verified'
      },
      {
        stageNumber: 4,
        title: 'Market Terminal Receipt & Retail Distribution',
        iasCategory: 'INVENTORY_IAS2',
        operator: 'San Fernando Public Market Retailers Association',
        regulatoryBody: 'City of San Fernando LGU Markets Division',
        location: 'San Fernando Mega Market, Pampanga',
        timestamp: '2026-10-03 18:00:00 PST',
        status: 'completed',
        metrics: { retailBags: '600 x 50kg sacks', suggestedRetailPrice: 'PHP 48.50/kg' },
        valuationAtStage: { grossMarketRate: 48.5, costsToSellPerKg: 2.91, fvlctsPerKg: 45.59, carryingAmountTotal: 1367700 },
        blockHash: '4399081bac772198fa0184bba0981928374a88bc190827364188ca001928ba66',
        txSignature: '30450221009988aa...verified'
      }
    ]
  },
  {
    id: 'BATCH-2026-PH-TM-0312',
    commodity: 'Fresh Tomatoes',
    variety: 'Diamante Max F1 Hybrid',
    quantityKg: 6800,
    unitPricePhp: 83.10,
    fvlctsPerKg: 74.70,
    totalGrossValuePhp: 565080,
    totalCarryingValuePhp: 507960,
    ias41Classification: 'INVENTORY_IAS2',
    harvestTimestamp: '2026-10-04 05:30:00 PST',
    origin: 'Concepcion Vegetable Growers Alliance, Tarlac',
    originCoords: '15.3242° N, 120.6558° E',
    destination: 'Angeles City Central Supermarket Depot, Pampanga',
    status: 'in_transit',
    currentStageIndex: 2,
    coldChainCompliance: 94.2,
    currentTemperatureC: 13.5,
    targetTempRange: '10°C to 15°C',
    manifestHash: '4a991823bc0198ca77321908fae8812678bb319808a287ce884218bbca772189',
    signatureEcdsa: '30440220771890fae12089bac19808a287ce884218bbca7721890cf2210081a9bc77180220881903ba88219087c2b01984288cfa990184ca7719873bac019827364188ca00',
    signerAuthority: 'Region III Agri-Safety & Provenance Council',
    publicKey: 'PUBKEY_SECP256R1_CONCEPCION_TARLAC_0312',
    timestamp: '2026-10-05 08:45:10 UTC',
    tampered: false,
    tamperedField: null,
    financialLedger: {
      initialBiologicalValue: 380800,
      harvestFairValue: 476000,
      unrealizedBioGainLoss: +95200,
      estimatedCostsToSellDeducted: 57120,
      reportingStandard: 'IAS 41 Agriculture / IAS 2 Inventories'
    },
    stages: [
      {
        stageNumber: 1,
        title: 'Morning Canopy Harvest',
        iasCategory: 'AGRICULTURAL_PRODUCE',
        operator: 'Concepcion Farm Unit 8',
        regulatoryBody: 'Bureau of Plant Industry (BPI)',
        location: 'Concepcion, Tarlac',
        timestamp: '2026-10-04 05:30:00 PST',
        status: 'completed',
        metrics: { brixSugar: '4.8°', colorIndex: 'Breaker to Pink', pesticideResidue: 'ND (Passed MRL)' },
        valuationAtStage: { grossMarketRate: 75.0, costsToSellPerKg: 8.40, fvlctsPerKg: 66.60, carryingAmountTotal: 452880 },
        blockHash: '112908fae12089bac19808a287ce884218bbca7721890cf2210081a9bc7718aa',
        txSignature: '30440220112908fa...verified'
      },
      {
        stageNumber: 2,
        title: 'Post-Harvest Hydrocooling & Packing',
        iasCategory: 'INVENTORY_IAS2',
        operator: 'Clark Agri-Tech Consolidation Hub',
        regulatoryBody: 'Clark Development Corporation Health & Safety',
        location: 'Clark Freeport Zone, Pampanga',
        timestamp: '2026-10-04 13:00:00 PST',
        status: 'completed',
        metrics: { coreTemp: '12.2°C', crateCount: '340 crates (20kg)', sanitizedWater: 'Ozone treated' },
        valuationAtStage: { grossMarketRate: 80.0, costsToSellPerKg: 8.40, fvlctsPerKg: 71.60, carryingAmountTotal: 486880 },
        blockHash: '5561908fae12089bac19808a287ce884218bbca7721890cf2210081a9bc7718bb',
        txSignature: '3045022100556190...verified'
      },
      {
        stageNumber: 3,
        title: 'Ventilated Reefer Shuttle',
        iasCategory: 'INVENTORY_IAS2',
        operator: 'Metro-Angeles Farm-to-Fork Direct Logistics',
        regulatoryBody: 'Angeles City Veterinary & Agriculture Office',
        location: 'Clark South Access Road, Angeles City approach',
        timestamp: '2026-10-05 07:15:00 PST',
        status: 'in_progress',
        metrics: { vanTemp: '13.5°C', etaMinutes: '28 mins', sensorHeartbeat: 'Active OK' },
        valuationAtStage: { grossMarketRate: 83.1, costsToSellPerKg: 8.40, fvlctsPerKg: 74.70, carryingAmountTotal: 507960 },
        blockHash: '4a991823bc0198ca77321908fae8812678bb319808a287ce884218bbca772189',
        txSignature: '30440220771890fa...verified'
      },
      {
        stageNumber: 4,
        title: 'Supermarket Distribution Platform Receipt',
        iasCategory: 'INVENTORY_IAS2',
        operator: 'Angeles Fresh Terminal Goods Inward',
        regulatoryBody: 'DTI Pampanga Consumer Protection Division',
        location: 'Angeles City, Pampanga',
        timestamp: 'Scheduled: 2026-10-05 10:00:00 PST',
        status: 'pending',
        metrics: { dockNumber: 'Gate 4', shelfLifeGuarantee: '7 days' },
        valuationAtStage: { grossMarketRate: 88.0, costsToSellPerKg: 8.40, fvlctsPerKg: 79.60, carryingAmountTotal: 541280 },
        blockHash: 'PENDING_TERMINAL_HASH',
        txSignature: 'AWAITING_INGESTION'
      }
    ]
  },
  {
    id: 'BATCH-2026-PH-WO-0079',
    commodity: 'White Onions',
    variety: 'Yellow Granex Giant',
    quantityKg: 8200,
    unitPricePhp: 145.0,
    fvlctsPerKg: 136.75,
    totalGrossValuePhp: 1189000,
    totalCarryingValuePhp: 1121350,
    ias41Classification: 'BIOLOGICAL_ASSET', // Pre-harvest / storage quarantine
    harvestTimestamp: '2026-10-03 07:00:00 PST',
    origin: 'Bayambang Farmers Agrarian Cooperative, Pangasinan',
    originCoords: '15.8078° N, 120.4578° E',
    destination: 'Dinalupihan Agri-Trading Post, Bataan / Pampanga border',
    status: 'flagged',
    currentStageIndex: 1,
    coldChainCompliance: 86.0,
    currentTemperatureC: 7.2,
    targetTempRange: '-1°C to +2°C',
    manifestHash: '99e810fae12089bac19808a287ce884218bbca7721890cf2210081a9bc771899',
    signatureEcdsa: '3044022033881903ba88219087c2b01984288cfa990184ca7719873bac019827364188ca02209914bca8210381eefc9135702bbd038237e1990c2941fa4bc88195a620b7ea02',
    signerAuthority: 'Northern Luzon Commercial Growers Board',
    publicKey: 'PUBKEY_SECP256R1_BAYAMBANG_PANGASINAN_0079',
    timestamp: '2026-10-04 18:10:00 UTC',
    tampered: true,
    tamperedField: 'currentTemperatureC',
    originalValue: '1.2°C',
    tamperedValue: '7.2°C (Cold-chain breach detected)',
    financialLedger: {
      initialBiologicalValue: 984000,
      harvestFairValue: 1107000,
      unrealizedBioGainLoss: +123000,
      estimatedCostsToSellDeducted: 67650,
      reportingStandard: 'IAS 41: Impairment Testing Required (IAS 36)'
    },
    stages: [
      {
        stageNumber: 1,
        title: 'Bulk Field Curing & Grading',
        iasCategory: 'BIOLOGICAL_ASSET',
        operator: 'Bayambang Agrarian Post #1',
        regulatoryBody: 'Bureau of Plant Industry (BPI)',
        location: 'Bayambang, Pangasinan',
        timestamp: '2026-10-03 07:00:00 PST',
        status: 'completed',
        metrics: { moisture: '12.1%', bulbDiameter: '75-90mm', skins: 'Double Papery Layer' },
        valuationAtStage: { grossMarketRate: 140.0, costsToSellPerKg: 8.25, fvlctsPerKg: 131.75, carryingAmountTotal: 1080350 },
        blockHash: '0098fae12089bac19808a287ce884218bbca7721890cf2210081a9bc771800',
        txSignature: '304402200098fae1...verified'
      },
      {
        stageNumber: 2,
        title: 'Regional Cold Warehouse Quarantine',
        iasCategory: 'INVENTORY_IAS2',
        operator: 'Region III Agri-Logistics Terminal',
        regulatoryBody: 'DA Region III Post-Harvest Audit',
        location: 'Tarlac City Depot Hub',
        timestamp: '2026-10-04 16:30:00 PST',
        status: 'flagged',
        metrics: { chamberTemp: '7.2°C (EXCEEDED LIMIT)', alarmCode: 'COLD_BREACH_ERR_404' },
        valuationAtStage: { grossMarketRate: 145.0, costsToSellPerKg: 8.25, fvlctsPerKg: 136.75, carryingAmountTotal: 1121350 },
        blockHash: '99e810fae12089bac19808a287ce884218bbca7721890cf2210081a9bc771899',
        txSignature: '3044022033881903...verified'
      },
      {
        stageNumber: 3,
        title: 'Subic-Clark Expressway Transfer',
        iasCategory: 'INVENTORY_IAS2',
        operator: 'SCTEX Agri-Express Route',
        regulatoryBody: 'Land Transportation Office (LTO)',
        location: 'On hold at Tarlac Hub',
        timestamp: 'Pending inspection clearance',
        status: 'pending',
        metrics: { clearanceStatus: 'Under Quarantine Review' },
        valuationAtStage: { grossMarketRate: 145.0, costsToSellPerKg: 8.25, fvlctsPerKg: 136.75, carryingAmountTotal: 1121350 },
        blockHash: 'BLOCKED_PENDING_AUDIT',
        txSignature: 'SECURITY_GATE_HOLD'
      },
      {
        stageNumber: 4,
        title: 'Dinalupihan Trading Post Distribution',
        iasCategory: 'INVENTORY_IAS2',
        operator: 'Bataan-Pampanga Cooperative Exchange',
        regulatoryBody: 'Municipal Agriculture Office (MAO)',
        location: 'Dinalupihan, Bataan',
        timestamp: 'Pending',
        status: 'pending',
        metrics: { allocation: 'Wholesale Bidding' },
        valuationAtStage: { grossMarketRate: 148.0, costsToSellPerKg: 8.25, fvlctsPerKg: 139.75, carryingAmountTotal: 1145950 },
        blockHash: 'BLOCKED',
        txSignature: 'NONE'
      }
    ]
  }
];
