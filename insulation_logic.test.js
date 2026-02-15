const { calculate } = require('./insulation_calculator.js');

describe('Insulation Logic', () => {
    test('Calculates active radiant barrier correctly (Summer)', () => {
        const stack = [
            { type: 'air', r: 0.9, thickness: 0.75 },
            { type: 'radiant', r: 1.1, thickness: 0.3 } // Bubble Wrap
        ];
        const result = calculate(stack);
        // Expect: 0.85 (films) + 0.9 (air) + 10.0 (radiant active summer) = 11.75 -> 11.8
        expect(result.r_summer).toBe('11.8');
    });

    test('Calculates inactive radiant barrier (Bubble Wrap) correctly', () => {
        const stack = [
            { type: 'insulation', r: 13, thickness: 3.5 },
            { type: 'radiant', r: 1.1, thickness: 0.3 } // Bubble Wrap, No Air Gap
        ];
        const result = calculate(stack);
        // Expect: 0.85 (films) + 13 (insulation) + 1.1 (radiant inactive) = 14.95 -> 14.9 (floating point)
        expect(result.r_summer).toBe('14.9');
    });

    test('Calculates inactive radiant barrier (Woven) correctly', () => {
        const stack = [
            { type: 'insulation', r: 13, thickness: 3.5 },
            { type: 'radiant', r: 0, thickness: 0.02 } // Woven, No Air Gap, R=0
        ];
        const result = calculate(stack);
        // Expect: 0.85 (films) + 13 (insulation) + 0 (radiant inactive) = 13.85 -> 13.8 (floating point)
        expect(result.r_summer).toBe('13.8');
    });

    test('Calculates active radiant barrier (Woven) correctly', () => {
        const stack = [
            { type: 'air', r: 0.9, thickness: 0.75 },
            { type: 'radiant', r: 0, thickness: 0.02 } // Woven, Air Gap
        ];
        const result = calculate(stack);
        // Expect: 0.85 (films) + 0.9 (air) + 10.0 (radiant active summer) = 11.75 -> 11.8
        expect(result.r_summer).toBe('11.8');
    });
});
