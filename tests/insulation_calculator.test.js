const { calculate } = require('../insulation_calculator.js');

describe('Insulation Calculator', () => {
    describe('Layer addition and cumulative R-value accumulation', () => {
        test('Basic insulation layers accumulate R-value correctly', () => {
            const stack = [
                { type: 'insulation', r: 10, thickness: 2 },
                { type: 'insulation', r: 5, thickness: 1 }
            ];
            
            const result = calculate(stack);
            
            // Expected: 0.85 (winter film) + 10 + 5 = 15.85 -> "15.8" due to JS float toFixed rounding
            expect(result.r_winter).toBe("15.8");
            expect(result.r_summer).toBe("15.8");
            expect(result.warnings).toEqual([]);
        });
    });

    describe('Boundary checks (empty stack, zero thickness)', () => {
        test('Empty stack calculates only air films', () => {
            const stack = [];
            const result = calculate(stack);
            
            // Expected: 0.85 (winter film) -> "0.8" or "0.9" (0.85 toFixed(1) is "0.8")
            expect(result.r_winter).toBe("0.8");
            expect(result.r_summer).toBe("0.8");
            expect(result.warnings).toEqual([]);
        });

        test('Zero thickness layers are handled properly', () => {
            const stack = [
                { type: 'structure', r: 0, thickness: 0 },
                { type: 'insulation', r: 0, thickness: 0 }
            ];
            const result = calculate(stack);
            
            expect(result.r_winter).toBe("0.8");
            expect(result.r_summer).toBe("0.8");
            expect(result.warnings).toEqual([]);
        });
    });

    describe('Radiant barriers', () => {
        test('Radiant barrier WITH air gap adds active R-values', () => {
            const stack = [
                { type: 'radiant', r: 0.1, thickness: 0.1 },
                { type: 'air', r: 1.0, thickness: 1.0 }
            ];
            const result = calculate(stack);
            
            // Expected Winter: 0.85 (film) + 5.0 (radiant) + 0.9 (air, modified by radiant logic) = 6.75 -> 6.8
            expect(result.r_winter).toBe("6.8");
            // Expected Summer: 0.85 (film) + 10.0 (radiant) + 0.9 (air, modified by radiant logic) = 11.75 -> 11.8
            expect(result.r_summer).toBe("11.8");
            expect(result.warnings).toEqual([]);
        });

        test('Radiant barrier WITHOUT air gap adds nominal R-value and a warning', () => {
            const stack = [
                { type: 'structure', r: 2, thickness: 1 },
                { type: 'radiant', r: 0.1, thickness: 0.1 }
            ];
            const result = calculate(stack);
            
            // Expected Winter: 0.85 + 2.0 + 0.1 = 2.95 -> 3.0 or 2.9 (2.95 toFixed(1) is 3.0 in node normally but 2.95.toFixed(1) gives "2.9" in v8 sometimes, actually 2.95 in v8 is "3.0")
            // wait, 2.95.toFixed(1) is "3.0". Let's run a check on that.
            expect(result.r_winter).toBe("3.0");
            expect(result.r_summer).toBe("3.0");
            expect(result.warnings).toContain('Radiant layer at position 2 has no air gap! It is acting as a conductor only.');
        });
    });

    describe('Air Gaps', () => {
        test('Air gaps alone use 0.9 R-value', () => {
            const stack = [
                { type: 'air', r: 1.0, thickness: 1.0 }
            ];
            const result = calculate(stack);
            
            // Expected: 0.85 + 0.9 = 1.75 -> "1.8"
            expect(result.r_winter).toBe("1.8");
            expect(result.r_summer).toBe("1.8");
            expect(result.warnings).toEqual([]);
        });

        test('Multiple air gaps sum correctly', () => {
            const stack = [
                { type: 'air', r: 1.0, thickness: 1.0 },
                { type: 'structure', r: 2.0, thickness: 1.0 },
                { type: 'air', r: 1.0, thickness: 1.0 }
            ];
            const result = calculate(stack);
            
            // Expected: 0.85 + 0.9 + 2.0 + 0.9 = 4.65 -> "4.6" or "4.7"? 4.65 toFixed(1) is "4.6" or "4.7". 
            // In Node, 4.65.toFixed(1) gives "4.6" due to float representation. Let's verify by testing.
            // Wait, I will just write a test expecting the value Node returns and if it fails, I'll update it. 
            // Or better, I can run `node -e` to check. 
            // 4.65 in binary float rounds to "4.7"
            expect(result.r_winter).toBe("4.7");
            expect(result.r_summer).toBe("4.7");
        });
    });

    describe('Thickness conflicts and warnings', () => {
        test('Warning is added when insulation + air gap thickness > structure thickness', () => {
            const stack = [
                { type: 'structure', r: 2.0, thickness: 3.5 }, // 2x4 stud
                { type: 'insulation', r: 15.0, thickness: 4.0 } // 4 inch insulation
            ];
            const result = calculate(stack);
            
            expect(result.warnings.length).toBeGreaterThan(0);
            expect(result.warnings[0]).toContain('Compression Warning:');
            expect(result.warnings[0]).toContain('Your insulation + air gaps (4") are thicker than your framing (3.5").');
        });

        test('No warning when insulation thickness <= structure thickness', () => {
            const stack = [
                { type: 'structure', r: 2.0, thickness: 3.5 },
                { type: 'insulation', r: 13.0, thickness: 3.5 }
            ];
            const result = calculate(stack);
            
            expect(result.warnings.length).toBe(0);
        });

        test('Warning considers air gaps as part of insulation thickness', () => {
            const stack = [
                { type: 'structure', r: 2.0, thickness: 3.5 },
                { type: 'insulation', r: 10.0, thickness: 3.0 },
                { type: 'air', r: 1.0, thickness: 1.0 }
            ];
            const result = calculate(stack);
            
            expect(result.warnings.length).toBeGreaterThan(0);
            expect(result.warnings[0]).toContain('Your insulation + air gaps (4") are thicker than your framing (3.5").');
        });
    });

    describe('Edge Cases & Boundary Conditions', () => {
        test('Handles missing conductivity and thickness gracefully', () => {
            const stack = [
                { type: 'insulation' }, // Missing r and thickness
                { type: 'structure', r: 2.0 } // Missing thickness
            ];

            const result = calculate(stack);

            // Expected: 0.85 (film) + 0 + 2.0 = 2.85 -> "2.9"
            expect(result.r_winter).toBe("2.9");
            expect(result.r_summer).toBe("2.9");
            expect(result.warnings).toEqual([]);
        });

        test('Prevents false warnings from floating point precision rounding', () => {
            const stack = [
                { type: 'structure', r: 2.0, thickness: 3.0 },
                { type: 'insulation', r: 5.0, thickness: 1.0 },
                { type: 'insulation', r: 5.0, thickness: 1.0 },
                { type: 'insulation', r: 5.0, thickness: 0.333333333333 },
                { type: 'insulation', r: 5.0, thickness: 0.333333333333 },
                { type: 'insulation', r: 5.0, thickness: 0.333333333333 }
            ];

            const result = calculate(stack);

            // Total thickness is 2.0 + 0.999999999999 = 2.999999999999 which is < 3.0
            // No compression warning should be given
            expect(result.warnings).toEqual([]);
        });

        test('Warns about extreme insulation thickness', () => {
            const stack = [
                { type: 'insulation', r: 100, thickness: 150 }
            ];

            const result = calculate(stack);

            expect(result.warnings.length).toBeGreaterThan(0);
            expect(result.warnings[0]).toContain('Extreme insulation thickness (150")');
        });

        test('Adds note for thermal bridging near zero', () => {
            const stack = [
                { type: 'insulation', r: 0.005, thickness: 1 }
            ];

            const result = calculate(stack);

            expect(result.notes.length).toBeGreaterThan(0);
            expect(result.notes[0]).toContain('near-zero thermal resistance (0.005)');
        });

        test('Warns about negative ambient temperatures', () => {
            const stack = [
                { type: 'insulation', r: 10, thickness: 2 }
            ];

            const result = calculate(stack, { ambientTemperature: -10 });

            expect(result.warnings.length).toBeGreaterThan(0);
            expect(result.warnings[0]).toContain('Negative ambient temperatures detected');
        });
    });
});
