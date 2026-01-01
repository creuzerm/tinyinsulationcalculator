// Global Chart Instances
let heatLossChart;
let simulationChart;
let breakdownChart;

const CONFIG_FIELDS = [
    // Shared
    'buildingShape', 'indoorTemp', 'outdoorTemp', 'groundTemp', 'abToggle',
    // Dimensions (all potential ones, though some might not exist depending on shape)
    'length', 'width', 'height', 'roofPitch', 'springWallHeight',
    // Scenario A
    'insulationPreset_A', 'wallRValue_A', 'roofRValue_A', 'floorRValue_A',
    'windowArea_A', 'windowU_A', 'doorArea_A', 'doorU_A', 'airSealing_A', 'massMaterial_A', 'slabThickness_A',
    // Scenario B
    'insulationPreset_B', 'wallRValue_B', 'roofRValue_B', 'floorRValue_B',
    'windowArea_B', 'windowU_B', 'doorArea_B', 'doorU_B', 'airSealing_B', 'massMaterial_B', 'slabThickness_B',
    // Simulation
    'simDuration', 'simInternalGain', 'simLowTemp', 'simHighTemp',
    'gainCountPerson', 'gainCountElectronics', 'gainCountLight'
];

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

    // 1. Set Building Shape First (to trigger dimension inputs)
    if (params.has('buildingShape')) {
        const shape = params.get('buildingShape');
        const shapeEl = document.getElementById('buildingShape');
        if (shapeEl) {
            shapeEl.value = shape;
            saveInputToLocalStorage(shapeEl);
            updateDimensions(); // This creates the specific dimension inputs
        }
    }

    // 2. Set All Fields
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
                saveInputToLocalStorage(el); // Persist immediately
            }
        }
    });

    return true; // Config loaded
}

// --- STORAGE HELPERS ---
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

// Shape Templates
const dimensionTemplates = {
    rectangle: `
        <div><label class="input-label">Length (ft)</label><input type="number" id="length" class="input-field bg-gray-50" value="20"></div>
        <div><label class="input-label">Width (ft)</label><input type="number" id="width" class="input-field bg-gray-50" value="10"></div>
        <div><label class="input-label">Height (ft)</label><input type="number" id="height" class="input-field bg-gray-50" value="8"></div>
        <div><label class="input-label">Roof Pitch</label><input type="number" id="roofPitch" class="input-field bg-gray-50" value="4"></div>
    `,
    'a-frame': `
        <div><label class="input-label">Length (ft)</label><input type="number" id="length" class="input-field bg-gray-50" value="20"></div>
        <div><label class="input-label">Base Width (ft)</label><input type="number" id="width" class="input-field bg-gray-50" value="12"></div>
        <div><label class="input-label">Height (ft)</label><input type="number" id="height" class="input-field bg-gray-50" value="15"></div>
    `,
    'gothic-arch': `
        <div><label class="input-label">Length (ft)</label><input type="number" id="length" class="input-field bg-gray-50" value="20"></div>
        <div><label class="input-label">Width (ft)</label><input type="number" id="width" class="input-field bg-gray-50" value="12"></div>
        <div><label class="input-label">Spring Ht</label><input type="number" id="springWallHeight" class="input-field bg-gray-50" value="2"></div>
    `
};

// --- PRESET LOGIC ---
function applyPreset(suffix) {
    const preset = document.getElementById(`insulationPreset${suffix}`).value;
    if(!preset) return;

    const w = document.getElementById(`wallRValue${suffix}`);
    const r = document.getElementById(`roofRValue${suffix}`);
    const f = document.getElementById(`floorRValue${suffix}`);

    switch(preset) {
        case 'code_min': w.value = 13; r.value = 38; f.value = 10; break;
        case 'high_perf': w.value = 21; r.value = 50; f.value = 20; break;
        case 'passive_house': w.value = 32; r.value = 50; f.value = 30; break;
        case 'uninsulated': w.value = 4; r.value = 4; f.value = 1; break;
    }
    // Save immediately on preset apply
    saveInputToLocalStorage(document.getElementById(`insulationPreset${suffix}`));
    saveInputToLocalStorage(w);
    saveInputToLocalStorage(r);
    saveInputToLocalStorage(f);

    calculateAll();
}

function updateInternalGains() {
    const p = (parseFloat(document.getElementById('gainCountPerson').value)||0) * 350;
    const e = (parseFloat(document.getElementById('gainCountElectronics').value)||0) * 150;
    const l = (parseFloat(document.getElementById('gainCountLight').value)||0) * 35;
    document.getElementById('simInternalGain').value = p + e + l;
    // Note: internal gain hidden field doesn't need explicit saving if we save the counts
    calculateAll();
}

function updateDimensions() {
    const shape = document.getElementById('buildingShape').value;
    const container = document.getElementById('dimensionInputs');
    container.innerHTML = dimensionTemplates[shape];

    // Re-bind listeners & Load Saved Data for these dynamic inputs
    container.querySelectorAll('input').forEach(i => {
        loadInputFromLocalStorage(i); // Restore persisted values
        i.addEventListener('input', (e) => {
            saveInputToLocalStorage(e.target);
            calculateAll();
        });
    });
    // Removed calculateAll() call here to avoid double calculation/side-effects during setup
}

// --- TOGGLE LOGIC ---
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
        // Turn ON Comparison
        scenariosGrid.classList.add('lg:grid-cols-2');
        scenarioB.classList.remove('hidden');
        headerA.textContent = "Scenario A (Standard)";

        resultsGrid.classList.add('lg:grid-cols-2');
        resultB.classList.remove('hidden');
        resultHeaderA.textContent = "Scenario A Results";

        chartContainers.forEach(el => el.classList.add('lg:col-span-2'));
    } else {
        // Turn OFF Comparison
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


// --- CALCULATION LOGIC ---

function getSurfaceAreas() {
    const shape = document.getElementById('buildingShape').value;
    const L = parseFloat(document.getElementById('length')?.value) || 0;
    const W = parseFloat(document.getElementById('width')?.value) || 0;

    let areas = { wall:0, roof:0, floor:0, total:0 };

    if(shape === 'rectangle') {
        const H = parseFloat(document.getElementById('height')?.value) || 0;
        const pitch = parseFloat(document.getElementById('roofPitch')?.value) || 0;
        areas.wall = (2*L*H) + (2*W*H);
        areas.floor = L*W;
        if(pitch === 0) {
            areas.roof = L*W;
        } else {
            const rise = (W/2) * (pitch/12);
            const slope = Math.sqrt((W/2)**2 + rise**2);
            areas.roof = L * slope * 2;
            // Add gable ends to wall
            areas.wall += (W * rise);
        }
    } else if (shape === 'a-frame') {
            const H = parseFloat(document.getElementById('height')?.value) || 0;
            const slope = Math.sqrt((W/2)**2 + H**2);
            areas.roof = 2 * L * slope;
            areas.wall = W * H; // Two triangle ends combined
            areas.floor = L * W;
    } else if (shape === 'gothic-arch') {
        const spring = parseFloat(document.getElementById('springWallHeight')?.value) || 0;
        const r = W/2;
        areas.floor = L * W;
        areas.wall = (2*L*spring) + (Math.PI * r**2); // Ends
        areas.roof = L * (Math.PI * r); // Arch top
    }

    areas.total = areas.wall + areas.roof;
    return areas;
}

function getScenarioData(suffix) {
    // R-Values
    const rWall = parseFloat(document.getElementById(`wallRValue${suffix}`).value) || 1;
    const rRoof = parseFloat(document.getElementById(`roofRValue${suffix}`).value) || 1;
    const rFloor = parseFloat(document.getElementById(`floorRValue${suffix}`).value) || 1;

    // Windows & Doors
    const wArea = parseFloat(document.getElementById(`windowArea${suffix}`).value) || 0;
    const wU = parseFloat(document.getElementById(`windowU${suffix}`).value) || 0.30;
    const dArea = parseFloat(document.getElementById(`doorArea${suffix}`).value) || 0;
    const dU = parseFloat(document.getElementById(`doorU${suffix}`).value) || 0.30;

    // Air Sealing
    const sealing = document.getElementById(`airSealing${suffix}`).value;

    // Mass
    const massMat = document.getElementById(`massMaterial${suffix}`).value;
    const thickness = parseFloat(document.getElementById(`slabThickness${suffix}`).value) || 1;

    return { rWall, rRoof, rFloor, wArea, wU, dArea, dU, sealing, massMat, thickness };
}

function calculateHeatLoss(areas, data, deltaT_Air, deltaT_Ground) {
    // Subtract openings from wall first, then roof if needed
    let netWall = areas.wall - (data.wArea + data.dArea);
    let netRoof = areas.roof;

    if (netWall < 0) {
        netRoof += netWall; // Subtract excess from roof
        netWall = 0;
    }
    netRoof = Math.max(0, netRoof);

    // Conductive Losses
    const lossWall = (netWall / data.rWall) * deltaT_Air;
    const lossRoof = (netRoof / data.rRoof) * deltaT_Air;
    const lossWindow = (data.wArea * data.wU) * deltaT_Air;
    const lossDoor = (data.dArea * data.dU) * deltaT_Air;
    const lossFloor = (areas.floor / data.rFloor) * deltaT_Ground;

    // UA (Conductance) for Simulation
    let ua = 0;
    ua += (netWall / data.rWall);
    ua += (netRoof / data.rRoof);
    ua += (data.wArea * data.wU);
    ua += (data.dArea * data.dU);

    // Sealing Penalty (Infiltration)
    // Simplified: Add % to total UA
    let infiltrationLoss = 0;
    if(data.sealing === 'poor') {
         // Approx 25% of conductive load
         infiltrationLoss = (lossWall + lossRoof + lossWindow + lossDoor + lossFloor) * 0.25;
         ua *= 1.25;
    }

    const totalLoss = lossWall + lossRoof + lossWindow + lossDoor + lossFloor + infiltrationLoss;
    const uaFloor = (areas.floor / data.rFloor);

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
    let density = 145, specHeat = 0.2; // Concrete
    if(data.massMat === 'stone') { density = 135; specHeat = 0.2; }
    if(data.massMat === 'wood') { density = 30; specHeat = 0.4; }

    const vol = areas.floor * (data.thickness / 12);
    const mass = vol * density;
    const floorCapacity = mass * specHeat;

    // Add Structure Mass (Approximation)
    // Even a light shed has wall mass (~1.5 BTU/sf/F).
    // This baseline stability mass prevents division by near-zero errors.
    const structureCapacity = areas.total * 1.5;

    return floorCapacity + structureCapacity;
}

function calculateAll() {
    const isAB = document.getElementById('abToggle').checked;

    // 1. Common Data
    const areas = getSurfaceAreas();
    if(areas.total <= 0) return;

    const tIn = parseFloat(document.getElementById('indoorTemp').value);
    const tOut = parseFloat(document.getElementById('outdoorTemp').value);
    const tGround = parseFloat(document.getElementById('groundTemp').value);
    const dtAir = Math.max(0, tIn - tOut);
    const dtGround = Math.max(0, tIn - tGround);

    // 2. Scenario A
    const dataA = getScenarioData('_A');
    const lossA = calculateHeatLoss(areas, dataA, dtAir, dtGround);
    const capA = calculateMassCapacity(areas, dataA);

    // Update A UI
    document.getElementById('resultLoss_A').textContent = Math.round(lossA.totalLoss).toLocaleString();
    const dropA = lossA.totalLoss / Math.max(capA, 1);
    document.getElementById('resultDrop_A').textContent = dropA.toFixed(2);
    updateBreakdownUI('breakdown_A', lossA.breakdown);

    let lossB = null, capB = null, dataB = null;

    if(isAB) {
        dataB = getScenarioData('_B');
        lossB = calculateHeatLoss(areas, dataB, dtAir, dtGround);
        capB = calculateMassCapacity(areas, dataB);

        // Update B UI
        document.getElementById('resultLoss_B').textContent = Math.round(lossB.totalLoss).toLocaleString();
        const dropB = lossB.totalLoss / Math.max(capB, 1);
        document.getElementById('resultDrop_B').textContent = dropB.toFixed(2);
        updateBreakdownUI('breakdown_B', lossB.breakdown);
    }

    // 6. Update Charts
    updateHeatLossChart(isAB, areas, tIn, tGround, dataA, dataB);
    updateSimulation(isAB, areas, lossA, lossB, capA, capB, tIn, tGround);
    updateBreakdownChart(isAB, lossA, lossB);
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
    const ctx = document.getElementById('breakdownChart').getContext('2d');

    // Data Preparation
    const labels = Object.keys(lossA.breakdown);
    const dataA = Object.values(lossA.breakdown);
    const dataB = isAB && lossB ? Object.values(lossB.breakdown) : [];

    const datasets = [{
        label: 'Scenario A',
        data: dataA,
        backgroundColor: 'rgba(59, 130, 246, 0.7)', // Blue
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
    }];

    if(isAB) {
        datasets.push({
            label: 'Scenario B',
            data: dataB,
            backgroundColor: 'rgba(16, 185, 129, 0.7)', // Green
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
    const ctx = document.getElementById('heatLossChart').getContext('2d');
    const labels = [];
    const d_A = [];
    const d_B = [];

    // Dynamic Chart Range logic based on Design Temps
    const currentOutdoor = parseFloat(document.getElementById('outdoorTemp').value);
    // Ensure we cover from roughly 20 below coldest to 20 above hottest, or at least 0-60 baseline
    const minT = Math.min(0, currentOutdoor - 10, tIn - 30);
    const maxT = Math.max(60, currentOutdoor + 10, tIn + 10);

    // Round to nearest 5 for clean ticks
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

function updateSimulation(isAB, areas, lossA, lossB, capA, capB, tIn, tGround) {
    const ctx = document.getElementById('simulationChart').getContext('2d');

    const duration = parseInt(document.getElementById('simDuration').value);
    const low = parseFloat(document.getElementById('simLowTemp').value);
    const high = parseFloat(document.getElementById('simHighTemp').value);
    const iGain = parseFloat(document.getElementById('simInternalGain').value);
    const sGain = 1000; // Simplified average solar for A/B demo

    const labels = [];
    const simA = [];
    const simB = [];
    const simOut = [];

    let currA = tIn;
    let currB = tIn;

    // Sub-step configuration for stability
    const stepsPerHour = 60; // 1-minute steps
    const dt = 1 / stepsPerHour;

    for(let h=0; h<=duration; h++) {
        // Time Label
        if(h%24 === 0) labels.push(`Day ${h/24 + 1}`);
        else labels.push('');

        // Outdoor Temp (Sinusoidal)
        const avg = (high+low)/2;
        const amp = (high-low)/2;
        const hDay = h%24;
        const tOut = avg - amp * Math.cos(Math.PI * (hDay-4)/12); // Low at 4am
        simOut.push(tOut);

        // Solar (Simple Step)
        let sol = (hDay >= 9 && hDay <= 16) ? sGain : 0;

        // Net Gains
        const gains = iGain + sol;

        // --- INTEGRATION LOOP ---
        // Run 60 mini-steps for every hour to prevent oscillation
        for(let m=0; m<stepsPerHour; m++) {
            // Step A
            // loss.ua is the conductance. Rate of change = (Gains - ConductiveLoss) / Capacity
            const loadA = (lossA.ua * (currA - tOut)) + (lossA.uaFloor * (currA - tGround));
            const rateA = (gains - loadA) / Math.max(capA, 50); // Clamp min capacity to 50
            currA += rateA * dt;

            if(isAB) {
                // Step B
                const loadB = (lossB.ua * (currB - tOut)) + (lossB.uaFloor * (currB - tGround));
                const rateB = (gains - loadB) / Math.max(capB, 50);
                currB += rateB * dt;
            }
        }

        simA.push(currA);
        if(isAB) simB.push(currB);
    }

    const datasets = [
        { label: isAB ? 'Indoor A' : 'Indoor Temp', data: simA, borderColor: '#3B82F6', tension: 0.4, pointRadius: 0 },
        { label: 'Outdoor', data: simOut, borderColor: '#9CA3AF', borderDash: [5,5], pointRadius: 0, borderWidth: 1 }
    ];

    if(isAB) {
        datasets.splice(1, 0, { label: 'Indoor B', data: simB, borderColor: '#10B981', tension: 0.4, pointRadius: 0 });
    }

        if(simulationChart) simulationChart.destroy();
    simulationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
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

// --- INIT ---
function init() {

    // Helper to attach listeners AND load data
    const attachAndLoad = (id) => {
        const el = document.getElementById(id);
        if(el) {
            loadInputFromLocalStorage(el); // Load on start
            el.addEventListener('input', (e) => {
                saveInputToLocalStorage(e.target);
                calculateAll();
            });
            el.addEventListener('change', (e) => {
                    saveInputToLocalStorage(e.target);
                    calculateAll();
            });
            // Specific handler for gain counts
            if(id.startsWith('gainCount')) {
                el.addEventListener('input', updateInternalGains);
            }
        }
    };

    // 1. Toggle Switch
    const toggle = document.getElementById('abToggle');
    if (toggle) {
        loadInputFromLocalStorage(toggle);
        toggle.addEventListener('change', (e) => {
            saveInputToLocalStorage(e.target);
            toggleABMode();
            calculateAll();
        });
    }

    // 2. Shape Selector (triggers dimension update)
    const shapeEl = document.getElementById('buildingShape');
    if (shapeEl) {
        loadInputFromLocalStorage(shapeEl);
        shapeEl.addEventListener('change', (e) => {
            saveInputToLocalStorage(e.target);
            updateDimensions();
        });
    }

    // 3. Update Dimensions first (to inject inputs)
    updateDimensions();

    // 4. Attach to Shared Inputs
    ['indoorTemp','outdoorTemp','groundTemp','simDuration','simLowTemp','simHighTemp','gainCountPerson','gainCountElectronics','gainCountLight'].forEach(attachAndLoad);

    // 5. Attach to Scenario Inputs
    ['_A','_B'].forEach(s => {
        ['insulationPreset','wallRValue','roofRValue','floorRValue','windowArea','windowU','doorArea','doorU','airSealing','massMaterial','slabThickness'].forEach(base => {
            attachAndLoad(base+s);
        });
    });

    // 6. Initial State Setters
    updateInternalGains();
    toggleABMode();
    calculateAll();

    // Menu
    const menuBtn = document.getElementById('menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            document.getElementById('menu-dropdown').classList.toggle('hidden');
        });
    }

    // Share Button Logic
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

    // Load from URL (High Priority)
    const loadedFromUrl = deserializeConfiguration();
    // If not loaded from URL, we rely on the localStorage loaded in attachAndLoad steps above.
    // However, deserializeConfiguration calls saveInputToLocalStorage, so we are good.
    // We just need to ensure calculateAll is called.
    if(loadedFromUrl) {
         // Re-run setup that depends on loaded values
         toggleABMode();
         updateDimensions(); // Ensure correct shape is rendered again if needed
         updateInternalGains();
         calculateAll();
    }
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', init);
}

// Export for testing
if (typeof module !== 'undefined') {
    module.exports = {
        calculateHeatLoss,
        calculateMassCapacity,
        getSurfaceAreas,
        getScenarioData,
        calculateAll,
        updateDimensions,
        toggleABMode,
        init
    };
}
