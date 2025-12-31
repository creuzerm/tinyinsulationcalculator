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

* **Conductive Loss (Air Coupled - Walls, Roof, Windows):**
  

  $$
  Q_{env} = \left( \frac{A_{wall}}{R_{wall}} + \frac{A_{roof}}{R_{roof}} + \frac{A_{window}}{R_{window}} \right) \times (T_{in} - T_{out})
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

## 4. Verification Instructions for Agents

When verifying the tool via code interpretation or DOM manipulation:

1. **Inject Values:** Use `document.getElementById('ID').value = X` for inputs.

2. **Trigger Events:** Dispatch `new Event('input')` or `new Event('change')` on the modified elements to trigger the `calculateAll()` listener.

3. **Read Output:** Check `document.getElementById('resultLoss_A').textContent` (or `resultLoss_B` in A/B mode).

4. **Validate:** Parse the integer from the result string (remove commas) and compare with the Expected Result +/- 1% tolerance.