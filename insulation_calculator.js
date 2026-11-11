// The Physics Engine
function calculate(currentStack, options = { orientation: 'wall' }) {
    let totalR_winter = 0;
    let totalR_summer = 0;
    let warnings = [];
    let notes = [];

    const r_se = 0.17; // Exterior air film

    // Basic air films (Exterior + Interior) based on orientation
    if (options.orientation === 'roof') {
        totalR_winter += r_se + 0.61; // Heat flow up
        totalR_summer += r_se + 0.92; // Heat flow down
    } else if (options.orientation === 'floor') {
        totalR_winter += r_se + 0.92; // Heat flow down
        totalR_summer += r_se + 0.61; // Heat flow up
    } else {
        // 'wall' or default
        totalR_winter += r_se + 0.68;
        totalR_summer += r_se + 0.68;
    }

    let structureLayer = null;
    let insulationThickness = 0;

    // Scan stack for context
    currentStack.forEach((layer, index) => {
        let layer_r = parseFloat(layer.r);
        if (isNaN(layer_r)) layer_r = 0;
        let r_up = layer_r; // Heat flow up (Winter)
        let r_down = layer_r; // Heat flow down (Summer)
        let layerNote = "";

        if (!structureLayer && layer.type === 'structure') {
            structureLayer = layer;
        }

        if (layer.type === 'insulation' || layer.type === 'air') {
            insulationThickness += layer.thickness;
        }

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
                r_down = layer_r;
                r_up = layer_r;
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
    let structureThickness = structureLayer ? parseFloat(structureLayer.thickness) : NaN;
    if (isNaN(structureThickness)) structureThickness = 0;

    if (structureLayer && insulationThickness > structureThickness) {
        warnings.push(`<b>Compression Warning:</b> Your insulation + air gaps (${insulationThickness}") are thicker than your framing (${structureThickness}"). Compressing insulation reduces R-value and eliminates air gaps.`);
    }

    // --- GLASER METHOD: Dew Point & Condensation Plane Detection ---
    if (options.indoorTemp !== undefined && options.outdoorTemp !== undefined && options.indoorRH !== undefined) {
        const tIn = parseFloat(options.indoorTemp);
        const tOut = parseFloat(options.outdoorTemp);
        const rh = parseFloat(options.indoorRH) / 100;

        if (!isNaN(tIn) && !isNaN(tOut) && !isNaN(rh) && rh > 0) {
            // Calculate indoor dew point using Magnus-Tetens approximation
            const tempC = (tIn - 32) / 1.8;
            const alpha = Math.log(rh * Math.exp((17.27 * tempC) / (tempC + 237.3)));
            const dewPointC = (237.3 * alpha) / (17.27 - alpha);
            const dewPointF = (dewPointC * 1.8) + 32;

            // Compute total R for winter (since heating season is primary condensation risk)
            // Wait, we just calculated totalR_winter inside the loop. Let's use it.
            // Air films
            const r_interior_film = options.orientation === 'roof' ? 0.61 : (options.orientation === 'floor' ? 0.92 : 0.68);
            const totalR = totalR_winter;
            let currentR = r_interior_film;
            let vaporBarrierFound = false;

            for (let i = 0; i < currentStack.length; i++) {
                const layer = currentStack[i];
                const layer_r = parseFloat(layer.r) || 0;

                // Effective R-up for this layer (simplified from loop above)
                let r_up = layer_r;
                if (layer.type === 'radiant') {
                    const prev = currentStack[i - 1];
                    const next = currentStack[i + 1];
                    if ((prev && prev.type === 'air') || (next && next.type === 'air')) {
                        r_up = 5.0;
                    }
                } else if (layer.type === 'air') {
                    r_up = 0.9;
                }

                currentR += r_up;

                // Calculate interface temperature AT THE COLD SIDE of this layer
                let interfaceTemp = tIn - ((tIn - tOut) * (currentR / totalR));

                if (layer.type === 'vapor' || layer.type === 'radiant') {
                    vaporBarrierFound = true;
                }

                // If interface is below dew point and no vapor barrier is protecting it from warm humid indoor air
                if (interfaceTemp < dewPointF && !vaporBarrierFound) {
                    warnings.push(`<b>Condensation Risk:</b> The temperature drops to ${interfaceTemp.toFixed(1)}°F at the exterior side of the ${layer.name || 'layer'}. This is below the interior dew point of ${dewPointF.toFixed(1)}°F. Consider adding a vapor barrier on the warm side.`);
                    break; // Warn once for the first condensation plane
                }
            }
        }
    }

    // Round to 1 decimal place to prevent microscopic float variations (like 1.11e-16) from failing zero-checks

    let final_r_winter = parseFloat(totalR_winter.toFixed(1));
    let final_r_summer = parseFloat(totalR_summer.toFixed(1));

    let u_winter = final_r_winter > 0 ? (1 / final_r_winter).toFixed(3) : "Infinity";
    let u_summer = final_r_summer > 0 ? (1 / final_r_summer).toFixed(3) : "Infinity";

    return {
        r_winter: final_r_winter.toFixed(1),
        r_summer: final_r_summer.toFixed(1),
        u_winter: u_winter,
        u_summer: u_summer,
        warnings,
        notes
    };
}

if (typeof window !== 'undefined') {
    window.calculate = calculate;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculate };
}
