// The Physics Engine
function calculate(currentStack, options = {}) {
    let totalR_winter = 0;
    let totalR_summer = 0;
    let warnings = [];
    let notes = [];

    // Basic air films (Exterior + Interior)
    totalR_winter += 0.85;
    totalR_summer += 0.85; // simplified

    if (options.ambientTemperature !== undefined && options.ambientTemperature < 0) {
        warnings.push("Negative ambient temperatures detected. Ensure proper vapor barriers are in place to prevent condensation.");
    }

    // Scan stack for context
    currentStack.forEach((layer, index) => {
        // Fallbacks for missing properties
        const r_val = layer.r || 0;
        const thickness = layer.thickness || 0;
        layer.r = r_val;
        layer.thickness = thickness;

        if (r_val > 0 && r_val < 0.01) {
            notes.push(`Layer at position ${index + 1} has near-zero thermal resistance (${r_val}). Significant thermal bridging may occur.`);
        }

        let r_up = r_val; // Heat flow up (Winter)
        let r_down = r_val; // Heat flow down (Summer)
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

    // Check thickness conflicts
    const structureLayer = currentStack.find(l => l.type === 'structure');
    const insulationThickness = currentStack.filter(l => l.type === 'insulation' || l.type === 'air').reduce((sum, l) => sum + l.thickness, 0);

    if (insulationThickness > 100) {
        warnings.push(`Warning: Extreme insulation thickness (${insulationThickness}"). This is physically unrealistic and may indicate an input error.`);
    }

    // Use a small epsilon to avoid floating point precision issues on thickness comparison
    const EPSILON = 0.0001;
    if (structureLayer && (insulationThickness - structureLayer.thickness > EPSILON)) {
        // Format to handle long floating point decimals
        const formattedInsThickness = parseFloat(insulationThickness.toFixed(3));
        warnings.push(`<b>Compression Warning:</b> Your insulation + air gaps (${formattedInsThickness}") are thicker than your framing (${structureLayer.thickness}"). Compressing insulation reduces R-value and eliminates air gaps.`);
    }

    return { r_winter: totalR_winter.toFixed(1), r_summer: totalR_summer.toFixed(1), warnings, notes };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculate };
} else {
    // In browser, calculate is global
    window.calculate = calculate;
}
