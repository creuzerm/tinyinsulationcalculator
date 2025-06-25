# Tiny Home Heat Loss Calculator

## 1. Overview

This project is not an authoritive resource, this is an exploration of an idea and the results will be incorrect as a great many assumptions and simplifications are being made.

---

## 2. Core Heat Loss Formula

The calculator uses a standard formula to determine conductive heat loss through the building envelope (walls, roof, and openings):

**`Heat Loss (BTU/hr) = (Area (ft²) * ΔT (°F)) / R-Value`**

Where:
- **Area**: The total square footage of the component (e.g., wall or window).
- **ΔT (Delta T)**: The temperature difference between the desired indoor temperature and the design outdoor temperature.
- **R-Value**: The measure of a material's resistance to heat flow. A higher R-value indicates better insulation.

The total heat loss is the sum of the losses through all components of the building envelope.

---

## 3. Calculation Algorithm

The final BTU/hr value is derived through the following sequence of calculations:

### Step 1: Calculate Total Surface Area (A_total)

This is the total area of the building's "envelope" that is exposed to the outside air. **The calculation deliberately excludes the floor area**, as slab-on-grade or insulated floor assemblies have different and more complex heat loss characteristics.

-   **Simple Rectangle:**
    -   `A_walls = 2 * Length * Height + 2 * Width * Height`
    -   `A_roof = Length * (2 * sqrt((Width/2)² + ((Width/2)*(Pitch/12))²))`
    -   `A_total = A_walls + A_roof`

-   **A-Frame:**
    -   `SlopeHeight = sqrt((Width/2)² + Height²)`
    -   `A_roof_walls = 2 * Length * SlopeHeight` (The two sloped roof/wall sections)
    -   `A_ends = Width * Height` (The two triangular end walls, calculated as a rectangle for simplicity)
    -   `A_total = A_roof_walls + A_ends`

-   **Gothic Arch:**
    -   `Radius = Width / 2`
    -   `ArchLength = π * Radius` (The length of the semi-circular arch)
    -   `A_curved_roof = Length * ArchLength`
    -   `A_ends = π * Radius²` (The area of the two semi-circle end walls, combined into one full circle)
    -   `A_spring_walls = 2 * Length * SpringWallHeight` (The optional vertical wall sections at the base)
    -   `A_total = A_curved_roof + A_ends + A_spring_walls`

### Step 2: Calculate Temperature Difference (ΔT)

This is the primary driver of heat loss.

-   `ΔT = |T_indoor - T_outdoor|`

### Step 3: Determine Component R-Values

-   **Insulated Surfaces (R_wall_effective):**
    -   The base R-value is selected by the user (e.g., R-13 for 2x4, R-21 for 2x6). These values are consistent with common insulation products like Fiberglass Batts, which offer an R-value of approximately 3.1 to 4.3 per inch. A 3.5" (2x4) stud cavity filled with this insulation reasonably achieves the R-13 value.
    -   **Radiant Barrier:** If "Reflective Barrier Included" is selected, a value of **+3** is added to the wall assembly's R-value. This is a simplified approximation of the barrier's effectiveness at reducing radiant heat transfer.
    -   `R_wall_effective = R_wall_base + (is_radiant_barrier ? 3 : 0)`

-   **Openings (R_openings):**
    -   A fixed value of **R-3** is used for all openings (windows and doors). This is a common and slightly conservative R-value for standard, contractor-grade double-pane (dual-glazed) windows.

### Step 4: Calculate Component Areas

The total surface area is divided into insulated surfaces and openings based on the user's selection.

-   `Area_openings = A_total * (OpeningsPercentage / 100)`
-   `Area_insulated = A_total - Area_openings`

### Step 5: Calculate Heat Loss per Component

The core formula is applied to each component type.

-   `Loss_insulated = (Area_insulated * ΔT) / R_wall_effective`
-   `Loss_openings = (Area_openings * ΔT) / R_openings`

### Step 6: Calculate Total Base Heat Loss

The losses from all components are summed.

-   `Total_Loss_Base = Loss_insulated + Loss_openings`

### Step 7: Apply Air Sealing Factor

This step accounts for heat loss due to infiltration (drafts).

-   If Air Sealing is **"Poor"**, the total base heat loss is increased by 25%. This represents a significant penalty for uncontrolled air movement.
    -   `Total_Loss_Final = Total_Loss_Base * 1.25`
-   If Air Sealing is **"Good"**, the value is unchanged.
    -   `Total_Loss_Final = Total_Loss_Base`

### Step 8: Calculate Estimated 1-Hour Temperature Change (ΔT_1hr)

This value estimates how much the indoor temperature would drop in one hour if the heating system were turned off, assuming no other heat gains (solar, occupants, appliances).

-   **Formula:**
    **`ΔT_1hr (°F) = Total_Loss_Final (BTU/hr) / (Air_Volume (ft³) * Specific_Heat_Air (BTU/ft³°F))`**

    Where:
    -   **Air_Volume (ft³)**: The internal air volume of the structure, calculated based on its dimensions and shape:
        -   Rectangle: `Length * Width * Height`
        -   A-Frame: `0.5 * Width * Height * Length`
        -   Gothic Arch: `(0.5 * π * (Width/2)² * Length) + (SpringWallHeight * Width * Length)`
    -   **Specific_Heat_Air (BTU/ft³°F)**: The specific heat capacity of air, assumed to be **0.018 BTU/ft³°F**.

This calculation provides an additional metric to understand the building's thermal performance beyond just the raw heat loss number. A higher ΔT_1hr indicates a faster temperature drop.

---

## 4. Reference Materials

-   **Insulation R-Values:** The assumed R-values for common insulation materials are based on industry standards, such as those listed by ColoradoENERGY.
    -   [R-Value Table - ColoradoENERGY.org](https://coloradoenergy.org/procorner/stuff/r-values.htm)

---

## 5. Assumptions & Limitations

This calculator is an estimation tool and relies on several key assumptions:

-   **No Floor Heat Loss:** Heat loss through the floor is not included in the calculation.
-   **Uniform Opening R-Value:** All windows and doors are treated as having a single R-value of R-3, regardless of their specific type (e.g., single-pane, triple-pane, argon-filled).
-   **Ideal Installation:** The R-value of a wall assembly represents the value of the insulation itself and does not account for thermal bridging through studs or potential installation gaps. The "Double Stud Wall" option is intended to simulate a build that minimizes this effect.
-   **Simplified Air Sealing:** Air infiltration is represented by a simple multiplier. For an accurate assessment, a professional energy audit with a blower door test is required.
-   **No Heat Gain:** The calculation does not account for heat gain from solar radiation (south-facing windows), occupants, or appliances, which can offset some heating demand.
