# Tiny Insulation Calculator: Solar Kiln & Greenhouse Math Integration Specification

## 1. Architectural Fit with `tinyinsulationcalculator`

Your `tinyinsulationcalculator` repository (`calculator.js`, `insulation_calculator.js`, `materials.json`, `methods.md`, `webmcp.js`, and `mcp-server/tools.ts`) is structured around modular physical constants, R-value / U-value envelope heat-transfer formulas, internal gains, and Heating Degree Day (HDD) / COP economic comparisons.

Adding the **Solar Kiln & Greenhouse Drying Module** fits into your existing architecture across five touchpoints:

| Existing Repo File | What We Are Adding | Purpose |
| :--- | :--- | :--- |
| **`materials.json`** | `glazing_materials`, `absorber_materials`, `hardwood_species`, and `envelope_liners` | Adds optical transmittance ($\tau$), R-value per air gap, wood dry density ($\text{lb/ft}^3$), gross heating value ($\text{MMBTU/cord}$), and cost/sq ft. |
| **`calculator.js`** | Pure JS functions: `calculateGlazingProps()`, `calculateWoodMoistureLoad()`, `calculateSolarKilnBalance()`, `calculatePsychrometrics()`, and `calculateKilnHeatPumpROI()` | Zero-dependency, deterministic math functions exported for both browser UI and Node/Jest tests. |
| **`methods.md` & `help.md`** | Full mathematical formulas, psychrometric equations, and ASHRAE Zone 4A COP documentation | Documents the physics behind free vs. bound water, glazing transmittance multiplication, and downdraft air buoyancy. |
| **`webmcp.js` & `mcp-server/tools.ts`** | New MCP Tool `calculate_solar_kiln_performance` | Exposes the solar kiln and heat-pump ROI math to AI agents and WebMCP clients. |
| **`calculator.test.js`** | Jest unit test suite | Verifies glazing transmittance, water mass removal, dwell time, and heat pump payback math in CI (`.github/workflows/test.yml`). |

---

## 2. Core Mathematical Formulas (For `methods.md`)

### 2.1 Multi-Layer Glazing Transmittance & Thermal Resistance
When layering $n$ sheets of clear greenhouse film (or rigid polycarbonate) separated by $n-1$ dead-air gaps ($1.0\text{ in}\text{ to }3.5\text{ in}$ thick):

1. **Net Solar Transmittance ($\tau_{\text{net}}$):** Shortwave solar transmission multiplies across layers:
   $$\tau_{\text{net}} = (\tau_{\text{single}})^n$$
   * Where $\tau_{\text{single}} = 0.88$ for 6-mil UV polyethylene film:
     * Single Glazing ($n = 1$): $\tau_{\text{net}} = 0.88^1 = 88.0\%$
     * Double Glazing ($n = 2$): $\tau_{\text{net}} = 0.88^2 = 77.4\%$
     * Triple Glazing ($n = 3$): $\tau_{\text{net}} = 0.88^3 = 68.1\%$

2. **Effective Envelope Thermal Resistance ($R_{\text{eff}}$) & Conductance ($U_{\text{eff}}$):**
   $$R_{\text{eff}} = R_{\text{surface\_films}} + (n - 1) \cdot R_{\text{air\_gap}} + R_{\text{reflective\_bonus}}$$
   $$U_{\text{eff}} = \frac{1}{R_{\text{eff}}} \quad \left[\text{BTU}/(\text{hr}\cdot\text{ft}^2\cdot^\circ\text{F})\right]$$
   * Single layer ($n=1$): $R_{\text{eff}} = 0.85\text{ hr}\cdot\text{ft}^2\cdot^\circ\text{F/BTU}$ ($U = 1.176$)
   * Double layer ($n=2$, $3.5\text{ in}$ pallet cavity): $R_{\text{eff}} = 0.85 + 0.95 = 1.80$ ($U = 0.556$)
   * Triple layer ($n=3$, two $1.75\text{ in}$ cavities): $R_{\text{eff}} = 0.85 + 2(0.925) = 2.70$ ($U = 0.370$)
   * North Wall with internal Reflectix facing a $3.5\text{ in}$ dead-air gap: adds $+R\text{-}2.70$ radiant barrier credit ($R_{\text{north}} = 3.55\text{ to }4.50$).

---

### 2.2 Wood Moisture Mass & Latent/Sensible Energy Budget
1. **Solid Wood Volume ($V_{\text{solid}}$) & Oven-Dry Mass ($M_{\text{dry}}$):**
   Firewood stacks contain a solid wood packing fraction $f_{\text{pack}} \approx 0.625$ ($80\text{ ft}^3$ solid wood per $128\text{ ft}^3$ gross full cord):
   $$V_{\text{solid}} = V_{\text{gross}} \cdot f_{\text{pack}}$$
   $$M_{\text{dry}} = V_{\text{solid}} \cdot \rho_{\text{dry}}$$
   * Where $\rho_{\text{dry}} \approx 36.0\text{ lb/ft}^3$ for mixed Appalachian hardwoods.

2. **Water Mass to Evaporate ($\Delta M_{\text{water}}$):**
   On an oven-dry basis ($MC_{\text{dry}}$), reducing moisture from initial $MC_i$ (e.g., $0.75$ green or $0.50$ semi-seasoned) to target $MC_f$ (e.g., $0.20$ stove-ready, or $0.26$ Fiber Saturation Point when paired with an indoor Stage-2 basement rack):
   $$\Delta M_{\text{water}} = M_{\text{dry}} \cdot (MC_i - MC_f) \quad [\text{lbs of water}]$$
   $$V_{\text{water\_gal}} = \frac{\Delta M_{\text{water}}}{8.34} \quad [\text{gallons}]$$

3. **Splitting Thickness Multiplier ($k_{\text{split}}$):**
   Drying diffusion time scales non-linearly with piece thickness $d$ (in inches) relative to a standard $2.75\text{ in}$ split:
   $$k_{\text{split}} = \left(\frac{d}{2.75}\right)^{1.5} \cdot k_{\text{bark}}$$
   * Where $k_{\text{bark}} = 1.0$ for split wood (exposed longitudinal grain) and $k_{\text{bark}} = 2.2$ for unsplit rounds with intact bark.

4. **Total Thermal Drying Energy Required ($Q_{\text{req}}$):**
   Combining the sensible heat to warm frozen timber/water and the latent heat of vaporization + bound-water heat of sorption ($h_{\text{evap}} \approx 1,150\text{ BTU/lb}$):
   $$Q_{\text{req}} = \Delta M_{\text{water}} \cdot 1,150 \quad [\text{BTU}]$$

---

### 2.3 Daily Solar Kiln Heat Balance ($Q_{\text{net\_day}}$)
1. **Active Transpired Collector Gain ($Q_{\text{coll}}$):**
   $$Q_{\text{coll}} = A_{\text{coll}} \cdot I_{\text{tilt}} \cdot \left(\frac{\tau_{\text{coll}}}{0.88}\right) \cdot \eta_{\text{collector}} \cdot f_{\text{flow\_penalty}}$$
   * Where $A_{\text{coll}}$ is total collector aperture area ($48\text{ ft}^2$ for two $3' \times 8'$ panels), $I_{\text{tilt}} \approx 950\text{ BTU/ft}^2\text{/day}$ at $55^\circ\text{--}60^\circ$ winter tilt, and $\eta_{\text{collector}} \approx 0.421$.

2. **Passive Greenhouse Box Gain Minus Conductive Wall Loss ($Q_{\text{box\_net}}$):**
   $$Q_{\text{box\_solar}} = A_{\text{glazed\_box}} \cdot I_{\text{box\_avg}} \cdot \tau_{\text{box}} \cdot \alpha_{\text{wood}}$$
   $$Q_{\text{box\_loss}} = \left( \frac{A_{\text{glazed\_box}}}{R_{\text{box}}} + \frac{A_{\text{north}}}{R_{\text{north}}} \right) \cdot \Delta T_{\text{day}} \cdot t_{\text{sun\_hrs}}$$
   $$Q_{\text{net\_day}} = Q_{\text{coll}} + Q_{\text{box\_solar}} - Q_{\text{box\_loss}} \quad [\text{BTU/clear day}]$$

3. **Daily Water Evaporation & Batch Dwell Time ($D_{\text{days}}$):**
   $$\dot{m}_{\text{evap\_clear}} = \frac{Q_{\text{net\_day}}}{1,150} \quad [\text{lbs water / clear day}]$$
   $$D_{\text{clear\_days}} = \frac{Q_{\text{req}}}{Q_{\text{net\_day}}} \cdot k_{\text{split}}$$
   $$D_{\text{calendar\_days}} = \frac{D_{\text{clear\_days}}}{f_{\text{sun\_fraction}}}$$
   * Where $f_{\text{sun\_fraction}} \approx 0.55\text{ to }0.65$ accounts for cloudy winter days in Northeast Kentucky (or $1.0$ when evaluating clear-equivalent days).

---

### 2.4 Psychrometrics, Air Residence Time & Downdraft Buoyancy
1. **Saturation Vapor Pressure ($P_{\text{ws}}$ in psia, for $T$ in $^\circ\text{F}$):**
   Using the Magnus-Tetens approximation converted to $^\circ\text{F}$ and $\text{psia}$ ($T_C = (T_F - 32)/1.8$):
   $$P_{\text{ws}}(T_C) = 0.08859 \cdot \exp\left(\frac{17.27 \cdot T_C}{T_C + 237.3}\right) \quad [\text{psia}]$$
2. **Humidity Ratio ($W$ in Grains of Moisture per lb of Dry Air):**
   $$P_w = \text{RH} \cdot P_{\text{ws}}$$
   $$W_{\text{grains}} = 7000 \cdot 0.62198 \cdot \frac{P_w}{14.696 - P_w}$$
3. **Moist Air Density ($\rho_{\text{air}}$ in $\text{lb/ft}^3$) & Downdraft Gravity Sink:**
   $$\rho_{\text{air}} = \frac{14.696 \cdot 144}{53.35 \cdot (T_F + 459.67)} \cdot \frac{1 + (W_{\text{grains}}/7000)}{1 + 1.6078 \cdot (W_{\text{grains}}/7000)}$$
   * At $90^\circ\text{F}$ / $8\%\text{ RH}$ (top inlet): $\rho_{\text{in}} = 0.0721\text{ lb/ft}^3$.
   * At $60^\circ\text{F}$ / $90\%\text{ RH}$ (bottom exhaust): $\rho_{\text{out}} = 0.0759\text{ lb/ft}^3$ (**$+5.3\%$ heavier**, driving natural downdraft flow).
4. **Air Residence Dwell Time ($t_{\text{dwell}}$ in seconds):**
   $$t_{\text{collector}} = \frac{V_{\text{collector}}\text{ [ft}^3\text{]}}{\text{CFM} / 60}, \quad t_{\text{stack}} = \frac{V_{\text{gross}} \cdot (1 - f_{\text{pack}})}{\text{CFM} / 60}$$

---

### 2.5 Firewood vs. Central Heat Pump ROI Math
1. **Heat Pump Cost per Million BTU ($\text{MMBTU}$):**
   $$\text{kWh per MMBTU} = \frac{1,000,000\text{ BTU}}{3,412.14\text{ BTU/kWh} \cdot \text{COP}} = \frac{293.07}{\text{COP}}$$
   $$\text{Cost per MMBTU} = \text{kWh per MMBTU} \cdot \text{Rate}_{\$/\text{kWh}}$$
2. **Net Usable Stove Heat per Cord ($Q_{\text{usable}}$):**
   * **Kiln-Dried ($<20\%$ MC):** $Q_{\text{dry}} = Q_{\text{gross\_cord}} \cdot \eta_{\text{stove\_dry}} = 24.0\text{ MMBTU} \times 0.72 = 17.28\text{ MMBTU/cord}$.
   * **Unseasoned / Damp ($\sim 50\%$ MC):** $Q_{\text{wet}} = Q_{\text{gross\_cord}} \cdot \eta_{\text{stove\_wet}} = 24.0\text{ MMBTU} \times 0.458 = 11.00\text{ MMBTU/cord}$.
   * **Pure Drying Bonus ($\Delta Q_{\text{bonus}}$):** $17.28 - 11.00 = +6.28\text{ MMBTU/cord}$ ($+57.1\%$ more usable heat from the exact same wood).

---

## 3. Data Additions for `materials.json`

Add the following JSON block to your `materials.json` file:

```json
{
  "solar_kiln_materials": {
    "glazing": [
      {
        "id": "uv_poly_6mil_1layer",
        "name": "Single Layer 6-Mil UV Greenhouse Film",
        "layers": 1,
        "single_transmittance": 0.88,
        "net_transmittance": 0.88,
        "r_value": 0.85,
        "u_value": 1.176,
        "cost_per_sqft": 0.11,
        "recommended_zone": "Solar Collectors"
      },
      {
        "id": "uv_poly_6mil_2layer",
        "name": "Double Layer 6-Mil UV Film (3.5 in Pallet Gap)",
        "layers": 2,
        "single_transmittance": 0.88,
        "net_transmittance": 0.774,
        "r_value": 1.80,
        "u_value": 0.556,
        "cost_per_sqft": 0.22,
        "recommended_zone": "Pallet Box South, East, West & Roof"
      },
      {
        "id": "uv_poly_6mil_3layer",
        "name": "Triple Layer 6-Mil UV Film (Two 1.75 in Gaps)",
        "layers": 3,
        "single_transmittance": 0.88,
        "net_transmittance": 0.681,
        "r_value": 2.70,
        "u_value": 0.370,
        "cost_per_sqft": 0.33,
        "recommended_zone": "Shaded Walls Only (High Optical Penalty)"
      },
      {
        "id": "north_wall_reflectix_cavity",
        "name": "North Wall: Inner Reflectix + 3.5 in Air Gap + Outer 6-Mil Film",
        "layers": 2,
        "single_transmittance": 0.0,
        "net_transmittance": 0.0,
        "r_value": 3.55,
        "u_value": 0.282,
        "cost_per_sqft": 0.11,
        "recommended_zone": "Pallet Box North Wall"
      }
    ],
    "hardwood_presets": [
      {
        "id": "ne_ky_mixed_hardwood",
        "name": "NE Kentucky Mixed Hardwood (Oak, Hickory, Maple, Ash)",
        "dry_density_lb_ft3": 36.0,
        "gross_mmbtu_per_cord": 24.0
      },
      {
        "id": "white_oak_hickory",
        "name": "Dense Oak / Shagbark Hickory",
        "dry_density_lb_ft3": 42.0,
        "gross_mmbtu_per_cord": 27.7
      },
      {
        "id": "soft_maple_poplar",
        "name": "Soft Maple / Tulip Poplar",
        "dry_density_lb_ft3": 29.0,
        "gross_mmbtu_per_cord": 18.6
      }
    ],
    "volume_presets": [
      {
        "id": "half_basement_rack",
        "name": "1 Basement Bay (1.5' x 6' x 16\")",
        "gross_cu_ft": 12.0,
        "solid_cu_ft": 7.5,
        "cords": 0.094
      },
      {
        "id": "full_basement_rack_1yd",
        "name": "Full Basement Rack / 1 Cubic Yard (3' x 6' x 18\")",
        "gross_cu_ft": 27.0,
        "solid_cu_ft": 17.0,
        "cords": 0.211
      },
      {
        "id": "single_outdoor_pallet",
        "name": "1 Full Outdoor Pallet Dryer (40\" x 48\" x 48\")",
        "gross_cu_ft": 42.7,
        "solid_cu_ft": 26.7,
        "cords": 0.333
      },
      {
        "id": "twin_outdoor_pallets",
        "name": "2 Outdoor Pallet Dryers (Twin Flip-Flop)",
        "gross_cu_ft": 85.3,
        "solid_cu_ft": 53.3,
        "cords": 0.667
      },
      {
        "id": "full_cord",
        "name": "1 Full Cord (4' x 4' x 8')",
        "gross_cu_ft": 128.0,
        "solid_cu_ft": 80.0,
        "cords": 1.000
      }
    ]
  }
}
```

---

## 4. Drop-In JavaScript Engine (For `calculator.js`)

Paste the following module into `calculator.js` (compatible with both browser `window` globals and Node CommonJS `module.exports` for Jest):

```javascript
/**
 * Solar Kiln, Greenhouse Glazing & Heat-Pump ROI Engine
 * Drop-in module for tinyinsulationcalculator/calculator.js
 */

const SOLAR_KILN_CONSTANTS = {
  BTU_PER_KWH: 3412.14,
  BTU_PER_LB_WATER: 1150, // Combined sensible + latent + bound sorption heat
  LBS_PER_GALLON_WATER: 8.34,
  SOLID_WOOD_PACKING_FRACTION: 0.625, // 80 solid cu ft per 128 gross cu ft cord
  FULL_CORD_GROSS_CU_FT: 128.0,
  FULL_CORD_SOLID_CU_FT: 80.0,
  DEFAULT_WINTER_TILT_INSOLATION: 950, // BTU/sq ft/day at 55-60 deg tilt (38N Lat)
  DEFAULT_BOX_WALL_INSOLATION: 460, // Weighted avg BTU/sq ft/day on roof/E/W/S walls
  COLLECTOR_BASE_EFFICIENCY: 0.421, // Transpired 3-layer charcoal screen efficiency
  STOVE_EFFICIENCY_DRY: 0.72, // <20% MC kiln-dried burn efficiency
  STOVE_EFFICIENCY_WET: 0.4583 // ~50% MC damp wood burn efficiency (11.0 / 24.0 MMBTU)
};

/**
 * 1. Calculate Multi-Layer Glazing Optical & Thermal Properties
 */
function calculateGlazingProps(layers = 2, singleTransmittance = 0.88, hasReflectix = false) {
  const n = Math.max(1, Math.min(4, Math.round(layers)));
  const netTransmittance = hasReflectix ? 0 : Math.pow(singleTransmittance, n);
  const opticalLossPct = hasReflectix ? 100 : (1 - netTransmittance / singleTransmittance) * 100;

  // Base surface film resistance R-0.85 + R-0.95 for first 3.5" gap + R-0.90 for additional gaps
  let rValue = 0.85;
  if (n === 2) rValue = 1.80;
  if (n === 3) rValue = 2.70;
  if (n >= 4) rValue = 3.55;
  if (hasReflectix) rValue += 1.75; // Radiant barrier credit across pallet air space

  const uValue = 1 / rValue;
  return {
    layers: n,
    netTransmittance: Number(netTransmittance.toFixed(4)),
    opticalLossPct: Number(opticalLossPct.toFixed(1)),
    rValue: Number(rValue.toFixed(2)),
    uValue: Number(uValue.toFixed(3))
  };
}

/**
 * 2. Calculate Psychrometric Properties & Air Density (Magnus-Tetens + Ideal Gas)
 */
function calculatePsychrometrics(tempF, relativeHumidityPct) {
  const rh = Math.max(0, Math.min(100, relativeHumidityPct)) / 100;
  const tempC = (tempF - 32) / 1.8;
  // Saturation vapor pressure in psia
  const pwsPsia = 0.08859 * Math.exp((17.27 * tempC) / (tempC + 237.3));
  const pwPsia = rh * pwsPsia;
  const patmPsia = 14.696;

  // Humidity ratio in lbs water / lb dry air, and grains / lb (7000 grains = 1 lb)
  const wLbPerLb = 0.62198 * (pwPsia / Math.max(0.1, patmPsia - pwPsia));
  const grainsPerLb = wLbPerLb * 7000;
  const satGrainsPerLb = 7000 * 0.62198 * (pwsPsia / Math.max(0.1, patmPsia - pwsPsia));

  // Dew point temperature in deg F
  let dewPointF = tempF;
  if (pwPsia > 0.001) {
    const alpha = Math.log(pwPsia / 0.08859);
    const dewPointC = (237.3 * alpha) / (17.27 - alpha);
    dewPointF = dewPointC * 1.8 + 32;
  }

  // Moist air density in lb/cu ft
  const tempRankine = tempF + 459.67;
  const dryAirDensity = (patmPsia * 144) / (53.35 * tempRankine);
  const moistAirDensity = dryAirDensity * ((1 + wLbPerLb) / (1 + 1.6078 * wLbPerLb));

  return {
    tempF,
    relativeHumidityPct,
    pwsPsia: Number(pwsPsia.toFixed(4)),
    grainsPerLb: Number(grainsPerLb.toFixed(1)),
    satGrainsPerLb: Number(satGrainsPerLb.toFixed(1)),
    dewPointF: Number(dewPointF.toFixed(1)),
    densityLbFt3: Number(moistAirDensity.toFixed(4))
  };
}

/**
 * 3. Calculate Wood Moisture Load & Splitting Thickness Multiplier
 */
function calculateWoodMoistureLoad({
  grossVolumeCuFt = 42.7,
  solidVolumeCuFt = null,
  dryDensityLbFt3 = 36.0,
  initialMcPct = 50,
  targetMcPct = 20,
  useBasementFinisher = false,
  splitDiameterInches = 2.75,
  isUnsplitRound = false
}) {
  const solidCuFt = solidVolumeCuFt !== null
    ? solidVolumeCuFt
    : grossVolumeCuFt * SOLAR_KILN_CONSTANTS.SOLID_WOOD_PACKING_FRACTION;

  const ovenDryWeightLbs = solidCuFt * dryDensityLbFt3;
  // If using the Stage-2 basement rack finisher, outdoor kiln only needs to reach ~26% FSP
  const effectiveOutdoorTargetMcPct = useBasementFinisher
    ? Math.max(targetMcPct, 26)
    : targetMcPct;

  const totalWaterLbs = Math.max(0, ovenDryWeightLbs * ((initialMcPct - targetMcPct) / 100));
  const outdoorWaterLbs = Math.max(0, ovenDryWeightLbs * ((initialMcPct - effectiveOutdoorTargetMcPct) / 100));
  const indoorWaterLbs = Math.max(0, totalWaterLbs - outdoorWaterLbs);

  const totalEnergyBtu = totalWaterLbs * SOLAR_KILN_CONSTANTS.BTU_PER_LB_WATER;
  const outdoorEnergyBtu = outdoorWaterLbs * SOLAR_KILN_CONSTANTS.BTU_PER_LB_WATER;

  // Thickness exponent: Time proportional to (Thickness / 2.75)^1.5 * bark factor
  const baseThicknessRatio = Math.max(0.5, splitDiameterInches / 2.75);
  const barkPenalty = isUnsplitRound ? 2.2 : 1.0;
  const splitMultiplier = Math.pow(baseThicknessRatio, 1.5) * barkPenalty;

  return {
    grossVolumeCuFt: Number(grossVolumeCuFt.toFixed(1)),
    solidVolumeCuFt: Number(solidCuFt.toFixed(1)),
    cordsEquivalent: Number((solidCuFt / SOLAR_KILN_CONSTANTS.FULL_CORD_SOLID_CU_FT).toFixed(3)),
    basementBaysEquivalent: Number((solidCuFt / 8.0).toFixed(2)),
    ovenDryWeightLbs: Number(ovenDryWeightLbs.toFixed(1)),
    totalWaterLbs: Number(totalWaterLbs.toFixed(1)),
    totalWaterGallons: Number((totalWaterLbs / SOLAR_KILN_CONSTANTS.LBS_PER_GALLON_WATER).toFixed(1)),
    outdoorWaterLbs: Number(outdoorWaterLbs.toFixed(1)),
    indoorWaterLbs: Number(indoorWaterLbs.toFixed(1)),
    totalEnergyBtu: Math.round(totalEnergyBtu),
    totalEnergyKwh: Number((totalEnergyBtu / SOLAR_KILN_CONSTANTS.BTU_PER_KWH).toFixed(1)),
    outdoorEnergyBtu: Math.round(outdoorEnergyBtu),
    splitMultiplier: Number(splitMultiplier.toFixed(2))
  };
}

/**
 * 4. Calculate Daily Solar Kiln Thermal Balance & Batch Dwell Time
 */
function calculateSolarKilnBalance({
  numCollectors = 2,
  collectorAreaSqFtEach = 24.0, // 36" x 96" = 24 sq ft
  collectorGlazingLayers = 1,
  boxGlazingLayers = 2,
  northWallReflectix = true,
  totalFanCfm = 96,
  chainedBoxesInSeries = false,
  ambientTempF = 32,
  internalKilnTempF = 80,
  sunHoursPerDay = 5.0,
  woodLoadResult
}) {
  const collGlazing = calculateGlazingProps(collectorGlazingLayers, 0.88, false);
  const boxGlazing = calculateGlazingProps(boxGlazingLayers, 0.88, false);
  const northGlazing = calculateGlazingProps(boxGlazingLayers, 0.88, northWallReflectix);

  // Chaining Box 1 into Box 2 doubles static pressure and cuts fan CFM by ~45%
  const effectiveCfm = chainedBoxesInSeries ? totalFanCfm * 0.55 : totalFanCfm;

  // Collector thermal output
  const totalCollectorArea = numCollectors * collectorAreaSqFtEach;
  const opticalRatio = collGlazing.netTransmittance / 0.88;
  const cfmPenalty = chainedBoxesInSeries ? 0.78 : 1.0;
  const collectorGainBtu = totalCollectorArea
    * SOLAR_KILN_CONSTANTS.DEFAULT_WINTER_TILT_INSOLATION
    * SOLAR_KILN_CONSTANTS.COLLECTOR_BASE_EFFICIENCY
    * opticalRatio
    * cfmPenalty;

  // Pallet box passive solar gain (South + East + West + Roof = ~45 sq ft glazed)
  const boxSolarAreaSqFt = 45.0;
  const boxWallLossAreaSqFt = 29.3; // East + West + Roof
  const northWallAreaSqFt = 13.3;

  const boxPassiveSolarGainBtu = boxSolarAreaSqFt
    * SOLAR_KILN_CONSTANTS.DEFAULT_BOX_WALL_INSOLATION
    * boxGlazing.netTransmittance
    * 0.58; // Effective wood stack solar absorptance factor

  // Daytime conductive heat loss during active solar heating window
  const deltaT = Math.max(10, internalKilnTempF - ambientTempF);
  const hourlyWallLossBtu =
    (boxWallLossAreaSqFt * boxGlazing.uValue * deltaT) +
    (northWallAreaSqFt * northGlazing.uValue * deltaT);
  const daytimeWallLossBtu = hourlyWallLossBtu * sunHoursPerDay;

  const netBoxGainBtu = boxPassiveSolarGainBtu - daytimeWallLossBtu;
  const totalNetDailyBtu = Math.max(1500, collectorGainBtu + netBoxGainBtu);

  const waterEvapLbsPerDay = totalNetDailyBtu / SOLAR_KILN_CONSTANTS.BTU_PER_LB_WATER;

  // Air residence dwell times
  const collectorVolumeCuFt = totalCollectorArea * 0.389; // ~4.67" avg effective channel depth
  const stackVoidVolumeCuFt = woodLoadResult
    ? woodLoadResult.grossVolumeCuFt * (1 - SOLAR_KILN_CONSTANTS.SOLID_WOOD_PACKING_FRACTION)
    : 16.0;
  const cfmPerSec = Math.max(0.1, effectiveCfm / 60);

  const collectorResidenceSec = collectorVolumeCuFt / cfmPerSec;
  const stackResidenceSec = stackVoidVolumeCuFt / cfmPerSec;

  // Dwell days required
  const targetBtu = woodLoadResult ? woodLoadResult.outdoorEnergyBtu : 211140;
  const splitMult = woodLoadResult ? woodLoadResult.splitMultiplier : 1.0;
  const outdoorDwellDays = (targetBtu / totalNetDailyBtu) * splitMult;

  return {
    collectorGainBtu: Math.round(collectorGainBtu),
    boxPassiveSolarGainBtu: Math.round(boxPassiveSolarGainBtu),
    daytimeWallLossBtu: Math.round(daytimeWallLossBtu),
    netBoxGainBtu: Math.round(netBoxGainBtu),
    totalNetDailyBtu: Math.round(totalNetDailyBtu),
    waterEvapLbsPerDay: Number(waterEvapLbsPerDay.toFixed(1)),
    waterEvapGalPerDay: Number((waterEvapLbsPerDay / SOLAR_KILN_CONSTANTS.LBS_PER_GALLON_WATER).toFixed(2)),
    effectiveCfm: Number(effectiveCfm.toFixed(1)),
    collectorResidenceSec: Number(collectorResidenceSec.toFixed(1)),
    stackResidenceSec: Number(stackResidenceSec.toFixed(1)),
    totalResidenceSec: Number((collectorResidenceSec + stackResidenceSec).toFixed(1)),
    outdoorDwellDays: Number(outdoorDwellDays.toFixed(1)),
    collGlazing,
    boxGlazing,
    northGlazing
  };
}

/**
 * 5. Calculate Northeast Kentucky Heat Pump vs. Solar Kiln Firewood ROI
 */
function calculateKilnHeatPumpROI({
  cordsProcessedPerSeason = 1.5,
  grossMmbtuPerCord = 24.0,
  electricRatePerKwh = 0.169, // KY Power avg $0.169/kWh; Co-op avg $0.138/kWh
  heatPumpCop = 2.40,
  buildCostUsd = 234.0
}) {
  const usableMmbtuPerCordDry = grossMmbtuPerCord * SOLAR_KILN_CONSTANTS.STOVE_EFFICIENCY_DRY;
  const usableMmbtuPerCordWet = grossMmbtuPerCord * SOLAR_KILN_CONSTANTS.STOVE_EFFICIENCY_WET;
  const dryingBonusMmbtuPerCord = usableMmbtuPerCordDry - usableMmbtuPerCordWet;

  const kwhPerMmbtuHeatPump = (1000000 / SOLAR_KILN_CONSTANTS.BTU_PER_KWH) / heatPumpCop;
  const kwhPerMmbtuAuxStrips = 1000000 / SOLAR_KILN_CONSTANTS.BTU_PER_KWH; // COP 1.0

  const costPerMmbtuHeatPump = kwhPerMmbtuHeatPump * electricRatePerKwh;
  const costPerMmbtuAuxStrips = kwhPerMmbtuAuxStrips * electricRatePerKwh;

  // Per-cord dollar values
  const cordValueDryVsHeatPump = usableMmbtuPerCordDry * costPerMmbtuHeatPump;
  const cordValueWetVsHeatPump = usableMmbtuPerCordWet * costPerMmbtuHeatPump;
  const cordDryingBonusVsHeatPump = dryingBonusMmbtuPerCord * costPerMmbtuHeatPump;
  const cordValueDryVsAuxStrips = usableMmbtuPerCordDry * costPerMmbtuAuxStrips;

  // Seasonal totals
  const seasonalUsableMmbtu = cordsProcessedPerSeason * usableMmbtuPerCordDry;
  const seasonalBonusMmbtu = cordsProcessedPerSeason * dryingBonusMmbtuPerCord;
  const seasonalValueVsHeatPump = cordsProcessedPerSeason * cordValueDryVsHeatPump;
  const seasonalBonusValueVsHeatPump = cordsProcessedPerSeason * cordDryingBonusVsHeatPump;
  const seasonalValueVsAuxStrips = cordsProcessedPerSeason * cordValueDryVsAuxStrips;

  const paybackSeasonsTotalHeat = buildCostUsd / Math.max(1, seasonalValueVsHeatPump);
  const paybackSeasonsBonusOnly = buildCostUsd / Math.max(1, seasonalBonusValueVsHeatPump);

  return {
    usableMmbtuPerCordDry: Number(usableMmbtuPerCordDry.toFixed(2)),
    usableMmbtuPerCordWet: Number(usableMmbtuPerCordWet.toFixed(2)),
    dryingBonusMmbtuPerCord: Number(dryingBonusMmbtuPerCord.toFixed(2)),
    kwhPerMmbtuHeatPump: Number(kwhPerMmbtuHeatPump.toFixed(1)),
    costPerMmbtuHeatPump: Number(costPerMmbtuHeatPump.toFixed(2)),
    costPerMmbtuAuxStrips: Number(costPerMmbtuAuxStrips.toFixed(2)),
    cordValueDryVsHeatPump: Number(cordValueDryVsHeatPump.toFixed(2)),
    cordValueWetVsHeatPump: Number(cordValueWetVsHeatPump.toFixed(2)),
    cordDryingBonusVsHeatPump: Number(cordDryingBonusVsHeatPump.toFixed(2)),
    cordValueDryVsAuxStrips: Number(cordValueDryVsAuxStrips.toFixed(2)),
    seasonalUsableMmbtu: Number(seasonalUsableMmbtu.toFixed(2)),
    seasonalBonusMmbtu: Number(seasonalBonusMmbtu.toFixed(2)),
    seasonalValueVsHeatPump: Number(seasonalValueVsHeatPump.toFixed(2)),
    seasonalBonusValueVsHeatPump: Number(seasonalBonusValueVsHeatPump.toFixed(2)),
    seasonalValueVsAuxStrips: Number(seasonalValueVsAuxStrips.toFixed(2)),
    paybackSeasonsTotalHeat: Number(paybackSeasonsTotalHeat.toFixed(2)),
    paybackWeeksTotalHeat: Number((paybackSeasonsTotalHeat * 21.4).toFixed(1)),
    paybackSeasonsBonusOnly: Number(paybackSeasonsBonusOnly.toFixed(2))
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SOLAR_KILN_CONSTANTS,
    calculateGlazingProps,
    calculatePsychrometrics,
    calculateWoodMoistureLoad,
    calculateSolarKilnBalance,
    calculateKilnHeatPumpROI
  };
}
```

---

## 5. WebMCP & MCP Server Tool Definition (For `webmcp.js` & `mcp-server/tools.ts`)

Register the following tool in `webmcp.js` and `mcp-server/tools.ts` so AI agents can query the solar kiln and heat pump comparison directly:

```javascript
const solarKilnMcpTool = {
  name: "calculate_solar_kiln_performance",
  description: "Calculates solar firewood kiln drying time, glazing optical/thermal R-values, psychrometric air buoyancy, and financial ROI against a central air heat pump.",
  inputSchema: {
    type: "object",
    properties: {
      grossVolumeCuFt: { type: "number", description: "Gross stacked wood volume in cu ft (27 = 1 yd3/basement rack, 42.7 = 1 pallet, 128 = 1 cord)", default: 27.0 },
      initialMcPct: { type: "number", description: "Initial wood moisture content % on dry basis (e.g., 75 green, 50 semi-seasoned)", default: 50 },
      targetMcPct: { type: "number", description: "Final stove-ready moisture content % (typically 18-20%)", default: 20 },
      useBasementFinisher: { type: "boolean", description: "True if finishing bound water (<26% MC) in indoor 60F low-humidity basement rack", default: true },
      splitDiameterInches: { type: "number", description: "Average thickness/diameter of wood splits in inches", default: 2.75 },
      isUnsplitRound: { type: "boolean", description: "True if logs are unsplit rounds with intact bark", default: false },
      numCollectors: { type: "number", description: "Number of 36x96 transpired screen solar collectors attached to active box", default: 2 },
      collectorGlazingLayers: { type: "number", description: "Layers of 6-mil UV film on solar collectors (1-3)", default: 1 },
      boxGlazingLayers: { type: "number", description: "Layers of 6-mil UV film on pallet box walls (1-3)", default: 2 },
      electricRatePerKwh: { type: "number", description: "Local electricity rate in $/kWh (0.169 KY Power, 0.138 KY Co-op)", default: 0.169 },
      heatPumpCop: { type: "number", description: "Seasonal Coefficient of Performance of central heat pump", default: 2.4 },
      cordsProcessedPerSeason: { type: "number", description: "Total cords processed through kiln over 150-day winter", default: 1.5 },
      buildCostUsd: { type: "number", description: "Total DIY solar kiln build cost in USD", default: 234 }
    }
  }
};
```

---

## 6. Jest Unit Test Suite (For `calculator.test.js`)

Add these unit tests to `calculator.test.js` so your GitHub Actions test workflow (`test.yml`) validates the greenhouse and kiln math:

```javascript
describe('Solar Kiln & Greenhouse Calculator Module', () => {
  test('calculateGlazingProps computes optical transmittance and R-value accurately', () => {
    const single = calculateGlazingProps(1, 0.88, false);
    const double = calculateGlazingProps(2, 0.88, false);
    const triple = calculateGlazingProps(3, 0.88, false);

    expect(single.netTransmittance).toBeCloseTo(0.88, 2);
    expect(single.rValue).toBeCloseTo(0.85, 2);

    expect(double.netTransmittance).toBeCloseTo(0.7744, 3);
    expect(double.rValue).toBeCloseTo(1.80, 2);

    expect(triple.netTransmittance).toBeCloseTo(0.6815, 3);
    expect(triple.rValue).toBeCloseTo(2.70, 2);
  });

  test('calculateWoodMoistureLoad matches 1 cubic yard (Full Basement Rack) energy budget', () => {
    const load = calculateWoodMoistureLoad({
      grossVolumeCuFt: 27.0,
      solidVolumeCuFt: 17.0,
      dryDensityLbFt3: 36.0,
      initialMcPct: 50,
      targetMcPct: 20,
      useBasementFinisher: false
    });
    expect(load.ovenDryWeightLbs).toBe(612.0);
    expect(load.totalWaterLbs).toBeCloseTo(183.6, 1);
    expect(load.totalEnergyBtu).toBe(211140);
  });

  test('calculatePsychrometrics verifies downdraft evaporative cooling density increase (+5.3%)', () => {
    const topInlet = calculatePsychrometrics(90, 8);
    const bottomExhaust = calculatePsychrometrics(60, 90);
    expect(bottomExhaust.densityLbFt3).toBeGreaterThan(topInlet.densityLbFt3 * 1.045);
  });

  test('calculateKilnHeatPumpROI computes NE Kentucky heat pump savings and payback', () => {
    const roi = calculateKilnHeatPumpROI({
      cordsProcessedPerSeason: 1.5,
      grossMmbtuPerCord: 24.0,
      electricRatePerKwh: 0.169,
      heatPumpCop: 2.40,
      buildCostUsd: 234.0
    });
    expect(roi.usableMmbtuPerCordDry).toBeCloseTo(17.28, 2);
    expect(roi.dryingBonusMmbtuPerCord).toBeCloseTo(6.28, 2);
    expect(roi.costPerMmbtuHeatPump).toBeCloseTo(20.64, 1);
    expect(roi.cordValueDryVsHeatPump).toBeCloseTo(356.6, 0);
    expect(roi.paybackSeasonsTotalHeat).toBeLessThan(0.5);
  });
});
```