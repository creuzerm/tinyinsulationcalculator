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

                    // Calculate summary stats
                    const lossA = results.scenarioA.loss;
                    const ua = lossA.ua;
                    const uaFloor = lossA.uaFloor;
                    const tIn = results.temperatures.tIn;
                    const tGround = results.temperatures.tGround;
                    
                    // Duration from params or default to value in DOM
                    const duration = params.duration || parseInt(document.getElementById('simDuration').value) || 24;
                    const low = parseFloat(document.getElementById('simLowTemp').value) || 15;
                    const high = parseFloat(document.getElementById('simHighTemp').value) || 35;
                    const avgTemp = (low + high) / 2;

                    const peakDeltaT = Math.max(0, tIn - low);
                    const peakHeatingLoadBTUPerHour = Math.round((ua * peakDeltaT) + (uaFloor * Math.max(0, tIn - tGround)));

                    const avgDeltaT = Math.max(0, tIn - avgTemp);
                    const averageDailyHeatLossBTU = Math.round(((ua * avgDeltaT) + (uaFloor * Math.max(0, tIn - tGround))) * 24);

                    const annualHeatingDegreeHours = Math.round(duration * avgDeltaT);
                    
                    const summaryText = `Simulation run for ${duration} hours. Peak heating load is ${peakHeatingLoadBTUPerHour} BTU/hr. Average daily heat loss is ${averageDailyHeatLossBTU} BTU.`;

                    return {
                        ...simData,
                        summaryStats: {
                            peakHeatingLoadBTUPerHour,
                            annualHeatingDegreeHours,
                            averageDailyHeatLossBTU,
                            summary: summaryText
                        }
                    };
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
        },
        {
            name: "calculate_solar_kiln_performance",
            description: "Calculates solar firewood kiln drying time, glazing optical/thermal R-values, psychrometric air buoyancy, and financial ROI against a central air heat pump.",
            inputSchema: {
                type: "object",
                properties: {
                    grossVolumeCuFt: { type: "number", description: "Gross stacked wood volume in cu ft (12 = 1 basement bay, 42.7 = 1 pallet, 128 = 1 cord)", default: 12.0 },
                    initialMcPct: { type: "number", description: "Initial wood moisture content % on dry basis (e.g. 75 green, 50 semi-seasoned)", default: 50 },
                    targetMcPct: { type: "number", description: "Final stove-ready moisture content % (typically 18-20%)", default: 20 },
                    useBasementFinisher: { type: "boolean", description: "True if finishing bound water (<26% MC) in indoor basement or conditioned space", default: true },
                    splitDiameterInches: { type: "number", description: "Average thickness/diameter of wood splits in inches", default: 2.75 },
                    isUnsplitRound: { type: "boolean", description: "True if logs are unsplit rounds with intact bark", default: false },
                    numCollectors: { type: "number", description: "Number of 36x96 transpired screen solar collectors attached to active box", default: 2 },
                    collectorGlazingLayers: { type: "number", description: "Layers of 6-mil UV film on solar collectors (1-3)", default: 1 },
                    boxGlazingLayers: { type: "number", description: "Layers of 6-mil UV film on pallet box walls (1-3)", default: 2 },
                    totalFanCfm: { type: "number", description: "Active fan ventilation airflow rate in CFM", default: 96 },
                    chainedBoxesInSeries: { type: "boolean", description: "True if multiple drying boxes are connected in series airflow", default: false },
                    electricRatePerKwh: { type: "number", description: "Local electricity rate in $/kWh (0.169 KY Power, 0.138 KY Co-op)", default: 0.169 },
                    heatPumpCop: { type: "number", description: "Seasonal Coefficient of Performance of central heat pump", default: 2.4 },
                    cordsProcessedPerSeason: { type: "number", description: "Total cords processed through kiln over 150-day winter", default: 1.5 },
                    buildCostUsd: { type: "number", description: "Total DIY solar kiln build cost in USD", default: 234 }
                }
            },
            execute: async (params = {}) => {
                const calc = (typeof window !== 'undefined' && window.calculateWoodMoistureLoad) ? window : (typeof require !== 'undefined' ? require('./calculator.js') : null);
                if (!calc || !calc.calculateWoodMoistureLoad) {
                    throw new Error("Solar kiln calculator engine not available.");
                }

                const grossVolumeCuFt = params.grossVolumeCuFt ?? 12.0;
                const initialMcPct = params.initialMcPct ?? 50;
                const targetMcPct = params.targetMcPct ?? 20;
                const useBasementFinisher = params.useBasementFinisher ?? true;
                const splitDiameterInches = params.splitDiameterInches ?? 2.75;
                const isUnsplitRound = params.isUnsplitRound ?? false;
                const numCollectors = params.numCollectors ?? 2;
                const collectorGlazingLayers = params.collectorGlazingLayers ?? 1;
                const boxGlazingLayers = params.boxGlazingLayers ?? 2;
                const totalFanCfm = params.totalFanCfm ?? 96;
                const chainedBoxesInSeries = params.chainedBoxesInSeries ?? false;
                const electricRatePerKwh = params.electricRatePerKwh ?? 0.169;
                const heatPumpCop = params.heatPumpCop ?? 2.4;
                const cordsProcessedPerSeason = params.cordsProcessedPerSeason ?? 1.5;
                const buildCostUsd = params.buildCostUsd ?? 234.0;

                const woodLoad = calc.calculateWoodMoistureLoad({
                    grossVolumeCuFt,
                    initialMcPct,
                    targetMcPct,
                    useBasementFinisher,
                    splitDiameterInches,
                    isUnsplitRound
                });

                const kilnBalance = calc.calculateSolarKilnBalance({
                    numCollectors,
                    collectorGlazingLayers,
                    boxGlazingLayers,
                    totalFanCfm,
                    chainedBoxesInSeries,
                    woodLoadResult: woodLoad
                });

                const heatPumpRoi = calc.calculateKilnHeatPumpROI({
                    cordsProcessedPerSeason,
                    electricRatePerKwh,
                    heatPumpCop,
                    buildCostUsd
                });

                const summaryText = `Solar kiln drying for ${woodLoad.cordsEquivalent} cords (${grossVolumeCuFt} cu ft) from ${initialMcPct}% to ${targetMcPct}% MC requires ~${kilnBalance.outdoorDwellDays} clear solar days. Water to evaporate: ${woodLoad.totalWaterGallons} gal (${woodLoad.totalWaterLbs} lbs). Net daily heat gain: ${kilnBalance.totalNetDailyBtu} BTU/day. Seasonal firewood value vs heat pump: $${heatPumpRoi.seasonalValueVsHeatPump} (payback ${heatPumpRoi.paybackWeeksTotalHeat} weeks).`;

                return {
                    summaryStats: {
                        outdoorDwellDays: kilnBalance.outdoorDwellDays,
                        waterEvapLbsPerDay: kilnBalance.waterEvapLbsPerDay,
                        waterEvapGalPerDay: kilnBalance.waterEvapGalPerDay,
                        totalNetDailyBtu: kilnBalance.totalNetDailyBtu,
                        cordsEquivalent: woodLoad.cordsEquivalent,
                        totalWaterGallons: woodLoad.totalWaterGallons,
                        seasonalValueVsHeatPumpUsd: heatPumpRoi.seasonalValueVsHeatPump,
                        paybackWeeksTotalHeat: heatPumpRoi.paybackWeeksTotalHeat,
                        summary: summaryText
                    },
                    woodLoad,
                    kilnBalance,
                    heatPumpRoi
                };
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
