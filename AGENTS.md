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
| `rectangle` | L×W | L×W (flat) or 2×L×slopeLen (pitched) | 2(L×H)+2(W×H) + gable ends | Supports configurable roof pitch |
| `a-frame` | L×W | 2×L×√((W/2)²+H²) | 2×(0.5×W×H) end walls | No vertical side walls |
| `gothic-arch` | L×W | L×(π×W/2) arch perimeter | π×(W/2)² ends + 2×L×SpringH | Optional spring walls |
| `cargo-van` | L×W | L×W | 2(L×H)+2(W×H) | Floor is **air-coupled**, not ground-coupled |

### 3.2 Effective R-Value (calculator.js → `calculateEffectiveR`)

Walls use assembly-based R-value calculation, **not** a simple nominal R-value:

* **Stick Frame (Wood/Steel/Van Ribs):** Parallel Path Method with framing factors and ASHRAE steel correction factors. Accounts for cavity insulation, continuous insulation, and fastener point-load losses (chi-value method).
* **Mass Wall:** Series summation of mass material R-value + additional insulation + air films.
* **Air Films:** Interior R=0.68, Exterior R=0.17 (automatically added).

Steel correction factors from `STEEL_CORRECTION_FACTORS`:
* 2×4 @16"oc: 0.46, @24"oc: 0.55
* 2×6 @16"oc: 0.37, @24"oc: 0.45
* Van Ribs: 0.25 (severe penalty)

### 3.3 Heat Loss (calculator.js → `calculateHeatLoss`)

$$Q_{total} = Q_{envelope} + Q_{floor}$$

* **Envelope (Air Coupled):** $Q_{env} = \left(\frac{A_{wall}}{R_{wall}} + \frac{A_{roof}}{R_{roof}} + \frac{A_{window}}{R_{win}} + \frac{A_{door}}{R_{door}}\right) \times (T_{in} - T_{out})$
* **Floor:** Ground-coupled for buildings ($\Delta T = T_{in} - T_{ground}$), Air-coupled for vehicles ($\Delta T = T_{in} - T_{out}$).
* **Air Sealing Penalty:** If `airSealing === 'poor'`, $Q_{envelope} \times 1.25$.

### 3.4 Buffer Zone / Skirting

Solves for $T_{buffer}$ via nodal steady-state balance when skirting R-value > 0:

$$T_{buffer} = \frac{T_{in} \cdot UA_{floor} + T_{out} \cdot (UA_{skirt} + Q_{vent}) + T_{ground} \cdot UA_{ground}}{UA_{floor} + UA_{skirt} + UA_{ground} + Q_{vent}}$$

Skirting ACH constants: Sealed=0.5, Vented=5.0, Leaky=20.0.

### 3.5 Thermal Battery (calculator.js → `calculateMassCapacity`)

$$C_{th} = C_{floor} + C_{structure}$$

* $C_{floor} = (A \times t/12) \times D \times C_p$
  * Concrete: D=145, Cp=0.2 | Stone/Earth: D=135, Cp=0.2 | Wood: D=30, Cp=0.4
* $C_{structure} = A_{envelope} \times 1.5$ BTU/°F (stability baseline)

### 3.6 Passive Simulation (calculator.js → `calculateSimulationData`)

Finite-difference time stepping at **1-minute sub-steps** (60 per displayed hour):

$$T_{in}^{(t+1)} = T_{in}^{(t)} + \frac{Q_{gains} - Q_{loss}}{C_{th}} \times \Delta t$$

* Solar gains applied 9 AM–5 PM only.
* Internal gains from `internal_gains.json` (sensible heat only; latent excluded).
* Vehicle Color toggle: "Dark" applies 1.5× solar gain multiplier.

### 3.7 Insulation Explorer (insulation_calculator.js → `calculate`)

Computes assembly R-value with separate Winter (heat-up) and Summer (heat-down) values:
* Radiant barriers: Active only when adjacent to an air gap (R-10 summer / R-5 winter when active, nominal R when inactive).
* Compression warnings when insulation exceeds framing depth.

### 3.8 R-Value Estimator (existing_building_estimator.js → `calculateRValue`)

Reverse-engineers R-value from HVAC load using energy balance:
1. Calculates infiltration loss from ACH rate, space volume, and ΔT.
2. Subtracts known losses (windows, other walls/ceilings, floor) using default U-values.
3. Solves for target component U-value from remaining heat balance.
4. Optionally calculates material-only R-value from surface temperatures.

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

## 5. WebMCP Integration

### 5.1 Architectural Directive

* **Client-side only.** DO NOT create backend MCP servers. All tool logic runs in the browser.
* Polyfill: `@mcp-b/global` loaded via ESM from CDN (with local fallback).

### 5.2 Registered Imperative Tools

Registered via `window.navigator.modelContext.registerTool()`:

| Tool | File | Description |
| :--- | :--- | :--- |
| `apply_preset` | `webmcp.js` | Apply a construction preset to a scenario suffix |
| `set_dimensions` | `webmcp.js` | Set building shape and dimensions |
| `run_simulation` | `webmcp.js` | Run passive thermal simulation |
| `get_detailed_results` | `webmcp.js` | Retrieve current heat loss results |
| `calculate_assembly` | `insulationexplorer.html` | Calculate R-value for a material stack |
| `estimate_r_value` | `existing_building_estimator.js` | Estimate component R-value from HVAC data |

### 5.3 Declarative Form Tools

Annotated with `toolname`, `tooldescription`, `toolparamdescription`, `toolautosubmit`:

| Tool | Page |
| :--- | :--- |
| `update_shared_settings` | `index.html` |
| `update_scenario_a` | `index.html` |
| `update_scenario_b` | `index.html` |
| `update_simulation_settings` | `index.html` |
| `estimate_r_value` (form) | `existing_building_estimator.html` |

### 5.4 Discovery

All tools are indexed in `llms.txt` at the repository root for agent discovery.

### 5.5 Testing

Mock tool responses via `window.navigator.modelContextTesting.setMockToolResponse("tool_name", mockResponse)`.

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
