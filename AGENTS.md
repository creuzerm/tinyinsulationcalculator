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
