# Skinning Guide & Presentation Contract

This repository (`core`) serves as the headless logic, building science, and structural foundation for skinnable implementations (such as `tinycalc` and downstream consumer apps).

The skinning architecture decouples computational physics from visual presentation, allowing brand partners, clients, and custom UI themes to overhaul typography, palettes, layouts, and feature sets without breaking simulation integrity.

---

## 1. The "Clean Contract"

To skin this application **without breaking core simulation or WebMCP logic**, themes and skins must adhere to the following contract.

### 🚫 Do NOT:
* **Never rename or remove structural ID attributes** on form inputs, calculation buttons, or result containers (e.g., `#resultsGrid`, `#solarKilnResults`, `#helpModal`). The underlying calculation engines and WebMCP bridges bind directly to these hooks.
* **Never strip `data-model`, `data-action`, or `data-output` attributes** from DOM elements.
* **Never remove required input elements from the DOM**; instead, hide them using CSS if a skin does not expose that parameter to end users.
* **Never use `innerHTML` when injecting dynamic text or values**; always use `textContent` or safe DOM node creation to prevent XSS vulnerabilities.
* **Never depend on fragile DOM traversal** (e.g., `parentElement.nextElementSibling.children[0]`). Always target specific classes, IDs, or `data-` attributes.

### ✅ DO:
* **Override CSS Custom Properties (Variables)** in your own `skin.css` (or `skin/skin.css`).
* **Hide unwanted elements or sections with CSS** (e.g., `.hidden-in-skin { display: none !important; }`).
* **Inject branding, header icons, custom call-to-actions, and supplementary controls** via `skin.js` using non-destructive DOM insertion (`insertBefore`, `prepend`, or `appendChild`).
* **Read live outputs** using `data-output` bindings or global calculation hooks (`window.calculateAll()`, `window.calculateSolarKiln()`).

---

## 2. CSS Variables (The Theme API)

The core stylesheet (`styles.css`) defines standard tokens. Override any or all of these variables in `skin.css`:

### 2.1 Core Semantic Colors
| Variable | Default (Core) | Description |
| :--- | :--- | :--- |
| `--color-primary` | `#2563eb` (Blue 600) | Primary action buttons, active states, key highlights. |
| `--color-primary-hover` | `#1d4ed8` (Blue 700) | Hover and focus states for primary interactive elements. |
| `--color-primary-subtle` | `#eff6ff` (Blue 50) | Light backgrounds for primary cards and Scenario A. |
| `--color-secondary` | `#10b981` (Green 500) | Secondary actions, badges, and Scenario B highlights. |
| `--color-secondary-subtle` | `#ecfdf5` (Green 50) | Light backgrounds for secondary cards and Scenario B. |
| `--color-accent` | `#f59e0b` (Amber 500) | Warnings, highlight callouts, and passive heat loss warnings. |
| `--color-danger` | `#ef4444` (Red 500) | Critical thermal warnings, frozen pipe alerts, and error states. |
| `--color-text-main` | `#1f2937` (Gray 800) | Primary body text and prominent headers. |
| `--color-text-sub` | `#4b5563` (Gray 600) | Secondary descriptions, input labels, and helper notes. |
| `--color-bg-app` | `#f3f4f6` (Gray 100) | Main viewport/page background. |
| `--color-bg-card` | `#ffffff` (White) | Background color for form sections and result cards. |
| `--color-border` | `#e5e7eb` (Gray 200) | Input borders, container dividers, and card outlines. |

### 2.2 Solar Kiln & Biomass Thermal Palette (New Module)
| Variable | Default (Core) | Description |
| :--- | :--- | :--- |
| `--color-solar` | `#f59e0b` (Amber 500) | Solar radiation highlights, collector gain cards, and peak sun indicators. |
| `--color-solar-subtle` | `#fffbeb` (Amber 50) | Background tint for active transpired solar collector stats. |
| `--color-drying` | `#06b6d4` (Cyan 500) | Evaporation indicators, moisture removal metrics, and humidity status. |
| `--color-drying-subtle` | `#ecfeff` (Cyan 50) | Background tint for drying dwell times and moisture delta graphs. |
| `--color-kiln-heat` | `#ea580c` (Orange 600) | High-temperature kiln plenum status, thermal absorption, and airflow metrics. |
| `--color-savings` | `#16a34a` (Green 600) | Avoided heat pump kWh costs, firewood economic substitution value, and ROI. |

### 2.3 Geometry & Typography Tokens
| Variable | Default (Core) | Description |
| :--- | :--- | :--- |
| `--radius-card` | `0.5rem` | Border radius for main cards and result containers. |
| `--radius-input` | `0.375rem` | Border radius for form controls, selects, and action buttons. |
| `--radius-pill` | `9999px` | Border radius for status badges and toggle switches. |
| `--spacing-base` | `1rem` | Base spatial grid unit for padding and margins. |
| `--font-heading` | `'Inter', system-ui, sans-serif` | Font family for page titles and section headers. |
| `--font-body` | `'Inter', system-ui, sans-serif` | Font family for body text, form labels, and table cells. |
| `--font-mono` | `'Courier New', monospace` | Font family for numeric outputs, R-values, and psychrometric data. |

---

## 3. Data Attributes (The Logic API)

The core suite uses declarative HTML `data-` attributes to decouple JavaScript calculation handlers from CSS layout classes. Skins can alter markup structures freely as long as these data bindings remain intact.

### 3.1 Actions (`[data-action]`)
| Attribute | Scope | Purpose |
| :--- | :--- | :--- |
| `[data-action="calculate"]` | Tiny Home Calculator | Triggers the main 24-hour heat loss and thermal battery simulation. |
| `[data-action="toggle-ab"]` | Tiny Home Calculator | Toggles between Single Scenario and Scenario A/B comparative mode. |
| `[data-action="estimate-r"]` | Existing Building Estimator | Triggers reverse-engineering calculation from utility bills. |
| `[data-action="add-layer"]` | Insulation Explorer | Adds a new material layer to the assembly stack. |
| `[data-action="calculate-solar-kiln"]` | Solar Kiln Module | Executes the solar heat balance, wood moisture removal, and ROI calculation. |
| `[data-action="apply-kiln-preset"]` | Solar Kiln Module | Ingests a standard volume/species preset into the form inputs. |
| `[data-action="toggle-kiln-stage"]` | Solar Kiln Module | Toggles Stage-1 outdoor drying vs Stage-2 indoor basement finishing. |

### 3.2 Model Bindings (`[data-model]`)

#### Tiny Home & Heat Loss Envelope Inputs:
* `[data-model="indoorTemp"]`: Indoor thermostat setpoint (°F).
* `[data-model="outdoorTemp"]`: Winter design cold temperature (°F).
* `[data-model="length"]`, `[data-model="width"]`, `[data-model="height"]`: Envelope dimensions (ft).
* `[data-model="wallR"]`, `[data-model="roofR"]`, `[data-model="floorR"]`: Nominal insulation values.
* `[data-model="windowArea"]`, `[data-model="windowU"]`: Glazing properties.
* `[data-model="airTightness"]`: Infiltration rating (ACH50 / Air Sealing quality).

#### Solar Kiln & Greenhouse Module Inputs:
* `[data-model="grossVolumeCuFt"]`: Stacked wood gross volume in cubic feet (e.g. 27.0 for 1 yd³, 42.7 for 1 pallet, 128 for 1 cord).
* `[data-model="woodSpecies"]`: Selected hardwood species preset (`ne_ky_mixed_hardwood`, `white_oak_hickory`, `soft_maple_poplar`).
* `[data-model="initialMcPct"]`: Initial wood moisture content % on dry basis (e.g. 75 green, 50 semi-seasoned).
* `[data-model="targetMcPct"]`: Target stove-ready moisture content % (standard 20%).
* `[data-model="splitDiameterInches"]`: Average wood split thickness in inches (default 2.75").
* `[data-model="isUnsplitRound"]`: Boolean checkbox indicating whether wood is unsplit round timber with intact bark.
* `[data-model="useBasementFinisher"]`: Boolean checkbox indicating 2-stage finishing (drying to 26% FSP outdoors, then indoor finishing).
* `[data-model="numCollectors"]`: Number of active transpired solar air collectors (e.g. 2 panels).
* `[data-model="collectorGlazingLayers"]`: Polyethylene/polycarbonate film layers on collectors (1 to 3).
* `[data-model="boxGlazingLayers"]`: Glazing layers on pallet greenhouse walls (1 to 3).
* `[data-model="electricRatePerKwh"]`: Grid electricity rate in $/kWh (default $0.169).
* `[data-model="heatPumpCop"]`: Seasonal COP of central heat pump (default 2.40).
* `[data-model="buildCostUsd"]`: DIY solar kiln capital expenditure in USD (default $234.00).

### 3.3 Output Hooks (`[data-output]`)

Skins can display calculated results anywhere in the DOM by attaching `data-output="<key>"`:
* `[data-output="heatingLoadBTUPerHour"]`: Peak heating demand in BTU/hr.
* `[data-output="heatingLoadWatts"]`: Peak heating demand in Watts.
* `[data-output="thermalBatteryCapacity"]`: Heat storage potential in BTU/°F.
* `[data-output="outdoorDwellDays"]`: Days required in solar kiln to reach target moisture content.
* `[data-output="waterEvapLbsPerDay"]`: Pounds of water evaporated per clear solar day.
* `[data-output="totalNetDailyBtu"]`: Net daily thermal energy delivered to the drying stack (BTU/day).
* `[data-output="seasonalValueVsHeatPump"]`: Total seasonal financial savings compared to running a heat pump ($).
* `[data-output="paybackWeeksTotalHeat"]`: Weeks of operation required to recoup DIY build costs.

---

## 4. Feature Flags & Component Visibility

Themes can selectively disable or streamline features entirely through CSS without altering application source code:

### 4.1 Hiding A/B Testing
To display a simplified, single-scenario calculator:
```css
#abToggleContainer,
.scenario-b-panel,
[data-scenario="B"] {
    display: none !important;
}
```
*Note: In `skin.js`, ensure the input `document.getElementById('abToggle').checked = false` on initial load.*

### 4.2 Hiding Solar Kiln Economics for Off-Grid Only Skins
If a custom deployment does not compare against grid heat pumps:
```css
#kilnRoiCard,
[data-section="heat-pump-comparison"] {
    display: none !important;
}
```

---

## 5. Non-Destructive Extension Guidelines (`skin.js`)

Custom skins inject branding and tailored widgets via `skin.js` (or `skin/skin.js`). Adhere to these principles:

1. **Check Before Injecting**: Verify whether an element is already present before inserting it into the DOM to prevent duplicate UI elements on hot reloads.
2. **Safe Prepending/Insertion**: Insert relative to existing landmarks (`#resultsGrid`, `header`, `#solarKilnResults`) rather than replacing containers.
3. **Trigger Core Functions Gracefully**: Call existing window methods (`window.calculateAll()`, `window.calculateSolarKiln()`) safely using optional chaining:
   ```javascript
   const runBtn = document.createElement('button');
   runBtn.textContent = 'Recalculate';
   runBtn.addEventListener('click', () => {
       if (typeof window.calculateAll === 'function') window.calculateAll();
   });
   ```
4. **Prevent XSS**: Always assign text via `.textContent`, not `.innerHTML`.

---

## 6. Directory Layout & File Conventions

Downstream projects implementing skins should follow this directory structure:

```text
tinycalc/ (or custom child repo)
├── skin.css           # Primary theme CSS variable overrides
├── skin.js            # Non-destructive header/branding injection script
├── skin/              # Optional packaged skin assets
│   ├── skin.css       # Scoped theme styles
│   ├── skin.js        # Scoped runtime enhancements
│   └── assets/        # Logos, SVGs, and brand images
├── index.html         # Imports core calculator + skin.css + skin.js
└── styles.css         # Upstream core stylesheet (untouched)
```
