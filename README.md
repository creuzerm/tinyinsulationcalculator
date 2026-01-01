# Tiny Home Heat Loss & Passive Performance Calculator

## 1. Overview

This project is an exploration tool designed to estimate the heating load and passive thermal performance of small structures (Tiny Homes, Sheds, Cabins). Unlike simple R-value calculators, this tool integrates **Thermal Mass (The "Battery")** and **Passive Simulation** to visualize how a building behaves over time without supplemental heating.

**Key Features:**

* **Heat Loss Calculation (UA):** Estimates peak heating load (BTU/hr) based on envelope insulation and air sealing.

* **A/B Scenario Testing:** Compare two different construction methods (e.g., "Standard Stick Frame" vs. "High Mass Passive") side-by-side.

* **Thermal Battery Calculator:** Quantifies the energy storage potential of the floor system (Concrete, Stabilized Earth, or Wood).

* **Passive Simulation:** Simulates indoor temperature drift over 24 hours or 7 days ("Coasting") based on internal gains, solar exposure, and thermal mass.

## 2. Core Methodologies

### 2.1 Heat Loss (UA Method)

The calculator uses a modified UA formula that separates air-coupled components from ground-coupled components.

**`Total Loss = Q_envelope + Q_floor`**

1. **Envelope Loss (Air Coupled):**

   * `Q_env = (Area / R_effective) * (T_indoor - T_outdoor)`

   * Includes Walls, Roof, Windows, Doors, and End Walls.

   * *Air Sealing Penalty:* If sealing is "Poor", the envelope loss is multiplied by **1.25** (25% penalty).

2. **Floor Loss (Ground Coupled):**

   * `Q_floor = (Area_floor / R_floor) * (T_indoor - T_ground)`

   * Uses a distinct ground temperature (default 50°F) rather than outdoor air temperature, which is critical for accurate winter estimates.

### 2.2 Thermal Mass ("The Battery")

Calculates the thermal inertia of the building. This determines how quickly the building heats up or cools down.

**`Total Capacity (BTU/°F) = Floor Capacity + Structure Baseline`**

* **Floor Capacity:** `Volume * Density * Specific Heat`

  * *Concrete:* 145 lbs/ft³, 0.2 BTU/lb°F

  * *Stabilized Earth:* 135 lbs/ft³, 0.2 BTU/lb°F

  * *Wood:* 30 lbs/ft³, 0.4 BTU/lb°F

* **Structure Baseline:** A fixed mass factor assigned to the walls/roof (approx 1.5 BTU/°F per sq ft of envelope) ensures lightweight buildings (sheds) don't exhibit mathematical instability in simulations.

### 2.3 Passive Simulation (Finite Difference)

The tool runs a time-step simulation to model temperature drift.

* **Time Step:** 1 minute (Calculated 60 times per displayed hour to prevent oscillation).

* **Inputs:**

  * **Outdoor Temp:** Sinusoidal curve between User-defined Daily High and Low.

  * **Internal Gains:** Dynamically calculated based on Occupants and Appliances (loaded from `internal_gains.json`).
    * *Note:* Only **Sensible Heat** is included in the simulation. Latent heat (moisture from breathing, cooking, etc.) is excluded.

  * **Solar Gains:** Applied during "Daylight Hours" (roughly 9 AM - 5 PM).

* **Logic:**

  * `Net Heat Flow = Total Gains - Total Heat Loss`

  * `Temp Change = Net Heat Flow / Total Thermal Capacity`

## 3. Supported Geometries

The calculator automatically derives surface areas for three common tiny home shapes:

1. **Simple Rectangle:** Standard box with customizable roof pitch.

2. **A-Frame:** Steep sloped roof/walls with triangular end walls.

3. **Gothic Arch:** Curved roof profile with semi-circular end walls and optional spring walls.

## 4. Usage Guide

### A/B Comparison

Toggle the **"Enable A/B Comparison"** switch at the top of the page.

* **Scenario A (Blue):** Typically used for the baseline or "Standard Construction".

* **Scenario B (Green):** Used for "High Performance" or alternative designs.

* *Shared Inputs:* Dimensions, Climate Data, and Simulation Settings apply to *both* scenarios to ensure a fair comparison.

### Persistence

All inputs are saved to your browser's **Local Storage**. You can refresh the page or close the tab, and your specific wall assemblies, R-values, and dimensions will remain.

## 5. Assumptions & Limitations

* **Solar Gain Simplified:** Solar gain is treated as a fixed "on/off" block during the day. It does not currently account for window orientation (North vs South) or shading coefficients.

* **Dynamic R-Values:** R-values are treated as static. In reality, some insulation performance drifts with extreme temperatures.

* **1D Heat Flow:** Calculations assume one-dimensional heat flow through assemblies. Thermal bridging is approximated via the "Air Sealing" penalty or user-adjusted R-values.