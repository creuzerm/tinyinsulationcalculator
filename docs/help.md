# 📘 Tiny House Thermal Suite — User Guide & Documentation

Welcome to the **Tiny House Thermal Engineering Suite**, an interactive collection of building science and thermal simulation tools designed specifically for tiny homes, high-performance compact dwellings, van conversions, and accessory dwelling units (ADUs).

This suite gives builders, architects, and DIY enthusiasts engineering-grade thermal modeling without requiring complex CAD or enterprise HVAC software.

---

## 🧭 Tool Suite Navigation

The suite consists of three interconnected simulation tools:

1. **[Tiny Home Calculator](index.html)**: Comprehensive 24-hour transient thermal simulation, hourly heat loss/gain curve, heating equipment sizing, and Scenario A/B side-by-side comparison.
2. **[Existing Building Estimator](existing_building_estimator.html)**: Reverse-engineers your actual building envelope R-value and air leakage (ACH50) from your monthly winter utility heating bills.
3. **[Insulation Explorer](insulationexplorer.html)**: Interactive multi-layer wall, roof, and floor assembly designer that calculates overall assembly R-values with thermal bridging penalties.

---

## 🏠 1. Tiny Home Calculator

### Purpose
Calculates dynamic peak heating load (BTU/hr and Watts), daily energy consumption, and temperature swings across a 24-hour diurnal cycle.

### How to Use
1. **Geometry & Envelope**:
   - Enter your tiny home exterior length, width, and wall height.
   - Enter window area and window performance (U-factor and Solar Heat Gain Coefficient / SHGC).
   - Enter assembly nominal R-values for Floor, Walls, and Ceiling/Roof.
2. **Climate & Temperatures**:
   - Choose a preset climate zone or specify your Winter Design Temperature (the 99% design cold temperature in °F).
   - Set your desired indoor thermostat setpoint (e.g., 68°F–70°F).
3. **Air Tightness & Infiltration**:
   - Select your air sealing quality (Standard 5 ACH, Tight 3 ACH, or High Performance 1 ACH). Air exchange accounts for 20–40% of heat loss in small structures.
4. **Compare Scenarios (Scenario A vs Scenario B)**:
   - Toggle the **A/B Comparison Switch** at the top.
   - Test upgrade scenarios: e.g., standard fiberglass batt (Scenario A) vs spray foam + continuous exterior polyiso (Scenario B).
   - Instantly see equipment sizing differences and monthly heating cost reductions.

### Interpreting the Results
- **Design Heat Loss (BTU/hr)**: The minimum capacity required for your primary heater (mini-split heat pump, propane furnace, or wood stove) on the coldest night of the year.
- **24-Hour Diurnal Curve**: Shows how daytime solar gains reduce heating needs at noon, and how thermal mass delays peak heating demand until the early morning hours.

---

## 📊 2. Existing Building Estimator

### Purpose
If you are living in an existing tiny home, cabin, or older house and want to know how well-insulated it *actually* is, this tool analyzes your winter utility bills to deduce whole-envelope performance.

### How to Use
1. Enter the square footage, estimated wall height, and general window coverage.
2. Select your heating fuel type (Electric Resistance / Mini-Split Heat Pump, Natural Gas, Propane, Fuel Oil, or Wood Pellets).
3. Enter your monthly heating consumption from a recent cold winter month (e.g., January kWh or therms).
4. Enter the average outdoor temperature for that billing cycle.
5. Click **Estimate Building Performance**.

### Results
- **Calculated Effective R-Value**: Identifies the real-world performance of your envelope, including real-world thermal bridging and insulation sagging.
- **Estimated Air Infiltration**: Flags whether your envelope suffers from severe draftiness (>7 ACH) or is relatively tight.

---

## 🧱 3. Insulation Explorer

### Purpose
Builds custom multi-layer assemblies from the drywall inward to the rainscreen siding outward.

### How to Use
1. Click **Add Layer** to choose from an extensive library of common building materials:
   - Drywall, OSB/Plywood sheathing, Fiberglass batts, Mineral wool, Open/Closed-cell spray foam, EPS/XPS/Polyisocyanurate rigid boards, air gaps, and cladding.
2. Adjust layer thickness (inches).
3. The real-time visual stack updates dynamically with exact material colors and textures.
4. Review the computed **Total Assembly R-Value** and **U-Factor**.

---

## 🤖 WebMCP Agent Support

This application natively supports autonomous AI agents via the **WebMCP** (`window.navigator.modelContext`) standard and Chrome Built-in AI:
- Registered tools allow AI agents to run simulations, evaluate heat loads, test presets (`applyPreset`), and inspect assembly performance without clicking buttons.
