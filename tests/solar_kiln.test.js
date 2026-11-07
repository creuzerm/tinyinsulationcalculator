/**
 * @jest-environment jsdom
 */

const {
    PRESETS,
    SPECIES,
    applyKilnPreset,
    calculateSolarKiln,
    init
} = require('../solar_kiln.js');

// Ensure calculator functions are on window
const calculator = require('../calculator.js');
Object.assign(window, calculator);

describe('Solar Kiln & Greenhouse Frontend Module', () => {

    beforeEach(() => {
        document.body.innerHTML = `
            <nav class="app-nav">
                <a href="solar_kiln.html">Solar Kiln & Greenhouse</a>
                <a href="#" id="help-link">Help / Documentation</a>
            </nav>

            <form id="solarKilnForm">
                <select id="volumePreset">
                    <option value="half_basement_rack">1 Basement Bay</option>
                    <option value="full_basement_rack_1yd" selected>Full Basement Rack</option>
                    <option value="single_outdoor_pallet">1 Outdoor Pallet Dryer</option>
                    <option value="twin_outdoor_pallets">2 Outdoor Pallets</option>
                    <option value="full_cord">1 Full Cord</option>
                </select>
                <input type="number" id="grossVolumeCuFt" value="27.0">
                <select id="woodSpecies">
                    <option value="ne_ky_mixed_hardwood" selected>Mixed Hardwood</option>
                    <option value="white_oak_hickory">Oak / Hickory</option>
                    <option value="soft_maple_poplar">Maple / Poplar</option>
                </select>
                <input type="number" id="initialMcPct" value="50">
                <input type="number" id="targetMcPct" value="20">
                <input type="checkbox" id="useBasementFinisher" checked>
                <input type="number" id="splitDiameterInches" value="2.75">
                <input type="checkbox" id="isUnsplitRound">
                <input type="number" id="numCollectors" value="2">
                <select id="collectorGlazingLayers">
                    <option value="1" selected>1</option>
                </select>
                <select id="boxGlazingLayers">
                    <option value="2" selected>2</option>
                </select>
                <input type="checkbox" id="northWallReflectix" checked>
                <input type="number" id="ambientTempF" value="32">
                <input type="number" id="internalKilnTempF" value="80">
                <input type="number" id="sunHoursPerDay" value="5.0">
                <input type="number" id="electricRatePerKwh" value="0.169">
                <input type="number" id="heatPumpCop" value="2.40">
                <input type="number" id="cordsProcessedPerSeason" value="1.5">
                <input type="number" id="buildCostUsd" value="234.0">
                <button type="submit" id="calculateSolarKilnBtn">Calculate</button>
            </form>

            <div id="solarKilnResults">
                <span data-output="outdoorDwellDays"></span>
                <span data-output="calendarDays"></span>
                <span data-output="waterEvapGalPerDay"></span>
                <span data-output="waterEvapLbsPerDay"></span>
                <span data-output="totalNetDailyBtu"></span>
                <span data-output="cordsEquivalent"></span>
                <span data-output="totalWaterGallons"></span>
                <span data-output="dryingBonusMmbtuPerCord"></span>
                <span data-output="seasonalValueVsHeatPump"></span>
                <span data-output="paybackWeeksTotalHeat"></span>
                <span data-output="densityDelta"></span>
            </div>

            <div id="helpModal" class="hidden">
                <button id="closeHelpModal">&times;</button>
                <div id="helpContent">Loading documentation...</div>
            </div>
        `;
    });

    test('presets and species constants are populated', () => {
        expect(PRESETS.full_basement_rack_1yd.grossVolumeCuFt).toBe(27.0);
        expect(PRESETS.full_cord.cords).toBe(1.0);
        expect(SPECIES.ne_ky_mixed_hardwood.dryDensity).toBe(36.0);
        expect(SPECIES.white_oak_hickory.grossMmbtuPerCord).toBe(27.7);
    });

    test('applyKilnPreset updates volume input and triggers calculation', () => {
        applyKilnPreset('full_cord');
        expect(document.getElementById('grossVolumeCuFt').value).toBe("128");

        const dwellDaysEl = document.querySelector('[data-output="outdoorDwellDays"]');
        expect(dwellDaysEl.textContent).toContain('Clear Days');
    });

    test('calculateSolarKiln accurately updates all DOM output hooks', () => {
        const result = calculateSolarKiln();
        expect(result).toBeDefined();
        expect(result.woodLoad.cordsEquivalent).toBeCloseTo(0.211, 2);
        expect(result.kilnBalance.outdoorDwellDays).toBeGreaterThan(0);
        expect(result.heatPumpRoi.seasonalValueVsHeatPump).toBeGreaterThan(100);

        const dwellDaysEl = document.querySelector('[data-output="outdoorDwellDays"]');
        expect(dwellDaysEl.textContent).toBe(`${result.kilnBalance.outdoorDwellDays} Clear Days`);

        const savingsEl = document.querySelector('[data-output="seasonalValueVsHeatPump"]');
        expect(savingsEl.textContent).toBe(`$${result.heatPumpRoi.seasonalValueVsHeatPump.toFixed(2)}`);

        const bonusEl = document.querySelector('[data-output="dryingBonusMmbtuPerCord"]');
        expect(bonusEl.textContent).toContain('+6.28 MMBTU');
    });

    test('form submission handles agentInvoked and calls respondWith', () => {
        init();
        const form = document.getElementById('solarKilnForm');

        const respondWithSpy = jest.fn();
        const event = new Event('submit', { bubbles: true, cancelable: true });
        event.agentInvoked = true;
        event.respondWith = respondWithSpy;

        form.dispatchEvent(event);

        expect(respondWithSpy).toHaveBeenCalledTimes(1);
    });
});
