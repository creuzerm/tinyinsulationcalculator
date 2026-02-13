# Agent Context: Tiny Home Heat Loss Calculator

## 1. Project Overview

This project is a Single Page Application (SPA) contained within `index.html`. It calculates the heating load (Heat Loss) and passive thermal performance of tiny homes. It supports A/B testing between two construction scenarios and simulates indoor temperature "coasting" over 24-hour or 7-day periods without supplemental heating.

## 2. Core Logic & Formulas

### 2.1 Geometry Calculations

The calculator derives surface areas based on the selected `buildingShape`.

* **Variables:**

  * $L$: Length (ft)

  * $W$: Width (ft)

  * $H$: Height (ft)

  * $P$: Roof Pitch (rise/12)

  * $S_{h}$: Spring Height (Gothic Arch)

* **Formulas:**

  * **Rectangle:**

    * $Area_{floor} = L \times W$

    * $Area_{wall} = 2(L \times H) + 2(W \times H)$ *(plus gable ends if pitch > 0)*

    * $Area_{roof} = L \times W$ *(if pitch=0)* OR $2 \times L \times \sqrt{(W/2)^2 + ((W/2) \times (P/12))^2}$

  * **A-Frame:**

    * $SlopeLength = \sqrt{(W/2)^2 + H^2}$

    * $Area_{roof} = 2 \times L \times SlopeLength$

    * $Area_{endwalls} = 2 \times (0.5 \times W \times H)$

    * $Area_{floor} = L \times W$

  * **Gothic Arch:**

    * $Radius = W/2$

    * $Area_{roof} = L \times (\pi \times Radius)$ *(Arch perimeter)*

    * $Area_{endwalls} = \pi \times Radius^2$

    * $Area_{sidewalls} = 2 \times L \times S_{h}$

    * $Area_{floor} = L \times W$

### 2.2 Heat Loss (UA Calculation)

Heat loss is calculated using the UA formula ($Q = U \cdot A \cdot \Delta T$), separated by component to account for ground coupling vs. air coupling.

* **Effective R-Value Calculation (Walls):**
  The calculator no longer uses a simple nominal R-value for walls. It calculates an **Effective R-Value** based on the assembly layers to account for thermal bridging.

  * **Stick Frame (Wood):** Uses the **Parallel Path Method** (weighting stud vs. cavity area).
    * $R_{effective} = 1 / ( (f_{framing} / R_{stud}) + (f_{cavity} / R_{cavity}) ) + R_{continuous} + R_{airfilms}$
  * **Mass Wall:** Uses **Series Summation** for homogeneous layers (like Aircrete or CMU) plus insulation.
    * $R_{effective} = R_{mass} + R_{insulation} + R_{airfilms}$
  * **Air Films:** Standard air films ($R_{int}=0.68$, $R_{ext}=0.17$) are automatically added.

* **Conductive Loss (Air Coupled - Walls, Roof, Windows):**
  

  $$
  Q_{env} = \left( \frac{A_{wall}}{R_{wall\_eff}} + \frac{A_{roof}}{R_{roof}} + \frac{A_{window}}{R_{window}} \right) \times (T_{in} - T_{out})
  $$

* **Conductive Loss (Ground Coupled - Floor):**
  

  $$
  Q_{floor} = \left( \frac{A_{floor}}{R_{floor}} \right) \times (T_{in} - T_{ground})
  $$

### 2.5 Skirting & Buffer Zones

If Skirting inputs (R-Value & Height) are provided, the calculator solves for the **Buffer Zone Temperature** ($T_{buffer}$) using a steady-state nodal balance equation.

**The Nodal Balance:**

$$
T_{buffer} = \frac{T_{in} \cdot UA_{floor} + T_{out} \cdot (UA_{skirt} + Q_{vent}) + T_{ground} \cdot UA_{ground\_contact}}{UA_{floor} + UA_{skirt} + UA_{ground\_contact} + Q_{vent}}
$$

**Where:**

* $UA_{floor} = A_{floor} / R_{floor}$
* $UA_{skirt} = (Perimeter \times Height) / R_{skirt}$
* $UA_{ground\_contact} = A_{floor} / 1$ (Assumes uninsulated earth floor of buffer zone)
* $Q_{vent} = Volume_{buffer} \times ACH \times 0.018$ (Convective heat removal)

**Skirting Air Tightness Constants (ACH):**

* **Sealed:** 0.5 ACH (Taped foam board)
* **Vented:** 5.0 ACH (Lattice/Standard skirting)
* **Leaky:** 20.0 ACH (Improvised/Windy)

* **Air Sealing Penalty:**
  If `airSealing === 'poor'`, the calculated $UA_{envelope}$ is multiplied by **1.25**.

### 2.3 Thermal Battery (Total Capacity)

Calculates the energy storage capacity of the floor slab **plus** a baseline structure mass.

* **Inputs:** Area ($A_{floor}$), Thickness ($t_{in}$), Density ($D$), Specific Heat ($C_p$).

* **Floor Mass Capacity:**

  * $Vol = A_{floor} \times (t_{in} / 12)$

  * $Mass = Vol \times D$

  * $C_{floor} = Mass \times C_p$

    * *Concrete:* $D=145, C_p=0.2$

    * *Stone/Earth:* $D=135, C_p=0.2$

    * *Wood:* $D=30, C_p=0.4$

* **Structure Mass Capacity (Baseline):**

  * To prevent instability in lightweight structures, a fixed mass is added based on the total envelope area.

  * $C_{structure} = A_{total\_envelope} \times 1.5$ BTU/°F

* **Total Capacity (**$C_{th}$**):**
  

  $$
  C_{th} = C_{floor} + C_{structure}
  $$

### 2.4 Passive Simulation (Finite Difference)

Simulates indoor temperature ($T_{in}$) drift. To prevent mathematical oscillation in low-mass buildings, the simulation uses **1-minute sub-steps** (60 steps per displayed hour).

$$
T_{in}^{(t+1)} = T_{in}^{(t)} + \frac{Q_{gains} - Q_{loss}}{C_{th}} \times \Delta t
$$

* $\Delta t$**:** $1/60$ (one minute).

* $Q_{gains}$**:** Internal Gains + Solar Gains (Solar applied only between 9 AM and 5 PM).
  * **Internal Gains Note:** The calculator loads occupant and appliance data from `internal_gains.json`. Only **Sensible Heat** is summed for the thermal model; Latent heat (moisture) is excluded as it does not directly raise air temperature.

* $Q_{loss}$**:** Calculated dynamically at every minute step based on current $T_{in}$ and interpolated $T_{out}$.

## 3. Test Scenarios

Agents should run these scenarios to verify the integrity of the calculator after edits.

### Scenario A: The "Shoebox" Baseline

**Goal:** Verify basic UA summation and ground temp differentiation.

* **Inputs:**

  * **Shape:** Rectangle

  * **Dims:** L=20, W=10, H=10, Pitch=0

  * **Temps:** Indoor=70, Outdoor=20, Ground=50

  * **R-Values:** Wall=10, Roof=10, Floor=10

  * **Openings:** 0% (Custom > 0 windows, 0 doors)

  * **Sealing:** Good

* **Expected Calculations:**

  * Surface Areas:

    * Floor: 200 sqft

    * Roof: 200 sqft

    * Walls: $2(20\times10) + 2(10\times10) = 600$ sqft

  * $\Delta T_{air} = 50$, $\Delta T_{ground} = 20$

  * Losses:

    * Wall: $(600/10) \times 50 = 3,000$

    * Roof: $(200/10) \times 50 = 1,000$

    * Floor: $(200/10) \times 20 = 400$

  * **Total Expected Result:** **4,400 BTU/hr**

### Scenario B: Thermal Mass Capacity

**Goal:** Verify the "Thermal Battery" math (including structure baseline).

* **Inputs:**

  * **Dims:** L=10, W=10, H=10, Pitch=0 (Box)

  * **Material:** Standard Concrete

  * **Thickness:** 6 inches

* **Expected Calculations:**

  * **Floor Capacity:**

    * Volume: $100 \times 0.5 = 50$ ft³

    * Mass: $50 \times 145 = 7,250$ lbs

    * Capacity: $7,250 \times 0.2 = \mathbf{1,450}$ BTU/°F

  * **Structure Capacity:**

    * Envelope Area: Floor(100) + Roof(100) + Walls(400) = 600 sqft.

    * Capacity: $600 \times 1.5 = \mathbf{900}$ BTU/°F

  * **Total Expected Capacity:** $1,450 + 900 = \mathbf{2,350}$ BTU/°F

  * **Storage Display (5°F rise):** $2,350 \times 5 = \mathbf{11,750}$ BTU

### Scenario C: A/B Comparison

**Goal:** Verify independent scenario handling.

1. Enable "A/B Comparison".

2. **Scenario A:** Use "Scenario A: The Shoebox" inputs above.

3. **Scenario B:** Change **Wall R-Value** to 20 (double insulation).

4. **Expected A Result:** 4,400 BTU/hr.

5. **Expected B Result:**

   * New Wall Loss: $(600/20) \times 50 = 1,500$

   * Roof (1000) + Floor (400) remain same.

   * **Total B:** 2,900 BTU/hr.

## 4. Development and Testing

### 4.1 Running Tests

The project includes a Jest-based test suite. The JavaScript logic has been extracted to `calculator.js` to facilitate testing.

To run the tests:
```bash
npm test
```

### 4.2 CI/CD

Tests are automatically run on push and pull request via GitHub Actions.

## 5. Skinning & Extension Architecture

To allow for white-labeling and customization without forking the core logic, this repository maintains a strict separation of structure, style, and private extensions.

### 5.1 Architecture Directives
**Do not revert these structural elements.** They are required for the private build process.

1.  **Externalized Styles (`styles.css`):**
    *   The core CSS must remain in `styles.css`, not in `index.html`.
    *   This allows the private repo to overwrite `styles.css` with a branded version during the build.
    *   `index.html` must link to `styles.css` and `skin.css`.

2.  **Skin Hooks (`skin.css` & `skin.js`):**
    *   These files must exist in the root but remain empty in the public repo.
    *   `skin.css` is loaded *after* `styles.css` to allow overrides.
    *   `skin.js` is loaded at the end of the `<body>` to allow UI injection (e.g., adding a custom navbar or footer).

3.  **Assets Directory (`assets/`):**
    *   All static images (logos, icons) must reside in the `assets/` folder.
    *   Do not place images in the root. This allows the private repo to overwrite assets cleanly.

## 6. Verification Instructions for Agents

When verifying the tool via code interpretation or DOM manipulation:

1. **Inject Values:** Use `document.getElementById('ID').value = X` for inputs.

2. **Trigger Events:** Dispatch `new Event('input')` or `new Event('change')` on the modified elements to trigger the `calculateAll()` listener.

3. **Read Output:** Check `document.getElementById('resultLoss_A').textContent` (or `resultLoss_B` in A/B mode).

4. **Validate:** Parse the integer from the result string (remove commas) and compare with the Expected Result +/- 1% tolerance.

5. **Clear All Verification:**
   * Trigger the "Clear all" button click.
   * Confirm that standard inputs reset to defaults (e.g., Indoor Temp = 68).
   * Confirm that "Custom Gains" entries are retained in the list but their quantities are reset to 0.

## 7. Accessibility Requirements

To ensure the application is usable by vision impaired users, all development must adhere to the following accessibility standards:

1.  **Semantic HTML:** Use proper HTML5 semantic elements (`<header>`, `<main>`, `<article>`, `<button>`, etc.) to provide structure.
2.  **ARIA Labels:** Use `aria-label`, `aria-describedby`, and `aria-live` attributes where appropriate, especially for:
    *   Dynamic content updates (e.g., calculation results).
    *   Visual-only elements like charts (provide text alternatives).
    *   Form controls without visible labels.
3.  **Keyboard Navigation:** Ensure all interactive elements (buttons, inputs, summaries) are focusable and operable via keyboard.
4.  **Color Contrast:** Ensure sufficient color contrast between text and background colors (WCAG AA standard). Avoid light gray text on white backgrounds.
5.  **Focus Management:** Ensure focus indicators are visible.
6.  **Screen Reader Compatibility:**
    *   Charts must have a text fallback or be described via ARIA.
    *   Status updates (results) should be announced dynamically.

## 8. Feature Roadmap: Van Life Support

The following roadmap details the technical changes required to support "Van Life" and camper builds.

### 1. The Core Physics Challenge: The Floor

In the current code (`calculator.js`), the floor is "Ground Coupled" (using `groundTemp`), assuming the building sits on soil. A van or truck camper sits on tires, meaning the floor is "Air Coupled" (air flows underneath it).

**Required Change:**
You must modify `calculateHeatLoss` in `calculator.js` to treat the floor as an air-coupled surface when a vehicle shape is selected.

**Code Logic Update:**

```javascript
// In calculator.js -> calculateHeatLoss function
function calculateHeatLoss(areas, data, deltaT_Air, deltaT_Ground) {
    // ... existing setup ...

    // DETECT VEHICLE CONTEXT
    const shape = document.getElementById('buildingShape').value;
    const isVehicle = (shape === 'cargo-van' || shape === 'camper-shell');

    // If it's a vehicle, the floor is exposed to Outside Air, not Ground
    const floorDeltaT = isVehicle ? deltaT_Air : deltaT_Ground;

    // ... existing calculations ...
    const lossFloor = (areas.floor / safeR(data.rFloor)) * floorDeltaT;

    // ... return results ...
}
```

### 2. New Geometry: "Cargo Van" Shape

You need to add a new shape to `getSurfaceAreas` that approximates the curved walls and lower volume of a van.

**Required Change:**
Add a "Cargo Van" option that accepts standard wheelbase dimensions (e.g., Sprinter 144", Ford Transit 148").

**Code Logic Update:**

```javascript
// In calculator.js -> getSurfaceAreas function
} else if (shape === 'cargo-van') {
    // User inputs: L (Cargo Length), W (Floor Width), H (Interior Height)
    // Approximation: Van walls are slightly curved, but a box is a close enough estimate for UA
    areas.floor = L * W;
    areas.roof = L * W;

    // Walls + Sliding Door + Rear Doors
    areas.wall = (2 * L * H) + (2 * W * H);

    // Total surface area is usually 100% metal skin
    areas.total = areas.wall + areas.roof;
}
```

### 3. Material Database Expansion

The current `MATERIALS` object in `calculator.js` lacks the specific insulation used in automotive builds (closed-cell foam, wool, Thinsulate).

**Required Change:**
Update `MATERIALS` in `calculator.js`:

```javascript
const MATERIALS = {
    // ... existing materials ...

    // Van Life Specifics
    havelock_wool: { r_inch: 3.6 }, // Common sheep wool insulation
    thinsulate_sm600: { r_inch: 5.2 }, // 3M Thinsulate (approximate based on thickness)
    xps_foam_board: { r_inch: 5.0 }, // Rigid foam for floors
    armaflex_foam: { r_inch: 4.0 }, // Black flexible foam
    polyiso_board: { r_inch: 6.0 }, // High R-value rigid board

    // Vehicle Structure
    sheet_metal_skin: { r_total: 0.001 }, // Effectively zero
    auto_glass_single: { r_total: 0.9 },
};
```

### 4. Handling Thermal Bridging (The "Rib" Problem)

Your `methods.md` file correctly identifies that steel conducts heat ~400x faster than wood. In a van, the structural "ribs" are massive thermal bridges.

The current tool handles architectural steel studs using `STEEL_CORRECTION_FACTORS`. You can reuse this logic but should add a "Vehicle Ribs" category which is even more severe than architectural steel studs because the outer skin is also metal (conductive).

**Required Change:**
Add a specific correction factor for "Van Ribs" where the insulation is interrupted by metal ribs.

```javascript
// In calculator.js
const STEEL_CORRECTION_FACTORS = {
    // ... existing ...
    'van_ribs': {
        'default': 0.25 // Highly severe penalty. R-10 becomes R-2.5 effectively if ribs aren't covered.
    }
};
```

### 5. Internal Gains (Existing Compatibility)

Your `internal_gains.json` file is already perfectly set up for this. It includes:

* `fridge_dc`: "Fridge 12V DC (50L)" — This is standard Van Life gear.
* `dog_med`: Standard travel companion.
* `cook_lpg`: "Propane Cooktop" — Standard camper gear.

**Recommendation:** No changes needed here, but you could add "Diesel Heater" as a heat *source* (though the calculator focuses on heat *loss*, understanding the heater output required is the goal).

### 6. Solar Gain "Oven Effect"

The current `README.md` notes that "Solar gain is treated as a fixed 'on/off' block". For a metal vehicle, this is insufficient. A dark grey van in the sun behaves differently than a white van.

**Simple Feature Add:**
Add a toggle in `index.html` for **"Vehicle Color"** (Light vs. Dark).

* **Light:** Keep current solar gain logic.
* **Dark:** Multiply `simInternalGain` or solar input by 1.5x during daylight hours to simulate the radiant heat transfer of the metal skin.

## 9. WebMCP Integration Standards

To support next-generation browser agents and assistive technologies, this project adopts **WebMCP** concepts. This allows agents to interact with the calculator logic directly rather than scraping the DOM.

### 9.1 Core Concepts
*   **Client-Side Tools:** The application exposes JavaScript functions as "tools" that agents can discover and invoke.
*   **Shared Context:** Agents operate within the user's session, manipulating the live application state so the user can verify changes (Human-in-the-loop).
*   **Structured Access:** Agents read results via structured JSON returns, not by parsing HTML text.

### 9.2 Requirements for Agents
When implementing new features or refactoring, ensure the following logic is exposed as WebMCP-compatible tools:

1.  **State Manipulation:**
    *   Functions that modify the application state (e.g., `setDimensions`, `updateMaterial`) must be decoupled from the UI event listeners so they can be called programmatically.
    *   *Example:* `updateWallRValue(20)` should update the state *and* refresh the UI, just as if the user typed it.

2.  **Tool Registration:**
    *   Future implementations should register these functions in a standardized namespace (e.g., `window.webmcp` or similar as the spec evolves) with JSON schemas describing their inputs.

3.  **Semantic Descriptions:**
    *   All exposed tools must include natural language descriptions explaining their purpose to an LLM (e.g., *"Calculates the heat loss based on current geometry"*).

4.  **Priority Tools to Expose:**
    *   `applyPreset(name)`: To quickly switch between `'van_build'`, `'code_min'`, `'passive_house'`.
    *   `runSimulation(days)`: To run the passive thermal battery simulation.
    *   `getDetailedResults()`: To return the breakdown of heat loss by component (Walls vs Windows vs Roof).
