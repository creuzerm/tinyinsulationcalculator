/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Helper to load script content
const loadScript = (filename) => {
    return fs.readFileSync(path.resolve(__dirname, filename), 'utf8');
};

describe('WebMCP Integration', () => {
    let calculatorScript;
    let webmcpScript;

    beforeAll(() => {
        calculatorScript = loadScript('calculator.js');
        webmcpScript = loadScript('webmcp.js');
    });

    beforeEach(() => {
        // Reset DOM
        document.documentElement.innerHTML = `
            <html>
            <body>
                <input id="insulationPreset_A" value="">
                <input id="insulationPreset_B" value="">
                <input id="buildingShape" value="rectangle">
                <div id="dimensionInputs"></div>
                <input id="length" value="10">
                <input id="width" value="10">
                <input id="height" value="8">
                <input id="roofPitch" value="0">
                <input id="indoorTemp" value="70">
                <input id="outdoorTemp" value="20">
                <input id="groundTemp" value="50">
                <input id="simDuration" value="24">
                <input id="simInternalGain" value="0">
                <input id="simLowTemp" value="20">
                <input id="simHighTemp" value="30">
                <input id="vehicleColor" value="light">
                <input id="abToggle" type="checkbox">

                <!-- Inputs needed for calculator.js to not crash -->
                <input id="wallAssemblyType_A" value="stick">
                <select id="wallStudSize_A"><option value="2x4">2x4</option></select>
                <select id="wallStudMaterial_A"><option value="wood">Wood</option></select>
                <select id="wallStudSpacing_A"><option value="16">16</option></select>
                <select id="wallCavityInsulation_A"><option value="fiberglass_batt">Fiberglass</option></select>
                <input id="wallContinuousInsulation_A" value="0">
                <input id="roofRValue_A" value="10">
                <input id="floorRValue_A" value="10">
                <input id="windowArea_A" value="0">
                <input id="windowR_A" value="1">
                <input id="doorArea_A" value="0">
                <input id="doorR_A" value="1">
                <input id="skirtR_A" value="0">
                <input id="skirtHeight_A" value="0">
                <input id="slabThickness_A" value="4">
                <select id="airSealing_A"><option value="poor">Poor</option></select>
                <select id="massMaterial_A"><option value="wood">Wood</option></select>
                <select id="glazingPreset_A"><option value="custom">Custom</option></select>

                <!-- B -->
                <input id="wallAssemblyType_B" value="stick">
                <select id="wallStudSize_B"><option value="2x4">2x4</option></select>
                <select id="wallStudMaterial_B"><option value="wood">Wood</option></select>
                <select id="wallStudSpacing_B"><option value="16">16</option></select>
                <select id="wallCavityInsulation_B"><option value="fiberglass_batt">Fiberglass</option></select>
                <input id="wallContinuousInsulation_B" value="0">
                <input id="roofRValue_B" value="10">
                <input id="floorRValue_B" value="10">
                <input id="windowArea_B" value="0">
                <input id="windowR_B" value="1">
                <input id="doorArea_B" value="0">
                <input id="doorR_B" value="1">
                <input id="skirtR_B" value="0">
                <input id="skirtHeight_B" value="0">
                <input id="slabThickness_B" value="4">
                <select id="airSealing_B"><option value="poor">Poor</option></select>
                <select id="massMaterial_B"><option value="wood">Wood</option></select>
                <select id="glazingPreset_B"><option value="custom">Custom</option></select>

                <canvas id="heatLossChart"></canvas>
                <canvas id="simulationChart"></canvas>
                <canvas id="breakdownChart"></canvas>

                <span id="resultLoss_A"></span>
                <span id="resultDrop_A"></span>
                <div id="breakdown_A"></div>
                <span id="resultLoss_B"></span>
                <span id="resultDrop_B"></span>
                <div id="breakdown_B"></div>

                <!-- Simulation Inputs Containers -->
                <div id="scenariosGrid">
                    <div id="scenarioBoxB" class="hidden"></div>
                </div>
                <div id="resultsGrid">
                    <div id="resultBoxB" class="hidden"></div>
                </div>
                <h3 id="headerA"></h3>
                <h3 id="resultHeaderA"></h3>
                <div class="lg:col-span-2-dynamic"></div>
            </body>
            </html>
        `;

        // Mock Fetch
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ occupants: [], appliances: [] }),
            })
        );

        // Mock Chart.js
        window.Chart = jest.fn().mockImplementation(() => ({
            destroy: jest.fn()
        }));

        // Mock window.aiTools if not present (WebMCP polyfill should create it)
        delete window.aiTools;
        delete window.navigator.modelContext;

        // Execute Calculator Script (to set up globals)
        // We rely on the module export for functions, but we must assign them to window
        // to mimic browser behavior for webmcp.js which expects them on window.
        const calculator = require('./calculator.js');
        Object.assign(window, calculator);

        // Initialize calculator
        window.init();

        // Execute WebMCP Script
        eval(webmcpScript);
    });

    test('window.navigator.modelContext should be defined', () => {
        expect(window.navigator.modelContext).toBeDefined();
        expect(typeof window.navigator.modelContext.provideContext).toBe('function');
    });

    test('tools should be registered in window.aiTools', () => {
        expect(window.aiTools).toBeDefined();
        expect(window.aiTools['apply_preset']).toBeDefined();
        expect(window.aiTools['set_dimensions']).toBeDefined();
        expect(window.aiTools['run_simulation']).toBeDefined();
        expect(window.aiTools['get_results']).toBeDefined();
    });

    test('apply_preset tool should update DOM and trigger calculation', () => {
        const tool = window.aiTools['apply_preset'];
        tool({ suffix: '_A', preset: 'van_build' }, {});

        const presetVal = document.getElementById('insulationPreset_A').value;
        expect(presetVal).toBe('van_build');
        // Check if roof R-value updated (van_build sets it to 12)
        const roofR = document.getElementById('roofRValue_A').value;
        expect(roofR).toBe('12');
    });

    test('set_dimensions tool should update DOM', () => {
        const tool = window.aiTools['set_dimensions'];
        tool({ shape: 'cargo-van', length: 20, width: 8, height: 7 }, {});

        expect(document.getElementById('buildingShape').value).toBe('cargo-van');
        expect(document.getElementById('length').value).toBe('20');
    });

    test('run_simulation tool should return data', () => {
        const tool = window.aiTools['run_simulation'];
        // Ensure valid inputs first
        window.aiTools['set_dimensions']({ shape: 'rectangle', length: 10, width: 10, height: 10 }, {});

        const result = tool({ duration: 24, lowTemp: 10, highTemp: 20 }, {});
        expect(result).toBeDefined();
        expect(result.simA.length).toBeGreaterThan(20);
        expect(result.labels).toBeDefined();
    });

    test('get_results tool should return result object', () => {
        const tool = window.aiTools['get_results'];
        // Set up valid state
        window.aiTools['set_dimensions']({ shape: 'rectangle', length: 10, width: 10, height: 10 }, {});

        const result = tool({}, {});
        expect(result).toBeDefined();
        expect(result.scenarioA).toBeDefined();
        expect(result.scenarioA.loss.totalLoss).toBeGreaterThan(0);
    });
});
