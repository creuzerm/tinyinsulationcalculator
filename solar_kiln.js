/**
 * Solar Kiln & Greenhouse Thermal Simulator
 * Modular frontend logic and WebMCP bridge
 */

const PRESETS = {
    half_basement_rack: {
        grossVolumeCuFt: 12.0,
        solidVolumeCuFt: 7.5,
        cords: 0.094,
        description: "1 Basement Bay (12 cu ft / ~0.10 cord)"
    },
    single_outdoor_pallet: {
        grossVolumeCuFt: 42.7,
        solidVolumeCuFt: 26.7,
        cords: 0.333,
        description: "1 Full Outdoor Pallet Dryer (40\" x 48\" x 48\")"
    },
    twin_outdoor_pallets: {
        grossVolumeCuFt: 85.3,
        solidVolumeCuFt: 53.3,
        cords: 0.667,
        description: "2 Outdoor Pallet Dryers (Twin Flip-Flop)"
    },
    full_cord: {
        grossVolumeCuFt: 128.0,
        solidVolumeCuFt: 80.0,
        cords: 1.000,
        description: "1 Full Cord (4' x 4' x 8')"
    }
};

const SPECIES = {
    ne_ky_mixed_hardwood: {
        name: "NE Kentucky Mixed Hardwood",
        dryDensity: 36.0,
        grossMmbtuPerCord: 24.0
    },
    white_oak_hickory: {
        name: "Dense Oak / Shagbark Hickory",
        dryDensity: 42.0,
        grossMmbtuPerCord: 27.7
    },
    soft_maple_poplar: {
        name: "Soft Maple / Tulip Poplar",
        dryDensity: 29.0,
        grossMmbtuPerCord: 18.6
    }
};

function el(id) {
    return document.getElementById(id);
}

function getCalcEngine() {
    if (typeof window !== 'undefined' && window.calculateWoodMoistureLoad) {
        return window;
    }
    if (typeof require !== 'undefined') {
        return require('./calculator.js');
    }
    return null;
}

function applyKilnPreset(presetKey) {
    const preset = PRESETS[presetKey];
    if (!preset) return;

    const volumeInput = el('grossVolumeCuFt');
    if (volumeInput) {
        volumeInput.value = preset.grossVolumeCuFt;
    }

    calculateSolarKiln();
}

function getFormData() {
    const volumePreset = el('volumePreset')?.value || 'half_basement_rack';
    const grossVolumeCuFt = parseFloat(el('grossVolumeCuFt')?.value) || 12.0;
    const woodSpecies = el('woodSpecies')?.value || 'ne_ky_mixed_hardwood';
    const speciesInfo = SPECIES[woodSpecies] || SPECIES.ne_ky_mixed_hardwood;

    const initialMcPct = parseFloat(el('initialMcPct')?.value) || 50;
    const targetMcPct = parseFloat(el('targetMcPct')?.value) || 20;
    const useBasementFinisher = el('useBasementFinisher')?.checked ?? true;
    const splitDiameterInches = parseFloat(el('splitDiameterInches')?.value) || 2.75;
    const isUnsplitRound = el('isUnsplitRound')?.checked ?? false;

    const numCollectors = parseInt(el('numCollectors')?.value, 10) || 2;
    const collectorGlazingLayers = parseInt(el('collectorGlazingLayers')?.value, 10) || 1;
    const boxGlazingLayers = parseInt(el('boxGlazingLayers')?.value, 10) || 2;
    const totalFanCfm = parseFloat(el('totalFanCfm')?.value) || 96;
    const chainedBoxesInSeries = el('chainedBoxesInSeries')?.checked ?? false;
    const northWallReflectix = el('northWallReflectix')?.checked ?? true;

    const ambientTempF = parseFloat(el('ambientTempF')?.value) || 32;
    const internalKilnTempF = parseFloat(el('internalKilnTempF')?.value) || 80;
    const sunHoursPerDay = parseFloat(el('sunHoursPerDay')?.value) || 5.0;

    const electricRatePerKwh = parseFloat(el('electricRatePerKwh')?.value) || 0.169;
    const heatPumpCop = parseFloat(el('heatPumpCop')?.value) || 2.40;
    const cordsProcessedPerSeason = parseFloat(el('cordsProcessedPerSeason')?.value) || 1.5;
    const buildCostUsd = parseFloat(el('buildCostUsd')?.value) || 234.0;

    return {
        volumePreset,
        grossVolumeCuFt,
        woodSpecies,
        speciesInfo,
        initialMcPct,
        targetMcPct,
        useBasementFinisher,
        splitDiameterInches,
        isUnsplitRound,
        numCollectors,
        collectorGlazingLayers,
        boxGlazingLayers,
        totalFanCfm,
        chainedBoxesInSeries,
        northWallReflectix,
        ambientTempF,
        internalKilnTempF,
        sunHoursPerDay,
        electricRatePerKwh,
        heatPumpCop,
        cordsProcessedPerSeason,
        buildCostUsd
    };
}

function calculateSolarKiln() {
    const calc = getCalcEngine();
    if (!calc || !calc.calculateWoodMoistureLoad) {
        console.warn("Solar kiln calculation functions not available.");
        return null;
    }

    const data = getFormData();

    // 1. Calculate wood load & moisture budget
    const woodLoad = calc.calculateWoodMoistureLoad({
        grossVolumeCuFt: data.grossVolumeCuFt,
        dryDensityLbFt3: data.speciesInfo.dryDensity,
        initialMcPct: data.initialMcPct,
        targetMcPct: data.targetMcPct,
        useBasementFinisher: data.useBasementFinisher,
        splitDiameterInches: data.splitDiameterInches,
        isUnsplitRound: data.isUnsplitRound
    });

    // 2. Calculate daily thermal balance & dwell time
    const kilnBalance = calc.calculateSolarKilnBalance({
        numCollectors: data.numCollectors,
        collectorGlazingLayers: data.collectorGlazingLayers,
        boxGlazingLayers: data.boxGlazingLayers,
        totalFanCfm: data.totalFanCfm,
        chainedBoxesInSeries: data.chainedBoxesInSeries,
        northWallReflectix: data.northWallReflectix,
        ambientTempF: data.ambientTempF,
        internalKilnTempF: data.internalKilnTempF,
        sunHoursPerDay: data.sunHoursPerDay,
        woodLoadResult: woodLoad
    });

    // 3. Calculate psychrometrics for downdraft buoyancy
    const psychInlet = calc.calculatePsychrometrics(data.internalKilnTempF + 10, 10);
    const psychExhaust = calc.calculatePsychrometrics(data.ambientTempF + 25, 88);
    const densityIncreasePct = ((psychExhaust.densityLbFt3 - psychInlet.densityLbFt3) / psychInlet.densityLbFt3) * 100;

    // 4. Calculate Heat Pump vs Firewood ROI
    const heatPumpRoi = calc.calculateKilnHeatPumpROI({
        cordsProcessedPerSeason: data.cordsProcessedPerSeason,
        grossMmbtuPerCord: data.speciesInfo.grossMmbtuPerCord,
        electricRatePerKwh: data.electricRatePerKwh,
        heatPumpCop: data.heatPumpCop,
        buildCostUsd: data.buildCostUsd
    });

    // Update DOM outputs safely
    updateOutputText('outdoorDwellDays', `${kilnBalance.outdoorDwellDays} Clear Days`);
    updateOutputText('calendarDays', `~${Math.round(kilnBalance.outdoorDwellDays / 0.6)} Calendar Days (60% Sun)`);
    updateOutputText('waterEvapGalPerDay', `${kilnBalance.waterEvapGalPerDay} gal/day`);
    updateOutputText('waterEvapLbsPerDay', `${kilnBalance.waterEvapLbsPerDay} lbs/day`);
    updateOutputText('totalNetDailyBtu', `${kilnBalance.totalNetDailyBtu.toLocaleString()} BTU/day`);
    updateOutputText('collectorGainBtu', `${kilnBalance.collectorGainBtu.toLocaleString()} BTU`);
    updateOutputText('boxPassiveSolarGainBtu', `${kilnBalance.boxPassiveSolarGainBtu.toLocaleString()} BTU`);
    updateOutputText('daytimeWallLossBtu', `-${kilnBalance.daytimeWallLossBtu.toLocaleString()} BTU`);

    updateOutputText('cordsEquivalent', `${woodLoad.cordsEquivalent} Cords (${woodLoad.basementBaysEquivalent} Basement Bays)`);
    updateOutputText('ovenDryWeightLbs', `${woodLoad.ovenDryWeightLbs.toLocaleString()} lbs dry biomass`);
    updateOutputText('totalWaterGallons', `${woodLoad.totalWaterGallons} gal (${woodLoad.totalWaterLbs} lbs water)`);
    updateOutputText('outdoorWaterLbs', `${woodLoad.outdoorWaterLbs} lbs outdoor Stage 1`);
    updateOutputText('indoorWaterLbs', `${woodLoad.indoorWaterLbs} lbs indoor Stage 2`);
    updateOutputText('effectiveCfm', `${kilnBalance.effectiveCfm} CFM`);
    updateOutputText('airResidenceSec', `${kilnBalance.totalResidenceSec}s (${kilnBalance.collectorResidenceSec}s coll / ${kilnBalance.stackResidenceSec}s stack)`);
    updateOutputText('splitMultiplier', `${woodLoad.splitMultiplier}x baseline`);

    updateOutputText('densityDelta', `+${densityIncreasePct.toFixed(1)}% heavier at exhaust (natural downdraft)`);

    updateOutputText('usableMmbtuPerCordDry', `${heatPumpRoi.usableMmbtuPerCordDry} MMBTU`);
    updateOutputText('dryingBonusMmbtuPerCord', `+${heatPumpRoi.dryingBonusMmbtuPerCord} MMBTU (+57% heat)`);
    updateOutputText('costPerMmbtuHeatPump', `$${heatPumpRoi.costPerMmbtuHeatPump} / MMBTU`);
    updateOutputText('cordValueDryVsHeatPump', `$${heatPumpRoi.cordValueDryVsHeatPump} / cord`);
    updateOutputText('seasonalValueVsHeatPump', `$${heatPumpRoi.seasonalValueVsHeatPump.toFixed(2)}`);
    updateOutputText('paybackWeeksTotalHeat', `${heatPumpRoi.paybackWeeksTotalHeat} Weeks`);
    updateOutputText('paybackSeasonsBonusOnly', `${heatPumpRoi.paybackSeasonsBonusOnly} Seasons`);

    return {
        woodLoad,
        kilnBalance,
        heatPumpRoi,
        densityIncreasePct
    };
}

function updateOutputText(name, value) {
    const elements = document.querySelectorAll(`[data-output="${name}"]`);
    elements.forEach(node => {
        node.textContent = value;
    });
}

function init() {
    const form = el('solarKilnForm');
    if (!form) return;

    // Attach change listeners to all form controls for live recalculation
    form.addEventListener('input', () => {
        calculateSolarKiln();
    });

    const presetSelect = el('volumePreset');
    if (presetSelect) {
        presetSelect.addEventListener('change', (e) => {
            applyKilnPreset(e.target.value);
        });
    }

    const calcBtn = el('calculateSolarKilnBtn');
    if (calcBtn) {
        calcBtn.addEventListener('click', (e) => {
            e.preventDefault();
            calculateSolarKiln();
        });
    }

    // Agent Invocation handling (WebMCP Form Event)
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const results = calculateSolarKiln();
        if (e.agentInvoked && typeof e.respondWith === 'function') {
            e.respondWith(Promise.resolve({
                summary: `Calculated solar kiln performance. Outdoor dwell time: ${results?.kilnBalance?.outdoorDwellDays} clear days. Total seasonal value: $${results?.heatPumpRoi?.seasonalValueVsHeatPump}.`,
                results
            }));
        }
    });

    // Wire Help / Documentation Modal
    const helpLink = el('help-link');
    const helpModal = el('helpModal');
    const closeHelpModal = el('closeHelpModal');
    const helpContent = el('helpContent');

    if (helpLink && helpModal) {
        helpLink.addEventListener('click', (e) => {
            e.preventDefault();
            helpModal.classList.remove('hidden');

            if (helpContent && helpContent.innerHTML.includes('Loading...')) {
                const fetchDoc = (name) => fetch(`docs/${name}`)
                    .then(r => r.ok ? r.text() : fetch(name).then(r2 => r2.text()))
                    .catch(() => fetch(name).then(r2 => r2.text()));

                Promise.all([
                    fetchDoc('help.md'),
                    fetchDoc('methods.md')
                ]).then(([help, methods]) => {
                    if (typeof marked !== 'undefined') {
                        helpContent.innerHTML = marked.parse(help + '\n<hr>\n' + methods);
                    } else {
                        helpContent.textContent = help + '\n---\n' + methods;
                    }
                }).catch(err => {
                    helpContent.innerHTML = '<p class="text-red-500">Failed to load documentation.</p>';
                    console.error('Error loading documentation:', err);
                });
            }
        });

        closeHelpModal?.addEventListener('click', () => helpModal.classList.add('hidden'));
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) helpModal.classList.add('hidden');
        });
    }

    // Initial calculation on load
    calculateSolarKiln();
}

if (typeof window !== 'undefined') {
    window.calculateSolarKiln = calculateSolarKiln;
    window.applyKilnPreset = applyKilnPreset;
    window.initSolarKiln = init;
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', init);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PRESETS,
        SPECIES,
        getFormData,
        calculateSolarKiln,
        applyKilnPreset,
        init
    };
}
