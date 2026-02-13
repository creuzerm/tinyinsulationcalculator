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

        // Strip import statements for JSDOM eval
        webmcpScript = webmcpScript.replace(/^import .*$/gm, '// import removed for test');
        webmcpScript = webmcpScript.replace(/await import\(.*\);/g, '// dynamic import removed');
    });

    beforeEach(() => {
        // Reset DOM
        document.documentElement.innerHTML = `
            <html>
            <body>
                <form id="sharedSettings">
                   <select id="buildingShape">
                       <option value="rectangle">Rectangle</option>
                       <option value="a-frame">A-Frame</option>
                       <option value="gothic-arch">Gothic Arch</option>
                       <option value="cargo-van">Cargo Van</option>
                   </select>
                   <div id="dimensionInputs"></div>
                   <input id="indoorTemp" value="70">
                   <input id="outdoorTemp" value="20">
                   <input id="groundTemp" value="50">
                   <select id="vehicleColor"><option value="light">Light</option></select>
                </form>

                <form id="simulationSettings">
                   <input id="simDuration" value="24">
                   <input id="simInternalGain" value="0">
                   <input id="simLowTemp" value="20">
                   <input id="simHighTemp" value="30">
                </form>

                <input id="abToggle" type="checkbox">

                <!-- Scenario A Inputs -->
                <input id="insulationPreset_A" value="">
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

                <!-- Scenario B Inputs -->
                <input id="insulationPreset_B" value="">
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

                <!-- Helper elements for UI toggles -->
                <div id="scenariosGrid">
                    <div id="scenarioBoxB" class="hidden"></div>
                </div>
                <div id="resultsGrid">
                    <div id="resultBoxB" class="hidden"></div>
                </div>
                <h3 id="headerA"></h3>
                <h3 id="resultHeaderA"></h3>
                <div class="lg:col-span-2-dynamic"></div>

                <!-- Helper for templates -->
                <div id="dimensionInputs"></div>
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
        // Also need to handle module.exports from calculator.js being assigned to window
        const calculator = require('./calculator.js');
        Object.assign(window, calculator);

        // Initialize calculator
        window.init();

        // Execute WebMCP Script
        // Since it might be an IIFE, just eval it
        eval(webmcpScript);
    });

    test('window.navigator.modelContext should be defined and have registerTool', () => {
        expect(window.navigator.modelContext).toBeDefined();
        expect(typeof window.navigator.modelContext.registerTool).toBe('function');
    });

    test('tools should be registered in window.aiTools', () => {
        expect(window.aiTools).toBeDefined();
        expect(window.aiTools['apply_preset']).toBeDefined();
        expect(window.aiTools['set_dimensions']).toBeDefined();
        expect(window.aiTools['run_simulation']).toBeDefined();
        expect(window.aiTools['get_detailed_results']).toBeDefined();
    });

    test('apply_preset tool should update DOM and trigger calculation', async () => {
        const tool = window.aiTools['apply_preset'];
        await tool({ suffix: '_A', preset: 'van_build' }, {});

        const presetVal = document.getElementById('insulationPreset_A').value;
        expect(presetVal).toBe('van_build');
        // Check if roof R-value updated (van_build sets it to 12)
        const roofR = document.getElementById('roofRValue_A').value;
        expect(roofR).toBe('12');
    });

    test('set_dimensions tool should update DOM', async () => {
        const tool = window.aiTools['set_dimensions'];
        await tool({ shape: 'cargo-van', length: 20, width: 8, height: 7 }, {});

        expect(document.getElementById('buildingShape').value).toBe('cargo-van');
        expect(document.getElementById('length').value).toBe('20');
    });

    test('run_simulation tool should return data', async () => {
        const tool = window.aiTools['run_simulation'];
        // Ensure valid inputs first
        await window.aiTools['set_dimensions']({ shape: 'rectangle', length: 10, width: 10, height: 10 }, {});

        const result = await tool({ duration: 24, lowTemp: 10, highTemp: 20 }, {});
        expect(result).toBeDefined();
        expect(result.simA.length).toBeGreaterThan(20);
        expect(result.labels).toBeDefined();
    });

    test('get_detailed_results tool should return result object', async () => {
        const tool = window.aiTools['get_detailed_results'];
        // Set up valid state
        await window.aiTools['set_dimensions']({ shape: 'rectangle', length: 10, width: 10, height: 10 }, {});

        const result = await tool({}, {});
        expect(result).toBeDefined();
        expect(result.scenarioA).toBeDefined();
        expect(result.scenarioA.loss.totalLoss).toBeGreaterThan(0);
    });
});
