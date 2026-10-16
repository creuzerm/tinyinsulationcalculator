/**
 * @jest-environment jsdom
 */

const { MATERIALS } = require('../calculator.js');
const { calculate } = require('../insulation_calculator.js');

describe('Skin layer and Emissivity tests', () => {
    describe('Exterior building skin thermal resistance', () => {
        test('Sheet metal skin has correct minimal thermal resistance', () => {
            expect(MATERIALS.sheet_metal_skin).toBeDefined();
            expect(MATERIALS.sheet_metal_skin.r_total).toBe(0.001);
        });
    });

    describe('Air film coefficients', () => {
        test('Exterior air film has correct R-value', () => {
            expect(MATERIALS.air_film_ext).toBeDefined();
            expect(MATERIALS.air_film_ext.r_total).toBe(0.17);
        });

        test('Interior wall air film has correct R-value', () => {
            expect(MATERIALS.air_film_wall_int).toBeDefined();
            expect(MATERIALS.air_film_wall_int.r_total).toBe(0.68);
        });

        test('Interior roof air film has correct R-value', () => {
            expect(MATERIALS.air_film_roof_int).toBeDefined();
            expect(MATERIALS.air_film_roof_int.r_total).toBe(0.61);
        });

        test('Interior floor air film has correct R-value', () => {
            expect(MATERIALS.air_film_floor_int).toBeDefined();
            expect(MATERIALS.air_film_floor_int.r_total).toBe(0.92);
        });
    });

    describe('Surface emissivity logic via radiant barrier calculations', () => {
        test('Radiant barrier WITH air gap adds active R-values', () => {
            const stack = [
                { type: 'radiant', r: 0.1, thickness: 0.1 },
                { type: 'air', r: 1.0, thickness: 1.0 }
            ];
            const result = calculate(stack);

            // Expected Winter: 0.85 (film) + 5.0 (radiant active) + 0.9 (air nominal modified by radiant) = 6.75 -> 6.8
            expect(result.r_winter).toBe("6.8");

            // Expected Summer: 0.85 (film) + 10.0 (radiant active) + 0.9 (air nominal) = 11.75 -> 11.8
            expect(result.r_summer).toBe("11.8");
            expect(result.warnings).toEqual([]);
        });

        test('Radiant barrier WITHOUT air gap adds only nominal R-value and a warning', () => {
            const stack = [
                { type: 'structure', r: 2, thickness: 1 },
                { type: 'radiant', r: 0.1, thickness: 0.1 }
            ];
            const result = calculate(stack);

            // Expected Winter: 0.85 (film) + 2.0 (structure) + 0.1 (radiant inactive) = 2.95 -> 3.0
            expect(result.r_winter).toBe("3.0");

            // Expected Summer: 0.85 (film) + 2.0 (structure) + 0.1 (radiant inactive) = 2.95 -> 3.0
            expect(result.r_summer).toBe("3.0");

            expect(result.warnings).toContain('Radiant layer at position 2 has no air gap! It is acting as a conductor only.');
        });
    });
});
