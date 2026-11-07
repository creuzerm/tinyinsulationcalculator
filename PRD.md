# Product Requirements Document (PRD): Tiny House Thermal Suite & Solar Biomass Processor

---

## 1. Executive Vision & Core Value Proposition

The **Tiny House Thermal Suite** is an open-source, zero-dependency, engineering-grade passive thermal and micro-climate simulation engine designed specifically for small, high-performance structures (tiny homes, sheds, cabins, greenhouses, and solar kilns).

Traditional residential HVAC sizing software (Manual J, EnergyPlus, DOE-2) is engineered for full-scale 2,500+ sq ft foundation-anchored homes. These enterprise tools systematically fail small-footprint builders:
1. They ignore the disproportionately massive surface-area-to-volume ratio ($A/V$) of tiny dwellings.
2. They treat mobile or skirted floor systems with standard slab-on-grade or unconditioned basement assumptions, miscalculating buffer zone freezing risks.
3. They fail to model diurnal thermal inertia ("thermal batteries") where solar heat gains captured during the day sustain overnight comfort without oversized mechanical heating.
4. They completely omit passive solar biomass processing (firewood seasoning and solar kilns), which provides the primary space-heating fuel source for off-grid and rural homesteaders.

The Tiny House Thermal Suite solves this by unifying four interconnected, mathematically rigorous modules into a single, headless, skinnable computational engine that operates in-browser, in Node.js test harnesses, and autonomously via the WebMCP (Web Model Context Protocol) agent interface.

---

## 2. Target Personas & Primary Use Cases

### Persona 1: The DIY Tiny Home & Micro-Dwelling Builder
* **Profile**: Self-builders constructing mobile, skidded, or pier-and-beam compact dwellings (120–400 sq ft).
* **Pain Points**: Undersizing heating systems leads to freeze damage; oversizing leads to short-cycling, high electrical draw, and excessive equipment costs. Uninsulated skirting causes frozen water supply lines.
* **Goal**: Accurately size heating equipment (mini-split heat pumps, propane furnaces, or wood stoves), design thermal battery floor systems, and evaluate skirting buffer zone temperatures before building.

### Persona 2: The Energy Auditor & Retrofitter
* **Profile**: Residents living in existing tiny homes, converted cabins, or uninsulated rural buildings wanting to lower heating bills.
* **Pain Points**: Lack of original construction blueprints or knowledge of internal wall insulation depth.
* **Goal**: Reverse-engineer whole-building effective envelope R-values and air leakage (ACH50) directly from winter utility bills and regional Heating Degree Days (HDD).

### Persona 3: The Off-Grid Homesteader & Firewood Processor
* **Profile**: Homesteaders heating with firewood who need rapid, reliable wood seasoning in temperate, humid climates (e.g., ASHRAE Climate Zone 4A / Central Appalachia).
* **Pain Points**: Burning unseasoned wood (>30% moisture content) cuts usable heat output by up to 57%, causes heavy chimney creosote, and wastes firewood. Outdoor ambient air drying takes 12–24 months.
* **Goal**: Model transpired solar air collector thermal gains, multi-layer greenhouse glazing losses, wood moisture evaporation rates, and 2-stage kiln dwell times to dry green timber to stove-ready (<20% MC) in 3–6 weeks, comparing the net financial savings against central heat pump operation.

### Persona 4: Autonomous Web Agents & Energy Optimizers (WebMCP)
* **Profile**: AI coding assistants (Gemini, Antigravity, Claude, local Ollama models) executing programmatic envelope optimizations.
* **Goal**: Query deterministic thermal tools via JSON-RPC/modelContext (`run_simulation`, `estimate_r_value`, `calculate_solar_kiln_performance`) to deliver instant executive summaries, HVAC equipment specifications, and optimal insulation schedules.

---

## 3. Product Architecture & Technical Invariants

```
                                +--------------------------------------------+
                                |               WebMCP Layer                 |
                                |  (window.navigator.modelContext / tsx MCP) |
                                +----------------------+---------------------+
                                                       |
       +-----------------------------------------------+-----------------------------------------------+
       |                                               |                                               |
+------v---------------------+           +-------------v--------------+                 +--------------v-------------+
|    Browser Presentation    |           |   Pure Computational Core  |                 |    Reference Documentation |
| - index.html               |           | - calculator.js            |                 | - docs/methods.md          |
| - existing_building_...html| <-------> | - insulation_calculator.js | <-------------> | - docs/help.md             |
| - insulationexplorer.html  |           | - insulation_explorer.js   |                 | - docs/SKINNING.md         |
| - skin.css / skin.js       |           | - materials.json           |                 | - docs/WebMCP.md           |
+----------------------------+           +----------------------------+                 +----------------------------+
```

### Architectural Invariants:
1. **Zero External Runtime Dependencies**: All math engines (`calculator.js`, `insulation_explorer.js`, `insulation_calculator.js`) are pure vanilla ES/CommonJS modules requiring zero external libraries. Charts and marked documentation render via decoupled CDNs.
2. **Strict Headless Separation**: Core physics and state algorithms are completely separated from presentation. Themes and downstream consumer apps customize typography, styling, and branding via the `docs/SKINNING.md` contract without altering calculation logic.
3. **WebMCP First-Class Protocol**: All computational endpoints are registered as native WebMCP tools returning JSON-serializable payloads with executive summaries (`peakHeatingLoadBTUPerHour`, `outdoorDwellDays`, `annualSavingsUsd`) alongside granular breakdown arrays.
4. **Deterministic & Unit-Tested**: Every mathematical formula must be verifiable via the Jest test harness (`npx jest --ci --runInBand`) in CI.

---

## 4. Functional Requirements

### 4.1 Module 1: Tiny Home Heat Loss & Diurnal Transient Simulator
* **FR-1.1 (Modified UA Heat Loss)**: Calculate whole-structure envelope heat loss separating air-coupled surfaces (walls, ceiling/roof, windows, doors, end walls) from ground-coupled surfaces (floor).
* **FR-1.2 (Air Infiltration Model)**: Model air leakage using ACH50 / air tightness quality multipliers (Standard 5 ACH, Tight 3 ACH, High Performance 1 ACH), applying a 25% penalty on envelope loss for poor air sealing.
* **FR-1.3 (Buffer Zone Skirting Physics)**: For raised foundations and trailers, calculate the dynamic equilibrium buffer temperature ($T_{\text{buffer}}$) between the insulated floor, skirted exterior walls, and ground heat exchange, predicting freezing hazards under cold design events.
* **FR-1.4 (Thermal Battery Modeling)**: Quantify the heat storage capacity ($\text{BTU}/^\circ\text{F}$) of the building's thermal mass (concrete floor slabs at $145\text{ lb/ft}^3$, stabilized rammed earth at $135\text{ lb/ft}^3$, or timber decking).
* **FR-1.5 (24-Hour Diurnal Coasting Simulation)**: Model indoor temperature trajectory over 24-hour and 7-day winter freeze cycles without supplemental heat, factoring in internal gains, diurnal outdoor temperature swings, and passive solar aperture.
* **FR-1.6 (Scenario A/B Side-by-Side Comparison)**: Provide real-time comparative modeling between two building envelopes (e.g. standard stick-frame vs high-mass passive envelope), displaying delta in peak heat load, heating equipment tonnage, and annual fuel expense.

### 4.2 Module 2: Existing Building Estimator
* **FR-2.1 (Utility Bill Energy Reverse-Engineering)**: Normalize monthly winter utility heating bills (kWh, therms, gallons of propane, cords of wood) against regional Heating Degree Days (HDD).
* **FR-2.2 (Effective R-Value Derivation)**: Reverse-engineer the whole-structure effective assembly R-value ($R_{\text{eff}}$) and heat loss rate ($\text{BTU}/(\text{hr}\cdot^\circ\text{F})$).
* **FR-2.3 (Infiltration Breakdown)**: Isolate conductive transmission losses from natural air infiltration (ACH50), isolating whether wall insulation or air sealing will produce the highest ROI retrofit.

### 4.3 Module 3: Insulation Explorer & Assembly Designer
* **FR-3.1 (Multi-Layer Series Resistance)**: Compute total thermal resistance across user-defined wall, roof, and floor assemblies ($R_{\text{total}} = \sum R_i$).
* **FR-3.2 (Framing Factor Thermal Bridging)**: Account for wood/steel stud framing thermal bridging using parallel-path conductance calculations ($U_{\text{parallel}} = f_{\text{stud}} U_{\text{stud}} + f_{\text{cavity}} U_{\text{cavity}}$).
* **FR-3.3 (Radiant Barrier Air Cavities)**: Enforce ASHRAE physics for radiant barrier foils: active low-emissivity resistance is credited ($R\text{-}5.0$ winter, $R\text{-}10.0$ summer) **only** when adjacent to an active dead-air gap ($\ge 0.75\text{ in}$); unvented contact layers revert to nominal material conductance ($R\text{-}0.1$) with explicit user warnings.

### 4.4 Module 4: Solar Kiln & Greenhouse Thermal Drying Simulator (New Requirement)
* **FR-4.1 (Multi-Layer Glazing Optical & Thermal Modeling)**:
  * Model solar transmittance across $n$ layers of 6-mil UV polyethylene film or polycarbonate: $\tau_{\text{net}} = (\tau_{\text{single}})^n$, where $\tau_{\text{single}} = 0.88$ ($88.0\%$ single, $77.4\%$ double, $68.1\%$ triple).
  * Calculate effective conductive resistance: $R_{\text{eff}} = 0.85 + (n - 1) \cdot R_{\text{air\_gap}}$, where $R_{\text{eff}} = 0.85$ ($n=1$), $1.80$ ($n=2$), and $2.70$ ($n=3$).
  * North wall opaque radiant barrier credit: Inner reflective foil + $3.5\text{ in}$ cavity adds $+R\text{-}1.75$ to $+R\text{-}2.70$, reaching $R_{\text{eff}} \approx 3.55$ ($U = 0.282$).
* **FR-4.2 (Transpired Solar Collector Thermal Gain)**:
  * Model active transpired screen solar air collectors:
    $$Q_{\text{coll}} = A_{\text{coll}} \cdot I_{\text{tilt}} \cdot \left(\frac{\tau_{\text{coll}}}{0.88}\right) \cdot \eta_{\text{coll}} \cdot f_{\text{flow\_penalty}}$$
  * Base collector efficiency $\eta_{\text{coll}} = 0.421$ with winter insolation $I_{\text{tilt}} = 950\text{ BTU}/(\text{ft}^2\cdot\text{day})$ at $55^\circ\text{--}60^\circ$ latitude tilt.
  * Fan series-chaining aerodynamic penalty: Chaining drying boxes in series reduces CFM by 45% and collector efficiency by 22% ($f_{\text{flow\_penalty}} = 0.78$).
* **FR-4.3 (Wood Moisture Mass & Energy Balance)**:
  * Calculate solid wood volume from gross stack volume using standard packing fraction $f_{\text{pack}} = 0.625$ ($80\text{ ft}^3$ solid wood per $128\text{ ft}^3$ gross cord).
  * Compute oven-dry biomass weight: $M_{\text{dry}} = V_{\text{solid}} \cdot \rho_{\text{dry}}$ using species dry density (36.0 lb/ft³ mixed Appalachian hardwood).
  * Calculate water mass to evaporate: $\Delta M_{\text{water}} = M_{\text{dry}} \cdot (MC_i - MC_f)$, converting to liquid gallons ($8.34\text{ lb/gal}$).
  * Compute total latent + sensible desorption drying energy at $1,150\text{ BTU/lb}$ of evaporated water ($Q_{\text{req}} = \Delta M_{\text{water}} \cdot 1,150$).
  * Split thickness diffusion scaling: Calculate non-linear drying diffusion multiplier:
    $$k_{\text{split}} = \left(\frac{d}{2.75}\right)^{1.5} \cdot k_{\text{bark}}$$
    where $d$ is split diameter in inches, $k_{\text{bark}} = 1.0$ for split wood and $k_{\text{bark}} = 2.2$ for unsplit round timber with intact bark.
* **FR-4.4 (Psychrometrics & Downdraft Buoyancy Dynamics)**:
  * Saturation vapor pressure via Magnus-Tetens approximation converted to psia.
  * Humidity ratio in grains per lb of dry air.
  * Moist air density calculations verifying the natural downdraft gravity sink: warm dry air entering at the top ($90^\circ\text{F}$ / 8% RH, $\rho = 0.0721\text{ lb/ft}^3$) absorbs evaporative moisture and cools, exiting the bottom heavily saturated ($60^\circ\text{F}$ / 90% RH, $\rho = 0.0759\text{ lb/ft}^3$, **+5.3% heavier**), reinforcing natural downward convective flow.
* **FR-4.5 (Hybrid 2-Stage Drying Strategy)**:
  * Stage-1: Transpired outdoor solar kiln evaporates free water down to the Fiber Saturation Point ($MC \approx 26\%$).
  * Stage-2: Conditioned indoor / basement finisher rack desorbs remaining bound water down to stove-ready ($MC \le 20\%$) using waste home heat, reducing outdoor kiln dwell days by up to 25%.
* **FR-4.6 (Firewood vs Central Heat Pump Economic ROI)**:
  * Calculate electricity equivalent cost per Million BTU ($\text{MMBTU}$) across seasonal heat pump COP ($2.40$) and auxiliary strip heat ($\text{COP } 1.0$).
  * Determine net stove heat output per cord: dry wood ($<20\%$ MC) yields $17.28\text{ MMBTU/cord}$ ($72\%$ stove efficiency) vs damp wood ($\sim 50\%$ MC) yielding $11.00\text{ MMBTU/cord}$ ($45.8\%$ stove efficiency), proving a $+57.1\%$ drying bonus ($\Delta Q = +6.28\text{ MMBTU/cord}$).
  * Compute seasonal dollar value, avoided electric costs, and DIY solar kiln capital payback period ($D_{\text{payback}} = \text{Cost} / \text{Savings}$).

---

## 5. Data Specifications & Material Presets

### 5.1 Glazing Materials (`materials.json`)
* **Single Layer 6-mil UV Greenhouse Film**: $\tau = 0.88$, $R\text{-}0.85$, $U = 1.176$.
* **Double Layer 6-mil UV Film ($3.5\text{ in}$ Pallet Gap)**: $\tau = 0.774$, $R\text{-}1.80$, $U = 0.556$.
* **Triple Layer 6-mil UV Film (Two $1.75\text{ in}$ Gaps)**: $\tau = 0.681$, $R\text{-}2.70$, $U = 0.370$.
* **North Wall Reflectix + Cavity**: $\tau = 0.00$, $R\text{-}3.55$, $U = 0.282$.

### 5.2 Hardwood Species Presets
* **NE Kentucky Mixed Hardwood** (Oak, Hickory, Sugar Maple, White Ash): Dry Density $36.0\text{ lb/ft}^3$, Gross Energy $24.0\text{ MMBTU/cord}$.
* **Dense White Oak / Shagbark Hickory**: Dry Density $42.0\text{ lb/ft}^3$, Gross Energy $27.7\text{ MMBTU/cord}$.
* **Soft Maple / Tulip Poplar**: Dry Density $29.0\text{ lb/ft}^3$, Gross Energy $18.6\text{ MMBTU/cord}$.

### 5.3 Wood Volume & Stack Presets
* **Half Basement Rack / 1 Bay** ($1.5' \times 6' \times 16"$): Gross $12.0\text{ ft}^3$, Solid $7.5\text{ ft}^3$ ($0.094\text{ cords}$).
* **Full Basement Rack / 1 Cubic Yard** ($3' \times 6' \times 18"$): Gross $27.0\text{ ft}^3$, Solid $17.0\text{ ft}^3$ ($0.211\text{ cords}$).
* **Single Outdoor Pallet Dryer** ($40" \times 48" \times 48"$): Gross $42.7\text{ ft}^3$, Solid $26.7\text{ ft}^3$ ($0.333\text{ cords}$).
* **Twin Outdoor Pallet Dryers (Flip-Flop)**: Gross $85.3\text{ ft}^3$, Solid $53.3\text{ ft}^3$ ($0.667\text{ cords}$).
* **Full Cord** ($4' \times 4' \times 8'$): Gross $128.0\text{ ft}^3$, Solid $80.0\text{ ft}^3$ ($1.000\text{ cords}$).

---

## 6. Integration & WebMCP Interface Requirements

The suite exposes the following programmatic tools to autonomous AI agents:

1. **`apply_preset`**: Ingests building geometry, insulation, and climate presets (e.g., "Zone 4 Tiny House", "High Mass Cabin").
2. **`set_dimensions`**: Updates structure dimensions, glazing ratios, and foundation configurations.
3. **`run_simulation`**: Executes the 24-hour diurnal transient simulation and returns peak BTU/hr, diurnal swings, and heat loss summaries.
4. **`get_detailed_results`**: Returns granular time-series thermal arrays, heat capacity, and surface breakdowns.
5. **`estimate_r_value`**: Reverse-engineers whole-structure R-values and ACH50 infiltration rates from monthly utility bills.
6. **`calculate_solar_kiln_performance`** (New Tool):
   * Accepts: `grossVolumeCuFt`, `initialMcPct`, `targetMcPct`, `useBasementFinisher`, `splitDiameterInches`, `isUnsplitRound`, `numCollectors`, `collectorGlazingLayers`, `boxGlazingLayers`, `electricRatePerKwh`, `heatPumpCop`, `buildCostUsd`.
   * Returns: Summary object with `outdoorDwellDays`, `waterEvapLbsPerDay`, `waterEvapGalPerDay`, `totalNetDailyBtu`, `seasonalSavingsUsd`, and `paybackWeeksTotalHeat`.

---

## 7. Skinning & Presentation Contracts

All visual presentation must honor the contract established in `docs/SKINNING.md`:
* **Theme Styling via CSS Variables**: Colors (`--color-primary`, `--color-solar`, `--color-drying`, `--color-savings`), typography, and geometry variables must be utilized rather than hardcoded hex values.
* **Declarative Logic Bindings**: UI inputs must preserve `data-model="..."` and buttons must preserve `data-action="..."` attributes.
* **Non-Destructive Enhancements**: Downstream custom themes inject headers, navigation pills, and logos via `skin.js` without modifying core HTML logic or invoking insecure `innerHTML` insertions.

---

## 8. Non-Functional Requirements

* **Performance & Latency**: Calculations must execute synchronously within $<50\text{ ms}$ on standard mobile hardware to ensure zero stutter on input sliders.
* **Client-Side & Offline Capability**: The entire suite must run offline without internet connectivity via standard static file serving (`npx serve .` or `python -m http.server`).
* **Cross-Browser & Device Support**: Responsive, touch-accessible layouts supporting modern mobile, tablet, and desktop viewports, with edge-to-edge support for foldables and notches.
* **Zero Telemetry & User Privacy**: 100% of user data, geometry inputs, and utility bills remain strictly client-side within local browser memory.
