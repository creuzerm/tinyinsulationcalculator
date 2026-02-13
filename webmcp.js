// webmcp.js
// Loaded as module

(async function() {
    try {
        await import('https://esm.sh/@mcp-b/global');
    } catch (e) {
        console.warn("Failed to load @mcp-b/global, using local polyfill.", e);
    }

    // --- Polyfill for WebMCP API ---
    // This polyfill ensures the application works even if the @mcp-b/global package
    // fails to load or if the environment does not provide the modelContext.
    if (!window.navigator.modelContext) {
        window.navigator.modelContext = {
            // Store registered tools
            _tools: [],

            registerTool: function(tool) {
                this._tools.push(tool);

                // Expose to window.aiTools for testing/legacy support
                window.aiTools = window.aiTools || {};
                window.aiTools[tool.name] = tool.execute;
                window.aiTools[tool.name].description = tool.description;
                window.aiTools[tool.name].schema = tool.inputSchema;

                console.log(`WebMCP Tool Registered: ${tool.name}`);
            }
        };
    }

    // --- Tool Definitions ---

    const tools = [
        {
            name: "apply_preset",
            description: "Applies a construction preset (e.g. 'van_build', 'code_min') to a specific scenario (A or B). This updates wall assemblies, insulation values, and other defaults.",
            inputSchema: {
                type: "object",
                properties: {
                    suffix: {
                        type: "string",
                        enum: ["_A", "_B"],
                        description: "The scenario suffix. Use '_A' for Scenario A (Standard) or '_B' for Scenario B (Comparison)."
                    },
                    preset: {
                        type: "string",
                        enum: ["code_min", "high_perf", "passive_house", "van_build", "uninsulated"],
                        description: "The preset identifier to apply."
                    }
                },
                required: ["suffix", "preset"]
            },
            execute: async ({ suffix, preset }) => {
                const el = document.getElementById(`insulationPreset${suffix}`);
                if (el) {
                    el.value = preset;
                    // Trigger the existing logic
                    if (window.applyPreset) {
                        window.applyPreset(suffix);
                        return `Applied preset '${preset}' to Scenario ${suffix.replace('_', '')}.`;
                    }
                }
                throw new Error("Failed to apply preset. Element or function not found.");
            }
        },
        {
            name: "set_dimensions",
            description: "Sets the building shape and dimensions. Updates the UI and recalculates surface areas.",
            inputSchema: {
                type: "object",
                properties: {
                    shape: {
                        type: "string",
                        enum: ["rectangle", "a-frame", "gothic-arch", "cargo-van"],
                        description: "The shape of the building."
                    },
                    length: { type: "number", description: "Length in feet." },
                    width: { type: "number", description: "Width in feet." },
                    height: { type: "number", description: "Height (or interior height) in feet." },
                    roofPitch: { type: "number", description: "Roof pitch (rise/12). Only for 'rectangle'." }
                },
                required: ["shape", "length", "width", "height"]
            },
            execute: async (params) => {
                const shapeEl = document.getElementById('buildingShape');
                if (shapeEl) {
                    shapeEl.value = params.shape;
                    // Trigger update to render inputs
                    if (window.updateDimensions) {
                        window.updateDimensions();
                        // Now set values
                        if (params.length) document.getElementById('length').value = params.length;
                        if (params.width) document.getElementById('width').value = params.width;
                        if (params.height) document.getElementById('height').value = params.height;
                        if (params.roofPitch && document.getElementById('roofPitch')) {
                            document.getElementById('roofPitch').value = params.roofPitch;
                        }

                        // Recalculate
                        if (window.calculateAll) window.calculateAll();

                        return `Dimensions updated: ${params.shape} ${params.length}x${params.width}x${params.height}.`;
                    }
                }
                throw new Error("Failed to set dimensions.");
            }
        },
        {
            name: "run_simulation",
            description: "Runs the passive thermal simulation for a specified duration and returns the temperature data series.",
            inputSchema: {
                type: "object",
                properties: {
                    duration: { type: "number", description: "Duration in hours (e.g. 24 or 168)." },
                    lowTemp: { type: "number", description: "Daily low temperature (°F)." },
                    highTemp: { type: "number", description: "Daily high temperature (°F)." }
                },
                required: ["duration"]
            },
            execute: async (params) => {
                // Update simulation inputs if provided
                if (params.duration) document.getElementById('simDuration').value = params.duration;
                if (params.lowTemp) document.getElementById('simLowTemp').value = params.lowTemp;
                if (params.highTemp) document.getElementById('simHighTemp').value = params.highTemp;

                // Run calculation
                if (window.calculateAll && window.calculateSimulationData) {
                    const results = window.calculateAll(); // Get current heat loss/cap data

                    if (!results) return "Calculation failed (invalid areas).";

                    const simData = window.calculateSimulationData({
                        isAB: results.isAB,
                        lossA: results.scenarioA.loss,
                        lossB: results.scenarioB ? results.scenarioB.loss : null,
                        capA: results.scenarioA.capacity,
                        capB: results.scenarioB ? results.scenarioB.capacity : null,
                        tIn: results.temperatures.tIn,
                        tGround: results.temperatures.tGround,
                        duration: parseInt(document.getElementById('simDuration').value),
                        low: parseFloat(document.getElementById('simLowTemp').value),
                        high: parseFloat(document.getElementById('simHighTemp').value),
                        iGain: parseFloat(document.getElementById('simInternalGain').value),
                        buildingShape: document.getElementById('buildingShape').value,
                        vehicleColor: document.getElementById('vehicleColor').value
                    });

                    return simData;
                }
                throw new Error("Simulation functions not available.");
            }
        },
        {
            name: "get_detailed_results",
            description: "Retrieves the current calculated heat loss results for all active scenarios.",
            inputSchema: { type: "object", properties: {} },
            execute: async (params) => {
                if (window.calculateAll) {
                    return window.calculateAll();
                }
                throw new Error("Calculation function not available.");
            }
        }
    ];

    // --- Register Tools ---
    // Ensure modelContext is available
    if (window.navigator.modelContext) {
        tools.forEach(tool => {
            window.navigator.modelContext.registerTool(tool);
        });
    }

})();
