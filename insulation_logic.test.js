// Function being tested (modified version)
function calculate(currentStack) {
    let totalR_winter = 0;
    let totalR_summer = 0;
    let warnings = [];
    let notes = [];

    // Basic air films (Exterior + Interior)
    totalR_winter += 0.85;
    totalR_summer += 0.85; // simplified

    // Scan stack for context
    currentStack.forEach((layer, index) => {
        let r_up = layer.r; // Heat flow up (Winter)
        let r_down = layer.r; // Heat flow down (Summer)
        let layerNote = "";

        // --- LOGIC: Radiant Barriers ---
        if (layer.type === 'radiant') {
            // Check neighbors for air gap
            const prev = currentStack[index - 1];
            const next = currentStack[index + 1];
            const hasAirGap = (prev && prev.type === 'air') || (next && next.type === 'air');

            if (hasAirGap) {
                // Radiant Barrier ACTIVE
                // Values approximate ASHRAE fundamentals for bright foil w/ air space

                // Heat Flow DOWN (Summer): Radiant barriers excel here
                r_down = 10.0; // Effective R-value of the assembly boost

                // Heat Flow UP (Winter): Convection dominates, radiation less factor
                r_up = 5.0;

                layerNote = "ACTIVE (Reflecting Heat)";
            } else {
                // Radiant Barrier INACTIVE (Conduction only)
                // MODIFIED: Use layer.r instead of hardcoded 1.1
                r_down = layer.r;
                r_up = layer.r;
                warnings.push(`Radiant layer at position ${index + 1} has no air gap! It is acting as a conductor only.`);
                layerNote = "INACTIVE (No Air Gap)";
            }
        }

        // --- LOGIC: Air Gaps ---
        if (layer.type === 'air') {
            // Air gap R-value depends on facing surfaces.
            // If next to radiant, the radiant layer claims the bonus, keep air nominal
            // to avoid double counting.
            r_up = 0.9;
            r_down = 0.9;
        }

        totalR_winter += r_up;
        totalR_summer += r_down;
    });

    // Check thickness conflicts (simplified for test)
    const structureLayer = currentStack.find(l => l.type === 'structure');
    const insulationThickness = currentStack.filter(l => l.type === 'insulation' || l.type === 'air').reduce((sum, l) => sum + l.thickness, 0);

    if (structureLayer && insulationThickness > structureLayer.thickness) {
        warnings.push(`<b>Compression Warning:</b> Your insulation + air gaps (${insulationThickness}") are thicker than your framing (${structureLayer.thickness}"). Compressing insulation reduces R-value and eliminates air gaps.`);
    }

    return { r_winter: totalR_winter.toFixed(1), r_summer: totalR_summer.toFixed(1), warnings, notes };
}

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
