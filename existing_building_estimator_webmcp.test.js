
const fs = require('fs');
const path = require('path');

// Mock DOM
const documentMock = {
    getElementById: jest.fn(),
    querySelector: jest.fn(),
    createElement: jest.fn(),
    addEventListener: jest.fn(),
};
global.document = documentMock;
global.window = {
    addEventListener: jest.fn((event, cb) => {
        console.log(`addEventListener called for ${event}`);
        if (event === 'load') {
            try {
                cb();
                console.log("load callback executed");
            } catch (e) {
                console.error("Error in load callback:", e);
            }
        }
    }),
    location: { search: '', origin: 'http://localhost', pathname: '/' },
    navigator: {
        modelContext: {
            registerTool: jest.fn(() => console.log("registerTool called"))
        }
    },
    localStorage: {
        getItem: () => { console.log("localStorage.getItem called"); return null; },
        setItem: () => { },
        removeItem: () => { },
    },
    confirm: () => true,
    alert: () => { },
};
global.localStorage = global.window.localStorage;
global.confirm = global.window.confirm;
global.alert = global.window.alert;

// Mock Elements
const mockElements = {};
const getMockElement = (id) => {
    if (!mockElements[id]) {
        mockElements[id] = { value: '', textContent: '', classList: { remove: jest.fn(), add: jest.fn() } };
    }
    return mockElements[id];
};

documentMock.getElementById.mockImplementation(getMockElement);
documentMock.querySelector.mockImplementation((selector) => {
    if (selector.includes('data-model')) {
        const id = selector.match(/data-model="(.+?)"/)[1];
        return getMockElement(id);
    }
    return null;
});


// Load script
const scriptContent = fs.readFileSync(path.resolve(__dirname, 'existing_building_estimator.js'), 'utf8');
eval(scriptContent); // Evaluate script in mocked environment

describe('WebMCP Tool Registration', () => {
    test('estimate_r_value tool is registered', () => {
        const registerTool = global.window.navigator.modelContext.registerTool;
        expect(registerTool).toHaveBeenCalled();
        const tool = registerTool.mock.calls.find(call => call[0].name === 'estimate_r_value')[0];
        expect(tool).toBeDefined();
        expect(tool.description).toContain('Estimate the R-value');
        expect(tool.inputSchema.properties.envelope).toBeDefined();
        expect(tool.inputSchema.properties.surfaceTemperatures).toBeDefined();
    });

    test('estimate_r_value execute maps arguments to DOM', async () => {
        const registerTool = global.window.navigator.modelContext.registerTool;
        const tool = registerTool.mock.calls.find(call => call[0].name === 'estimate_r_value')[0];

        const args = {
            spaceDimensions: { length: 20, width: 10, height: 8 },
            temperatures: { indoor: 70, outdoor: 30 },
            envelope: { achRate: 0.5, areaWindows: 30, areaOtherWallsCeilings: 600, areaFloor: 200 }
        };

        // Suppress calculateRValue error (or mock it if extracted)
        // Since calculateRValue is internal to the eval'd script, we can't easily mock it unless we intercept.
        // However, we can check if the DOM elements were set *before* it runs/fails.

        try {
            await tool.execute(args);
        } catch (e) {
            // Ignore calc errors, we just want to check input mapping
        }

        expect(mockElements['spaceLength'].value).toBe(20);
        expect(mockElements['tIndoorAir'].value).toBe(70);
        expect(mockElements['achRate'].value).toBe(0.5);
        expect(mockElements['areaWindows'].value).toBe(30);
    });
});
