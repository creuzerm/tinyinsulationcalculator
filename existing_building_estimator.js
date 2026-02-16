/**
 * existing_building_estimator.js
 * Decoupled logic for R-Value Estimator
 */

// Helper to get element by ID or Data Model
function el(id) {
    return document.getElementById(id) || document.querySelector(`[data-model="${id}"]`) || document.querySelector(`[data-action="${id}"]`);
}

const CONFIG_FIELDS = [
    'spaceLength', 'spaceWidth', 'spaceHeight', 'tIndoorAir', 'tOutdoorAir',
    'qHvac', 'hvacMode', 'targetComponentType', 'targetComponentArea',
    'tTargetSurfaceIndoor', 'tTargetSurfaceOutdoor', 'achRate',
    'areaWindows', 'areaOtherWallsCeilings', 'areaFloor'
];

// Constants for calculations
const BTU_TO_W = 0.293071;
const FT_TO_M = 0.3048;
const FAHRENHEIT_TO_CELSIUS_OFFSET = 32;
const FAHRENHEIT_TO_CELSIUS_SCALE = 5 / 9;
const R_VALUE_IMPERIAL_TO_SI = 0.1761;

const AIR_DENSITY_KG_PER_M3 = 1.2;
const AIR_SPECIFIC_HEAT_J_PER_KG_K = 1000;

const DEFAULT_U_WINDOWS = 2.8;
const DEFAULT_U_OTHER_WALLS_CEILINGS = 0.5;
const DEFAULT_U_FLOOR = 0.3;

function fahrenheitToCelsius(f) {
    return (f - FAHRENHEIT_TO_CELSIUS_OFFSET) * FAHRENHEIT_TO_CELSIUS_SCALE;
}

function displayError(message) {
    const errorDisplay = el('error-display');
    const errorMessageSpan = el('error-message');
    const resultsDiv = el('results');

    if (errorMessageSpan) errorMessageSpan.textContent = message;
    if (errorDisplay) errorDisplay.classList.remove('hidden');
    if (resultsDiv) resultsDiv.classList.add('hidden');
}

function hideError() {
    const errorDisplay = el('error-display');
    if (errorDisplay) errorDisplay.classList.add('hidden');
}

function calculateRValue() {
    hideError();
    const matRowImp = el('materialRValueImperialRow');
    const matRowSI = el('materialRValueSIRow');
    if (matRowImp) matRowImp.classList.add('hidden');
    if (matRowSI) matRowSI.classList.add('hidden');

    // 1. Get all inputs and validate
    const spaceLengthFt = parseFloat(el('spaceLength').value);
    const spaceWidthFt = parseFloat(el('spaceWidth').value);
    const spaceHeightFt = parseFloat(el('spaceHeight').value);
    const tIndoorAirF = parseFloat(el('tIndoorAir').value);
    const tOutdoorAirF = parseFloat(el('tOutdoorAir').value);
    let qHvacBtuh = parseFloat(el('qHvac').value);
    const hvacMode = el('hvacMode').value;

    const targetComponentAreaFt2 = parseFloat(el('targetComponentArea').value);
    const tTargetSurfaceIndoorF = parseFloat(el('tTargetSurfaceIndoor').value);
    const tTargetSurfaceOutdoorF = parseFloat(el('tTargetSurfaceOutdoor').value);

    const achRate = parseFloat(el('achRate').value);
    const areaWindowsFt2 = parseFloat(el('areaWindows').value);
    const areaOtherWallsCeilingsFt2 = parseFloat(el('areaOtherWallsCeilings').value);
    const areaFloorFt2 = parseFloat(el('areaFloor').value);

    const mandatoryInputs = [
        spaceLengthFt, spaceWidthFt, spaceHeightFt, tIndoorAirF, tOutdoorAirF, qHvacBtuh,
        targetComponentAreaFt2, achRate, areaWindowsFt2,
        areaOtherWallsCeilingsFt2, areaFloorFt2
    ];

    if (mandatoryInputs.some(isNaN) || mandatoryInputs.some(val => val < 0 && val !== qHvacBtuh && !isNaN(val))) {
        displayError('Please enter valid, non-negative numbers for all required fields.');
        return;
    }

    if (targetComponentAreaFt2 === 0) {
        displayError('Target component area cannot be zero.');
        return;
    }

    const hasSurfaceTemps = !isNaN(tTargetSurfaceIndoorF) && !isNaN(tTargetSurfaceOutdoorF);
    if ((!isNaN(tTargetSurfaceIndoorF) && isNaN(tTargetSurfaceOutdoorF)) || (isNaN(tTargetSurfaceIndoorF) && !isNaN(tTargetSurfaceOutdoorF))) {
        displayError('If providing surface temperatures, both Indoor and Outdoor Surface Temperatures must be entered.');
        return;
    }

    if (hvacMode === 'cooling') {
        qHvacBtuh = -Math.abs(qHvacBtuh);
    } else {
        qHvacBtuh = Math.abs(qHvacBtuh);
    }

    const spaceVolumeM3 = (spaceLengthFt * spaceWidthFt * spaceHeightFt) * (FT_TO_M ** 3);
    const tIndoorAirC = fahrenheitToCelsius(tIndoorAirF);
    const tOutdoorAirC = fahrenheitToCelsius(tOutdoorAirF);
    const deltaT_Air_C = tIndoorAirC - tOutdoorAirC;

    if (deltaT_Air_C === 0) {
        displayError('Temperature difference between indoor and outdoor air cannot be zero.');
        return;
    }

    const qHvacW = qHvacBtuh * BTU_TO_W;
    const targetComponentAreaM2 = targetComponentAreaFt2 * (FT_TO_M ** 2);
    const areaWindowsM2 = areaWindowsFt2 * (FT_TO_M ** 2);
    const areaOtherWallsCeilingsM2 = areaOtherWallsCeilingsFt2 * (FT_TO_M ** 2);
    const areaFloorM2 = areaFloorFt2 * (FT_TO_M ** 2);

    const qInternalW = 0;
    const qSolarW = 0;

    const qWindows = DEFAULT_U_WINDOWS * areaWindowsM2 * deltaT_Air_C;
    const qOtherWallsCeilings = DEFAULT_U_OTHER_WALLS_CEILINGS * areaOtherWallsCeilingsM2 * deltaT_Air_C;
    const qFloor = DEFAULT_U_FLOOR * areaFloorM2 * deltaT_Air_C;
    const qInfiltration = spaceVolumeM3 * achRate / 3600 * AIR_DENSITY_KG_PER_M3 * AIR_SPECIFIC_HEAT_J_PER_KG_K * deltaT_Air_C;

    const qTargetComponentW = qHvacW + qInternalW + qSolarW - (qWindows + qOtherWallsCeilings + qFloor + qInfiltration);
    const qFluxTargetComponentW_per_m2 = qTargetComponentW / targetComponentAreaM2;

    const estimatedRValueSIOverall = deltaT_Air_C / qFluxTargetComponentW_per_m2;
    const estimatedRValueImperialOverall = estimatedRValueSIOverall / R_VALUE_IMPERIAL_TO_SI;

    el('rValueImperialOverall').textContent = estimatedRValueImperialOverall.toFixed(2);
    el('rValueSIOverall').textContent = estimatedRValueSIOverall.toFixed(2);

    if (hasSurfaceTemps) {
        const tTargetSurfaceIndoorC = fahrenheitToCelsius(tTargetSurfaceIndoorF);
        const tTargetSurfaceOutdoorC = fahrenheitToCelsius(tTargetSurfaceOutdoorF);
        const deltaT_Surface_C = tTargetSurfaceIndoorC - tTargetSurfaceOutdoorC;

        if (deltaT_Surface_C !== 0) {
            const estimatedRValueSIMaterial = deltaT_Surface_C / qFluxTargetComponentW_per_m2;
            const estimatedRValueImperialMaterial = estimatedRValueSIMaterial / R_VALUE_IMPERIAL_TO_SI;

            el('rValueImperialMaterial').textContent = estimatedRValueImperialMaterial.toFixed(2);
            el('rValueSIMaterial').textContent = estimatedRValueSIMaterial.toFixed(2);
            if (matRowImp) matRowImp.classList.remove('hidden');
            if (matRowSI) matRowSI.classList.remove('hidden');
        }
    }

    el('results').classList.remove('hidden');
    return {
        rValueImperial: estimatedRValueImperialOverall.toFixed(2),
        rValueSI: estimatedRValueSIOverall.toFixed(2)
    };
}

// Persistence & Sharing
function saveToLocalStorage() {
    CONFIG_FIELDS.forEach(id => {
        const element = el(id);
        if (element) {
            localStorage.setItem(`estim_${id}`, element.value);
        }
    });
}

function loadFromLocalStorage() {
    CONFIG_FIELDS.forEach(id => {
        const val = localStorage.getItem(`estim_${id}`);
        const element = el(id);
        if (val !== null && element) {
            element.value = val;
        }
    });
}

function serializeConfig() {
    const params = new URLSearchParams();
    CONFIG_FIELDS.forEach(id => {
        const element = el(id);
        if (element && element.value) {
            params.set(id, element.value);
        }
    });
    return params.toString();
}

function deserializeConfig() {
    const params = new URLSearchParams(window.location.search);
    let hasParams = false;
    CONFIG_FIELDS.forEach(id => {
        if (params.has(id)) {
            const element = el(id);
            if (element) {
                element.value = params.get(id);
                hasParams = true;
            }
        }
    });
    return hasParams;
}

function clearAll() {
    if (!confirm('Are you sure you want to clear all data?')) return;
    CONFIG_FIELDS.forEach(id => {
        const element = el(id);
        if (element) {
            element.value = element.defaultValue || '';
            localStorage.removeItem(`estim_${id}`);
        }
    });
    el('results').classList.add('hidden');
    hideError();
}

function copyShareLink() {
    const query = serializeConfig();
    const url = `${window.location.origin}${window.location.pathname}?${query}`;
    navigator.clipboard.writeText(url).then(() => {
        const btn = el('copyLinkBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Copied!';
        setTimeout(() => { btn.innerHTML = originalText; }, 2000);
    });
}

// Initialization
window.addEventListener('load', () => {
    loadFromLocalStorage();
    if (deserializeConfig()) {
        calculateRValue();
    }

    // Bind Auto-save
    CONFIG_FIELDS.forEach(id => {
        el(id)?.addEventListener('input', saveToLocalStorage);
    });

    // Bind Actions
    el('calculateBtn')?.addEventListener('click', calculateRValue);
    el('clearAllBtn')?.addEventListener('click', clearAll);
    el('copyLinkBtn')?.addEventListener('click', copyShareLink);

    // Hamburger menu toggle
    const menuBtn = document.getElementById('menu-btn');
    const menuDropdown = document.getElementById('menu-dropdown');
    if (menuBtn && menuDropdown) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            menuDropdown.classList.toggle('hidden');
        });
        document.addEventListener('click', () => menuDropdown.classList.add('hidden'));
    }

    // Help Modal
    const helpLink = el('help-link');
    const helpModal = el('helpModal');
    const closeHelpModal = el('closeHelpModal');
    if (helpLink && helpModal) {
        helpLink.addEventListener('click', (e) => {
            e.preventDefault();
            helpModal.classList.remove('hidden');
            const helpContent = el('helpContent');
            if (helpContent && helpContent.innerHTML.includes('Loading...')) {
                fetch('README.md')
                    .then(r => r.text())
                    .then(t => { helpContent.innerHTML = marked.parse(t); });
            }
        });
        closeHelpModal?.addEventListener('click', () => helpModal.classList.add('hidden'));
        helpModal.addEventListener('click', (e) => { if (e.target === helpModal) helpModal.classList.add('hidden'); });
    }

    // WebMCP Registration
    if (window.navigator?.modelContext) {
        window.navigator.modelContext.registerTool({
            name: "estimate_r_value",
            description: "Estimate the R-value of a building component using energy balance calculations.",
            inputSchema: {
                type: "object",
                properties: {
                    spaceDimensions: {
                        type: "object",
                        properties: {
                            length: { type: "number" },
                            width: { type: "number" },
                            height: { type: "number" }
                        }
                    },
                    temperatures: {
                        type: "object",
                        properties: {
                            indoor: { type: "number" },
                            outdoor: { type: "number" }
                        }
                    },
                    hvac: {
                        type: "object",
                        properties: {
                            rate: { type: "number" },
                            mode: { type: "string", enum: ["heating", "cooling"] }
                        }
                    },
                    targetComponent: {
                        type: "object",
                        properties: {
                            area: { type: "number" },
                            type: { type: "string", enum: ["wall", "ceiling"] }
                        }
                    },
                    surfaceTemperatures: {
                        type: "object",
                        properties: {
                            indoor: { type: "number", description: "Indoor surface temperature of the component." },
                            outdoor: { type: "number", description: "Outdoor surface temperature of the component." }
                        }
                    },
                    envelope: {
                        type: "object",
                        properties: {
                            achRate: { type: "number", description: "Air changes per hour." },
                            areaWindows: { type: "number", description: "Total window area (sq ft)." },
                            areaOtherWallsCeilings: { type: "number", description: "Area of other walls/ceilings (sq ft)." },
                            areaFloor: { type: "number", description: "Floor area (sq ft)." }
                        }
                    }
                }
            },
            execute: async (args) => {
                if (args.spaceDimensions) {
                    if (args.spaceDimensions.length) el('spaceLength').value = args.spaceDimensions.length;
                    if (args.spaceDimensions.width) el('spaceWidth').value = args.spaceDimensions.width;
                    if (args.spaceDimensions.height) el('spaceHeight').value = args.spaceDimensions.height;
                }
                if (args.temperatures) {
                    if (args.temperatures.indoor) el('tIndoorAir').value = args.temperatures.indoor;
                    if (args.temperatures.outdoor) el('tOutdoorAir').value = args.temperatures.outdoor;
                }
                if (args.hvac) {
                    if (args.hvac.rate) el('qHvac').value = args.hvac.rate;
                    if (args.hvac.mode) el('hvacMode').value = args.hvac.mode;
                }
                if (args.targetComponent) {
                    if (args.targetComponent.area) el('targetComponentArea').value = args.targetComponent.area;
                    if (args.targetComponent.type) el('targetComponentType').value = args.targetComponent.type;
                }
                if (args.surfaceTemperatures) {
                    if (args.surfaceTemperatures.indoor) el('tTargetSurfaceIndoor').value = args.surfaceTemperatures.indoor;
                    if (args.surfaceTemperatures.outdoor) el('tTargetSurfaceOutdoor').value = args.surfaceTemperatures.outdoor;
                }
                if (args.envelope) {
                    if (args.envelope.achRate) el('achRate').value = args.envelope.achRate;
                    if (args.envelope.areaWindows) el('areaWindows').value = args.envelope.areaWindows;
                    if (args.envelope.areaOtherWallsCeilings) el('areaOtherWallsCeilings').value = args.envelope.areaOtherWallsCeilings;
                    if (args.envelope.areaFloor) el('areaFloor').value = args.envelope.areaFloor;
                }
                return calculateRValue();
            }
        });
    }
});
