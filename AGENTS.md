# Agent Context: Tiny Home Heat Loss Calculator

## 1. Project Overview

This project is a **no-build-step** static web application for estimating heating loads, R-values, and passive thermal performance of small structures (tiny homes, sheds, cabins, and van conversions). It consists of three interconnected tools:

| Page | Purpose | Core JS |
| :--- | :--- | :--- |
| `index.html` | Main Heat Loss & Passive Simulation Calculator | `calculator.js`, `webmcp.js` |
| `insulationexplorer.html` | Visual wall/roof assembly R-value explorer | `insulation_calculator.js` |
| `existing_building_estimator.html` | Reverse-engineer R-value from HVAC data | `existing_building_estimator.js` |

All pages share `styles.css`, `skin.css`, and `skin.js` for a consistent theme and skinning layer. Navigation between tools is via a hamburger menu present on every page.

## 2. Architecture & File Map

### 2.1 Core Application Files

```
├── index.html                        # Main calculator SPA
├── calculator.js                     # All calculation logic, charting, state persistence
├── webmcp.js                         # WebMCP imperative tool registration (module)
├── insulationexplorer.html           # Insulation Explorer SPA (inline JS + imported module)
├── insulation_calculator.js          # Assembly R-value engine (used by explorer)
├── existing_building_estimator.html  # R-Value Estimator SPA
├── existing_building_estimator.js    # Estimator logic, persistence, WebMCP tool
├── styles.css                        # Core CSS with CSS custom properties
├── skin.css                          # Theme overrides (consumed by child projects)
├── skin.js                           # Skin logic hooks (branding, injected UI)
```

### 2.2 Data Files

```
├── materials.json                    # Material library for Insulation Explorer
├── internal_gains.json               # Occupant & appliance heat gains (sensible + latent)
```

### 2.3 Documentation

```
├── AGENTS.md                         # This file — project specification for AI agents
├── README.md                         # User-facing documentation
├── SKINNING.md                       # Skinning contract (CSS variables, data attributes)
├── WebMCP.md                         # WebMCP implementation guidelines
├── llms.txt                          # Tool discovery index for navigating agents
├── methods.md                        # Detailed methodology research & references
├── Insulation Calculator Data Compilation.md  # Source data research
```

### 2.4 Testing & CI

```
├── calculator.test.js                # Jest tests for main calculator logic
├── insulation_logic.test.js          # Jest tests for assembly R-value engine
├── existing_building_estimator.test.js       # Jest tests for R-Value Estimator logic
├── existing_building_estimator_webmcp.test.js # Jest tests for estimator WebMCP tool
├── webmcp.test.js                    # Jest tests for main WebMCP tools
├── jest.config.json                  # Jest config (testEnvironment: jsdom)
├── package.json                      # Dependencies & scripts
├── .github/workflows/test.yml        # GitHub Actions CI (npm test on push/PR to main)
```

### 2.5 Debugging Artifacts (Temp)

```
├── debug_error.txt                   # Debug output (can be cleaned up)
├── debug_eval.js                     # Debug script (can be cleaned up)
├── debug_success.txt                 # Debug output (can be cleaned up)
```

## 3. Core Physics & Formulas

### 3.1 Geometry (calculator.js → `getSurfaceAreas`)

Derives surface areas from `buildingShape`:

| Shape | Floor | Roof | Walls | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `rectangle` | L×W | 2×L×slopeLen + gable ends (if pitched) | 2(L×H)+2(W×H) | Gable triangle area is assigned to roof assembly. Pitch is X:12 slope ratio (`rise = (W/2) * (pitch/12)`). |
| `a-frame` | L×W | 2×L×√((W/2)²+H²) | 2×(0.5×W×H) end walls | No vertical side walls |
| `gothic-arch` | L×W | L×(π×W/2) arch perimeter | π×(W/2)² arch ends + 2(L×SpringH) side walls + 2(W×SpringH) end walls | Full end wall includes arch semicircles + spring wall rectangles |
| `cargo-van` | L×W | L×W | 2(L×H)+2(W×H) | Floor is **air-coupled**, not ground-coupled |

### 3.2 Effective R-Value (calculator.js → `calculateEffectiveR`)

Walls and Roofs use assembly-based R-value calculation, **not** simple nominal R-values:

* **Stick Frame (Wood/Steel/Van Ribs):** Parallel Path Method with framing factors and ASHRAE steel correction factors. Accounts for cavity insulation, continuous insulation, and fastener point-load losses (chi-value method).
  * Framing factors ($f_f$): 16" o.c. = 0.25, 24" o.c. = 0.22, Wood truss = 0.12, Van ribs = 0.10.
  * Stud depths: 2x4 = 3.5", 2x6 = 5.5", 2x8 = 7.25", 2x10 = 9.25", 2x12 = 11.25".
* **Mass Wall:** Series summation of mass material R-value + additional insulation + air films.
* **Direction-Specific Air Films:**
  * Walls: Interior R=0.68, Exterior R=0.17.
  * Roof/Ceiling: Interior R=0.61 (heat flow up), Exterior R=0.17.
  * Floor: Interior R=0.92 (heat flow down), Exterior R=0.17.
* **Base Gypsum/Sheathing R=1.0:** Applied to **wall assemblies only** (R-0.45 gypsum + R-0.62 OSB allowance). Roof and floor assemblies stand on their own inputs.
* **Thinsulate SM600L:** Rated at $R = 3.15$ per inch ($R = 5.2$ total at 1.65" thickness).

Steel correction factors from `STEEL_CORRECTION_FACTORS` (multiplies nominal cavity R directly: $R_{eff\_cav} = R_{cav} \times F_{steel}$):
* 2×4 @16"oc: 0.46, @24"oc: 0.55
* 2×6 @16"oc: 0.37, @24"oc: 0.45
* 2×8 @16"oc: 0.30, @24"oc: 0.35 (extrapolated)
* Van Ribs: 0.25 (severe penalty)

Continuous Insulation (CI) Fastener Correction (ISO 10211 Point Thermal Transmittance):
$$U_{eff\_ci} = \frac{1}{R_{ci}} + (\chi \cdot n) \implies R_{eff\_ci} = \frac{1}{U_{eff\_ci}}$$
where $\chi$ is point transmittance ($\text{BTU/h}\cdot^\circ\text{F}$ per fastener) and $n$ is fastener density per $\text{ft}^2$.

### 3.3 Heat Loss & Infiltration (calculator.js → `calculateHeatLoss`)

$$Q_{total} = Q_{envelope} + Q_{floor} + Q_{infiltration}$$

* **Envelope (Air Coupled):** $Q_{env} = \left(\frac{A_{wall}}{R_{wall}} + \frac{A_{roof}}{R_{roof}} + \frac{A_{window}}{R_{win}} + \frac{A_{door}}{R_{door}}\right) \times (T_{in} - T_{out})$
* **Infiltration Loss (ACH-based):** $Q_{infil} = V \times ACH \times 0.018 \times (T_{in} - T_{out})$
  * Tightness levels: Passive House ($ACH=0.15$), Tight ($ACH=0.35$), Average ($ACH=0.50$), Leaky ($ACH=1.00$).
* **Floor Loss:**
  * **Ground-Coupled (Slab-on-Grade):** Calculated via ASHRAE F-factor perimeter method:
    $$Q_{floor} = F \times P \times (T_{in} - T_{out})$$
    (F-factors: Uninsulated=0.73, R-5=0.54, R-10=0.43, R-15=0.36 BTU/hr·ft·°F).
  * **Air-Coupled (Vehicles / Stilts):** $Q_{floor} = \frac{A_{floor}}{R_{floor}} \times (T_{in} - T_{out})$.
  * **Skirted Buffer Zone:** Solved via steady-state nodal balance (see Section 3.4).

### 3.4 Buffer Zone / Skirting

Solves for $T_{buffer}$ via nodal steady-state balance when skirting R-value > 0 and height > 0:

$$T_{buffer} = \frac{T_{in} \cdot U_f + T_{out} \cdot (U_s + Q_v) + T_{ground} \cdot U_g}{U_f + U_s + U_g + Q_v}$$

* $U_f = A_{floor} / R_{floor}$
* $U_s = (P \times h_{skirt}) / R_{skirt}$
* $U_g = A_{floor} / 5.0$ (Ground resistance $R=5.0 \text{ hr}\cdot\text{ft}^2\cdot^\circ\text{F/BTU}$)
* Skirting ACH constants ($Q_v = V_{skirt} \cdot ACH \cdot 0.018$): Sealed=0.5, Vented=5.0, Leaky=20.0.

### 3.5 Thermal Battery (calculator.js → `calculateMassCapacity`)

$$C_{th} = C_{floor} + C_{structure}$$

* $C_{floor} = (A \times t/12) \times D \times C_p$
  * Concrete: D=145 lb/ft³, Cp=0.20
  * Stone (Granite/Limestone): D=160 lb/ft³, Cp=0.19, R=0.08/in
  * Rammed Earth: D=120 lb/ft³, Cp=0.22, R=0.14/in
  * Packed Soil: D=100 lb/ft³, Cp=0.20, R=0.20/in
  * Wood: D=30 lb/ft³, Cp=0.40
  * Metal (Steel): D=490 lb/ft³, Cp=0.12
* $C_{structure} = A_{envelope} \times 1.5$ BTU/°F (structural mass baseline)

### 3.6 Passive Simulation (calculator.js → `calculateSimulationData`)

Finite-difference time stepping at **1-minute sub-steps** (60 per displayed hour) with sub-step outdoor temperature interpolation:

$$T_{in}^{(t+1)} = T_{in}^{(t)} + \frac{Q_{gains} - Q_{loss}}{C_{th}} \times \Delta t$$

* **Outdoor Temperature Model:** Diurnal cosine wave with sunrise minimum (~6 AM) and afternoon maximum (~3 PM):
  $$T_{out}(h, m) = T_{avg} - A_{amp} \cos\left(\frac{\pi (h + m/60 - 6)}{12}\right)$$
* **Ground Temperature Model:** Small diurnal variation (1°F amplitude, 6-hour lag behind air temp):
  $$T_{ground}(h) = T_{ground\_avg} - 1.0 \cos\left(\frac{\pi (h - 12)}{12}\right)$$
* **Physics-Based Solar Gain Model:**
  $$Q_{solar} = A_{window} \times SHGC \times I_{peak} \times \sin\left(\frac{\pi (h - h_{sunrise})}{h_{sunset} - h_{sunrise}}\right)$$
  * SHGC derived from window type: single=0.86, double=0.76, low-e=0.40.
  * Winter vertical peak irradiance $I_{peak} = 120 \text{ BTU/hr}\cdot\text{ft}^2$.
  * Vehicle Color toggle: "Dark" applies 1.5× solar gain multiplier.
* Internal gains from `internal_gains.json` (sensible heat only; latent excluded).

### 3.7 Insulation Explorer (insulation_calculator.js → `calculate`)

Computes assembly R-value with separate Winter (heat-up) and Summer (heat-down) values:
* Radiant barriers: Active only when adjacent to an air gap (R-10 summer / R-5 winter when active, nominal R when inactive).
* Compression warnings when insulation exceeds framing depth.

### 3.8 R-Value Estimator (existing_building_estimator.js → `calculateRValue`)

Reverse-engineers R-value from HVAC load using energy balance:
1. Calculates infiltration loss from ACH rate, space volume, and ΔT.
2. Uses `R_VALUE_IMPERIAL_TO_SI = 0.1761101838` for precise unit conversions.
3. Subtracts known losses (windows, other walls/ceilings, floor) using default U-values.
4. Solves for target component U-value from remaining heat balance (assuming zero internal/solar gains for a conservative baseline).
5. Optionally calculates material-only R-value from surface temperatures.

## 4. Implemented Features

### 4.1 Main Calculator (`index.html`)
- [x] 4 building shapes (Rectangle, A-Frame, Gothic Arch, Cargo Van)
- [x] A/B scenario comparison with independent construction details
- [x] Wall assembly builder (Stick Frame with wood/steel/van ribs, Mass Wall)
- [x] Fastener thermal bridging (galvanized, stainless, adhesive + chi-value)
- [x] Foundation/Skirting buffer zone calculation
- [x] Glazing presets (Minimal/Common/Generous)
- [x] Construction presets (Code Min, High Perf, Passive House, Van Build, Uninsulated)
- [x] Thermal Mass calculator with 4 floor types
- [x] Passive temperature simulation (24h or 7-day)
- [x] Chart.js visualizations (Heat Loss curve, Breakdown bar, Simulation line)
- [x] Internal gains from JSON (occupants + appliances with sensible/latent split)
- [x] Custom heat sources (user-defined, persisted separately)
- [x] LocalStorage persistence for all inputs
- [x] URL serialization/deserialization for shareable links
- [x] Vehicle color solar gain modifier (Light/Dark)
- [x] Help modal loading `methods.md` via fetch + marked.js
- [x] SEO meta tags (OpenGraph, Twitter Cards)
- [x] Declarative WebMCP forms: `update_shared_settings`, `update_scenario_a`, `update_scenario_b`, `update_simulation_settings`

### 4.2 Insulation Explorer (`insulationexplorer.html`)
- [x] Drag-and-drop-style layer assembly from `materials.json`
- [x] A/B comparison mode with independent stacks
- [x] Real-time R-value calculation (Winter/Summer split)
- [x] Radiant barrier interaction logic (active vs. inactive)
- [x] Compression warnings
- [x] Inspector notes panel
- [x] URL serialization for shareable links
- [x] WebMCP tool: `calculate_assembly`

### 4.3 R-Value Estimator (`existing_building_estimator.html`)
- [x] Energy balance calculation with infiltration
- [x] Overall (air-to-air) and Material (surface-to-surface) R-values
- [x] Imperial and SI unit display
- [x] LocalStorage persistence and URL sharing
- [x] Help modal with documentation
- [x] Declarative WebMCP form: `estimate_r_value`
- [x] Imperative WebMCP tool: `estimate_r_value`

## 5. MCP Integration (WebMCP & Backend MCP Server)

### 5.1 Overview & Architecture

This project supports two Model Context Protocol (MCP) integrations:
1. **Client-Side WebMCP:** In-browser tools exposing SPA features to browser-based AI agents via `@mcp-b/global`.
2. **Backend MCP Server (`/mcp-server/`):** Standalone Node.js / TypeScript MCP server built with `@modelcontextprotocol/sdk`. Exposes core thermal physics tools, JSON resource libraries, and audit prompts for desktop AI clients (e.g. Claude Desktop, Antigravity, Cursor) via `stdio` or `http/sse` transports.

### 5.2 Backend MCP Server Tools & Capabilities

Start the backend MCP server using `npm run mcp:start` (stdio) or `npm run mcp:start -- --sse` (HTTP/SSE).

| Type | Name / URI | Description |
| :--- | :--- | :--- |
| **Tool** | `calculate_heat_loss` | Computes envelope heat loss, UA summation, infiltration, floor coupling, and thermal mass. |
| **Tool** | `calculate_assembly_rvalue` | Computes effective winter/summer R-values for custom material stacks (radiant barriers, compression). |
| **Tool** | `estimate_r_value_from_hvac` | Reverse-engineers component R-value from empirical HVAC load and temperature differentials. |
| **Tool** | `run_passive_simulation` | Runs 24h / 7-day finite-difference diurnal thermal simulation with 1-minute time steps. |
| **Resource** | `materials://library` | Read-only JSON resource exposing full `materials.json` library. |
| **Resource** | `internal_gains://library` | Read-only JSON resource exposing full `internal_gains.json` occupant & appliance gains. |
| **Prompt** | `audit_tiny_home_insulation` | Prompt preset guiding AI assistants through a systematic tiny structure thermal audit. |

### 5.3 Registered Imperative WebMCP Tools (Browser)

Registered via `window.navigator.modelContext.registerTool()`:

| Tool | File | Description |
| :--- | :--- | :--- |
| `apply_preset` | `webmcp.js` | Apply a construction preset to a scenario suffix |
| `set_dimensions` | `webmcp.js` | Set building shape and dimensions |
| `run_simulation` | `webmcp.js` | Run passive thermal simulation |
| `get_detailed_results` | `webmcp.js` | Retrieve current heat loss results |
| `calculate_assembly` | `insulationexplorer.html` | Calculate R-value for a material stack |
| `estimate_r_value` | `existing_building_estimator.js` | Estimate component R-value from HVAC data |

### 5.4 Declarative Form Tools

Annotated with `toolname`, `tooldescription`, `toolparamdescription`, `toolautosubmit`:

| Tool | Page |
| :--- | :--- |
| `update_shared_settings` | `index.html` |
| `update_scenario_a` | `index.html` |
| `update_scenario_b` | `index.html` |
| `update_simulation_settings` | `index.html` |
| `estimate_r_value` (form) | `existing_building_estimator.html` |

### 5.5 Discovery & Testing

- All tools are indexed in `llms.txt` at the repository root.
- Backend MCP Server tests: `npm run mcp:test` (`mcp-server/mcp_server.test.ts`).
- WebMCP Browser tests: `npm test` using Jest & jsdom with `setMockToolResponse`.

## 6. Skinning & Extension Architecture

### 6.1 Philosophy

* **Core (this repo):** Logic + structure + basic theme. Fully functional on GitHub Pages.
* **Skin (child projects):** Override via `skin.css` / `skin.js` per the contract in `SKINNING.md`.

### 6.2 Rules

1. **No build steps.** The repo must work as plain static files.
2. **CSS Variables for theming.** See `SKINNING.md` for the full variable table.
3. **`data-` attributes for logic bindings** — skins may change classes freely.
4. **`skin.css` / `skin.js` are override points** for child projects.

## 7. Development & Testing

### 7.1 Running Tests

```bash
npm install
npm test
```

Test environment: `jsdom` (configured in `jest.config.json`). Tests mock DOM, Chart.js, fetch, and localStorage.

### 7.2 Test Files

| Test File | Covers |
| :--- | :--- |
| `calculator.test.js` | Heat loss, thermal mass, surface areas, presets, effective R-value, A/B mode, custom gains |
| `insulation_logic.test.js` | Assembly R-value calculation, radiant barriers, compression |
| `existing_building_estimator.test.js` | R-value estimation, error handling, persistence |
| `existing_building_estimator_webmcp.test.js` | WebMCP tool registration and execution |
| `webmcp.test.js` | All imperative WebMCP tools |

### 7.3 CI/CD

GitHub Actions (`.github/workflows/test.yml`): Runs `npm test` on push/PR to `main` using Node 20 on `ubuntu-latest`.

## 8. Verification Scenarios

Run these after making changes to validate calculator integrity.

### Scenario A: "Shoebox" Baseline

**Goal:** Verify basic UA summation.

* Shape: Rectangle, L=20 W=10 H=10 Pitch=0
* Temps: Indoor=70, Outdoor=20, Ground=50
* R-Values: Wall=10, Roof=10, Floor=10 (set via direct R-value, not assembly)
* Openings: 0 windows, 0 doors | Sealing: Good
* **Expected:** ~4,400 BTU/hr
  * Walls: (600/10)×50=3,000 | Roof: (200/10)×50=1,000 | Floor: (200/10)×20=400

### Scenario B: Thermal Mass Capacity

**Goal:** Verify thermal battery math.

* Dims: L=10 W=10 H=10 Pitch=0 | Material: Concrete, 6"
* **Expected Total Capacity:** 2,350 BTU/°F
  * Floor: 50ft³ × 145 × 0.2 = 1,450 | Structure: 600sqft × 1.5 = 900

### Scenario C: A/B Comparison

**Goal:** Verify independent scenario handling.

1. Scenario A: "Shoebox" inputs → **4,400 BTU/hr**
2. Scenario B: Wall R=20, rest same → **2,900 BTU/hr**

## 9. Verification Instructions for Agents

1. **Inject Values:** `document.getElementById('ID').value = X`
2. **Trigger Events:** Dispatch `new Event('input')` or `new Event('change')` to fire `calculateAll()`.
3. **Read Output:** Check `document.getElementById('resultLoss_A').textContent`.
4. **Validate:** Parse result (remove commas), compare ±1% tolerance.
5. **Clear All:** Click "Clear all" button. Confirm standard inputs reset. Confirm custom gains are retained but quantities reset to 0.

## 10. Accessibility Requirements

1. **Semantic HTML:** Proper `<header>`, `<main>`, `<article>`, `<button>`, `<section>` usage.
2. **ARIA:** `aria-label` on interactive elements, `aria-live="polite"` on result regions. Charts have `role="img"` + descriptive `aria-label`.
3. **Keyboard Navigation:** All interactive elements focusable and operable.
4. **Color Contrast:** WCAG AA minimum.
5. **Screen Reader:** Charts described via ARIA; results announced dynamically.

## 11. Maintenance Rules

### 11.1 AGENTS.md Code Sync
When modifying any formula, constant, or calculation logic in the codebase, the corresponding section in AGENTS.md **MUST** be updated in the same changeset. Specifically:
- Section 3 (Core Physics & Formulas) must match the actual code in `calculator.js`, `insulation_calculator.js`, and `existing_building_estimator.js`
- All physical constants and their values must match what is defined in source code
- All verification scenarios (Section 8) must be re-validated after formula changes

Before making changes to calculation logic, **always read the relevant source code** rather than relying solely on AGENTS.md descriptions, as they may have drifted.

### 11.2 Engineering Constants Verification
When adding or modifying material properties, thermal constants, or physical coefficients:
1. **Cite the source** in a code comment (e.g., `// ASHRAE Fundamentals Ch. 26`, `// Manufacturer datasheet`)
2. **Verify units** — distinguish between R-per-inch vs R-total, per-fastener vs per-sqft, etc.
3. **Cross-check against authoritative sources**: ASHRAE Handbook of Fundamentals, manufacturer datasheets, ISO standards, or DOE/ORNL publications
4. **For R-values**: Always confirm whether the value is per-inch or total. If a product has a fixed thickness (e.g., Thinsulate SM600L at 1.65"), store as `r_total` not `r_inch` to avoid misapplication at different depths.

### 11.3 Vanilla JS Dual-Export Pattern
For pure client-side static JS files that are evaluated or imported in Jest test environments:
- Attach primary calculation functions and helpers to `window` (`if (typeof window !== 'undefined') window.func = func`) so inline HTML scripts and DOM events can access them.
- Export key functions via `if (typeof module !== 'undefined') module.exports = { ... }` so Node/Jest can import them directly without DOM `eval` side effects.
