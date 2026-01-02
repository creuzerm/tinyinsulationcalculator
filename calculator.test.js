const {
    calculateHeatLoss,
    calculateMassCapacity,
    getSurfaceAreas,
    getScenarioData,
    calculateAll,
    updateDimensions,
    toggleABMode,
    init,
    loadGainData,
    calculateDetailedGains,
    renderGainTable,
    addCustomGain,
    removeCustomGain,
    updateCustomGain,
    syncCustomGainsFromDOM,
    renderCustomGains,
    calculateEffectiveR,
    applyPreset
} = require('./calculator');

describe('Tiny Home Heat Loss Calculator', () => {

    // --- SETUP MOCK DOM ---
    beforeEach(() => {
        document.body.innerHTML = `
            <input type="checkbox" id="abToggle">
            <select id="buildingShape">
                <option value="rectangle" selected>Rectangle</option>
                <option value="a-frame">A-Frame</option>
                <option value="gothic-arch">Gothic Arch</option>
            </select>
            <div id="dimensionInputs">
                <!-- Will be populated by JS -->
                 <div><label>Length</label><input type="number" id="length" value="20"></div>
                 <div><label>Width</label><input type="number" id="width" value="10"></div>
                 <div><label>Height</label><input type="number" id="height" value="8"></div>
                 <div><label>Pitch</label><input type="number" id="roofPitch" value="4"></div>
                 <div><label>Spring Ht</label><input type="number" id="springWallHeight" value="2"></div>
            </div>

            <!-- Shared -->
            <input type="number" id="indoorTemp" value="70">
            <input type="number" id="outdoorTemp" value="10">
            <input type="number" id="groundTemp" value="50">
            <select id="vehicleColor"><option value="light">Light</option></select>

            <select id="simDuration"><option value="24" selected>24</option></select>
            <input type="number" id="simInternalGain" value="400">
            <input type="number" id="simLowTemp" value="25">
            <input type="number" id="simHighTemp" value="50">

             <!-- Gain Container -->
            <div id="gainInputsContainer"></div>
            <input type="hidden" id="customGainsData">

            <!-- Scenario A -->
            <select id="insulationPreset_A"><option value="">Select</option></select>

            <select id="wallAssemblyType_A"><option value="stick">Stick</option><option value="mass">Mass</option></select>
            <div id="group_stick_A">
                <select id="wallStudMaterial_A">
                    <option value="wood">Wood</option>
                    <option value="steel">Steel</option>
                    <option value="van_ribs">Van Ribs</option>
                </select>
                <select id="wallStudSize_A"><option value="2x4">2x4</option></select>
                <select id="wallStudSpacing_A"><option value="16">16</option><option value="24">24</option></select>
                <select id="wallCavityInsulation_A">
                    <option value="fiberglass_batt">Fiberglass</option>
                    <option value="thinsulate_sm600">Thinsulate</option>
                </select>
                <input type="number" id="wallContinuousInsulation_A" value="0">
            </div>
            <div id="group_mass_A">
                <select id="wallMassMaterial_A"><option value="cmu_standard">CMU</option></select>
                <input type="number" id="wallMassThickness_A" value="8">
                <input type="number" id="wallMassInsulation_A" value="0">
            </div>

            <input type="number" id="roofRValue_A" value="10">
            <input type="number" id="floorRValue_A" value="10">
            <input type="number" id="windowArea_A" value="0">
            <input type="number" id="windowR_A" value="3">
            <input type="number" id="doorArea_A" value="0">
            <input type="number" id="doorR_A" value="3">
            <select id="airSealing_A"><option value="good" selected>Good</option></select>
            <select id="massMaterial_A">
                <option value="wood" selected>Wood</option>
                <option value="metal">Metal</option>
            </select>
            <input type="number" id="slabThickness_A" value="1">

            <!-- Result A -->
            <div id="resultLoss_A"></div>
            <div id="resultDrop_A"></div>
            <div id="breakdown_A"></div>

             <!-- Scenario B -->
             <div id="scenariosGrid">
                <div id="scenarioBoxB" class="hidden">
                    <select id="insulationPreset_B"><option value="">Select</option></select>

                    <select id="wallAssemblyType_B"><option value="stick">Stick</option></select>
                    <div id="group_stick_B">
                        <select id="wallStudMaterial_B"><option value="wood">Wood</option><option value="steel">Steel</option></select>
                        <select id="wallStudSize_B"><option value="2x4">2x4</option></select>
                        <select id="wallStudSpacing_B"><option value="16">16</option></select>
                        <select id="wallCavityInsulation_B"><option value="fiberglass_batt">Fiberglass</option></select>
                        <input type="number" id="wallContinuousInsulation_B" value="0">
                    </div>
                    <div id="group_mass_B">
                        <select id="wallMassMaterial_B"><option value="cmu_standard">CMU</option></select>
                        <input type="number" id="wallMassThickness_B" value="8">
                        <input type="number" id="wallMassInsulation_B" value="0">
                    </div>

                    <input type="number" id="roofRValue_B" value="10">
                    <input type="number" id="floorRValue_B" value="10">
                    <input type="number" id="windowArea_B" value="0">
                    <input type="number" id="windowR_B" value="3">
                    <input type="number" id="doorArea_B" value="0">
                    <input type="number" id="doorR_B" value="3">
                    <select id="airSealing_B"><option value="good" selected>Good</option></select>
                    <select id="massMaterial_B"><option value="wood" selected>Wood</option></select>
                    <input type="number" id="slabThickness_B" value="1">
                </div>
            </div>

             <!-- Result B -->
            <div id="resultsGrid">
                <div id="resultBoxB" class="hidden">
                    <div id="resultLoss_B"></div>
                    <div id="resultDrop_B"></div>
                    <div id="breakdown_B"></div>
                </div>
            </div>

            <div id="headerA"></div>
            <div id="resultHeaderA"></div>

            <!-- Charts (Mock Canvas) -->
            <canvas id="heatLossChart"></canvas>
            <canvas id="simulationChart"></canvas>
            <canvas id="breakdownChart"></canvas>
        `;

        // Mock Chart.js
        global.Chart = jest.fn(() => ({
            destroy: jest.fn()
        }));

        // Mock Fetch
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({
                    occupants: [
                        { id: 'person', name: 'Person', watts_sensible: 75, duty_cycle_hours: 24, default_qty: 1 }
                    ],
                    appliances: [
                        { id: 'fridge', name: 'Fridge', watts_sensible: 45, duty_cycle_hours: 8, default_qty: 0 }
                    ]
                }),
            })
        );

        // Mock LocalStorage
        const localStorageMock = (function() {
            let store = {};
            return {
                getItem: function(key) {
                    return store[key] || null;
                },
                setItem: function(key, value) {
                    store[key] = value.toString();
                },
                clear: function() {
                    store = {};
                }
            };
        })();
        Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // --- TESTS ---

    describe('Internal Gains Calculator', () => {
        test('loadGainData fetches and renders table', async () => {
            await loadGainData();

            expect(global.fetch).toHaveBeenCalledWith('internal_gains.json');

            const container = document.getElementById('gainInputsContainer');
            // Should contain Person and Fridge
            expect(container.innerHTML).toContain('Person');
            expect(container.innerHTML).toContain('Fridge');
            expect(container.innerHTML).toContain('Custom / Additional Sources');
        });

        test('calculateDetailedGains computes correctly', async () => {
             await loadGainData();

             // Person: 1 * 75W * 24h = 1800Wh / 24 = 75W.
             // Fridge: 0 * 45W * 8h = 0.
             // Total = 75W * 3.412 = 255.9 BTU/hr.

             // Initial calc is triggered by loadGainData
             let simInput = document.getElementById('simInternalGain');
             expect(parseInt(simInput.value)).toBe(256); // 255.9 rounded

             // Update Fridge Count
             // Note: loadGainData generates IDs like gain_qty_fridge
             const fridgeInput = document.getElementById('gain_qty_fridge');
             fridgeInput.value = 1;

             // Trigger update manually (event listener not auto-bound in Jest unless dispatched)
             calculateDetailedGains();

             // Fridge: 1 * 45 * 8 = 360Wh / 24 = 15W.
             // Total W = 75 + 15 = 90W.
             // BTU = 90 * 3.412 = 307.08

             expect(parseInt(simInput.value)).toBe(307);
        });

        test('Custom Gains Management', async () => {
            await loadGainData(); // setup structure

            // Add
            addCustomGain(); // Default: New Source, 100W, 24h, 1qty

            // Rendered?
            const container = document.getElementById('gainInputsContainer');
            expect(container.innerHTML).toContain('New Source');

            // Calc?
            // Base (Person 1) = 256
            // Custom: 100W * 24 * 1 = 2400Wh / 24 = 100W. 100 * 3.412 = 341.2
            // Total = 255.9 + 341.2 = 597.1 -> 597

            let simInput = document.getElementById('simInternalGain');
            expect(parseInt(simInput.value)).toBe(597);

            // Update
            // Custom gains array is index 0.
            updateCustomGain(0, 'watts', 200);

            // 200W -> 682.4 BTU
            // Total = 255.9 + 682.4 = 938.3 -> 938
            expect(parseInt(simInput.value)).toBe(938);

            // Remove
            removeCustomGain(0);
            expect(container.innerHTML).not.toContain('New Source');
            expect(parseInt(simInput.value)).toBe(256); // Back to base
        });

        test('Custom Gains Persistence', () => {
            // Simulate saved data in hidden input
            const savedData = [{ name: 'Test Stove', watts: 1000, duty: 5, qty: 1 }];
            const hidden = document.getElementById('customGainsData');
            hidden.value = JSON.stringify(savedData);

            // Sync
            syncCustomGainsFromDOM();

            // Render
            renderCustomGains();

            const container = document.getElementById('gainInputsContainer');
            expect(container.innerHTML).toContain('Test Stove');

            // Calculate should include it
            // 1000 * 5 * 1 = 5000 / 24 = 208.33 W
            // 208.33 * 3.412 = 710.8
            // Note: gainData is null so standard items aren't calculated, returns only custom total

            calculateDetailedGains();
            let simInput = document.getElementById('simInternalGain');
            expect(parseInt(simInput.value)).toBe(711);
        });
    });

    describe('Effective R-Value Calculation', () => {
        test('Stick Frame: 2x4 Wood with Fiberglass', () => {
            const assembly = {
                type: 'stick',
                studSize: '2x4',
                studMaterial: 'wood',
                spacing: '16',
                cavityInsulation: 'fiberglass_batt',
                continuousInsulation: '0'
            };
            const r = calculateEffectiveR(assembly);
            expect(r).toBeCloseTo(9.9, 1);
        });

        test('Stick Frame: 2x6 Wood with Mineral Wool + CI', () => {
            const assembly = {
                type: 'stick',
                studSize: '2x6',
                studMaterial: 'wood',
                spacing: '24',
                cavityInsulation: 'mineral_wool',
                continuousInsulation: '5'
            };
            const r = calculateEffectiveR(assembly);
            expect(r).toBeCloseTo(22.0, 0);
        });

        test('Stick Frame: 2x4 Steel with Fiberglass', () => {
            // R-13 Cavity. Factor 0.46.
            // Effective Cavity = 13 * 0.46 = 5.98
            // Plus Series Layers: Air Films (0.85) + Gyp/Sheathing (1.0) = 1.85
            // Total = 5.98 + 1.85 = 7.83
            // Significantly less than Wood 2x4 (9.9)

            const assembly = {
                type: 'stick',
                studSize: '2x4',
                studMaterial: 'steel',
                spacing: '16',
                cavityInsulation: 'fiberglass_batt',
                continuousInsulation: '0'
            };
            // 3.5 * 3.2 = 11.2 (Nominal Cavity)
            // 11.2 * 0.46 = 5.152
            // Total = 5.152 + 1.85 = 7.002
            // Note: My manual calc assumed R-13 batt, code uses depth*R_per_inch.
            // 3.5 * 3.2 = 11.2.

            const r = calculateEffectiveR(assembly);
            expect(r).toBeCloseTo(7.0, 1);
        });

        test('Mass Wall: Aircrete', () => {
            const assembly = {
                type: 'mass',
                massMaterial: 'aircrete',
                massThickness: '8',
                massInsulation: '0'
            };
            const r = calculateEffectiveR(assembly);
            expect(r).toBeCloseTo(21.05, 1);
        });
    });

    describe('Mass Capacity Calculation', () => {
        test('Calculates Metal Floor Mass Correctly', () => {
             // Area = 100 sqft. Thickness = 0.1 inch.
             // Volume = 100 * (0.1/12) = 0.8333 ft3
             // Mass = 0.8333 * 490 = 408.33 lbs
             // Capacity = 408.33 * 0.12 = 49.0 BTU/F

             // Structure Baseline = Total Envelope * 1.5
             // Assume box 10x10x10. Floor=100. Roof=100. Walls=400. Total=600.
             // Baseline = 600 * 1.5 = 900.

             // Total = 949.0

             const areas = { floor: 100, total: 600 };
             const data = { massMat: 'metal', thickness: 0.1 };

             const cap = calculateMassCapacity(areas, data);
             expect(cap).toBeCloseTo(949.0, 0);
        });
    });

    describe('Scenario A: The "Shoebox" Baseline', () => {
        test('Calculates basic Heat Loss (UA) correctly', () => {
             // Inputs from AGENTS.md Scenario A
            document.getElementById('length').value = 20;
            document.getElementById('width').value = 10;
            document.getElementById('height').value = 10;
            document.getElementById('roofPitch').value = 0; // Flat roof for simplicity as per doc

            document.getElementById('indoorTemp').value = 70;
            document.getElementById('outdoorTemp').value = 20;
            document.getElementById('groundTemp').value = 50;

            // Scenario A Setup (Legacy R=10 wall equivalence)
            document.getElementById('wallAssemblyType_A').value = 'stick';
            document.getElementById('wallStudSize_A').value = '2x4';
            document.getElementById('wallStudMaterial_A').value = 'wood';
            document.getElementById('wallStudSpacing_A').value = '16';
            document.getElementById('wallCavityInsulation_A').value = 'fiberglass_batt';
            document.getElementById('wallContinuousInsulation_A').value = '0';

            document.getElementById('roofRValue_A').value = 10;
            document.getElementById('floorRValue_A').value = 10;

            // No openings
            document.getElementById('windowArea_A').value = 0;
            document.getElementById('doorArea_A').value = 0;
            document.getElementById('airSealing_A').value = 'good';

            // Trigger calc
            calculateAll();

            const resultText = document.getElementById('resultLoss_A').textContent.replace(/,/g, '');
            const val = parseInt(resultText);
            expect(val).toBeGreaterThan(4350);
            expect(val).toBeLessThan(4500);
        });

        test('Applies Van Build Preset correctly', () => {
             // Setup Scenario A
             const preset = document.getElementById('insulationPreset_A');

             const opt = document.createElement('option');
             opt.value = 'van_build';
             preset.appendChild(opt);
             preset.value = 'van_build';

             // Setup other inputs that applyPreset reads/writes
             document.getElementById('wallStudMaterial_A').value = 'wood'; // Should change to van_ribs

             applyPreset('_A');

             expect(document.getElementById('wallAssemblyType_A').value).toBe('stick');
             expect(document.getElementById('wallStudSize_A').value).toBe('2x4');
             expect(document.getElementById('wallStudMaterial_A').value).toBe('van_ribs');
             expect(document.getElementById('wallCavityInsulation_A').value).toBe('thinsulate_sm600');
             expect(document.getElementById('roofRValue_A').value).toBe('12');
             expect(document.getElementById('floorRValue_A').value).toBe('5');

             expect(document.getElementById('massMaterial_A').value).toBe('metal');
             expect(document.getElementById('slabThickness_A').value).toBe('0.1');
        });
    });
});
