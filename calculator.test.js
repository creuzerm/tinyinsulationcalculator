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
    renderCustomGains
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

            <select id="simDuration"><option value="24" selected>24</option></select>
            <input type="number" id="simInternalGain" value="400">
            <input type="number" id="simLowTemp" value="25">
            <input type="number" id="simHighTemp" value="50">

             <!-- Gain Container -->
            <div id="gainInputsContainer"></div>
            <input type="hidden" id="customGainsData">

            <!-- Scenario A -->
            <select id="insulationPreset_A"><option value="">Select</option></select>
            <input type="number" id="wallRValue_A" value="10">
            <input type="number" id="roofRValue_A" value="10">
            <input type="number" id="floorRValue_A" value="10">
            <input type="number" id="windowArea_A" value="0">
            <input type="number" id="windowR_A" value="3">
            <input type="number" id="doorArea_A" value="0">
            <input type="number" id="doorR_A" value="3">
            <select id="airSealing_A"><option value="good" selected>Good</option></select>
            <select id="massMaterial_A"><option value="wood" selected>Wood</option></select>
            <input type="number" id="slabThickness_A" value="1">

            <!-- Result A -->
            <div id="resultLoss_A"></div>
            <div id="resultDrop_A"></div>
            <div id="breakdown_A"></div>

             <!-- Scenario B -->
             <div id="scenariosGrid">
                <div id="scenarioBoxB" class="hidden">
                    <select id="insulationPreset_B"><option value="">Select</option></select>
                    <input type="number" id="wallRValue_B" value="20">
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

            document.getElementById('wallRValue_A').value = 10;
            document.getElementById('roofRValue_A').value = 10;
            document.getElementById('floorRValue_A').value = 10;

            // No openings
            document.getElementById('windowArea_A').value = 0;
            document.getElementById('doorArea_A').value = 0;
            document.getElementById('airSealing_A').value = 'good';

            // Trigger calc
            calculateAll();

            // Verification
            // Floor: 200 sqft
            // Roof: 200 sqft
            // Walls: 2(20*10) + 2(10*10) = 400 + 200 = 600 sqft

            // Losses:
            // Wall: (600 / 10) * (70 - 20) = 60 * 50 = 3000
            // Roof: (200 / 10) * (70 - 20) = 20 * 50 = 1000
            // Floor: (200 / 10) * (70 - 50) = 20 * 20 = 400
            // Total: 4400

            const resultText = document.getElementById('resultLoss_A').textContent.replace(/,/g, '');
            expect(parseInt(resultText)).toBe(4400);
        });

        test('Calculates breakdown correctly', () => {
             document.getElementById('length').value = 20;
             document.getElementById('width').value = 10;
             document.getElementById('height').value = 10;
             document.getElementById('roofPitch').value = 0;

             document.getElementById('indoorTemp').value = 70;
             document.getElementById('outdoorTemp').value = 20;

             document.getElementById('wallRValue_A').value = 10;
             document.getElementById('roofRValue_A').value = 10;

             // Add a window
             document.getElementById('windowArea_A').value = 50; // 50 sqft window
             document.getElementById('windowR_A').value = 2; // R-2 (U=0.5)

             calculateAll();

             // Wall Area Total: 600. Net Wall: 550.
             // Wall Loss: (550 / 10) * 50 = 2750
             // Window Loss: (50 / 2) * 50 = 25 * 50 = 1250

             const breakdownHTML = document.getElementById('breakdown_A').innerHTML;
             expect(breakdownHTML).toContain('Wall');
             expect(breakdownHTML).toContain('2,750 BTU/hr');
             expect(breakdownHTML).toContain('Window');
             expect(breakdownHTML).toContain('1,250 BTU/hr');
        });
    });

    describe('Scenario B: Thermal Mass Capacity', () => {
        test('Calculates Thermal Battery correctly', () => {
             // Inputs from AGENTS.md Scenario B
            document.getElementById('length').value = 10;
            document.getElementById('width').value = 10;
            document.getElementById('height').value = 10;
            document.getElementById('roofPitch').value = 0;

            document.getElementById('massMaterial_A').value = 'concrete';
            document.getElementById('slabThickness_A').value = 6;

            // Trigger calc
            const areas = { floor: 100, total: 600 }; // derived from 10x10x10 box
            const data = { massMat: 'concrete', thickness: 6 };

            const capacity = calculateMassCapacity(areas, data);

            // Floor Capacity:
            // Vol = 100 * 0.5 = 50 ft3
            // Mass = 50 * 145 = 7250 lbs
            // Cap = 7250 * 0.2 = 1450 BTU/F

            // Structure Capacity:
            // Envelope = 600 sqft
            // Cap = 600 * 1.5 = 900 BTU/F

            // Total = 2350
            expect(capacity).toBe(2350);
        });
    });

    describe('Scenario C: A/B Comparison', () => {
        test('Verify independent scenario handling', () => {
            // Enable A/B
            const toggle = document.getElementById('abToggle');
            toggle.checked = true;
            toggleABMode();

            // Scenario A (Same as Shoebox)
            document.getElementById('length').value = 20;
            document.getElementById('width').value = 10;
            document.getElementById('height').value = 10;
            document.getElementById('roofPitch').value = 0;
            document.getElementById('indoorTemp').value = 70;
            document.getElementById('outdoorTemp').value = 20;
            document.getElementById('groundTemp').value = 50;

            document.getElementById('wallRValue_A').value = 10;
            document.getElementById('roofRValue_A').value = 10;
            document.getElementById('floorRValue_A').value = 10;
            document.getElementById('windowArea_A').value = 0;
            document.getElementById('doorArea_A').value = 0;
            document.getElementById('airSealing_A').value = 'good';

            // Scenario B: Change Wall R to 20
            document.getElementById('wallRValue_B').value = 20;
            document.getElementById('roofRValue_B').value = 10;
            document.getElementById('floorRValue_B').value = 10;
            document.getElementById('windowArea_B').value = 0;
            document.getElementById('doorArea_B').value = 0;
            document.getElementById('airSealing_B').value = 'good';

            calculateAll();

            // Check A
            const resultA = parseInt(document.getElementById('resultLoss_A').textContent.replace(/,/g, ''));
            expect(resultA).toBe(4400);

            // Check B
            // Wall Loss: (600 / 20) * 50 = 30 * 50 = 1500
            // Roof: 1000 (same)
            // Floor: 400 (same)
            // Total B: 2900
            const resultB = parseInt(document.getElementById('resultLoss_B').textContent.replace(/,/g, ''));
            expect(resultB).toBe(2900);
        });
    });

    describe('Core Variables Testing', () => {
        test('Low Temperature Day', () => {
            // Test with extreme low outdoor temp
             document.getElementById('length').value = 20;
            document.getElementById('width').value = 10;
            document.getElementById('height').value = 8;
            document.getElementById('roofPitch').value = 0;
            document.getElementById('indoorTemp').value = 70;
            document.getElementById('outdoorTemp').value = -10; // Low temp
            document.getElementById('groundTemp').value = 40;

            document.getElementById('wallRValue_A').value = 20;
            document.getElementById('roofRValue_A').value = 40;
            document.getElementById('floorRValue_A').value = 20;
            document.getElementById('windowArea_A').value = 0;
            document.getElementById('doorArea_A').value = 0;

            calculateAll();

            // Areas: Wall=2(20*8)+2(10*8)=320+160=480. Roof=200. Floor=200.
            // DeltaT Air = 80. DeltaT Ground = 30.

            // Losses:
            // Wall: (480/20)*80 = 24*80 = 1920
            // Roof: (200/40)*80 = 5*80 = 400
            // Floor: (200/20)*30 = 10*30 = 300
            // Total: 2620

            const resultA = parseInt(document.getElementById('resultLoss_A').textContent.replace(/,/g, ''));
            expect(resultA).toBe(2620);
        });

        test('High Temperature Day', () => {
             // Test where outdoor > indoor (Summer condition logic check)
             // The calculator currently uses Math.max(0, tIn - tOut) for heating load.
             // If outdoor is hotter, heating load should be 0.

            document.getElementById('length').value = 20;
            document.getElementById('width').value = 10;
            document.getElementById('indoorTemp').value = 70;
            document.getElementById('outdoorTemp').value = 90; // Hot!
            document.getElementById('groundTemp').value = 60;

            calculateAll();

            // DeltaT Air = max(0, 70-90) = 0
            // DeltaT Ground = max(0, 70-60) = 10

            // Should only have floor loss (cooling the house actually, but math max(0) prevents negative loss in heating calc?)
            // Wait, calculateHeatLoss uses: const totalLoss = (ua * deltaT_Air) + floorLoss;
            // And calculateAll uses: const dtAir = Math.max(0, tIn - tOut);

            // So if it's hot outside, air loss is 0.
            // Ground loss: (200/10)*10 = 200.

            const resultA = parseInt(document.getElementById('resultLoss_A').textContent.replace(/,/g, ''));
            // Depending on implementation, ground loss might be the only component.
            // Note: If ground is 60 and indoor 70, ground is still cooling the house (heat loss to ground).

            expect(resultA).toBeGreaterThan(0); // Should be some loss to ground

            // Verify specifically floor loss
            // Assuming defaults R=10 for floor
            // Area=200.
            // Loss = (200/10) * 10 = 200.

             // But wait, in the test setup above I didn't set R-values explicitly for this test, so it uses previous state or defaults?
             // It uses mock DOM state.
             // Let's reset R values to knowns
            document.getElementById('floorRValue_A').value = 10;
            calculateAll();

            // Recalculate result
             const resultA2 = parseInt(document.getElementById('resultLoss_A').textContent.replace(/,/g, ''));
             // The mock DOM persists between tests in the same describe block unless cleared?
             // beforeEach resets body innerHTML, so values reset to defaults in HTML string.
             // My HTML string has value="10" for floor R.

             expect(resultA2).toBe(200);
        });

        test('Warm Days Cool Nights (Variable Temp)', () => {
             // This mainly affects the simulation, not the peak heat loss calc.
             // We can check if simulation runs without error and produces values.

             document.getElementById('simLowTemp').value = 40;
             document.getElementById('simHighTemp').value = 80;
             document.getElementById('simDuration').value = 24;

             // Trigger calc which calls updateSimulation
             calculateAll();

             // Check if Chart was called
             expect(global.Chart).toHaveBeenCalled();
        });
    });

    describe('Surface Area Calculations', () => {
        test('Rectangle', () => {
            document.getElementById('buildingShape').value = 'rectangle';
            document.getElementById('length').value = 20;
            document.getElementById('width').value = 10;
            document.getElementById('height').value = 10;
            document.getElementById('roofPitch').value = 0;

            const areas = getSurfaceAreas();
            expect(areas.floor).toBe(200);
            expect(areas.wall).toBe(600);
            expect(areas.roof).toBe(200);
        });

        test('A-Frame', () => {
             document.getElementById('buildingShape').value = 'a-frame';
            document.getElementById('length').value = 20;
            document.getElementById('width').value = 10;
            document.getElementById('height').value = 10; // H=10, W/2=5.

            const areas = getSurfaceAreas();
            expect(areas.floor).toBe(200);

            // Slope = sqrt(5^2 + 10^2) = sqrt(25+100) = sqrt(125) approx 11.18
            const slope = Math.sqrt(125);
            const expectedRoof = 2 * 20 * slope; // 447.2
            expect(areas.roof).toBeCloseTo(expectedRoof);

            // Walls (Ends) = W * H = 10 * 10 = 100
            expect(areas.wall).toBe(100);
        });

        test('Gothic Arch', () => {
             document.getElementById('buildingShape').value = 'gothic-arch';
            document.getElementById('length').value = 20;
            document.getElementById('width').value = 10; // r = 5
            document.getElementById('springWallHeight').value = 2;

            const areas = getSurfaceAreas();
            expect(areas.floor).toBe(200);

            // Roof (Arch) = L * (PI * r) = 20 * (3.14159 * 5) = 100 * PI = 314.159
            expect(areas.roof).toBeCloseTo(314.16, 1);

            // Wall (Ends + Sides)
            // Sides = 2 * L * Spring = 2 * 20 * 2 = 80
            // Ends = PI * r^2 = PI * 25 = 78.54
            // Total Wall = 158.54
            expect(areas.wall).toBeCloseTo(158.54, 1);
        });
    });

});
