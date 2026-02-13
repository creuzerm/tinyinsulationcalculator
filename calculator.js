// Global Chart Instances
let heatLossChart;
let simulationChart;
let breakdownChart;

const CONFIG_FIELDS = [
    // Shared
    'buildingShape', 'indoorTemp', 'outdoorTemp', 'groundTemp', 'vehicleColor', 'abToggle',
    // Dimensions
    'length', 'width', 'height', 'roofPitch', 'springWallHeight',
    // Scenario A
    'insulationPreset_A',
    // Wall Assembly A
    'wallAssemblyType_A', 'wallStudSize_A', 'wallStudMaterial_A', 'wallStudSpacing_A', 'wallCavityInsulation_A', 'wallContinuousInsulation_A',
    'wallFastenerType_A', 'wallFastenerDensity_A',
    'wallMassMaterial_A', 'wallMassThickness_A', 'wallMassInsulation_A',
    // Other A
    'roofRValue_A', 'floorRValue_A',
    'skirtR_A', 'skirtHeight_A', 'skirtSeal_A',
    'windowArea_A', 'windowR_A', 'doorArea_A', 'doorR_A', 'airSealing_A', 'massMaterial_A', 'slabThickness_A',
    // Scenario B
    'insulationPreset_B',
    // Wall Assembly B
    'wallAssemblyType_B', 'wallStudSize_B', 'wallStudMaterial_B', 'wallStudSpacing_B', 'wallCavityInsulation_B', 'wallContinuousInsulation_B',
    'wallFastenerType_B', 'wallFastenerDensity_B',
    'wallMassMaterial_B', 'wallMassThickness_B', 'wallMassInsulation_B',
    // Other B
    'roofRValue_B', 'floorRValue_B',
    'skirtR_B', 'skirtHeight_B', 'skirtSeal_B',
    'windowArea_B', 'windowR_B', 'doorArea_B', 'doorR_B', 'airSealing_B', 'massMaterial_B', 'slabThickness_B',
    // Simulation
    'simDuration', 'simInternalGain', 'simLowTemp', 'simHighTemp',
    // Custom Data
    'customGainsData'
];

const FASTENER_CHI_VALUES = {
    galvanized: { steel: 0.006, van_ribs: 0.006, wood: 0.001 },
    stainless: { steel: 0.002, van_ribs: 0.002, wood: 0.001 },
    adhesive: { steel: 0, van_ribs: 0, wood: 0 }
};

const MATERIALS = {
    // Framing
    wood_stud: { r_inch: 1.25, type: 'framing' },
    steel_stud: { type: 'framing' },

    // Mass / Solid
    cmu_standard: { r_total: 1.11, type: 'mass' },
    aircrete: { r_inch: 2.4, type: 'mass_solid' },
    concrete: { r_inch: 0.1, type: 'mass_solid' },
    brick: { r_inch: 0.2, type: 'mass_solid' },

    // Insulation (Cavity)
    fiberglass_batt: { r_inch: 3.2 },
    mineral_wool: { r_inch: 4.2 },
    cellulose: { r_inch: 3.7 },
    spray_foam_open: { r_inch: 3.6 },
    spray_foam_closed: { r_inch: 6.5 },

    // Van Life Specifics
    havelock_wool: { r_inch: 3.6 }, // Common sheep wool insulation
    thinsulate_sm600: { r_inch: 5.2 }, // 3M Thinsulate (approximate based on thickness)
    xps_foam_board: { r_inch: 5.0 }, // Rigid foam for floors
    armaflex_foam: { r_inch: 4.0 }, // Black flexible foam
    polyiso_board: { r_inch: 6.0 }, // High R-value rigid board

    none: { r_inch: 0 },

    // Vehicle Structure
    sheet_metal_skin: { r_total: 0.001 }, // Effectively zero
    auto_glass_single: { r_total: 0.9 },

    // Air Films
    air_film_int: { r_total: 0.68 },
    air_film_ext: { r_total: 0.17 }
};

// ASHRAE 90.1 / IECC Correction Factors for Steel Stud Walls
// Factor multiplies the Cavity Insulation R-Value.
// Format: [StudDepth][Spacing]
const STEEL_CORRECTION_FACTORS = {
    '2x4': {
        '16': 0.46, // R-13 becomes ~R-6
        '24': 0.55
    },
    '2x6': {
        '16': 0.37, // R-19 becomes ~R-7.1
        '24': 0.45
    },
    '2x8': { // Extrapolated / Approx
        '16': 0.30,
        '24': 0.35
    },
    'van_ribs': {
        'default': 0.25 // Highly severe penalty. R-10 becomes R-2.5 effectively if ribs aren't covered.
    }
};

// Global variable to store the loaded data
let gainData = null;
let customGains = [];

async function loadGainData() {
    try {
        const response = await fetch('internal_gains.json');
        gainData = await response.json();
        renderGainTable(); // Generate the UI inputs
        calculateDetailedGains(); // Initial calc
    } catch (error) {
        console.error("Failed to load gain data:", error);
    }
}

function renderGainTable() {
    const container = document.getElementById('gainInputsContainer');
    if (!container || !gainData) return;

    container.innerHTML = ''; // Clear existing

    // Helper to build a section
    const buildSection = (title, items, type, sectionId) => {
        const details = document.createElement('details');
        details.className = 'border border-gray-200 rounded-md bg-white shadow-sm overflow-hidden group';
        details.open = true; // Default open

        const summary = document.createElement('summary');
        summary.className = 'p-3 bg-gray-50 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors flex justify-between items-center';
        summary.innerHTML = `
            <span>${title}</span>
            <span id="gain_summary_${sectionId}" class="text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">0 BTU/hr</span>
        `;

        const table = document.createElement('table');
        table.className = 'w-full text-sm';

        let rows = '';
        items.forEach(item => {
            rows += `
                <tr class="border-b border-gray-100 last:border-0">
                    <td class="py-2 pl-3">
                        <div class="font-medium text-gray-700">${item.name}</div>
                        <div class="text-xs text-gray-400">
                            ${type === 'appliance'
                                ? `${item.watts_sensible}W Sensible / ${item.duty_cycle_hours}h daily`
                                : `${item.watts_sensible}W Sensible Heat`}
                        </div>
                    </td>
                    <td class="text-right pr-3">
                        <input type="number"
                            id="gain_qty_${item.id}"
                            data-sensible="${item.watts_sensible}"
                            data-duty="${item.duty_cycle_hours || 24}"
                            data-section="${sectionId}"
                            class="w-16 border border-gray-300 rounded text-center p-1 focus:ring-blue-500 focus:border-blue-500"
                            value="${item.default_qty}"
                            min="0"
                            oninput="calculateDetailedGains()">
                    </td>
                </tr>
            `;
        });

        table.innerHTML = `<tbody class="divide-y divide-gray-100">${rows}</tbody>`;

        details.appendChild(summary);
        details.appendChild(table);
        container.appendChild(details);
    };

    buildSection('Occupants', gainData.occupants, 'occupant', 'occupants');
    buildSection('Appliances & Infrastructure', gainData.appliances, 'appliance', 'appliances');

    renderCustomGains();
}

function renderCustomGains() {
    const container = document.getElementById('gainInputsContainer');
    if(!container) return;

    // Remove existing custom section if any (re-render strategy)
    const existing = document.getElementById('details_custom_gains');
    if(existing) existing.remove();

    const details = document.createElement('details');
    details.id = 'details_custom_gains';
    details.className = 'border border-gray-200 rounded-md bg-white shadow-sm overflow-hidden group';
    details.open = true;

    const summary = document.createElement('summary');
    summary.className = 'p-3 bg-gray-50 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors flex justify-between items-center';
    summary.innerHTML = `
        <span>Custom / Additional Sources</span>
        <span id="gain_summary_custom" class="text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">0 BTU/hr</span>
    `;

    const content = document.createElement('div');
    content.className = 'p-3 bg-gray-50/50';

    // Rows
    if(customGains.length > 0) {
        const table = document.createElement('table');
        table.className = 'w-full text-sm mb-3';
        let rows = '';
        customGains.forEach((item, index) => {
            rows += `
                <tr class="border-b border-gray-200 last:border-0 bg-white">
                    <td class="p-2">
                        <input type="text"
                            class="w-full border border-gray-300 rounded px-2 py-1 text-gray-700 focus:ring-blue-500 focus:border-blue-500 mb-1"
                            placeholder="Source Name"
                            value="${item.name}"
                            oninput="updateCustomGain(${index}, 'name', this.value)">
                        <div class="flex space-x-2">
                            <div class="flex items-center space-x-1">
                                <input type="number"
                                    class="w-16 border border-gray-300 rounded px-1 py-1 text-center text-xs"
                                    placeholder="Watts"
                                    value="${item.watts}"
                                    oninput="updateCustomGain(${index}, 'watts', this.value)">
                                <span class="text-xs text-gray-400">W</span>
                            </div>
                            <div class="flex items-center space-x-1">
                                <input type="number"
                                    class="w-12 border border-gray-300 rounded px-1 py-1 text-center text-xs"
                                    placeholder="Hrs"
                                    value="${item.duty}"
                                    max="24"
                                    oninput="updateCustomGain(${index}, 'duty', this.value)">
                                <span class="text-xs text-gray-400">h/day</span>
                            </div>
                        </div>
                    </td>
                    <td class="p-2 text-right align-top">
                        <div class="flex flex-col items-end space-y-2">
                            <input type="number"
                                class="w-12 border border-gray-300 rounded px-1 py-1 text-center"
                                value="${item.qty}"
                                min="0"
                                oninput="updateCustomGain(${index}, 'qty', this.value)">
                            <button onclick="removeCustomGain(${index})" class="text-xs text-red-500 hover:text-red-700 underline">Remove</button>
                        </div>
                    </td>
                </tr>
            `;
        });
        table.innerHTML = `<tbody class="divide-y divide-gray-200 border border-gray-200 rounded">${rows}</tbody>`;
        content.appendChild(table);
    }

    // Add Button
    const addBtn = document.createElement('button');
    addBtn.className = 'w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm font-medium';
    addBtn.textContent = '+ Add Custom Source';
    addBtn.onclick = addCustomGain;
    content.appendChild(addBtn);

    details.appendChild(summary);
    details.appendChild(content);
    container.appendChild(details);

    // Update summaries just in case (e.g. on load)
    calculateDetailedGains();
}

function addCustomGain() {
    customGains.push({ name: 'New Source', watts: 100, duty: 24, qty: 1 });
    saveCustomGains();
    renderCustomGains();
}

function removeCustomGain(index) {
    customGains.splice(index, 1);
    saveCustomGains();
    renderCustomGains();
}

function updateCustomGain(index, field, value) {
    if(customGains[index]) {
        if(field === 'name') customGains[index].name = value;
        else customGains[index][field] = parseFloat(value) || 0;
        saveCustomGains();
        calculateDetailedGains();
    }
}

function saveCustomGains() {
    const el = document.getElementById('customGainsData');
    if(el) {
        el.value = JSON.stringify(customGains);
        saveInputToLocalStorage(el);
    }
}

function syncCustomGainsFromDOM() {
    const el = document.getElementById('customGainsData');
    if(el && el.value) {
        try {
            customGains = JSON.parse(el.value);
        } catch(e) {
            console.error('Failed to parse custom gains', e);
            customGains = [];
        }
    }
}

function clearAll() {
    if (!confirm('Are you sure you want to clear all data? Custom sources will be retained but unselected.')) return;

    // 1. Reset Custom Gains (retain items, zero qty)
    customGains.forEach(g => g.qty = 0);
    saveCustomGains(); // Updates hidden input and LocalStorage for 'customGainsData'

    // 2. Reset Config Fields
    CONFIG_FIELDS.forEach(id => {
        if (id === 'customGainsData') return; // Handled above

        // Remove from storage
        localStorage.removeItem(id);

        // Reset DOM Element
        const el = document.getElementById(id);
        if (el) {
            if (el.type === 'checkbox') {
                el.checked = el.defaultChecked;
            } else {
                el.value = el.defaultValue;
            }

            // Special handling for selects that might not have a "value" attribute in HTML but option selected
            if (el.tagName === 'SELECT') {
                let foundDefault = false;
                for(let opt of el.options) {
                    if(opt.defaultSelected) {
                        el.value = opt.value;
                        foundDefault = true;
                        break;
                    }
                }
                if(!foundDefault && el.options.length > 0) {
                     el.value = el.options[0].value;
                }
            }
        }
    });

    // 3. Handle specific logic triggered by changes

    // Reset Shape & Dimensions
    updateDimensions();

    // Reset A/B Toggle UI
    toggleABMode();

    // Reset Wall Assembly UIs (A and B)
    toggleScenarioAssemblyUI('_A');
    toggleScenarioAssemblyUI('_B');

    // 4. Re-render Gains Table (resets occupants/appliances to JSON defaults)
    renderGainTable();

    // 5. Recalculate
    calculateAll();
}

function calculateDetailedGains() {
    if (!gainData) return;

    let totalBTUPerHour = 0;
    const sectionTotals = { occupants: 0, appliances: 0, custom: 0 };

    // Loop through all generated inputs
    const inputs = document.querySelectorAll('input[id^="gain_qty_"]');

    inputs.forEach(input => {
        const qty = parseFloat(input.value) || 0;
        const wattsSensible = parseFloat(input.dataset.sensible);
        const dutyHours = parseFloat(input.dataset.duty);
        const section = input.dataset.section;

        if (qty > 0) {
            const dailyWh = wattsSensible * dutyHours * qty;
            const avgWatts = dailyWh / 24;
            const btuHr = avgWatts * 3.412;

            totalBTUPerHour += btuHr;

            if(section && sectionTotals[section] !== undefined) {
                sectionTotals[section] += btuHr;
            }
        }
    });

    customGains.forEach(item => {
        const qty = parseFloat(item.qty) || 0;
        const watts = parseFloat(item.watts) || 0;
        const duty = parseFloat(item.duty) || 0;

        if(qty > 0) {
             const dailyWh = watts * duty * qty;
             const avgWatts = dailyWh / 24;
             const btuHr = avgWatts * 3.412;
             totalBTUPerHour += btuHr;
             sectionTotals.custom += btuHr;
        }
    });

    for(const [key, val] of Object.entries(sectionTotals)) {
        const el = document.getElementById(`gain_summary_${key}`);
        if(el) el.textContent = `${Math.round(val)} BTU/hr`;
    }

    const simInput = document.getElementById('simInternalGain');
    if (simInput) {
        simInput.value = Math.round(totalBTUPerHour);
        if (typeof calculateAll === 'function') calculateAll();
    }
}

function serializeConfiguration() {
    const params = new URLSearchParams();
    CONFIG_FIELDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            let value;
            if (el.type === 'checkbox') {
                value = el.checked ? '1' : '0';
            } else {
                value = el.value;
            }
            params.set(id, value);
        }
    });
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

function deserializeConfiguration() {
    const params = new URLSearchParams(window.location.search);
    if ([...params].length === 0) return false;

    if (params.has('buildingShape')) {
        const shape = params.get('buildingShape');
        const shapeEl = document.getElementById('buildingShape');
        if (shapeEl) {
            shapeEl.value = shape;
            saveInputToLocalStorage(shapeEl);
            updateDimensions();
        }
    }

    CONFIG_FIELDS.forEach(id => {
        if (params.has(id)) {
            const el = document.getElementById(id);
            if (el) {
                const val = params.get(id);
                if (el.type === 'checkbox') {
                    el.checked = (val === '1');
                } else {
                    el.value = val;
                }
                saveInputToLocalStorage(el);
            }
        }
    });

    return true;
}

function saveInputToLocalStorage(element) {
    if (element && element.id) {
        if(element.type === 'checkbox') {
                localStorage.setItem(element.id, element.checked);
        } else {
                localStorage.setItem(element.id, element.value);
        }
    }
}

function loadInputFromLocalStorage(element) {
    if (element && element.id) {
        const savedValue = localStorage.getItem(element.id);
        if (savedValue !== null) {
            if(element.type === 'checkbox') {
                element.checked = (savedValue === 'true');
            } else {
                element.value = savedValue;
            }
        }
    }
}

const dimensionTemplates = {
    rectangle: `
        <div><label class="input-label">Length (ft)</label><input type="number" id="length" class="input-field bg-gray-50" value="20" toolparamdescription="Length of the rectangle in feet."></div>
        <div><label class="input-label">Width (ft)</label><input type="number" id="width" class="input-field bg-gray-50" value="10" toolparamdescription="Width of the rectangle in feet."></div>
        <div><label class="input-label">Height (ft)</label><input type="number" id="height" class="input-field bg-gray-50" value="8" toolparamdescription="Height of the walls in feet."></div>
        <div><label class="input-label">Roof Pitch</label><input type="number" id="roofPitch" class="input-field bg-gray-50" value="4" toolparamdescription="Roof pitch (rise over 12)."></div>
    `,
    'a-frame': `
        <div><label class="input-label">Length (ft)</label><input type="number" id="length" class="input-field bg-gray-50" value="20" toolparamdescription="Length of the A-frame in feet."></div>
        <div><label class="input-label">Base Width (ft)</label><input type="number" id="width" class="input-field bg-gray-50" value="12" toolparamdescription="Base width of the A-frame in feet."></div>
        <div><label class="input-label">Height (ft)</label><input type="number" id="height" class="input-field bg-gray-50" value="15" toolparamdescription="Peak height of the A-frame in feet."></div>
    `,
    'gothic-arch': `
        <div><label class="input-label">Length (ft)</label><input type="number" id="length" class="input-field bg-gray-50" value="20" toolparamdescription="Length of the arch structure in feet."></div>
        <div><label class="input-label">Width (ft)</label><input type="number" id="width" class="input-field bg-gray-50" value="12" toolparamdescription="Width of the arch base in feet."></div>
        <div><label class="input-label">Spring Ht</label><input type="number" id="springWallHeight" class="input-field bg-gray-50" value="2" toolparamdescription="Height of the vertical spring walls in feet."></div>
    `,
    'cargo-van': `
        <div><label class="input-label">Cargo Length (ft)</label><input type="number" id="length" class="input-field bg-gray-50" value="12" toolparamdescription="Interior cargo length in feet."></div>
        <div><label class="input-label">Floor Width (ft)</label><input type="number" id="width" class="input-field bg-gray-50" value="6" toolparamdescription="Interior floor width in feet."></div>
        <div><label class="input-label">Int. Height (ft)</label><input type="number" id="height" class="input-field bg-gray-50" value="6.3" toolparamdescription="Interior standing height in feet."></div>
    `
};

function applyPreset(suffix) {
    const preset = document.getElementById(`insulationPreset${suffix}`).value;
    if(!preset) return;

    // We only set R-values for Roof and Floor directly.
    // Wall R-Value is now derived from assembly, so we set the Assembly fields.
    const r = document.getElementById(`roofRValue${suffix}`);
    const f = document.getElementById(`floorRValue${suffix}`);

    // Helpers to set assembly inputs
    const setAssembly = (type, studSize, spacing, cavIns, ci, massMat, massThick, massIns) => {
        const setVal = (id, val) => {
            const el = document.getElementById(id + suffix);
            if (el) {
                el.value = val;
                saveInputToLocalStorage(el);
            }
        };

        setVal('wallAssemblyType', type);

        if (type === 'stick') {
            setVal('wallStudSize', studSize);
            setVal('wallStudMaterial', 'wood'); // Default to wood for presets for now
            setVal('wallStudSpacing', spacing);
            setVal('wallCavityInsulation', cavIns);
            setVal('wallContinuousInsulation', ci);
        } else {
            setVal('wallMassMaterial', massMat);
            setVal('wallMassThickness', massThick);
            setVal('wallMassInsulation', massIns);
        }
    };

    switch(preset) {
        case 'code_min':
            // Stick Frame, 2x4, 16oc, Fiberglass, No CI. Result ~R-13 nominal, Eff ~11
            setAssembly('stick', '2x4', '16', 'fiberglass_batt', '0');
            if(r) r.value = 38;
            if(f) f.value = 10;
            break;
        case 'high_perf':
            // Stick Frame, 2x6, 24oc, Mineral Wool, R-5 CI. Result ~R-23 nominal + 5
            setAssembly('stick', '2x6', '24', 'mineral_wool', '5');
            if(r) r.value = 50;
            if(f) f.value = 20;
            break;
        case 'passive_house':
            // Double Stud or Thick Mass? Let's do 2x8 + R-10 CI for simulation or similar
            // Or better: Stick, 2x6, 24oc, Mineral Wool, R-15 CI
            setAssembly('stick', '2x6', '24', 'mineral_wool', '15');
            if(r) r.value = 60;
            if(f) f.value = 30;
            break;
        case 'van_build':
            // Stick, 2x4 (approx depth), Van Ribs, 24oc, Thinsulate, 0 CI
            // Note: 2x4 is 3.5" deep, Thinsulate is R-5.2/in.
            // Effective R will be heavily penalized by van_ribs factor (0.25).
            setAssembly('stick', '2x4', '24', 'thinsulate_sm600', '0');
            // We need to override the material to van_ribs, but setAssembly defaults to wood for stick.
            // We'll manually set it after calling setAssembly, or update setAssembly.
            // Let's update the element directly here to be safe and simple.
            const matEl = document.getElementById(`wallStudMaterial${suffix}`);
            if(matEl) {
                matEl.value = 'van_ribs';
                saveInputToLocalStorage(matEl);
            }
            if(r) r.value = 12; // Approx 2 inches of thinsulate/foam
            if(f) f.value = 5;  // Approx 1 inch of foam

            const massMat = document.getElementById(`massMaterial${suffix}`);
            if(massMat) {
                massMat.value = 'metal';
                saveInputToLocalStorage(massMat);
            }
            const massThick = document.getElementById(`slabThickness${suffix}`);
            if(massThick) {
                massThick.value = 0.1; // Thin sheet metal skin
                saveInputToLocalStorage(massThick);
            }
            break;
        case 'uninsulated':
            // Stick, 2x4, 16oc, None
            setAssembly('stick', '2x4', '16', 'none', '0');
            if(r) r.value = 4;
            if(f) f.value = 1;
            break;
    }

    saveInputToLocalStorage(document.getElementById(`insulationPreset${suffix}`));
    saveInputToLocalStorage(r);
    saveInputToLocalStorage(f);

    // Force UI update to show correct fields
    toggleScenarioAssemblyUI(suffix);
    calculateAll();
}

function applyGlazingPreset(suffix) {
    const preset = document.getElementById(`glazingPreset${suffix}`).value;
    if(!preset || preset === 'custom') return;

    const areas = getSurfaceAreas();
    const floor = areas.floor;

    let winPct = 0;
    let doorArea = 20;

    switch(preset) {
        case 'minimal': winPct = 0.10; doorArea = 20; break;
        case 'common': winPct = 0.20; doorArea = 20; break;
        case 'generous': winPct = 0.35; doorArea = 40; break;
    }

    const wArea = document.getElementById(`windowArea${suffix}`);
    const dArea = document.getElementById(`doorArea${suffix}`);

    if(floor > 0) {
        wArea.value = Math.round(floor * winPct);
    }
    dArea.value = doorArea;

    saveInputToLocalStorage(document.getElementById(`glazingPreset${suffix}`));
    saveInputToLocalStorage(wArea);
    saveInputToLocalStorage(dArea);

    calculateAll();
}

function updateDimensions() {
    const shape = document.getElementById('buildingShape').value;
    const container = document.getElementById('dimensionInputs');
    container.innerHTML = dimensionTemplates[shape];

    container.querySelectorAll('input').forEach(i => {
        loadInputFromLocalStorage(i);
        i.addEventListener('input', (e) => {
            saveInputToLocalStorage(e.target);
            calculateAll();
        });
    });
}

function toggleABMode() {
    const isEnabled = document.getElementById('abToggle').checked;
    const scenariosGrid = document.getElementById('scenariosGrid');
    const scenarioB = document.getElementById('scenarioBoxB');
    const headerA = document.getElementById('headerA');
    const resultsGrid = document.getElementById('resultsGrid');
    const resultB = document.getElementById('resultBoxB');
    const resultHeaderA = document.getElementById('resultHeaderA');
    const chartContainers = document.querySelectorAll('.lg\\:col-span-2-dynamic');

    if(isEnabled) {
        scenariosGrid.classList.add('lg:grid-cols-2');
        scenarioB.classList.remove('hidden');
        headerA.textContent = "Scenario A (Standard)";
        resultsGrid.classList.add('lg:grid-cols-2');
        resultB.classList.remove('hidden');
        resultHeaderA.textContent = "Scenario A Results";
        chartContainers.forEach(el => el.classList.add('lg:col-span-2'));
    } else {
        scenariosGrid.classList.remove('lg:grid-cols-2');
        scenarioB.classList.add('hidden');
        headerA.textContent = "Construction Details";
        resultsGrid.classList.remove('lg:grid-cols-2');
        resultB.classList.add('hidden');
        resultHeaderA.textContent = "Estimated Results";
        chartContainers.forEach(el => el.classList.remove('lg:col-span-2'));
    }
    calculateAll();
}

function toggleScenarioAssemblyUI(suffix) {
    const type = document.getElementById(`wallAssemblyType${suffix}`)?.value;
    const stickGroup = document.getElementById(`group_stick${suffix}`);
    const massGroup = document.getElementById(`group_mass${suffix}`);

    if (!stickGroup || !massGroup) return;

    if (type === 'stick') {
        stickGroup.classList.remove('hidden');
        massGroup.classList.add('hidden');
    } else {
        stickGroup.classList.add('hidden');
        massGroup.classList.remove('hidden');
    }
}

// --- CALCULATION LOGIC ---

function getSurfaceAreas() {
    const shape = document.getElementById('buildingShape').value;
    const L = parseFloat(document.getElementById('length')?.value) || 0;
    const W = parseFloat(document.getElementById('width')?.value) || 0;

    let areas = { wall:0, roof:0, floor:0, perimeter:0, total:0 };

    if(shape === 'rectangle') {
        const H = parseFloat(document.getElementById('height')?.value) || 0;
        const pitch = parseFloat(document.getElementById('roofPitch')?.value) || 0;
        areas.wall = (2*L*H) + (2*W*H);
        areas.floor = L*W;
        areas.perimeter = (2*L) + (2*W);
        if(pitch === 0) {
            areas.roof = L*W;
        } else {
            const rise = (W/2) * (pitch/12);
            const slope = Math.sqrt((W/2)**2 + rise**2);
            areas.roof = L * slope * 2;
            areas.wall += (W * rise);
        }
    } else if (shape === 'a-frame') {
            const H = parseFloat(document.getElementById('height')?.value) || 0;
            const slope = Math.sqrt((W/2)**2 + H**2);
            areas.roof = 2 * L * slope;
            areas.wall = W * H;
            areas.floor = L * W;
            areas.perimeter = (2*L) + (2*W);
    } else if (shape === 'gothic-arch') {
        const spring = parseFloat(document.getElementById('springWallHeight')?.value) || 0;
        const r = W/2;
        areas.floor = L * W;
        areas.wall = (2*L*spring) + (Math.PI * r**2);
        areas.roof = L * (Math.PI * r);
        areas.perimeter = (2*L) + (2*W);
    } else if (shape === 'cargo-van') {
        // User inputs: L (Cargo Length), W (Floor Width), H (Interior Height)
        const H = parseFloat(document.getElementById('height')?.value) || 0;
        areas.floor = L * W;
        areas.roof = L * W;
        // Walls + Sliding Door + Rear Doors approximation
        areas.wall = (2 * L * H) + (2 * W * H);
        areas.perimeter = (2*L) + (2*W);
    }

    areas.total = areas.wall + areas.roof;
    return areas;
}

function calculateEffectiveR(assembly) {
    // Mandatory Air Films (R-0.68 Interior + R-0.17 Exterior)
    let r_total = MATERIALS.air_film_int.r_total + MATERIALS.air_film_ext.r_total;

    // Add Gypsum/Sheathing defaults (R-1.0)
    r_total += 1.0;

    if (assembly.type === 'stick') {
        // Stud Depth
        let depth = 3.5;
        if (assembly.studSize === '2x6') depth = 5.5;
        if (assembly.studSize === '2x8') depth = 7.25;

        // Cavity Insulation R
        const insType = assembly.cavityInsulation || 'fiberglass_batt';
        const insRPerInch = MATERIALS[insType]?.r_inch || 0;
        let r_cavity = depth * insRPerInch;

        // Determine Calculation Method based on Material
        const mat = assembly.studMaterial || 'wood'; // Default to wood

        if (mat === 'steel') {
            // Steel: Use Correction Factors
            const sizeKey = assembly.studSize;
            const spaceKey = assembly.spacing;
            const factor = STEEL_CORRECTION_FACTORS[sizeKey]?.[spaceKey] || 0.46; // Fallback to 0.46 if not found

            // Effective Cavity R = Nominal Cavity R * Factor
            r_total += (r_cavity * factor);

        } else if (mat === 'van_ribs') {
            // Van Ribs: Severe thermal bridging
            const factor = STEEL_CORRECTION_FACTORS['van_ribs'].default;
            r_total += (r_cavity * factor);

        } else {
            // Wood: Parallel Path Method
            const framingFactor = assembly.spacing === '24' ? 0.22 : 0.25;

            const studRPerInch = MATERIALS.wood_stud.r_inch;
            const r_stud = depth * studRPerInch;

            const u_stud = r_stud > 0 ? 1/r_stud : 0;
            const u_cavity_final = r_cavity > 0 ? 1/r_cavity : 1/0.9; // Empty cavity R~0.9

            const u_effective = (framingFactor * u_stud) + ((1-framingFactor) * u_cavity_final);

            if (u_effective > 0) {
                r_total += (1 / u_effective);
            }
        }

        // Add Continuous Insulation (Series) with Fastener Correction
        const ci = parseFloat(assembly.continuousInsulation) || 0;

        if (ci > 0) {
            // Determine Chi Value
            const fType = assembly.fastenerType || 'galvanized';
            // map studMaterial from select values to keys in FASTENER_CHI_VALUES if needed,
            // but select values 'wood', 'steel', 'van_ribs' match keys in FASTENER_CHI_VALUES exactly (except 'wood' vs 'wood_stud' in MATERIALS, but getScenarioData gets value directly)
            // Let's check getScenarioData. It gets value from select.
            // Select options: wood, steel, van_ribs.
            const sMat = assembly.studMaterial || 'wood';

            const chiTable = FASTENER_CHI_VALUES[fType] || FASTENER_CHI_VALUES['galvanized'];
            const chi = chiTable[sMat] !== undefined ? chiTable[sMat] : FASTENER_CHI_VALUES.galvanized.wood;

            const density = parseFloat(assembly.fastenerDensity) || 0;

            // Calculate Effective CI R-Value
            // U_effective = U_nominal + (Chi * Density)
            // R_effective = 1 / U_effective
            const u_nominal = 1 / ci;
            const u_effective = u_nominal + (chi * density);
            const r_effective_ci = 1 / u_effective;

            r_total += r_effective_ci;
        }

    } else if (assembly.type === 'mass') {
        // Series Calculation
        const matType = assembly.massMaterial || 'cmu_standard';
        const thickness = parseFloat(assembly.massThickness) || 8;
        const ci = parseFloat(assembly.massInsulation) || 0;

        // Mass Layer
        if (MATERIALS[matType]) {
            if (MATERIALS[matType].r_total) {
                // Fixed R (like CMU block)
                r_total += MATERIALS[matType].r_total;
            } else if (MATERIALS[matType].r_inch) {
                // Per inch
                r_total += (thickness * MATERIALS[matType].r_inch);
            }
        }

        // Insulation Layer (Series)
        r_total += ci;
    }

    return r_total;
}

function getScenarioData(suffix) {
    // WALL R-VALUE CALCULATION
    const assType = document.getElementById(`wallAssemblyType${suffix}`)?.value;
    let rWall = 0;

    if (assType) {
        // Build Assembly Object
        const assembly = {
            type: assType, // 'stick' or 'mass'
            // Stick
            studSize: document.getElementById(`wallStudSize${suffix}`)?.value,
            studMaterial: document.getElementById(`wallStudMaterial${suffix}`)?.value,
            spacing: document.getElementById(`wallStudSpacing${suffix}`)?.value,
            cavityInsulation: document.getElementById(`wallCavityInsulation${suffix}`)?.value,
            continuousInsulation: document.getElementById(`wallContinuousInsulation${suffix}`)?.value,
            fastenerType: document.getElementById(`wallFastenerType${suffix}`)?.value,
            fastenerDensity: document.getElementById(`wallFastenerDensity${suffix}`)?.value,
            // Mass
            massMaterial: document.getElementById(`wallMassMaterial${suffix}`)?.value,
            massThickness: document.getElementById(`wallMassThickness${suffix}`)?.value,
            massInsulation: document.getElementById(`wallMassInsulation${suffix}`)?.value
        };
        rWall = calculateEffectiveR(assembly);
    } else {
        // Fallback or Legacy
        rWall = parseFloat(document.getElementById(`wallRValue${suffix}`)?.value) || 13;
    }

    const rRoofEl = document.getElementById(`roofRValue${suffix}`);
    const rRoof = rRoofEl ? (parseFloat(rRoofEl.value) || 1) : 1;

    const rFloorEl = document.getElementById(`floorRValue${suffix}`);
    const rFloor = rFloorEl ? (parseFloat(rFloorEl.value) || 1) : 1;

    const skirtREl = document.getElementById(`skirtR${suffix}`);
    const skirtR = skirtREl ? (parseFloat(skirtREl.value) || 0) : 0;

    const skirtHeightEl = document.getElementById(`skirtHeight${suffix}`);
    const skirtHeight = skirtHeightEl ? (parseFloat(skirtHeightEl.value) || 0) : 0;

    const skirtSealEl = document.getElementById(`skirtSeal${suffix}`);
    const skirtSeal = skirtSealEl ? skirtSealEl.value : 'vented';

    const wAreaEl = document.getElementById(`windowArea${suffix}`);
    const wArea = wAreaEl ? (parseFloat(wAreaEl.value) || 0) : 0;

    const wREl = document.getElementById(`windowR${suffix}`);
    const wR = wREl ? (parseFloat(wREl.value) || 1) : 1;

    const dAreaEl = document.getElementById(`doorArea${suffix}`);
    const dArea = dAreaEl ? (parseFloat(dAreaEl.value) || 0) : 0;

    const dREl = document.getElementById(`doorR${suffix}`);
    const dR = dREl ? (parseFloat(dREl.value) || 1) : 1;

    const sealingEl = document.getElementById(`airSealing${suffix}`);
    const sealing = sealingEl ? sealingEl.value : 'poor';

    const massMatEl = document.getElementById(`massMaterial${suffix}`);
    const massMat = massMatEl ? massMatEl.value : 'wood';

    const thicknessEl = document.getElementById(`slabThickness${suffix}`);
    const thickness = thicknessEl ? (parseFloat(thicknessEl.value) || 1) : 1;

    return { rWall, rRoof, rFloor, skirtR, skirtHeight, skirtSeal, wArea, wR, dArea, dR, sealing, massMat, thickness };
}

function calculateHeatLoss(areas, data, deltaT_Air, deltaT_Ground) {
    let netWall = areas.wall - (data.wArea + data.dArea);
    let netRoof = areas.roof;

    if (netWall < 0) {
        netRoof += netWall;
        netWall = 0;
    }
    netRoof = Math.max(0, netRoof);

    const safeR = (r) => Math.max(r, 0.1);
    const rW_win = safeR(data.wR);
    const rD_door = safeR(data.dR);

    // Basic UAs
    const ua_wall = netWall / safeR(data.rWall);
    const ua_roof = netRoof / safeR(data.rRoof);
    const ua_win = data.wArea / rW_win;
    const ua_door = data.dArea / rD_door;

    // DETECT FLOOR COUPLING CONTEXT
    const shape = document.getElementById('buildingShape')?.value;
    // Floor is Air Coupled if it is a vehicle OR if the user selected a raised floor type (Wood/Metal)
    // Concrete and Stone (Earth) are assumed to be Ground Coupled (Slab on Grade)
    const isAirCoupled = (shape === 'cargo-van') || (data.massMat === 'wood' || data.massMat === 'metal');

    let lossFloor = 0;
    let ua_floor_to_air = 0;
    let ua_floor_to_ground = 0;

    // SKIRTING / BUFFER ZONE LOGIC
    if (data.skirtR > 0 && data.skirtHeight > 0) {
        // Definitions
        // U_f: Floor Conductance (Area / R_floor)
        const U_f = areas.floor / safeR(data.rFloor);

        // U_s: Skirting Conductance (Perimeter * Height / R_skirt)
        const U_s = (areas.perimeter * data.skirtHeight) / safeR(data.skirtR);

        // U_g: Ground Conductance (Area / 1.0)
        const U_g = areas.floor / 1.0;

        // Q_v: Ventilation (Volume * ACH * 0.018)
        // Volume = Area * Height
        const volume = areas.floor * data.skirtHeight;
        let ach = 5.0; // Default vented
        if(data.skirtSeal === 'sealed') ach = 0.5;
        else if(data.skirtSeal === 'leaky') ach = 20.0;
        const Q_v = volume * ach * 0.018;

        const U_sigma = U_f + U_s + U_g + Q_v;

        // Calculate K factors for effective UA mapping
        // Heat Loss Floor = K1 * (Ti - To) + K2 * (Ti - Tg)
        const K1 = (U_f * (U_s + Q_v)) / U_sigma;
        const K2 = (U_f * U_g) / U_sigma;

        ua_floor_to_air = K1;
        ua_floor_to_ground = K2;

        lossFloor = (K1 * deltaT_Air) + (K2 * deltaT_Ground);

    } else if (isAirCoupled) {
        // Standard Air Coupled (Stilts, Vehicle, etc)
        const U_f = areas.floor / safeR(data.rFloor);
        ua_floor_to_air = U_f;
        ua_floor_to_ground = 0;
        lossFloor = U_f * deltaT_Air;

    } else {
        // Standard Ground Coupled (Slab on Grade)
        const U_f = areas.floor / safeR(data.rFloor);
        ua_floor_to_air = 0;
        ua_floor_to_ground = U_f;
        lossFloor = U_f * deltaT_Ground;
    }

    const lossWall = ua_wall * deltaT_Air;
    const lossRoof = ua_roof * deltaT_Air;
    const lossWindow = ua_win * deltaT_Air;
    const lossDoor = ua_door * deltaT_Air;

    let ua = ua_wall + ua_roof + ua_win + ua_door + ua_floor_to_air;
    let uaFloor = ua_floor_to_ground;

    let infiltrationLoss = 0;
    if(data.sealing === 'poor') {
         // Infiltration adds 25% to envelope losses (simplified)
         // Note: Applying to floor loss as well for simplicity, though debatably applies less to ground coupled
         infiltrationLoss = (lossWall + lossRoof + lossWindow + lossDoor + lossFloor) * 0.25;

         // Increase UAs effectively
         ua *= 1.25;
         uaFloor *= 1.25;
    }

    const totalLoss = lossWall + lossRoof + lossWindow + lossDoor + lossFloor + infiltrationLoss;

    return {
        totalLoss, ua, uaFloor,
        breakdown: {
            Wall: lossWall,
            Roof: lossRoof,
            Window: lossWindow,
            Door: lossDoor,
            Floor: lossFloor,
            Infiltration: infiltrationLoss
        }
    };
}

function calculateMassCapacity(areas, data) {
    let density = 145, specHeat = 0.2;
    if(data.massMat === 'stone') { density = 135; specHeat = 0.2; }
    if(data.massMat === 'wood') { density = 30; specHeat = 0.4; }
    if(data.massMat === 'metal') { density = 490; specHeat = 0.12; }

    const vol = areas.floor * (data.thickness / 12);
    const mass = vol * density;
    const floorCapacity = mass * specHeat;
    const structureCapacity = areas.total * 1.5;

    return floorCapacity + structureCapacity;
}

function calculateAll() {
    const isAB = document.getElementById('abToggle')?.checked;
    const areas = getSurfaceAreas();
    if(areas.total <= 0) return null;

    const tIn = parseFloat(document.getElementById('indoorTemp').value);
    const tOut = parseFloat(document.getElementById('outdoorTemp').value);
    const tGround = parseFloat(document.getElementById('groundTemp').value);
    const dtAir = Math.max(0, tIn - tOut);
    const dtGround = Math.max(0, tIn - tGround);

    const dataA = getScenarioData('_A');
    const lossA = calculateHeatLoss(areas, dataA, dtAir, dtGround);
    const capA = calculateMassCapacity(areas, dataA);

    document.getElementById('resultLoss_A').textContent = Math.round(lossA.totalLoss).toLocaleString();
    const dropA = lossA.totalLoss / Math.max(capA, 1);
    document.getElementById('resultDrop_A').textContent = dropA.toFixed(2);
    updateBreakdownUI('breakdown_A', lossA.breakdown);

    let lossB = null, capB = null, dataB = null;

    if(isAB) {
        dataB = getScenarioData('_B');
        lossB = calculateHeatLoss(areas, dataB, dtAir, dtGround);
        capB = calculateMassCapacity(areas, dataB);

        document.getElementById('resultLoss_B').textContent = Math.round(lossB.totalLoss).toLocaleString();
        const dropB = lossB.totalLoss / Math.max(capB, 1);
        document.getElementById('resultDrop_B').textContent = dropB.toFixed(2);
        updateBreakdownUI('breakdown_B', lossB.breakdown);
    }

    updateHeatLossChart(isAB, areas, tIn, tGround, dataA, dataB);
    updateSimulation(isAB, areas, lossA, lossB, capA, capB, tIn, tGround);
    updateBreakdownChart(isAB, lossA, lossB);

    return {
        isAB,
        areas,
        temperatures: { tIn, tOut, tGround },
        scenarioA: { data: dataA, loss: lossA, capacity: capA },
        scenarioB: isAB ? { data: dataB, loss: lossB, capacity: capB } : null
    };
}

function updateBreakdownUI(elementId, breakdown) {
    const el = document.getElementById(elementId);
    if(!el) return;

    let html = '<ul class="space-y-1">';
    for(const [key, val] of Object.entries(breakdown)) {
        if(val > 0) {
            html += `<li class="flex justify-between"><span>${key}:</span> <span>${Math.round(val).toLocaleString()} BTU/hr</span></li>`;
        }
    }
    html += '</ul>';
    el.innerHTML = html;
}

function updateBreakdownChart(isAB, lossA, lossB) {
    const ctx = document.getElementById('breakdownChart')?.getContext('2d');
    if(!ctx) return;

    const labels = Object.keys(lossA.breakdown);
    const dataA = Object.values(lossA.breakdown);
    const dataB = isAB && lossB ? Object.values(lossB.breakdown) : [];

    const datasets = [{
        label: 'Scenario A',
        data: dataA,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
    }];

    if(isAB) {
        datasets.push({
            label: 'Scenario B',
            data: dataB,
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1
        });
    }

    if(breakdownChart) breakdownChart.destroy();

    breakdownChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            scales: {
                y: { beginAtZero: true, title: {display:true, text: 'Heat Loss (BTU/hr)'} }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Heat Loss Components (Design Temp)'
                }
            }
        }
    });
}

function updateHeatLossChart(isAB, areas, tIn, tGround, dataA, dataB) {
    const ctx = document.getElementById('heatLossChart')?.getContext('2d');
    if(!ctx) return;

    const labels = [];
    const d_A = [];
    const d_B = [];

    const currentOutdoor = parseFloat(document.getElementById('outdoorTemp').value);
    const minT = Math.min(0, currentOutdoor - 10, tIn - 30);
    const maxT = Math.max(60, currentOutdoor + 10, tIn + 10);
    const startT = Math.floor(minT / 5) * 5;
    const endT = Math.ceil(maxT / 5) * 5;

    for(let t=startT; t<=endT; t+=5) {
        labels.push(`${t}°F`);
        const dt = Math.max(0, tIn - t);
        const dtG = Math.max(0, tIn - tGround);

        const rA = calculateHeatLoss(areas, dataA, dt, dtG);
        d_A.push(rA.totalLoss);

        if(isAB) {
            const rB = calculateHeatLoss(areas, dataB, dt, dtG);
            d_B.push(rB.totalLoss);
        }
    }

    const datasets = [
        { label: isAB ? 'Scenario A' : 'Heat Loss', data: d_A, borderColor: '#3B82F6', tension: 0.3, fill: false }
    ];

    if(isAB) {
        datasets.push({ label: 'Scenario B', data: d_B, borderColor: '#10B981', tension: 0.3, fill: false });
    }

    if(heatLossChart) heatLossChart.destroy();
    heatLossChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            scales: {
                y: { title: {display:true, text: 'Heat Loss (BTU/hr)'} },
                x: { title: {display:true, text: 'Outdoor Temp (°F)'} }
            }
        }
    });
}

function calculateSimulationData(params) {
    const { isAB, lossA, lossB, capA, capB, tIn, tGround, duration, low, high, iGain, buildingShape, vehicleColor } = params;
    const sGainBase = 1000;

    const isVehicle = (buildingShape === 'cargo-van');
    const solarMult = (isVehicle && vehicleColor === 'dark') ? 1.5 : 1.0;
    const sGain = sGainBase * solarMult;

    const labels = [];
    const simA = [];
    const simB = [];
    const simOut = [];

    let currA = tIn;
    let currB = tIn;

    const stepsPerHour = 60;
    const dt = 1 / stepsPerHour;

    for(let h=0; h<=duration; h++) {
        if(h%24 === 0) labels.push(`Day ${h/24 + 1}`);
        else labels.push('');

        const avg = (high+low)/2;
        const amp = (high-low)/2;
        const hDay = h%24;
        const tOut = avg - amp * Math.cos(Math.PI * (hDay-4)/12);
        simOut.push(tOut);

        let sol = (hDay >= 9 && hDay <= 16) ? sGain : 0;
        const gains = iGain + sol;

        for(let m=0; m<stepsPerHour; m++) {
            const loadA = (lossA.ua * (currA - tOut)) + (lossA.uaFloor * (currA - tGround));
            const rateA = (gains - loadA) / Math.max(capA, 50);
            currA += rateA * dt;

            if(isAB && lossB) {
                const loadB = (lossB.ua * (currB - tOut)) + (lossB.uaFloor * (currB - tGround));
                const rateB = (gains - loadB) / Math.max(capB, 50);
                currB += rateB * dt;
            }
        }

        simA.push(currA);
        if(isAB) simB.push(currB);
    }

    return { labels, simA, simB, simOut };
}

function updateSimulation(isAB, areas, lossA, lossB, capA, capB, tIn, tGround) {
    const ctx = document.getElementById('simulationChart')?.getContext('2d');
    if(!ctx) return;

    const duration = parseInt(document.getElementById('simDuration').value);
    const low = parseFloat(document.getElementById('simLowTemp').value);
    const high = parseFloat(document.getElementById('simHighTemp').value);
    const iGain = parseFloat(document.getElementById('simInternalGain').value);
    const shape = document.getElementById('buildingShape').value;
    const vColor = document.getElementById('vehicleColor').value;

    const simData = calculateSimulationData({
        isAB, lossA, lossB, capA, capB, tIn, tGround,
        duration, low, high, iGain,
        buildingShape: shape,
        vehicleColor: vColor
    });

    const datasets = [
        { label: isAB ? 'Indoor A' : 'Indoor Temp', data: simData.simA, borderColor: '#3B82F6', tension: 0.4, pointRadius: 0 },
        { label: 'Outdoor', data: simData.simOut, borderColor: '#9CA3AF', borderDash: [5,5], pointRadius: 0, borderWidth: 1 }
    ];

    if(isAB) {
        datasets.splice(1, 0, { label: 'Indoor B', data: simData.simB, borderColor: '#10B981', tension: 0.4, pointRadius: 0 });
    }

    if(simulationChart) simulationChart.destroy();
    simulationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: simData.labels,
            datasets: datasets
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            scales: {
                y: { title: {display:true, text: 'Temperature (°F)'} },
                x: { ticks: { autoSkip: true, maxTicksLimit: 8 } }
            }
        }
    });
}

function init() {
    const attachAndLoad = (id) => {
        const el = document.getElementById(id);
        if(el) {
            loadInputFromLocalStorage(el);
            el.addEventListener('input', (e) => {
                saveInputToLocalStorage(e.target);
                calculateAll();
            });
            el.addEventListener('change', (e) => {
                    saveInputToLocalStorage(e.target);
                    calculateAll();
            });
            if(id.startsWith('gainCount')) {
                el.addEventListener('input', updateInternalGains);
            }
        }
    };

    const toggle = document.getElementById('abToggle');
    if (toggle) {
        loadInputFromLocalStorage(toggle);
        toggle.addEventListener('change', (e) => {
            saveInputToLocalStorage(e.target);
            toggleABMode();
            calculateAll();
        });
    }

    const shapeEl = document.getElementById('buildingShape');
    if (shapeEl) {
        loadInputFromLocalStorage(shapeEl);
        shapeEl.addEventListener('change', (e) => {
            saveInputToLocalStorage(e.target);
            updateDimensions();
        });
    }

    updateDimensions();

    ['indoorTemp','outdoorTemp','groundTemp','simDuration','simLowTemp','simHighTemp','customGainsData'].forEach(attachAndLoad);

    ['_A','_B'].forEach(s => {
        // Shared & Others
        ['insulationPreset','glazingPreset','roofRValue','floorRValue',
         'skirtR', 'skirtHeight', 'skirtSeal',
         'windowArea','windowR','doorArea','doorR','airSealing','massMaterial','slabThickness'].forEach(base => {
            attachAndLoad(base+s);
        });

        // Assembly Fields
        ['wallAssemblyType','wallStudSize','wallStudMaterial','wallStudSpacing','wallCavityInsulation','wallContinuousInsulation',
         'wallFastenerType', 'wallFastenerDensity',
         'wallMassMaterial','wallMassThickness','wallMassInsulation'].forEach(base => {
             const id = base+s;
             const el = document.getElementById(id);
             if (el) {
                 loadInputFromLocalStorage(el);
                 el.addEventListener('change', (e) => {
                    saveInputToLocalStorage(e.target);
                    // If type changes, toggle UI
                    if(id.startsWith('wallAssemblyType')) toggleScenarioAssemblyUI(s);
                    calculateAll();
                 });
                 el.addEventListener('input', (e) => {
                    saveInputToLocalStorage(e.target);
                    calculateAll();
                 });
             }
        });

        // Toggle visibility initially
        toggleScenarioAssemblyUI(s);

        ['windowArea','doorArea'].forEach(k => {
             const el = document.getElementById(k+s);
             if(el) {
                el.addEventListener('input', () => {
                    const pre = document.getElementById('glazingPreset'+s);
                    if(pre) { pre.value = 'custom'; saveInputToLocalStorage(pre); }
                });
             }
        });
    });

    // Check if configuration loaded from URL, otherwise apply defaults
    if (!deserializeConfiguration()) {
        ['_A', '_B'].forEach(s => {
            // Only apply defaults if local storage is empty for these?
            // For now, simple approach: check if type is set.
            const typeEl = document.getElementById('wallAssemblyType' + s);
            if(typeEl && !typeEl.value) {
                applyPreset(s);
            }
            applyGlazingPreset(s);
        });
    }

    syncCustomGainsFromDOM();
    loadGainData();
    toggleABMode();
    calculateAll();

    const menuBtn = document.getElementById('menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            document.getElementById('menu-dropdown').classList.toggle('hidden');
        });
    }

    const helpLink = document.getElementById('help-link');
    const helpModal = document.getElementById('helpModal');
    const closeHelpModal = document.getElementById('closeHelpModal');
    const helpContent = document.getElementById('helpContent');

    if (helpLink && helpModal) {
        helpLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('menu-dropdown').classList.add('hidden');
            helpModal.classList.remove('hidden');

            if (helpContent.innerHTML.includes('Loading...')) {
                Promise.all([
                    fetch('README.md').then(res => res.text()),
                    fetch('methods.md').then(res => res.text())
                ]).then(([readme, methods]) => {
                    helpContent.innerHTML = marked.parse(readme + '\n<hr>\n' + methods);
                }).catch(err => {
                    helpContent.innerHTML = '<p class="text-red-500">Failed to load documentation.</p>';
                    console.error(err);
                });
            }
        });

        closeHelpModal.addEventListener('click', () => {
            helpModal.classList.add('hidden');
        });

        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.classList.add('hidden');
            }
        });
    }

    const shareBtn = document.getElementById('shareBtn');
    const copyLinkBtn = document.getElementById('copyLinkBtn');

    if (navigator.share) {
        shareBtn.classList.remove('hidden');
        shareBtn.addEventListener('click', async () => {
            const url = serializeConfiguration();
            try {
                await navigator.share({
                    title: 'Tiny Home Heat Loss Calculator',
                    text: 'Check out this tiny home energy configuration!',
                    url: url
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        });
    }

    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => {
            const url = serializeConfiguration();
            navigator.clipboard.writeText(url).then(() => {
                const originalText = copyLinkBtn.innerHTML;
                copyLinkBtn.innerHTML = `
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    Copied!
                `;
                setTimeout(() => {
                    copyLinkBtn.innerHTML = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                alert('Failed to copy URL to clipboard');
            });
        });
    }

    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAll);
    }
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', init);
}

if (typeof module !== 'undefined') {
    module.exports = {
        calculateHeatLoss,
        calculateMassCapacity,
        calculateEffectiveR,
        getSurfaceAreas,
        getScenarioData,
        calculateAll,
        calculateSimulationData,
        updateDimensions,
        toggleABMode,
        init,
        applyPreset,
        applyGlazingPreset,
        loadGainData,
        calculateDetailedGains,
        renderGainTable,
        addCustomGain,
        removeCustomGain,
        updateCustomGain,
        syncCustomGainsFromDOM,
        renderCustomGains,
        clearAll,
        MATERIALS,
        STEEL_CORRECTION_FACTORS
    };
}
