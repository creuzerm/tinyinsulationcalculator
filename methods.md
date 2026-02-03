# **Comprehensive Analysis of Thermal Performance Calculation Methodologies for Building Envelopes: Theoretical Frameworks, Bridging Mitigation, and Integrated Hygrothermal Assessment**

## **1\. Introduction to Building Envelope Thermal Physics**

The thermal performance of the building envelope is the single most critical variable in the passive determination of a structure's energy consumption. While the fundamental concept of thermal insulation is widely understood—placing a material with high resistance to heat flow between conditioned and unconditioned spaces—the mathematical quantification of this performance is fraught with complexity. The transition from a theoretical, one-dimensional understanding of heat transfer to the multi-dimensional reality of modern construction assemblies requires a sophisticated application of physics and mathematics.

This report serves as an exhaustive technical reference for the calculation of heat loss in building walls, specifically addressing the discrepancies between nominal and effective R-values caused by thermal bridging. It explores the governing physics of conduction, the specific mathematical derivations for wood and steel-framed assemblies, the rigorous integration of continuous insulation (CI) strategies, and the secondary thermal degradation caused by mechanical fasteners. Furthermore, it integrates these thermal calculations with hygrothermal risk assessment, demonstrating how thermal math directly informs moisture control strategies such as dew point management.

### **1.1 The Imperative of Accurate Calculation**

In the architectural, engineering, and construction (AEC) industry, the "performance gap"—the difference between predicted energy use and actual operational energy use—is a persistent challenge. A significant portion of this gap can be attributed to the oversimplification of envelope thermal calculations. Historically, simplistic area-weighted averaging was deemed sufficient. However, as energy codes such as ASHRAE 90.1 and the International Energy Conservation Code (IECC) have tightened, the margins for error have vanished.

The user's query highlights a central tension in building science: the measured R-value of a product versus the true effective value of an assembly. An R-19 fiberglass batt does not produce an R-19 wall. In a steel-stud assembly, that R-19 batt may function effectively as an R-7 layer—a degradation of over 60%. Understanding the mathematics behind this degradation is not merely an academic exercise; it is a prerequisite for code compliance and mechanical system sizing.

### **1.2 Defining the Fundamental Metrics**

To establish a rigorous mathematical framework, we must first define the core metrics used in heat transfer calculations. These metrics are derived from Fourier's Law of Conduction, which states that the rate of heat transfer through a material is proportional to the negative gradient in the temperature and to the area, at right angles to that gradient, through which the heat flows.

#### **1.2.1 Thermal Conductivity ($k$ or $\\lambda$)**

Thermal conductivity is an intrinsic property of a homogeneous material, representing its ability to conduct heat. It is defined as the quantity of heat ($Q$) transmitted through a unit thickness ($L$) in a direction normal to a surface of unit area ($A$), due to a unit temperature gradient ($\\Delta T$) under steady state conditions.

* **Units:** $W/(m\\cdot K)$ (SI) or $Btu\\cdot in/(h\\cdot ft^2\\cdot ^\\circ F)$ (IP).  
* **Significance:** This is the base metric from which R-values are derived. Lower conductivity indicates better insulating properties.

#### **1.2.2 Thermal Conductance ($C$)**

Conductance is a property of a specific component with a fixed thickness, such as a concrete block or a pane of glass. It is calculated as:

$$C \= \\frac{k}{L}$$

* **Units:** $W/(m^2\\cdot K)$ or $Btu/(h\\cdot ft^2\\cdot ^\\circ F)$.  
* **Usage:** Often used for materials where thickness is standard or variable layers are pre-combined.

#### **1.2.3 Thermal Resistance ($R$-value)**

The R-value is the reciprocal of thermal conductance. It represents the material's resistance to heat flow. This is the most common metric used in the North American construction industry because R-values of adjacent layers in a simple series circuit are additive, making mental arithmetic easier for designers.

$$R \= \\frac{1}{C} \= \\frac{L}{k}$$

* **Units:** $m^2\\cdot K/W$ (RSI) or $h\\cdot ft^2\\cdot ^\\circ F/Btu$.  
* **Distinction:** It is crucial to distinguish between the **Nominal R-value** (the resistance of the insulation product alone) and the **Effective R-value** (the resistance of the entire assembly including bridging).

#### **1.2.4 Thermal Transmittance ($U$-factor)**

The U-factor is the overall coefficient of heat transmission through a building assembly, including all material layers and surface air films. It is the reciprocal of the total effective R-value ($R\_{total}$).

$$U \= \\frac{1}{R\_{total}}$$

* **Units:** $W/(m^2\\cdot K)$ or $Btu/(h\\cdot ft^2\\cdot ^\\circ F)$.  
* Usage: Heat loss calculations rely on the U-factor because it relates directly to the energy flux. The equation for heat loss ($Q$) is:  
  $$Q \= U \\cdot A \\cdot \\Delta T$$

## **2\. Theoretical Assumptions and Boundary Conditions**

Before detailing the complex math of thermal bridging, it is essential to outline the assumptions inherent in standard heat loss calculations. The "math" described in energy codes and standard engineering practice is a simplified model of physical reality.

### **2.1 The Steady-State Assumption**

The primary assumption in standard R-value and U-factor calculations is **steady-state heat flow**.

* **Definition:** Steady-state assumes that the temperatures on both sides of the building envelope ($T\_{in}$ and $T\_{out}$) are constant for a sufficient period that the rate of heat flow entering the warm side equals the rate of heat flow exiting the cold side. There is no accumulation or depletion of heat energy within the wall materials themselves.  
* **Reality Gap:** In the real world, temperatures fluctuate constantly (diurnal cycles). Building materials have **thermal mass** (heat capacity), meaning they store and release heat. A heavy concrete wall behaves dynamically, dampening temperature swings—a phenomenon not captured by steady-state R-values. However, for the purpose of sizing heating equipment (which must handle the worst-case sustained cold snap) and for simplified code compliance, steady-state calculations are the industry standard.

### **2.2 The Linearity and Homogeneity Assumptions**

Standard calculations often assume that layers are homogeneous (uniform properties throughout) and that heat flows in straight lines perpendicular to the surface (1-dimensional flow).

* **Homogeneity:** While true for a sheet of glass or a layer of continuous insulation, this assumption fails for framed walls where studs and cavities alternate.  
* **Linearity:** The Parallel Path method (discussed later) assumes heat does not flow "sideways" from the insulation into the stud. This is a reasonable approximation for wood framing but a catastrophic error for steel framing. The "Modified Zone Method" is specifically designed to correct this failed assumption.

### **2.3 Air Films and Surface Coefficients**

The boundary between the solid wall and the air is not a point of zero resistance. There is a thin film of stagnant air clinging to the surface, which provides measurable thermal resistance. This resistance varies based on surface roughness, air velocity, and temperature difference.

**Standard Calculation Values (ASHRAE Handbook of Fundamentals):**

* **Interior Air Film (**$R\_{si}$ **or** $R\_{in}$**):**  
  * Vertical Surfaces (Walls): **R-0.68** ($h\\cdot ft^2\\cdot ^\\circ F/Btu$) / **0.12** RSI.  
  * Horizontal Surfaces (Ceilings, heat flow up): **R-0.61** / **0.11** RSI.  
  * Horizontal Surfaces (Floors, heat flow down): **R-0.92** / **0.16** RSI.  
  * *Assumption:* Still air conditions with natural convection currents driven by temperature deltas.  
* **Exterior Air Film (**$R\_{so}$ **or** $R\_{out}$**):**  
  * All Surfaces: **R-0.17** ($h\\cdot ft^2\\cdot ^\\circ F/Btu$) / **0.03** RSI.  
  * *Assumption:* Moving air at 15 mph (6.7 m/s) wind speed. If the wind speed drops, this resistance increases. For example, in a calm summer condition, the exterior film might be closer to 0.25.

Integration Math:  
These films must be added to the summation of material resistances.

$$R\_{total} \= R\_{out} \+ R\_{materials} \+ R\_{in}$$

Omitting these films results in an overestimation of heat transfer (underestimation of total resistance), particularly for poorly insulated assemblies like single-pane windows or uninsulated metal walls where the films constitute a large percentage of the total R-value.

## **3\. Mathematical Methodologies for Effective R-Value Calculation**

The core of the user's query regards the calculation of heat loss when the "true effective value is less due to thermal bridging." The method of calculation depends entirely on the severity of the thermal bridge, which is dictated by the thermal conductivity of the framing members relative to the cavity insulation.

### **3.1 The Series Calculation (Homogeneous Layers)**

For a wall with no framing (e.g., a solid concrete wall with continuous external insulation), the calculation is a simple summation of series resistances.

Equation 1: Series Summation

$$R\_{series} \= R\_{film\\\_out} \+ R\_1 \+ R\_2 \+... \+ R\_n \+ R\_{film\\\_in}$$$$U\_{series} \= \\frac{1}{R\_{series}}$$

This serves as the foundational step for all complex assemblies. Typically, the "continuous" layers (sheathing, siding, drywall, air films) are summed into a single term often denoted as $R\_{continuous}$ or $R\_{series\\\_layers}$ before integrating the framed portion.

### **3.2 The Parallel Path Method (Wood Framing)**

**Applicability:** This method is valid **only for wood-framed assemblies** (studs, joists, rafters) or other materials where the thermal conductivity of the framing is relatively low (approx. 1.0 \- 1.5 $W/m\\cdot K$ or less). The conductivity ratio between wood and fiberglass is roughly 3:1 or 4:1. This proximity allows the assumption that heat flows in independent parallel lanes through the stud and the cavity.

Derivation:  
The wall is visualized as two separate circuits connected in parallel:

* **Path A (Cavity):** Heat flows through the insulation, sheathing, drywall, etc.  
* **Path B (Framing):** Heat flows through the stud, sheathing, drywall, etc.

Step 1: Calculate Path R-values

$$R\_A \= R\_{series\\\_layers} \+ R\_{insulation}$$$$R\_B \= R\_{series\\\_layers} \+ R\_{stud}$$  
Step 2: Determine Framing Factors ($f$)  
The framing factor ($f\_f$) is the fraction of the wall area occupied by framing members (studs, plates, headers, sills). The cavity factor ($f\_c$) is the remainder.

* Typical 16" o.c. framing: $f\_f \\approx 25\\%$, $f\_c \\approx 75\\%$.  
* Typical 24" o.c. framing: $f\_f \\approx 22\\%$, $f\_c \\approx 78\\%$.  
* Advanced Framing (24" o.c., single top plate, etc.): $f\_f \\approx 15-18\\%$.

Step 3: Calculate Weighted U-factor  
Because resistances are not additive in parallel (conductances are), we must convert to U-factors to average them.

$$U\_{effective} \= (f\_c \\times U\_A) \+ (f\_f \\times U\_B)$$$$U\_{effective} \= \\left(f\_c \\times \\frac{1}{R\_A}\\right) \+ \\left(f\_f \\times \\frac{1}{R\_B}\\right)$$  
Step 4: Convert to Effective R-value

$$R\_{effective} \= \\frac{1}{U\_{effective}}$$  
**Example Calculation (Wood 2x6, R-19 Batt):**

* **Layers:** Ext. Air (0.17), Siding (0.62), Sheathing (0.62), Drywall (0.45), Int. Air (0.68). Sum ($R\_{series}$) \= 2.54.  
* **Path A (Insulation):** $R\_{batt} \= 19$. Total $R\_A \= 2.54 \+ 19 \= 21.54$. $U\_A \= 0.046$.  
* **Path B (Wood Stud):** $R\_{wood} \\approx 6.88$ (5.5" x 1.25/in). Total $R\_B \= 2.54 \+ 6.88 \= 9.42$. $U\_B \= 0.106$.  
* **Weighting (25% Framing):** $U\_{eff} \= (0.75 \\times 0.046) \+ (0.25 \\times 0.106) \= 0.0345 \+ 0.0265 \= 0.061$.  
* **Effective R-value:** $1 / 0.061 \= \\mathbf{16.39}$.  
* **Insight:** The nominal R-19 batt results in an R-16.4 wall. The degradation is significant (\~14%) but manageable.

### **3.3 The Isothermal Planes Method (Masonry/Concrete)**

**Applicability:** This method is used for assemblies like concrete masonry units (CMU) where highly conductive webs connect the face shells. It assumes that lateral conductivity is so high that the temperature is uniform across planes perpendicular to heat flow.

Method:  
Instead of calculating separate paths for the whole wall, the resistance of the non-homogeneous layer (e.g., the block layer) is calculated using parallel conductance formulas first, and then added in series to the other layers.

$$R\_{block\_layer} \= \\frac{1}{ (f\_{web}/R\_{web}) \+ (f\_{core}/R\_{core}) }$$

Then:

$$R\_{total} \= R\_{film} \+ R\_{face\\\_shell} \+ R\_{block\\\_layer} \+ R\_{finish}$$

### **3.4 The Modified Zone Method (Steel Framing)**

**Applicability:** This method is **mandatory for steel-framed assemblies**. The thermal conductivity of steel ($k \\approx 50 W/m\\cdot K$) is roughly 1000 times that of insulation ($k \\approx 0.04 W/m\\cdot K$). This extreme delta renders the Parallel Path method mathematically invalid because heat does not flow in straight parallel lines. Instead, the steel stud acts as a "heat funnel," gathering heat from a wide area of the drywall and transmitting it rapidly across the cavity.

Derivation:  
The Zone Method defines a "zone of thermal influence" around the metal stud. The wall is modeled as two zones:

* **Zone W (Web):** The section containing the metal stud and the portion of the sheathing/drywall thermally affected by it.  
* **Zone CAV (Cavity):** The remainder of the cavity which functions as a thermally insulated wall.

The critical mathematical step is determining the **width of the thermal zone (**$w\_{zone}$**)**. It is wider than the physical flange of the stud.

Equation 2: Zone Width Calculation

$$w\_{zone} \= w\_{flange} \+ 2 \\cdot (d\_{eff})$$

where $d\_{eff}$ is an effective depth parameter that depends on the thickness and thermal conductivity of the sheathing layers. The higher the conductivity of the sheathing, the wider the zone of influence, because conductive sheathing feeds heat more efficiently into the stud.  
Once $w\_{zone}$ is established, the calculation proceeds similarly to the Parallel Path method but using the calculated Zone areas rather than physical stud widths.  
**Why this is often skipped:** The calculation of $w\_{zone}$ is complex and iterative. Consequently, **ASHRAE 90.1 and IECC** have codified this physics into lookup tables of **Correction Factors**.

## **4\. Comprehensive Analysis of Opaque Wall Assemblies: Thermal Mechanics, Effective R-Values, and Hygrothermal Performance**

### **4.1 Introduction: The Physics of Thermal Envelopes**

The design of the building envelope determines the energy efficiency, durability, and occupant comfort of any structure. In the context of modern building science, the "opaque wall" section—representing the solid components of the façade excluding fenestration—must be analyzed not merely as a collection of materials with nominal thermal ratings, but as a complex, interactive system governed by the laws of thermodynamics. While prescriptive energy codes such as the International Energy Conservation Code (IECC) and ASHRAE Standard 90.1 provide baseline targets, high-performance building standards (Passive House, Net Zero) demand a rigorous calculation of **Effective Thermal Resistance (**$R\_{eff}$**)**.

This section provides an exhaustive technical analysis of prevalent and emerging wall construction methodologies. It moves beyond the simplistic "rated R-value" printed on insulation packaging to explore the "whole-wall" performance, accounting for the degradation caused by structural framing (thermal bridging), fastener conductivity, installation imperfections, and the physics of parallel heat flow. The analysis encompasses traditional wood framing (2x4 to 2x8), advanced double-stud assemblies, masonry (CMU), and industrialized systems such as Structural Insulated Panels (SIPs) and Insulated Concrete Forms (ICFs).

#### **4.1.1 Mechanisms of Heat Transfer in Wall Assemblies**

To understand the disparity between nominal and effective R-values, one must dissect the three modes of heat transfer active within a wall cavity:

* **Conduction (**$q\_{cond}$**):** The transfer of kinetic energy between molecules. This is the primary mode of heat loss through solid materials. Wood studs, steel headers, and concrete webs act as "thermal bridges," providing a path of least resistance for heat to bypass insulation. Steel, being approximately 400 times more conductive than wood, presents a catastrophic thermal bridge if not mitigated by continuous insulation.  
* **Convection (**$q\_{conv}$**):** The movement of heat via fluid motion (air). In low-density fiberglass batts, large temperature differentials can drive convection loops **within** the insulation matrix, degrading performance. Furthermore, air leakage through the assembly (infiltration/exfiltration) transports heat and moisture, necessitating an integral air barrier system.  
* **Radiation (**$q\_{rad}$**):** The transfer of energy via electromagnetic waves. While less dominant in opaque walls than in glazing, radiative transfer occurs across air gaps (e.g., rainscreens, empty CMU cores). Foil-faced insulation utilizes low-emissivity surfaces to reduce this load.

#### **4.1.2 The Imperative of Effective R-Value Calculation**

The "Nominal R-value" refers strictly to the thermal resistance of the insulation material measured in a steady-state condition (typically ASTM C518). However, a wall assembly is a composite. The **Effective R-value** is the reciprocal of the overall thermal transmittance ($U\_{overall}$), calculated by integrating the thermal properties of all layers—air films, cladding, sheathing, framing, cavity insulation, and interior finish.

The calculation methodology generally follows the **Parallel Path Method** for wood and the **Isothermal** Planes Method (or Modified Zone Method) for steel and concrete.

$$U\_{overall} \= \\frac{1}{R\_{eff}} \= \\sum (U\_i \\cdot A\_i)$$  
Where $U\_i$ is the transmittance of a specific path (e.g., through the stud vs. through the cavity) and $A\_i$ is the area fraction of that path. The accuracy of this calculation relies heavily on the **Framing** Factor **(FF)**—the percentage of the wall area occupied by structural members. While older models assumed an FF of 15%, modern forensic analysis of stick-framed buildings reveals actual framing factors ranging from **22% to 27%**, significantly reducing thermal performance.

### **4.2 Wood Frame Construction: From Standard to High Performance**

Wood framing remains the dominant residential construction method in North America. However, the evolution of energy codes has forced a transition from simple 2x4 walls to deeper cavities and advanced framing techniques.

#### **4.2.1 The Legacy 2x4 Wall (3.5" Cavity)**

The 2x4 wall, typically framed at 16 inches on center (o.c.), represents the baseline for millions of existing homes but is increasingly obsolete for new construction in Climate Zones 4 and above without significant exterior insulation.

* **Structural Mechanics:** The 3.5-inch depth limits the volume available for insulation.  
* **Insulation Capacity:**  
  * *Fiberglass Batt:* Standard R-13 or High-Density R-15.  
  * *Cellulose (Dense Pack):* Approximately R-13 (at 3.7 per inch).  
  * *Closed* Cell Spray *Foam (ccSPF):* R-21 to R-24 (at 6.0-6.8 per inch).  
* **Thermal Bridging Reality:** With a standard framing factor of 25% (accounting for plates, headers, cripples, and corners), the thermal bridge of the spruce-pine-fir (SPF) lumber (R-1.25/inch) encompasses a quarter of the wall area.  
* **Calculation:** A 2x4 wall with R-13 batt does **not** perform at R-13. The weighted average yields an effective R-value of approximately **R-11.9**.  
* **Zone Compliance:** To meet a Zone 5 U-factor requirement of 0.060 (Effective R-16.7), a 2x4 wall **must** utilize Continuous Insulation (CI). The addition of R-5 rigid foam serves a dual purpose: it boosts the total R-value and warms the sheathing, reducing condensation potential.

#### **4.2.2 The Standard 2x6 Wall (5.5" Cavity)**

The 2x6 wall has largely superseded the 2x4 in colder climates, offering greater structural capacity for taller floor-to-ceiling heights and deeper insulation cavities.

* **Insulation Capacity:**  
  * *Fiberglass Batt:* R-19 (Standard) to R-21 (High Density).  
  * *Mineral Wool:* R-23 (High Density).  
  * *Cellulose:* \~R-20.  
* **Advanced Framing (OVE):** 2x6 framing allows for **24-inch o.c.** spacing. This creates a "win-win" scenario: it reduces the framing factor from \~25% to \~22%, thereby reducing the area of the thermal bridge, and simultaneously increases the area available for higher-R insulation.  
* **Performance Delta:** A 2x6 wall (24" o.c.) with R-20 cellulose achieves an effective R-value of approximately **R-16.7**. While this meets some baseline codes, it still suffers from the "thermal striping" effect, where studs remain cold spots prone to ghosting (dust deposition) and mold. Thus, hybrid assemblies combining 2x6 framing with R-5 to R-10 exterior sheathing are becoming the "sweet spot" for high-performance production building.

#### **4.2.3 The "Deep Cavity" 2x8 Wall (7.25" Cavity)**

The use of 2x8 studs (7.25 inches actual depth) is a strategy often employed to achieve high R-values without the complexity of double walls or the expense of thick exterior foam.

* **Insulation Capacity:**  
  * *Fiberglass Batt:* R-30 is the standard batt for this depth.  
  * *Cellulose:* \~R-26 to R-27.  
  * *Mineral Wool:* \~R-30.  
* **Thermal Physics of Deep Studs:** While the cavity R-value is impressive (R-30), the stud itself is a massive thermal bridge. A 7.25-inch piece of lumber has an R-value of only \~R-9 (7.25" x 1.25/in).  
* **The Diminishing Returns of Depth:** As the disparity between the insulation R-value (R-30) and the stud R-value (R-9) widens, the framing factor exerts a stronger penalty on the overall assembly.  
* **Calculation:** At 16" o.c. (25% Framing Factor), a 2x8 wall with R-30 batt yields an effective R-value of only **R-21.8**. The thermal efficiency is approximately **72%**.  
* **Optimization:** Pushing spacing to 24" o.c. improves this to **R-23.2**.  
* **Comparative Insight:** A 2x6 wall with R-21 cavity and R-5 continuous insulation (Total Nominal R-26) often outperforms the 2x8 wall (Nominal R-30) in effective terms because the continuous insulation creates a thermal break that the 2x8 stud does not. However, 2x8 walls are favored in assemblies where "foam-free" construction is prioritized for environmental or fire safety reasons.

#### **4.2.4 The Double Stud Wall (Super-Insulated)**

The double stud wall is the archetype of "Passive House" framing, designed to eliminate thermal bridging almost entirely through the opaque assembly.

* **Configuration:** Two independent stud walls (typically 2x4) are constructed with a gap between them. The outer wall is often non-load-bearing (curtain wall), while the inner wall carries the structural load. The entire volume—inner bay, gap, and outer bay—is filled with insulation (usually dense-pack cellulose or blown fiberglass).  
* **Thermal Break Mechanics:** Because the inner and outer studs are separated by a continuous layer of insulation (the gap), there is no solid wood path from interior to exterior (except for top/bottom plates and window bucks).  
* **Effective R-Value:**  
  * *Example:* Two 2x4 walls with a 2.5-inch gap (Total thickness 9.5 inches).  
  * *Insulation:* 9.5 inches x R-3.7/inch \= Nominal R-35.  
  * *Efficiency:* Due to the lack of thermal bridging, double stud walls maintain **88% to 92%** of their nominal R-value. A 9.5" assembly typically yields an effective **R-30 to R-32**.  
  * *12-inch Assembly:* A 12-inch double stud wall can easily achieve effective **R-40+**, a common target for Passive House certification in cold climates.  
* **Hygrothermal** Risk (The "Cold Sheathing" **Problem):** The profound efficiency of a double stud wall creates a moisture risk. Because so little heat escapes from the interior, the exterior sheathing (OSB/Plywood) stays extremely cold in winter—often below the dew point of the interior air. If moisture-laden interior air migrates into the cavity (via diffusion or leakage), it **will** condense on the sheathing.  
  * *Mitigation:* This assembly requires a rigorous interior air barrier and often a "smart" vapor retarder (variable permeance membrane) that prevents vapor entry in winter but allows inward drying in summer.

### **4.3 Masonry (CMU) and Mass Wall Assemblies**

Concrete Masonry Units (CMU) are ubiquitous in commercial and institutional construction. Their thermal behavior differs fundamentally from frame walls due to the physics of **Thermal Mass** and **Web Conduction**.

#### **4.3.1 The Failure of Core Insulation**

A common misconception is that filling the cores of CMU blocks with loose-fill insulation (perlite/vermiculite) or foam inserts creates a high-performance wall. Physics dictates otherwise.

* **The Web Short-Circuit:** A standard 8-inch CMU block consists of face shells connected by solid concrete webs. Concrete is highly conductive ($k \\approx 1.0 \- 2.5$ W/mK). Heat flows through the webs, bypassing the insulated cores entirely.  
* **Performance Data:**  
  * Uninsulated 8" Normal Weight CMU: **R-1.11**.  
  * Insulated (Perlite) 8" Normal Weight CMU: **R-2.6 to R-3.7**.  
* **Efficiency:** Even with cores filled, the effective R-value remains below R-4, failing to meet even the most lenient energy codes.  
* **Density Impact:** Lightweight CMU (using pumice/shale aggregate) performs better than normal weight. An 8" lightweight block with perlite fill can reach **R-5.2**, but this is still insufficient for a standalone thermal envelope in most climates.

#### **4.3.2 Continuous Insulation and Thermal Mass**

To comply with ASHRAE 90.1, CMU walls almost invariably require **Continuous Insulation (CI)**.

* **CI Application:** Rigid foam (XPS, EPS, Polyiso) or Mineral Wool board is applied to the exterior or interior face. This eliminates the web bridging effect. An 8" CMU wall with R-10 ci achieves an effective R-value of roughly **R-11.1**.  
* **The Mass Effect (Decrement Factor):** Heavy walls store heat energy, delaying the transmission of temperature peaks (time lag) and reducing the amplitude of the flux (decrement factor). Codes like ASHRAE 90.1 allow for higher U-factors (lower R-values) for mass walls because this dynamic behavior reduces the actual cooling/heating load, particularly in climates with high diurnal swings (e.g., Arizona, Zone 2B).  
* **Code Example:** A mass wall in Zone 3 might require a U-factor of 0.090, whereas a wood frame wall requires 0.060. The code credits the "virtual" R-value provided by the mass.

### **4.4 Advanced and Industrialized Assemblies**

The construction industry is increasingly adopting industrialized systems that decouple thermal performance from on-site labor variability.

#### **4.4.1 Structural Insulated Panels (SIPs)**

SIPs are composite panels consisting of an insulating foam core (EPS, XPS, or Polyurethane) sandwiched between two structural facings (typically OSB).

* **Thermal Mechanics:** SIPs rely on the "I-beam" structural concept, where the facings act as flanges and the foam as the web. This eliminates the need for vertical lumber studs every 16 inches.  
* **Framing Factor:** The only lumber in a SIP wall is at the top/bottom plates, corners, and window surrounds. The framing factor drops from \~25% (stick frame) to **3% \- 7%**.  
* **Performance:**  
  * *4.5" Panel (3.5" EPS Core):* Rated R-15. Effective R-value $\\approx$ **R-14**.  
  * *6.5" Panel (5.5" EPS Core):* Rated R-24. Effective R-value $\\approx$ **R-22 to R-23**.  
* **Comparison:** A 4-inch SIP wall often outperforms a 2x6 fiberglass wall (Effective R-16) despite being thinner, due to the uniformity of insulation and superior air tightness (reduced convective loss).  
* **Long-Term Creep:** One structural consideration is the "creep" of the foam core under sustained loads, which limits SIPs primarily to low-rise residential and light commercial applications unless reinforced with splines.

#### **4.4.2 Insulated Concrete Forms (ICFs)**

ICFs consist of expanded polystyrene (EPS) blocks that serve as permanent formwork for a reinforced concrete core.

* **Assembly:** 2.5" EPS \+ Concrete Core (4", 6", 8") \+ 2.5" EPS.  
* **Thermal Bridge Free:** The plastic ties connecting the inner and outer foam layers are non-conductive. The wall is essentially wrapped in R-22 to R-24 continuous insulation.  
* **Effective R-Value:** Since there are no thermal bridges, the effective R-value is the sum of the EPS layers, typically **R-22 to R-25**.  
* **Mass \+ Resistance:** ICFs combine the high steady-state R-value of SIPs with the thermal mass benefits of CMU. This dual-action performance often results in energy savings that exceed what steady-state models predict, sometimes marketed as "Performance R-50," though the steady-state value remains \~R-22.  
* **Core Size:** Increasing the concrete core (e.g., 6" to 8") increases structural capacity and thermal mass but does **not** significantly increase the R-value, as concrete is a poor insulator.

#### **4.4.3 Steel Stud Framing**

Light Gauge Steel (LGS) framing presents the most challenging thermal scenario due to the extreme conductivity of steel.

* **The Physics:** Heat conducts through steel 400x faster than wood. A steel stud acts as a "thermal radiator fin," rapidly bypassing cavity insulation.  
* **ASHRAE Corrections:** ASHRAE 90.1 Table A3.3 imposes severe penalties on steel stud walls.  
* **Example:** A 2x6 steel stud wall at 16" o.c. with R-19 fiberglass batt has an effective R-value of only **R-7.1**. The thermal efficiency is approximately **37%**.  
* **Mandate for CI:** It is economically and physically impractical to meet modern U-factors with steel cavity insulation alone. Continuous exterior insulation is not optional; it is a prerequisite for code compliance.

### **4.5 Thermal Bridging of Fasteners and Attachments**

As energy codes drive the industry toward Continuous Insulation (CI), the method of attaching cladding through that insulation becomes a critical "second-order" thermal bridge. The "Clear Field" R-value of a CI wall is degraded by the fasteners (point bridges) and support rails (linear bridges) used to hang siding or masonry.

#### **4.5.1 The Chi-Factor ($\\chi$) and Psi-Factor ($\\psi$)**

To accurately model these losses, building physicists use:

* **Psi-Factor (**$\\psi$**):** Linear thermal transmittance (W/m·K). Used for Z-girts, shelf angles, and slab edges.  
* **Chi-Factor (**$\\chi$**):** Point thermal transmittance (W/K). Used for screws, pins, and clips.

#### **4.5.2 Cladding Attachment Systems**

* **Continuous Z-Girts (The "Old" Standard):** Metal Z-girts installed horizontally or vertically penetrate the insulation continuously.  
  * *Impact:* A galvanized steel Z-girt can reduce the effective R-value of exterior insulation by **50% or more**. An R-20 layer of foam effectively becomes R-10.  
* **Clip Systems (Thermally Broken):** Modern systems use discrete clips to hold rails.  
  * *Impact:* Because the bridge is a "point" rather than a "line," the degradation is significantly lower (typically 10-20% reduction).  
* **Fastener Metallurgy (Galvanized vs. Stainless):**  
  * *Conductivity (*$k$*):* Carbon steel (galvanized) has a $k$ of \~50 W/mK. Stainless steel has a $k$ of \~15 W/mK.  
  * *Result:* Switching from galvanized to stainless steel screws for attaching insulation can reduce the point transmission loss ($\\chi$) by nearly **70%**. In a wall with a high density of fasteners, this can boost the overall assembly effective R-value by R-1 to R-3.

### **4.6 Comprehensive Thermal Performance Data (Table 1\)**

The following expanded table synthesizes the analysis of wood, masonry, and industrialized systems. Effective R-values are calculated using ASHRAE parallel path methodology, assuming standard air films (R-0.17 ext / R-0.68 int) and 0.5" gypsum board.

| Assembly Category | Framing / Core | Spacing | Cavity Insulation | Nominal Cavity R | Framing Factor | Effective R-Value (Reff​) | U-Factor | Efficiency (%) | Notes |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Wood Frame | 2x4 (3.5") | 16" o.c. | Fiberglass Batt | R-13 | 25% | R-11.9 | 0.084 | 91% | Standard "Code Min" (Zone 3\) |
| Wood Frame | 2x4 (3.5") | 16" o.c. | Closed Cell Spray Foam | R-21 | 25% | R-16.5 | 0.060 | 78% | High cost per R-value |
| Wood Frame | 2x6 (5.5") | 16" o.c. | Fiberglass Batt | R-19 | 25% | R-15.8 | 0.063 | 83% | Common Residential Std |
| Wood Frame | 2x6 (5.5") | 24" o.c. | Fiberglass Batt | R-19 | 22% | R-16.6 | 0.060 | 87% | Advanced Framing (OVE) |
| Wood Frame | 2x6 (5.5") | 24" o.c. | Mineral Wool | R-23 | 22% | R-18.2 | 0.055 | 79% | Excellent fire resistance |
| Wood Frame | 2x6 (5.5") | 24" o.c. | R-19 \+ R-5 ci (XPS) | R-24 | 22% | R-22.2 | 0.045 | 92% | Optimal Cost/Performance |
| Wood Frame | 2x8 (7.25") | 16" o.c. | Fiberglass Batt | R-30 | 25% | R-21.8 | 0.046 | 72% | Poor efficiency due to stud depth |
| Wood Frame | 2x8 (7.25") | 24" o.c. | Fiberglass Batt | R-30 | 22% | R-23.2 | 0.043 | 77% | Better, but CI is superior |
| Double Stud | 2x4 \+ 2.5" Gap \+ 2x4 | N/A | Dense Pack Cellulose | R-35 | \~10% | R-31.0 | 0.032 | 88% | Highest R/$ (Passive House) |
| Double Stud | 2x4 \+ 5" Gap \+ 2x4 | N/A | Dense Pack Cellulose | R-44 | \~9% | R-40.5 | 0.025 | 92% | Requires smart vapor retarder |
| Masonry | 8" CMU (Normal Wt) | N/A | Empty | R-1.1 | N/A | R-1.1 | 0.909 | \- | Thermal bridge disaster |
| Masonry | 8" CMU (Normal Wt) | N/A | Perlite Loose Fill | R-2.6 | N/A | R-2.6 | 0.384 | \- | Webs bypass insulation |
| Masonry | 8" CMU \+ R-10 ci | N/A | Grout/Empty | R-11 | N/A | R-11.1 | 0.090 | \- | Mass Wall compliance path |
| Steel Frame | 3.625" (2x4) | 16" o.c. | Fiberglass Batt | R-13 | N/A | R-6.0 | 0.166 | 46% | Requires CI for compliance |
| Steel Frame | 6" (2x6) | 16" o.c. | Fiberglass Batt | R-19 | N/A | R-7.1 | 0.141 | 37% | Extreme thermal bridging |
| SIPs | 4.5" Panel | N/A | EPS Core | R-14 | 3-7% | R-13.8 | 0.072 | 98% | Superior air tightness |
| SIPs | 6.5" Panel | N/A | EPS Core | R-24 | 3-7% | R-22.5 | 0.044 | 94% | Minimal thermal bridging |
| ICF | 6" Concrete Core | N/A | EPS (2.5" In / 2.5" Out) | R-22 | 0% | R-22.0 | 0.045 | 100% | High Thermal Mass \+ Resistance |

### **4.7 Key Insights and Future Implications**

The synthesis of data from standard wood framing, masonry, and advanced envelope systems yields several critical insights for the AEC (Architecture, Engineering, and Construction) industry:

* **The "Nominal" Fallacy:** Specifying wall assemblies based on nominal insulation values is professional negligence in the context of modern energy codes. A "R-19" steel stud wall performs at R-7. A "R-30" 2x8 wood wall performs at R-22. Effective R-value calculations must be the standard of practice.  
* **The 2x6 Sweet Spot:** The 2x6 wall (24" o.c.) coupled with continuous exterior insulation (R-5 to R-10) emerges as the most robust, cost-effective solution for mainstream construction. It balances structural utility, cavity depth, and thermal bridging mitigation.  
* **Double Stud vs. Deep Cavity:** While 2x8 walls are often proposed as a simplified high-R solution, the **Double Stud** wall is vastly superior in thermal efficiency. The thermal bridge of a 7.25" solid stud is simply too large to ignore. Double stud walls decouple the structure, allowing the insulation to perform at near-nominal capacity.  
* **The Detail is the Assembly:** As insulation levels rise, the relative impact of small thermal bridges (fasteners, clips) grows exponentially. Using **stainless steel fasteners** and **thermally broken clips** for cladding attachment is a low-cost, high-impact strategy to preserve the integrity of the continuous insulation layer.  
* **Industrialized Superiority:** Factory-built systems like SIPs and ICFs inherently solve the framing factor and air sealing challenges that plague stick-built construction. Their market adoption is limited more by supply chain and trade familiarity than by performance physics.

## **5\. The Math of Continuous Insulation (CI)**

The user asks: "When we add a continuous insulation layer... what is the math to calculate the impact?" and "How do we integrate the two different values?" Continuous Insulation (CI) is defined as insulation that runs continuously over structural members, free of significant thermal bridging. Because it is located **outside** the studs (usually), it acts as a thermal break.

### **5.1 Series Integration**

The integration of CI is fundamentally a **series addition**. Because the CI layer covers the entire face of the building (studs and cavities alike), its resistance is added directly to the effective resistance of the base assembly.

**Equation 4: Basic Integration of CI**

$$R\_{total} \= R\_{base\\\_assembly} \+ R\_{CI\\\_effective}$$  
**Example (Steel 2x4 with R-13 Batt \+ R-10 CI):**

* **Base Assembly:** From previous section, R-13 steel stud wall effective R-value $\\approx$ R-10 (R-6 for cavity \+ R-4 for films/gyp/sheathing).  
* **Add CI:** Add R-10.  
* **Total:** R-20.  
* **Total U-factor:** $1/20 \= 0.050$.

**Comparative Insight:**

* *Without CI:* R-19 batt in 2x6 steel stud \= Effective R-11 (approx).  
* *With CI:* R-13 batt in 2x4 steel stud \+ R-7.5 CI \= Effective R-17.5 (approx). The wall with less total nominal insulation (13+7.5=20.5 vs 19\) performs significantly better (Effective 17.5 vs 11\) because the CI is not degraded by the studs.

### **5.2 The "Continuous" Fallacy: Fastener Effects**

However, CI is rarely perfectly continuous. It must be attached to the studs, typically with metal screws or Z-girts. The user asks: "How do we integrate the two different values?" This requires accounting for the **Point Thermal Bridges** of the fasteners. If Z-girts are used, they act as linear bridges (like studs) and must be modeled using zone methods. If discrete screws/clips are used, they are modeled as point transmittances.

#### **5.2.1 Point Transmittance ($\\chi$ \- Chi Value)**

The heat flow through a single fastener is quantified by its **Chi-value (**$\\chi$**)**.

* **Units:** $W/K$ or $Btu/h\\cdot ^\\circ F$.  
* **Determinants:** Fastener material (stainless vs. carbon steel), diameter, length, and substrate.

**Equation 5: U-factor Correction for Fasteners**

$$U\_{final} \= U\_{nominal\\\_with\\\_CI} \+ \\Delta U\_{fasteners}$$$$\\Delta U\_{fasteners} \= \\chi \\cdot n$$  
Where $n$ is the number of fasteners per unit area (density).

**Table 2: Typical Chi-Values for Fasteners through CI**

| Fastener Type | Substrate | Insulation Thickness | Chi-Value (χ) |
| :---- | :---- | :---- | :---- |
| Galvanized Screw (\#10) | Steel Stud | 4" (100mm) | 0.006 \- 0.008 |
| Stainless Steel Screw (\#10) | Steel Stud | 4" (100mm) | 0.002 \- 0.003 |
| Galvanized Screw | Wood Stud | 4" (100mm) | 0.001 \- 0.002 |

**Calculation Example:**

* **Scenario:** R-10 CI ($U\_{ins} \= 1/10 \= 0.10$).  
* **Fasteners:** Galvanized screws, 4 per $ft^2$ (approx 43 per $m^2$ \- *Note: this is a high density for illustration*).  
* **Chi Value:** 0.006 W/K (approx 0.0034 Btu/h F).  
* **Calculation (IP Units):** $\\Delta U \= 0.0034 \\times 1 \\text{ (screw/ft}^2\\text{)} \= 0.0034$. If Base U with CI was 0.050, New U \= 0.0534. This represents a 6.8% degradation in performance.  
* **Research Insight:** Studies show that using stainless steel fasteners instead of carbon steel can reduce this penalty by a factor of 3 to 5\. Simply ignoring fasteners can lead to a 5-20% error in the calculated U-factor of the CI layer.

## **6\. Integrated Calculation Workflow (Step-by-Step)**

To satisfy the user's request for "how to integrate the two," we present a unified linear workflow for a complex assembly (Steel Stud \+ CI).

**Scenario:** 6" Steel Studs @ 16" o.c. with R-19 Batt \+ 2" R-10 CI (attached with stainless screws).

Step 1: Calculate Base Assembly R-Value (Zone A \+ B)  
Instead of manual zone math, we use the ASHRAE Correction Factor.

* Nominal Cavity: R-19.  
* Correction Factor: 0.37 (from Table 1 in Section 4.6 data).  
* Effective Cavity ($R\_{eff\\\_cav}$): $19 \\times 0.37 \= \\mathbf{7.03}$.  
* Add Layers:  
  * Interior Film: 0.68  
  * Gypsum: 0.56  
  * Ext. Sheathing: 0.62  
* **Base Sum:** $7.03 \+ 0.68 \+ 0.56 \+ 0.62 \= \\mathbf{8.89}$.

Step 2: Calculate Effective CI R-Value (Corrected for Points)  
We treat the CI layer separately first to find its "true" R-value before adding it.

* Nominal CI: R-10 ($U\_{nom} \= 0.10$).  
* Fastener Impact:  
  * Density ($n$): 1 screw per $2 ft^2$ \= 0.5 screws/$ft^2$.  
  * Chi Value ($\\chi$): 0.002 Btu/h·F (Stainless).  
* $\\Delta U \= 0.002 \\times 0.5 \= 0.001$.  
* Effective CI U-factor: $0.10 \+ 0.001 \= 0.101$.  
* **Effective CI R-value:** $1 / 0.101 \= \\mathbf{9.90}$. (*Note: Stainless screws have minimal impact. Galvanized would be higher.*)

Step 3: Integrate Values (Series Summation)  
Now we add the Effective Base Assembly (Step 1\) and Effective CI (Step 2).

* **Total Effective R-value (**$R\_{total}$**):** $8.89 (Base) \+ 9.90 (CI) \+ 0.17 (Ext Film) \= \\mathbf{18.96}$.  
* **Total U-Factor:** $1 / 18.96 \= \\mathbf{0.053}$.

**Step 4: Calculate Heat Loss**

* Area ($A$): $1,000 ft^2$.  
* Delta T ($\\Delta T$): $40^\\circ F$ (e.g., $70^\\circ F$ in, $30^\\circ F$ out).  
* Heat Loss ($Q$): $0.053 \\times 1000 \\times 40 \= \\mathbf{2,120 \\text{ Btu/hr}}$.

## **7\. Hygrothermal Integration: Dew Point Analysis**

Thermal calculations are not just for energy; they determine moisture safety. The user asks about "assumptions" and implications. A key implication of the R-value ratio is the **Temperature Gradient**.

### **7.1 Temperature Gradient Math**

To prevent condensation within the wall, the temperature of the first condensing surface (usually the exterior sheathing) must be kept above the **Dew Point Temperature (**$T\_{dp}$**)** of the interior air.

Equation 6: Interface Temperature ($T\_x$)

$$T\_x \= T\_{in} \- \\left( \\Delta T \\times \\frac{R\_{interior\\\_to\\\_x}}{R\_{total}} \\right)$$

Where $R\_{interior\\\_to\\\_x}$ is the cumulative resistance from the warm side up to the point of interest.

### **7.2 The CI Ratio Rule**

Increasing the R-value of the Continuous Insulation ($R\_{ci}$) relative to the Cavity Insulation ($R\_{cav}$) pushes the sheathing temperature ($T\_{sheathing}$) upward (warmer).

**Example Calculation:**

* Interior: $70^\\circ F$, 35% RH $\\rightarrow$ **Dew Point (**$T\_{dp}$**) \= 40^\\circ F**.  
* Exterior: $10^\\circ F$. $\\Delta T \= 60^\\circ F$.

**Wall A (Cavity Dominated):** R-20 Cavity \+ R-5 CI.

* $R\_{total} \\approx 25$.  
* $R\_{in\\\_to\\\_sheathing} \\approx 20$ (Cavity \+ Gyp \+ Film).  
* Ratio: $20/25 \= 0.8$.  
* Drop: $60 \\times 0.8 \= 48^\\circ F$ drop.  
* $T\_{sheathing} \= 70 \- 48 \= \\mathbf{22^\\circ F}$.  
* **Result:** $22^\\circ F \< 40^\\circ F$ (Dew Point). **FAIL. Condensation Risk.**

**Wall B (CI Dominated):** R-13 Cavity \+ R-15 CI.

* $R\_{total} \\approx 28$.  
* $R\_{in\\\_to\\\_sheathing} \\approx 13$.  
* Ratio: $13/28 \= 0.46$.  
* Drop: $60 \\times 0.46 \= 27.6^\\circ F$ drop.  
* $T\_{sheathing} \= 70 \- 27.6 \= \\mathbf{42.4^\\circ F}$.  
* **Result:** $42.4^\\circ F \> 40^\\circ F$. **PASS. Safe.**

**Integration Insight:** This math demonstrates that R-value selection is not arbitrary. We cannot simply swap R-10 CI for R-10 Cavity to save money; doing so fundamentally alters the temperature gradient and moisture dynamics.

## **8\. Conclusion**

The calculation of heat loss in building envelopes requires a layered mathematical approach that rigorously accounts for thermal bridging. The simple summation of nominal R-values is mathematically invalid for framed assemblies.

* **For Wood:** Use the **Parallel Path Method** to area-weight the disparate U-factors of the stud and cavity.  
* **For Steel:** Use **Correction Factors** or the **Modified Zone Method** to account for the extreme lateral heat flow that degrades cavity insulation effectiveness by 40-60%.  
* **For Continuous Insulation:** Integrate as a **Series Resistance**, but apply **Chi-value (**$\\chi$**)** corrections to account for the point thermal bridges of fasteners, which can degrade the CI layer by 5-10%.  
* **For Moisture:** Use the ratio of these effective R-values to calculate **Interface Temperatures** against the **Dew Point**, ensuring that thermal efficiency does not compromise structural durability.

By integrating these methodologies, designers move from theoretical "nominal" performance to realistic "effective" performance, ensuring code compliance and energy resilience.

## **9\. References**

1. What is a U-value? Heat loss, thermal mass and online calculators explained | NBS, accessed January 1, 2026\.  
2. Effective R Value of Common Wall Construction Methods | Math Encounters Blog, accessed January 1, 2026\.  
3. K-Value, U-Value, R-Value, C-Value \- Insulation Outlook Magazine \- National Insulation Association, accessed January 1, 2026\.  
4. Steady-State Heat Flow \- CMACN, accessed January 1, 2026\.  
5. How to Calculate a U-value? \- Kingspan, accessed January 1, 2026\.  
6. What's the Difference Between U‑Value and R‑Value? \- Vitro Glass Education Center, accessed January 1, 2026\.  
7. Calculating Heat Loss: A Simple and Understandable Guide, accessed January 1, 2026\.  
8. Fundamentals of Building Heat Transfer \- PMC \- PubMed Central \- NIH, accessed January 1, 2026\.  
9. How the Same Wall Can Have Several Different R-Values: Relations Between Amount of Framing and Overall Thermal Performance in Wood and Steel-Framed Walls, accessed January 1, 2026\.  
10. Framing with Steel Versus Wood/ Heat Transfer Issues and Analysis, accessed January 1, 2026\.  
11. ANSI/ASHRAE/IES Addendum aw to ANSI/ASHRAE/IES Standard 90.1-2022, accessed January 1, 2026\.  
12. APPENDIX RA DEFAULT HEAT LOSS COEFFICIENTS \- 2018 WASHINGTON STATE ENERGY CODE \- RESIDENTIAL PROVISIONS, accessed January 1, 2026\.  
13. Calculating Wall U-Factors for Compliance with Table R402.1.4 \- OSFM, accessed January 1, 2026\.  
14. Thermal properties of metal stud walls \- Alaska Department of Transportation and Public Facilities, accessed January 1, 2026\.  
15. Air Space R-Value Design Guide \- Continuous Insulation, accessed January 1, 2026\.  
16. Tables for Calculating Effective Thermal Resistance of Opaque Assemblies, accessed January 1, 2026\.  
17. ANSI/ASHRAE/IES Addendum ay to ANSI/ASHRAE/IES Standard 90.1-2022, accessed January 1, 2026\.  
18. Table 4.1.1 U-Factor Calculations for Wood Framed Assembly \- Energy Code Ace, accessed January 1, 2026\.  
19. Thermal Bridging Implementation in AccuRate \- NatHERS, accessed January 1, 2026\.  
20. THERMAL PERFORMANCE OF "ENERGY- EFFICIENT" METAL STUD WALL SYSTEMS \- Oak Ridge National Laboratory, accessed January 1, 2026\.  
21. 2021 International Energy Conservation Code (IECC) \- C402.1.4.2 Thermal resistance of cold-formed steel walls., accessed January 1, 2026\.  
22. Steel Stud Wall Systems R-Value \- Masonry Advisory Council, accessed January 1, 2026\.  
23. Continuous Insulation Solves Energy Code Math Problem, accessed January 1, 2026\.  
24. "ci" Defined Exceed Prescriptive R-Value Requirements With Continuous Insulation \- DuPont, accessed January 1, 2026\.  
25. Thermal Bridging Through Roof Fasteners Why the Industry Should Take Note, accessed January 1, 2026\.  
26. What is Thermal Bridging? | Kingspan GB, accessed January 1, 2026\.  
27. A Simplified Methodology for Evaluating the Impact of Point Thermal Bridges on the High-Energy Performance of a Passive House \- MDPI, accessed January 1, 2026\.  
28. Thermal Bridging From Cladding Attachment Strategies Through Exterior Insulation \- Cascadia Windows, accessed January 1, 2026\.  
29. Thermo-mechanical modeling and testing of thermal breaks in structural steel point transmittances \- AISC, accessed January 1, 2026\.  
30. The Dew Point and Insulation \- Rise, accessed January 1, 2026\.  
31. How To Correctly Position the Dew Point Using Exterior Insulation: Guidelines for Builders | BuildwithHalo.com, accessed January 1, 2026\.  
32. New Wall Design Calculator for Commercial Energy Code Compliance | Continuous Insulation with Foam Sheathing, accessed January 1, 2026\.  
33. Insulation and Temperature–A Useful Relationship, accessed January 1, 2026\.  
34. Understanding Basic Dew Point Calculations for High-Performance Basement, Walls, and Roof Systems \- Efficiency Vermont, accessed January 1, 2026\.  
35. Methodology to be followed for calculation of equivalent thermal conductivities for Passive House construction system certification, accessed January 1, 2026\.  
36. Wood‐ Frame Buildings and Updates to the Seattle and Washington State Energy Codes | WoodWorks, accessed January 1, 2026\.  
37. R-Values in the Real World | Structural Insulated Panel Association, accessed January 1, 2026\.  
38. R-Value of Building Materials, accessed January 1, 2026\.  
39. R22+ Effective Walls in Residential Construction in British Columbia \- City of Vancouver, accessed January 1, 2026\.  
40. Standard Method of Test for the Evaluation of Building Energy Analysis Computer Programs \- ASHRAE, accessed January 1, 2026\.  
41. JA4.3 Walls \- Energy Code Ace, accessed January 1, 2026\.  
42. 2x8 exterior wall, 16" on center, with R30 Rockwool batts, zip R6 sheathing, Rockwool 1.5" comfortboard on the exterior of the house. : r/Homebuilding \- Reddit, accessed January 1, 2026\.  
43. ETW: Wall \- Double Stud Wall Construction | buildingscience.com, accessed January 1, 2026\.  
44. Double Stud Wall Simplified \- Low Cost, High Performance \- Zero Energy Project, accessed January 1, 2026\.  
45. High-R Walls | Building America Top Innovation \- Department of Energy, accessed January 1, 2026\.  
46. Double Stud Wall Assemblies, accessed January 1, 2026\.  
47. Concrete Masonry Unit (CMU) Insulation: What You Need to Know \- Rmax, accessed January 1, 2026\.  
48. TABLE \- Concrete Block Walls \- U-Values & R-Values \- Perlite.info, accessed January 1, 2026\.  
49. 2023 Illinois Commercial Stretch Energy Code Based on ASHRAE 90.1-2022 \- A3.1.3.2 Determination of Mass Wall U-Factors., accessed January 1, 2026\.  
50. Structural Insulated Panels | Tolko, accessed January 1, 2026\.  
51. Taking Longer to Reach the Steady State Helps ICF Walls Outperform Other Assembly Types, accessed January 1, 2026\.  
52. What Is the R-Value of ICF Foundation Walls? \- Fox Blocks, accessed January 1, 2026\.  
53. Technically Speaking: A Comparison of Core Sizes | ICF Builder Magazine, accessed January 1, 2026\.  
54. Panel attachment & the energy code: how to meet & exceed the engery code with exterior mineral fiber insulation, accessed January 1, 2026\.  
55. ARMATHERM™ Minimize building energy loss and improve building envelope performance, accessed January 1, 2026\.  
56. Thermal Bridging \- Applied Building Technology Group, accessed January 1, 2026\.  
57. THERMAL BRIDGING SOLUTIONS FOR COMMERCIAL BUILDINGS \- Armatherm, accessed January 1, 2026\.  
58. THERMAL BRIDGING IN STEEL CONSTRUCTION \- Schoeck, accessed January 1, 2026\.  
59. Galvanized Screws Vs Stainless Steel Screws，How Should I Choose?, accessed January 1, 2026\.  
60. Energy-Efficient Wood Wall Assemblies \- APA – The Engineered Wood Association, accessed January 1, 2026\.

# **The Engineering Architecture of Residential Thermal Analysis: A Comprehensive Report on ACCA Manual J Methodologies and Algorithmic Implementation**

## **1\. Introduction: The Imperative of Precision in HVAC Design**

The built environment represents a complex thermodynamic system where energy flows are governed by the interaction of transient meteorological conditions, physical material properties, and dynamic internal loads. The sizing of Heating, Ventilation, and Air Conditioning (HVAC) equipment is the pivotal engineering calculation that dictates the energy efficiency, occupant comfort, and long-term durability of a residential structure. The **Air Conditioning Contractors of America (ACCA) Manual J, Eighth Edition (MJ8)**, stands as the American National Standards Institute (ANSI) recognized authority for quantifying these loads.1

Historically, residential equipment sizing was often relegated to heuristic "rules of thumb," such as allocating one ton of cooling capacity for every 500 square feet of floor area. In an era of uninsulated structures and cheap energy, such approximations were tolerated. However, contemporary building codes, which mandate tighter envelopes and higher insulation levels, render these archaic methods obsolete and detrimental. Oversized equipment—a frequent consequence of imprecise calculation—results in "short cycling," where the system satisfies the thermostat setpoint too quickly to effectively dehumidify the air, leading to clammy indoor conditions, microbial growth, and premature equipment failure due to excessive startup stress.2 Conversely, undersized equipment fails to maintain thermal equilibrium during peak design conditions.

This report serves as a definitive technical reference for the development of a digital calculation engine based on Manual J methodologies. It dissects the thermodynamic principles, mathematical formulas, material property databases, and logical assumptions required to simulate a building’s thermal performance. The analysis distinguishes between the various calculation pathways—specifically the **Block Load** method versus the **Room-by-Room** method—and provides the granular data structures necessary to construct a robust online calculator tool.3

## **2\. Theoretical Framework: The Physics of Load Calculation**

To accurately replicate the Manual J methodology in software, one must first understand the governing physics. The load calculation is not a static summation but a dynamic modeling of heat transfer mechanisms: conduction, convection, and radiation.

### **2.1 The Duality of Loads: Heating vs. Cooling**

The methodology bifurcates into two distinct calculation modes, each governed by different thermodynamic assumptions:

1. **Heating Load (Winter):** This is typically modeled as a steady-state conduction problem. The assumption is that the worst-case scenario occurs during a prolonged period of cold darkness (nighttime). Therefore, solar heat gains and the thermal lag capability of mass walls are generally ignored to ensure the system can maintain comfort without the aid of the sun or stored heat. The calculation focuses on the rate of heat loss from the conditioned interior to the cold exterior.4  
2. **Cooling Load (Summer):** This is a transient, non-steady-state problem. Heat gain occurs through conduction (driven by temperature difference) and radiation (solar loading). Because building materials have thermal mass, there is a time delay between when heat strikes the exterior and when it impacts the indoor air temperature. Manual J utilizes the **Cooling Load Temperature Difference (CLTD)** method to simplify these complex transient heat flows into equivalent steady-state calculations suitable for engineering use.5

### **2.2 The Fundamental Heat Transfer Equation**

The bedrock of the entire Manual J system is the basic transmission equation, which calculates the rate of heat flow (![][image1]) through a building assembly:

![][image2]  
Where:

* ![][image1]: The heat transfer rate in British Thermal Units per hour (![][image3]).  
* ![][image4]: The Overall Coefficient of Heat Transmission (![][image5]). This value represents the thermal conductivity of a composite assembly (e.g., a wall with siding, sheathing, insulation, and drywall). It is mathematically the reciprocal of the total thermal resistance (![][image6]\-value): ![][image7].4  
* ![][image8]: The net surface area of the component in square feet (![][image9]).  
* ![][image10]: The temperature difference between the conditioned space and the ambient environment (![][image11]).

For software implementation, this equation is often abstracted into a **Heat Transfer Multiplier (HTM)**:

![][image12]  
![][image13]  
The complexity of Manual J lies in determining the correct ![][image14] and ![][image4] values for thousands of different construction permutations and environmental conditions.

### **2.3 Sensible and Latent Energy Components**

A robust calculator must distinguish between the two forms of energy load:

* **Sensible Load:** Energy required to change the dry-bulb temperature of the air. This includes heat transmission through the envelope, duct conduction losses, and the sensible portion of infiltration.  
* **Latent Load:** Energy required to change the state of moisture (humidity) in the air without changing its temperature. This includes moisture from occupants, cooking, showering, and the humidity contained in infiltrating outdoor air.

![][image15]  
Failure to calculate the latent load accurately results in equipment that may cool the air effectively but fail to dehumidify it, a common issue in high-performance homes with low sensible loads but standard occupant densities.3

## ---

**3\. Algorithmic Logic: Determining Environmental Boundary Conditions**

The first step in any load calculation algorithm is establishing the boundary conditions. These are not arbitrary variables but statistically derived parameters that define the "design day."

### **3.1 Outdoor Design Conditions**

MJ8 explicitly prohibits the use of historical extreme temperatures (e.g., the coldest day ever recorded) for sizing, as this leads to gross oversizing. Instead, it relies on percentile values derived from 30-year climate data (typically ASHRAE data).7

**Data Structure for Calculator Implementation:**

An online tool must query a weather database (referenced in MJ8 Table 1A) using the project's location (Zip Code or City). The required data fields are:

* **99% Heating Dry Bulb (![][image16]):** The temperature at which the outdoor air stays above for 99% of the hours in a year.  
* **1% Cooling Dry Bulb (![][image17]):** The temperature exceeded by only 1% of the hours in a year.  
* **Coincident Wet Bulb (![][image18]):** The wet-bulb temperature occurring simultaneously with the 1% Dry Bulb. This is critical for calculating the enthalpy of the outdoor air for latent load calculations.  
* **Daily Range (DR):** The average difference between the daily high and daily low temperatures during the warmest month. This categorizes the climate into Low (![][image19]), Medium (![][image20]), or High (![][image21]) ranges, which affects the thermal storage (flywheel) calculations for walls and roofs.8  
* **Latitude:** Required for calculating solar angles and solar heat gain factors.  
* **Elevation:** Used to calculate the Altitude Correction Factor (ACF) for air density.

**Logic Check:** If a user attempts to manually override these values with a safety factor (e.g., lowering the winter design temp by 10 degrees), the software should flag this as a violation of MJ8 protocols, as safety factors are inherent in the material properties and load assumptions.2

### **3.2 Indoor Design Conditions**

While codes vary, MJ8 establishes standard indoor setpoints to ensure consistency. These should be the default values in any calculator tool, editable only with a warning.

* **Heating Setpoint:** ![][image22] at ![][image23] Relative Humidity (RH).  
* **Cooling Setpoint:** ![][image24] at ![][image25] Relative Humidity (RH).3

**Algorithm for Temperature Difference (![][image10]):**

**![][image26]**  
**![][image27]**  
These fundamental deltas are used directly for heating transmission loads but are modified by CLTD factors for cooling.

## ---

**4\. Opaque Envelope Analysis: Walls, Roofs, and Floors**

The "opaque" envelope refers to the solid components of the building shell. The calculation engine must select the appropriate U-factor and apply the correct temperature differential.

### **4.1 Construction Assembly Database (U-Factors)**

Manual J utilizes a lookup system based on "Construction Numbers" (Table 4A). A calculator must house a relational database linking user-friendly descriptions to these engineering values.

**Table 1: Representative Wall Assemblies and U-Factors (MJ8 Table 4A Extracts)**

*This table represents the data structure required for the software backend.*

| Construction No. | Description | Cavity Insulation | Continuous Insulation (Sheathing) | Exterior Finish | U-Value (Winter) | U-Value (Summer) | Wall Group (CLTD) |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **12A-0** | Wood Frame 2x4 | None | None | Vinyl/Wood Siding | 0.230 | 0.230 | G |
| **12C-13** | Wood Frame 2x4 | R-13 | R-0 (Plywood/OSB) | Vinyl/Wood Siding | 0.089 | 0.089 | F |
| **12C-13+5** | Wood Frame 2x4 | R-13 | R-5 (Foam Board) | Vinyl/Wood Siding | 0.064 | 0.064 | E |
| **12E-19** | Wood Frame 2x6 | R-19 | R-0 (Plywood/OSB) | Brick Veneer | 0.068 | 0.068 | D |
| **12E-21** | Wood Frame 2x6 | R-21 | R-0 (Plywood/OSB) | Brick Veneer | 0.057 | 0.057 | D |
| **15B-0** | Concrete Block (8") | None | None | Stucco | 0.510 | 0.510 | K |
| **15B-5** | Concrete Block (8") | None | R-5 (Interior Board) | Stucco | 0.120 | 0.120 | C |

**Insight for Tool Builders:** The U-values listed in Manual J are "effective U-values." They already account for the "framing factor"—the fact that wood studs (R-4.38 for a 2x4) bridge the insulation cavity (R-13). A naive calculation of ![][image28] without accounting for the 15-25% framing fraction will yield an incorrect, optimistic U-value. The software must use these weighted average U-values.9

### **4.2 The CLTD Method for Cooling Loads**

For cooling, the ![][image10] is replaced by the **Cooling Load Temperature Difference (CLTD)**. The CLTD accounts for the Sol-Air temperature—the elevation in surface temperature caused by solar absorption. This varies by orientation (North walls are cooler than West walls) and wall mass (heavy walls delay the heat pulse).

**Algorithm for Corrected CLTD (![][image29]):** The base CLTD tables in Manual J are normalized for specific conditions (![][image30] outdoor, ![][image31] indoor, ![][image32] daily range). The software must apply a correction formula for every wall segment based on the specific project conditions 10:

![][image33]  
Where:

* ![][image34] (Mean Outdoor Temp) \= ![][image35]  
* ![][image36] is retrieved from a data table based on the **Wall Group** (from Table 1 above) and **Orientation**.

**Table 2: Base CLTD Values for Sunlit Walls (Hour 17 / 5:00 PM Peak)**

*Data Source: MJ8 / ASHRAE Fundamentals (simplified for illustration of data structure)*

| Wall Group | N | NE | E | SE | S | SW | W | NW |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **A (Light)** | 12 | 19 | 26 | 28 | 26 | 36 | 38 | 30 |
| **C (Medium)** | 10 | 17 | 24 | 26 | 24 | 33 | 35 | 27 |
| **E (Heavy)** | 8 | 14 | 20 | 22 | 20 | 28 | 30 | 24 |
| **K (Mass)** | 6 | 10 | 14 | 16 | 14 | 20 | 22 | 18 |

*Implication:* A west-facing wall (Group A) has a CLTD of 38°F, significantly higher than a north-facing wall (12°F). The calculator must iterate through each wall segment, applying the correct orientation-specific CLTD. This captures the peak load movement around the house throughout the day.10

### **4.3 Roof and Ceiling Complexities**

Roof loads are often the highest cooling component due to intense solar irradiance. MJ8 distinguishes between:

* **Vented Attics:** The insulation is on the ceiling floor. The load is calculated across the ceiling using a high CLTD to represent the superheated attic air (often 130°F+).  
* **Cathedral Ceilings (Sealed/Compact):** The insulation is between rafters. The entire assembly heats up, requiring different CLTD values.  
* **Roof Color:** Dark shingles absorb \~90% of solar heat; light/reflective roofs absorb significantly less. The calculator must include a "Roof Color" input that modifies the CLTD or selects from a different table column.13

**Table 3: Ceiling U-Values and Construction Codes (MJ8 Table 4B)**

| Construction No. | Description | Insulation | U-Value |
| :---- | :---- | :---- | :---- |
| **16A-19** | Vented Attic, Ceiling Joists | R-19 | 0.053 |
| **16A-30** | Vented Attic, Ceiling Joists | R-30 | 0.035 |
| **16A-38** | Vented Attic, Ceiling Joists | R-38 | 0.027 |
| **16A-49** | Vented Attic, Ceiling Joists | R-49 | 0.021 |
| **19A-19** | Radiant Barrier, Vented Attic | R-19 | 0.045 |

## ---

**5\. Fenestration Physics: Windows, Skylights, and Glazed Doors**

Fenestration (glazing) introduces the most volatility into the load calculation. Unlike opaque walls, windows admit solar radiation directly into the space (solar gain) in addition to conductive heat transfer.

### **5.1 The Fenestration Load Equation**

MJ8 employs a sophisticated equation for cooling loads through glass, combining conduction and radiation into a single Heat Transfer Multiplier (HTM).

![][image37]  
Where:

* ![][image4]: The NFRC-rated U-factor of the window assembly.  
* ![][image38]: The NFRC-rated Solar Heat Gain Coefficient (0.0 to 1.0).  
* ![][image39]: **Peak Solar Factor**. This is the maximum solar heat gain (in ![][image40]) for a specific latitude and orientation. It replaces the older "Solar Heat Gain Factor" (SHGF) by focusing on the peak load contribution.9  
* ![][image41]: **Interior Attenuation Coefficient**. A factor representing internal shading (blinds, drapes). Standard MJ8 default is usually 1.0 (no blinds) or specific values for blinds at 45 degrees.

### **5.2 Solar Data Tables (PSF)**

To build the calculator, one must compile tables of Peak Solar Factors for various latitudes (e.g., 30°N, 40°N, 50°N) and orientations.

**Table 4: Peak Solar Factors (PSF) Example (![][image40] at 40°N Latitude)**

*Derived from MJ8 / ASHRAE Solar Flux Data*

| Orientation | Peak Solar Factor (Summer) |
| :---- | :---- |
| North | 35 |
| Northeast | 140 |
| East | 210 |
| Southeast | 170 |
| South | 110 |
| Southwest | 170 |
| West | 210 |
| Northwest | 140 |
| Horizontal (Skylight) | 270 |

*Analysis:* Note that for summer cooling at 40°N latitude, South-facing windows actually have a *lower* peak solar gain (110) than East or West windows (210) because the sun is high overhead and strikes the vertical South glass at a steep, glancing angle. East and West glass receive direct, low-angle sunshine. The calculator logic must reflect this counter-intuitive physics: West glass is the primary driver of peak cooling load.9

### **5.3 Default Fenestration Properties**

In renovation scenarios, NFRC labels are often missing. The calculator must provide "Default" tables based on frame type and glazing count.13

**Table 5: Default Window Properties (MJ8 Table 2A/3A Extracts)**

| Frame Type | Glazing Configuration | Default U-Factor | Default SHGC |
| :---- | :---- | :---- | :---- |
| **Metal (Standard)** | Single Pane | 1.27 | 0.80 |
| **Metal (Standard)** | Double Pane, Clear | 0.87 | 0.70 |
| **Metal (Thermal Break)** | Double Pane, Clear | 0.65 | 0.63 |
| **Vinyl / Wood** | Double Pane, Clear | 0.49 | 0.58 |
| **Vinyl / Wood** | Double Pane, Low-E (Hard Coat) | 0.35 | 0.45 |
| **Vinyl / Wood** | Double Pane, Low-E (Soft Coat/Argon) | 0.30 | 0.30 |

### **5.4 External Shading and Overhangs**

Software must calculate the percentage of the window that is shaded by roof overhangs. This requires trigonometry involving the **Solar Altitude Angle** (![][image42]) and the **Wall Solar Azimuth** (![][image43]).

![][image44]  
If a window is fully shaded, the calculator should switch its PSF from the direct exposure value to the "North/Shaded" value (diffuse radiation only), drastically reducing the load.14

## ---

**6\. Internal Load Dynamics**

Internal loads act as a "credit" for heating (reducing the required furnace size) but a "penalty" for cooling (increasing air conditioner size). MJ8 provides strict guidelines to prevent "padding" these numbers, which would lead to oversized cooling equipment.

### **6.1 Occupant Loads**

Human metabolism generates both sensible heat (body temp) and latent heat (respiration/perspiration).

* **Formula:** Number of Occupants \= Number of Bedrooms \+ 1\.15  
* **Load Per Person:**  
  * Sensible: 230 Btu/h  
  * Latent: 200 Btu/h  
  * **Total:** 430 Btu/h per person.16

### **6.2 Appliance and Lighting Loads**

MJ8 recommends a standard block load for typical appliances rather than an itemized list, to avoid over-complication and transient spikes.

* **Standard Kitchen/Living:** 1,200 Btu/h sensible load.15  
* **Additional Equipment:** Large electronics (plasma TVs, gaming PCs) can be added as custom loads (\~300-500 Btu/h each).  
* **Lighting:** In modern energy-efficient homes with LED lighting, the lighting load is minimal. Older incandescent assumptions (3.41 Btu/h per Watt) should be used with caution.

## ---

**7\. Infiltration and Ventilation: The Air Barrier Analysis**

Air leakage is often the most difficult variable to quantify but can account for 30-40% of the heating load.

### **7.1 Infiltration: From Blower Door to Natural Infiltration**

Professional energy auditors use a **Blower Door Test** to measure envelope tightness (![][image45] at 50 Pascals). The calculator must convert this test pressure to "natural" pressure conditions (![][image46]) using **LBL N-Factors**.

![][image47]  
**Table 6: LBL N-Factors (Simplified for Calculator Logic)** *Depends on Climate Zone, Shielding, and Building Height* 18

| Shielding Class | 1 Story | 1.5 Stories | 2 Stories | 3 Stories |
| :---- | :---- | :---- | :---- | :---- |
| **Well Shielded** (Urban) | 18.0 | 16.7 | 15.4 | 13.0 |
| **Normal** (Suburban) | 22.0 | 20.2 | 18.5 | 16.1 |
| **Exposed** (Rural/Open) | 26.0 | 23.9 | 21.8 | 19.5 |

*Insight:* A 2-story home in a normal suburban neighborhood with a blower door reading of 3000 CFM50 would have a natural infiltration of ![][image48].

### **7.2 The Qualitative Alternative (Table 5A)**

If no test data exists, the user must select a qualitative tightness level.

* **Tight:** Vapor barrier, sealed penetrations, gasketed outlets (0.1 \- 0.2 ACH).  
* **Average:** Standard construction, some sealing (0.3 \- 0.5 ACH).  
* **Loose:** Old construction, unsealed (0.6 \- 0.9 ACH).18

### **7.3 Infiltration Load Formulas**

Once ![][image46] is determined, the loads are calculated using standard air properties:

![][image49]  
![][image50]

* **1.1 Constant:** Derived from ![][image51].  
* **0.68 Constant:** Derived from ![][image52].  
* **ACF (Altitude Correction Factor):** Air density drops with altitude. At 5,000 ft (e.g., Denver), the ACF is \~0.82, reducing the load significantly.20

## ---

**8\. Distribution System Efficiency: Duct Loads**

Perhaps the most critical "hidden" load in Manual J is the duct system. Ducts located in unconditioned spaces (attics, crawlspaces) suffer from both conduction losses and leakage.

### **8.1 Duct Load Factors and Multipliers**

MJ8 handles duct loads by applying a multiplier to the envelope load, or by adding a specific sensible/latent load based on duct surface area. The multiplier method is common in simplified tools (MJ8AE).

**Table 7: Duct Loss Multipliers (Typical MJ8 Default Values)** *Based on Supply & Return in Vented Attic* 21

| Insulation R-Value | Duct Leakage Level | Supply Load Multiplier | Return Load Multiplier | Total Impact |
| :---- | :---- | :---- | :---- | :---- |
| **R-4** | Unsealed (30%) | 0.25 | 0.15 | \+40% Load |
| **R-6** | Average (15%) | 0.15 | 0.08 | \+23% Load |
| **R-8** | Tight (5%) | 0.08 | 0.03 | \+11% Load |
| **Buried/Conditioned** | None (0%) | 0.00 | 0.00 | 0% Load |

*Analysis:* An unsealed R-4 duct system in an attic effectively forces the equipment to be 40% larger than the house itself requires. A calculator must emphasize this input. The formula logic is:

![][image53]

### **8.2 Regain and Location**

If ducts are inside the conditioned envelope (e.g., between floors, or in a spray-foamed attic), the losses are "regained" by the living space. In this case, the duct load is effectively zero. The calculator must ask "Duct Location" as a primary branching logic question.3

## ---

**9\. Computational Architecture: Building the Tool**

To synthesize the above physics into a functional online tool, the software architecture should follow this logical sequence:

### **9.1 Step 1: Project Initialization**

* **Input:** Zip Code.  
* **Backend Action:** Lookup Latitude, Elevation, and MJ8 Design Conditions (![][image54]).  
* **Input:** House Orientation (Front Door Direction).

### **9.2 Step 2: Envelope Definition (The "Construction Library")**

* **User Interface:** Allow users to build "surfaces."  
  * *Walls:* Select type (Frame/Block), Insulation (R-value), Area (![][image9]), Orientation.  
  * *Windows:* Select type (Glass/Frame), Area (![][image9]), Orientation, Overhang geometry.  
  * *Roof/Ceiling:* Select type (Attic/Cathedral), Color, Insulation.  
* **Logic:**  
  * Sum ![][image55] for heating.  
  * Look up specific CLTD and PSF for each orientation for cooling.  
  * Apply area-weighted averages for U-values if multiple wall types exist.

### **9.3 Step 3: Systems & Infiltration**

* **Input:** Tightness level (Qualitative drop-down) OR Blower Door Number (![][image45]).  
* **Input:** Duct location (Attic/Crawl/Conditioned) and Insulation (R-Value).  
* **Logic:**  
  * Calculate ![][image46] using N-factor table.  
  * Calculate Infiltration Sensible/Latent loads.  
  * Calculate Duct Load Multiplier based on location inputs.

### **9.4 Step 4: Loads Summation**

* **Sensible Heating Load:** ![][image56].  
* **Sensible Cooling Load:** ![][image57].  
* **Latent Cooling Load:** ![][image58].

### **9.5 Step 5: Sizing & Reporting (Manual S Integration)**

While Manual J calculates the load, the tool should output data ready for **Manual S (Equipment Selection)**.

* **Total Cooling Capacity Required:** Sensible \+ Latent.  
* **Sensible Heat Ratio (SHR):** ![][image59]. This is crucial for selecting equipment that can handle the humidity load. A low SHR (e.g., 0.65) indicates a high humidity problem requiring specific equipment.23

## **10\. Conclusion**

The transition from "rule of thumb" to ACCA Manual J is a transition from estimation to engineering. By rigorously accounting for the physics of heat transfer—through the precise application of U-factors, CLTDs, Solar Heat Gain Factors, and Infiltration dynamics—MJ8 ensures that HVAC systems are matched to the actual needs of the building.

For the developer of an online calculator, the challenge lies not in the math, which is linear algebra, but in the **data structure**. The fidelity of the tool depends on the granularity of the lookup tables (Construction Codes, Solar Factors, N-Factors) and the logic of the "correction" algorithms (CLTD corrections, Altitude corrections). When executed correctly, such a tool does not merely output a "tonnage"; it provides a diagnostic map of the building's thermal performance, highlighting areas where insulation, air sealing, or shading can reduce the load and capital cost of the mechanical system.

### ---

**Appendix A: List of Essential Formulas for Calculator Logic**

1. **Transmission Heating:** ![][image60]  
2. **Transmission Cooling (Opaque):** ![][image61]  
3. **CLTD Correction:** ![][image62]  
4. **Glass Cooling:** ![][image63]  
5. **Infiltration (Sensible):** ![][image64]  
6. **Infiltration (Latent):** ![][image65]  
7. **Natural Airflow:** ![][image66] (where N is from shielding table)  
8. **Duct Load:** ![][image67]

### **Appendix B: List of Required Assumptions**

1. **Air Density:** Standard air density is ![][image68] at sea level.  
2. **Specific Heat of Air:** ![][image69].  
3. **Latent Heat of Vaporization:** ![][image70].  
4. **Occupant Density:** 1 person per bedroom \+ 1 (unless specified).  
5. **Internal Load:** 1200 Btu/h sensible for appliances; 230 sensible/200 latent per person.  
6. **Window Shading:** Interior blinds are assumed at ![][image71] (IAC \~0.80) unless specified otherwise.  
7. **Thermal Mass:** Wood frame walls are considered "Low" thermal mass; Brick/Block are "Medium" or "High."

#### **Works cited**

1. Manual J® Residential Load Calculation \- Air Conditioning Contractors of America \- ACCA, accessed January 31, 2026, [https://www.acca.org/standards/technical-manuals/manual-j](https://www.acca.org/standards/technical-manuals/manual-j)  
2. ACCA Manual J, accessed January 31, 2026, [https://deq.mt.gov/files/Energy/EnergizeMT/Conservation/Energy%20Code/ACCAManual-J-Brochure.pdf](https://deq.mt.gov/files/Energy/EnergizeMT/Conservation/Energy%20Code/ACCAManual-J-Brochure.pdf)  
3. Residential Load Calculations: Manual J and more \- University of Illinois, accessed January 31, 2026, [https://smartenergy.illinois.edu/wp-content/uploads/2021/10/Manual-J-Load-Calculations-and-more.pdf](https://smartenergy.illinois.edu/wp-content/uploads/2021/10/Manual-J-Load-Calculations-and-more.pdf)  
4. Understanding Manual J8, accessed January 31, 2026, [https://scheatingandair.org/wp-content/uploads/2015/04/SCAHACC-Understanding-MJ8-Luis-Escobar.pdf](https://scheatingandair.org/wp-content/uploads/2015/04/SCAHACC-Understanding-MJ8-Luis-Escobar.pdf)  
5. HVAC – Practical Basic Calculations \- PDH Online, accessed January 31, 2026, [https://www.pdhonline.com/courses/m378/m378content.pdf](https://www.pdhonline.com/courses/m378/m378content.pdf)  
6. Cooling load temperature difference calculation method \- Wikipedia, accessed January 31, 2026, [https://en.wikipedia.org/wiki/Cooling\_load\_temperature\_difference\_calculation\_method](https://en.wikipedia.org/wiki/Cooling_load_temperature_difference_calculation_method)  
7. Outdoor Design Conditions \- Farm Energy, accessed January 31, 2026, [https://farm-energy.extension.org/wp-content/uploads/2019/04/7.-Outdoor\_Design\_Conditions\_508.pdf](https://farm-energy.extension.org/wp-content/uploads/2019/04/7.-Outdoor_Design_Conditions_508.pdf)  
8. Outdoor Design Conditions \- Manual J \- CoolCalc Documentation, accessed January 31, 2026, [https://docs.coolcalc.com/user-guide/MJ8/projects/outdoor-design-conditions.html](https://docs.coolcalc.com/user-guide/MJ8/projects/outdoor-design-conditions.html)  
9. 9.3 Using Manual J \- University of Illinois, accessed January 31, 2026, [https://smartenergy.illinois.edu/wp-content/uploads/2021/11/9.3-Using-Manual-J\_10.21.2021.pdf](https://smartenergy.illinois.edu/wp-content/uploads/2021/11/9.3-Using-Manual-J_10.21.2021.pdf)  
10. HEAT GAINS and LOSSES : ROOFS and WALLS | Energy-Models.com, accessed January 31, 2026, [https://energy-models.com/heat-gains-and-losses-roofs-and-walls](https://energy-models.com/heat-gains-and-losses-roofs-and-walls)  
11. HVAC Made Easy: A Guide to Heating & Cooling Load Estimation \- PDH Online, accessed January 31, 2026, [https://pdhonline.com/courses/m196/m196content.pdf](https://pdhonline.com/courses/m196/m196content.pdf)  
12. the cltd/scl/clf cooling load calculation method \- Building and Environmental Thermal Systems, accessed January 31, 2026, [https://parrotfish-blenny-bzeg.squarespace.com/s/Spitler-McQuiston-and-Lindsey-1993-CLTDr.pdf](https://parrotfish-blenny-bzeg.squarespace.com/s/Spitler-McQuiston-and-Lindsey-1993-CLTDr.pdf)  
13. Manual J Residential Load Calculation PDF \- Scribd, accessed January 31, 2026, [https://www.scribd.com/doc/287475456/212762908-Manual-J-Residential-Load-Calculation-pdf](https://www.scribd.com/doc/287475456/212762908-Manual-J-Residential-Load-Calculation-pdf)  
14. Manual J Field Data: Windows \- HVAC School, accessed January 31, 2026, [http://www.hvacrschool.com/manual-j-field-data-windows/](http://www.hvacrschool.com/manual-j-field-data-windows/)  
15. ACCA Manual J Speed Sheet Example \- YouTube, accessed January 31, 2026, [https://www.youtube.com/watch?v=TjkSJfm1DSs](https://www.youtube.com/watch?v=TjkSJfm1DSs)  
16. Complete Guide To HVAC Heat Load Calculation: Manual J & Professional Methods (2025), accessed January 31, 2026, [https://solartechonline.com/blog/hvac-heat-load-calculation-guide/](https://solartechonline.com/blog/hvac-heat-load-calculation-guide/)  
17. Understanding Manual J Occupant Loads \- Energy Vanguard, accessed January 31, 2026, [https://www.energyvanguard.com/blog/understanding-manual-j-occupant-loads/](https://www.energyvanguard.com/blog/understanding-manual-j-occupant-loads/)  
18. Infiltration Guidance for Buildings at Design Conditions | NY.Gov, accessed January 31, 2026, [https://cleanheat.ny.gov/assets/pdf/infiltration-guidance-for-buildings-at-design-conditions.pdf](https://cleanheat.ny.gov/assets/pdf/infiltration-guidance-for-buildings-at-design-conditions.pdf)  
19. Estimation of Infiltration from leakage and Climate Indicators, accessed January 31, 2026, [https://eta-publications.lbl.gov/sites/default/files/estimation\_of\_inflitration\_from\_leakage\_and\_climate\_indicators.pdf](https://eta-publications.lbl.gov/sites/default/files/estimation_of_inflitration_from_leakage_and_climate_indicators.pdf)  
20. Rev 1 2016-1 Infiltration per, accessed January 31, 2026, [https://higherlogicdownload.s3.amazonaws.com/ACCA/c6b38bda-2e04-4f93-bd51-7a80525ad936/UploadedImages/Infiltration%20per%20Blower%20Door%20Test%20Oct2016.pdf](https://higherlogicdownload.s3.amazonaws.com/ACCA/c6b38bda-2e04-4f93-bd51-7a80525ad936/UploadedImages/Infiltration%20per%20Blower%20Door%20Test%20Oct2016.pdf)  
21. Strategy Guideline: Accurate Heating and Cooling Load Calculations \- Publications, accessed January 31, 2026, [https://docs.nrel.gov/docs/fy11osti/51603.pdf](https://docs.nrel.gov/docs/fy11osti/51603.pdf)  
22. Manual J Field Data: Ducts \- HVAC School, accessed January 31, 2026, [http://www.hvacrschool.com/manual-j-field-data-ducts/](http://www.hvacrschool.com/manual-j-field-data-ducts/)  
23. Understanding Calculations for Manual J, S, T and D \- MRCOOL, accessed January 31, 2026, [https://www.mrcool.com/blog/understanding-calculations-for-manual-j-s-t-and-d](https://www.mrcool.com/blog/understanding-calculations-for-manual-j-s-t-and-d)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAZCAYAAADuWXTMAAAA8klEQVR4Xu2TvQ5BQRCFjyjpSBQKDYVOohAiColK4knUvIdSqdFpPIxGrdEJpZ89mdnYu3fvXkqJL5nk7jkz+zO7F/jjUjCxMHE38TRxNVFMZAQoQZJ3vgHRGZnQPPuiMoH4Td8gLOI2Y7D44Iv2bHncEMjLPY9ii8tW2Kows0KE1CIPFdjpGHVI3sUVU7NlsILkLV2RAs+SR3ARCtx6jAokb+8bczVqkGfJ7zVkQo47qk1tgQ/NE6TzLdWGkAJ6R9WC8Jrs9nuQn2Cj2tjJ+5gukr3gAm1nHKUPWblhYoD8piao4n09DDbvK+zDGPnGj/ICSF5CB77eYH0AAAAASUVORK5CYII=>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAtCAYAAAATDjfFAAADXklEQVR4Xu3dz+s1UxwH8CMUIflRD2XBRpGShYWypB7ExoKFPcXGSrF5/gJZWNlYSApb+6eUxFbZsCApLGRhQ37Mp5mTcz/PzJl7ud/b03i96nRnPme+95x7v4t5d+beuaUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwRfcO7a+h/Ti036bta3eOOBsxTtven+ofpfq5qX4KN5ZxzFN6r6yP+e1K+/SfQwGArYmg8HqqXTHVr071sxDj/JmLgxuG9mEunkANiadUx3w0d0weKWMoq24t4/HXNLVTzxkAOJE4yb+Vi5Nfy3yQOraYwyu5OHi17AaSU3huaC+W04afN8u4mtkLivn/8Ha59Ni8DwBswB2lf5K/WPr9x1BXiq7KHYPfc2HGC7nQiFBzqJ+HdnvZ73X/kAuNp3Kho4axWF2LcR9q+qq4ZNqK4/L7813aBwA2IE76z+Zi4+OyX3D5L+ZWiqocSJb8kQuDD8r4WbRDfDY9Xl/GOcXjmrm5z81nyYWyO894vrnnzOKYuVVJAGBD6mfUetbCQ+1faz3RPxfMYsXtkEDShqR/E9bCG812zOv+Zr+nfY2HhLWQ35/zU+2+VG/1ViUBgA15rFwaFrLov5iLRxZjPJ+LZQxrhwaSCEsR1m7OHXvIl1ZjXk+mWk8cf2hYe2lot+RiWQ+68UWMXj8AsBEPlv5J/8vS7z+GWMFaGmOp3hN/88TQnskdK+ID/3k1L57r3VRbcmUZP/v2eTnsVijxHs+JEBfjX0j1Kvq+zkUAYJvaUBTbn0zbNTDEZdOefB+wpbbknrIczJZub7GkfZ4IbU83+2vm5hC1b3JxRg1rVYS2fW6FsnbJNsafm1eI+sO5CABs0xdlvI1FDQY3De3OaX8trB1LjJUvCy4FlSVzx+8b2t4p85c+e4Gpivfop1wsY2hbE98MrWP0Wr5UG0FtbV4AwMbUXzWIW0LE42tN3+PN9lmpX36o7avd7lV350LjgVxoXFd2x71rqscvKuTQtOTlXGjclguNuLdcHqPXQq61fQDA/0jcxuL7aTsCRw0xAABcJvKqEwAAl6FfyvgD8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABs098dWdw9qk2mjQAAAABJRU5ErkJggg==>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAYCAYAAACx4w6bAAACSklEQVR4Xu2WsUsdQRDGJ2ggEo0RAhKNhEQsAgERQRvtLBRELNLZ2NkkbQJWWtgJAUsbK5uQVrCwEP8GISm0EEQLEUFQ0EB0PndG583N3TM+BXl5P/i422/u9nb3ZueOqEaNGreglfXcm3fhCeuijDqur354jrxBN+M49YFyPGV9p3Rzn/FfsxbF3zC+Mu6NCmlmnXmTeUlpDD994DYcsv56U9AVs7wX717SRvjF+uhN5hWlZ+H4z+DGFW8K0cTmAq9S8vqbovxYIWOUbnzjA5TSA7ED5+PtYnL3RQNr2JsC9tadJrZG8Y0vKPlIEaDp5zUicaSlej/EUzZZPc6zfPOGAf1hcltyDp2XXJGDH6jqN8UVMS8N9+SI/WrjuiD1xvNE/Sk6HqVR2mX3HC6KCsckpdiQ8/fFtzxj9co5Yra65S2Egq2Qt7+1cAwGXovxMujsp31A0EnYTtCGH4G9gritbn7FPYjhexqxxPoTeEX9XaGFA+kScUwpjj8CBe28whFVsKKFALqHI04o+/1CdvlnZPD7wdJPKYaNr+h+wZsGmLDNdSzEsmkDXI8FbGetl4ZogFLljUCW+EUF8GbMeQgCqIoRiEE2TVC9bGfb5hxghW2F66J0fRNrgbIlvehtTVB24HZhke6rNghDB12kL3qDQb9rnXLE75jlrfiYwA5rXtqjVPrmwTvWrvMsUTbhefp831/FoPp99aahjTXLqpM2FuPTTfgaVEL/Bi14Trc3mQ8U9/doiH54q4LP3qgGUEiqkuhPp8Z/xSXfTaoRseKB0gAAAABJRU5ErkJggg==>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAZCAYAAADuWXTMAAAAtUlEQVR4Xu2SMQrCQBBFv6AgaBULsZAcQuwsLXITj+BRvJJgbaewnSfQTnSG2cHl4yRgJ+TBL/J+ZjMJAXp+Zi555dTUKVN8+gV1GOYikS+5SbYslTVseM9FgfZjlsoZVuoGEYmF4+8ToYeGW3UN6+DXrQawQV09IrFwVrDhHRcF4VYntHxJYSO5snTuaDlZOEoalo6WD5aZkeTAsmQJe/KM/CT7Tp6wG2vYv3vJ11V5U89f8gZX7iWyORAbIgAAAABJRU5ErkJggg==>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJsAAAAYCAYAAADtRY/6AAAFCElEQVR4Xu2aTchuUxTHl1xF9/oquW7ozddAKUkRbt3cDMhH8lHK5BZlwsTgKlFKBkYkUSY3AyNmNzGQTkzESBED8pEykEQRycf+2Xu9d73rWXs/5zzP877Pue751ep9zn+fs88+e6+z9tr7vCITExMThgPJ9nhxYmKVPJ/ssvL7hmR/mbKJFXOFFwwHk33mxf8Z/8hWB+P4anM8Rh5MdqYXI06S/EAtu3Dz7O3nby8UNpId9qLkgdF2jpFbJbfti2Q/uLKIU4spXLvfHPfljGS/Sb6eNgzhY5n1gci+1AsSnyR7xRxXOSXZc5IruMbo+yRXgP6e0ZU7vbAkFyX7zouFljP9Ku3ydUK7Hit/ozbSx5d6sXCuLD6Nvmt+32R+94H73iG5vfQtbVRjilef6Mr5sKtovfhR6lEl6qiLi7bb6cvwU7K9XpSsd1400I5a29fJ2ZLbdnqylyRHG4+PEMqGzPZ5X6KFBQ4/hIck378WVT+V2To596jTQqj4TS8WImd7JtCW5Q8vFLjP5V40tNq+Tu6S+X1EuR80IKIsClGG9MhCW4aAM9E26oroJHbEec+7GTIv8AWSEz/KfL5BJMHhVgURLVocnCPtByBq1Nq+bohYDFoNXiA/oDjJV+b4YcnT11DIoQ5JnvZ+31rUi1qAUb6ROIJyzeNetLwjsxUDYR9dV4A6dXq7pZSfZ7Rni6bgrC2HOOKFAm9ka8A0elC3bZNdHTGAupB4OdkT5ry7zXmrQnNIazZSfRSUY0DKEOmLcHKys7zYk+jetZnHwjVRWrCJfzi1zyVeidam0A/LX6KeLSfcRucrrL5qOVcn7TeFXJO6bZLNsa2PATwt2fulDEfUVfgy01ULzddaLxjlj3pxBOhs4u0Xe1IFIl5rrGcGRzkkucyvZr4vuoUGnl9+U2ZXlW8UrQY5ywteLND4+71ooN6nA+1Pc4yzgX0J1NnmRbYnvdAT+qz1zOqM0YJoKESwe7y4BLo4uFeOrUI5PmJPqtBJ47mZdymsRQ91LDpH4Rg9gs7znchxtQHSLsPZbvdiQXNND9pTXpSsM4X1pZN8DX+HUktNFF6uVvkQtH9r/TQU3Z+zMN7WB2p0MnvtJjpg5GMRhM7IeWqLAzrRR8l5g/y2FwwtZ+tk9sHU2aOOQW9FSQ/bOlyzyPZONGAWnf5XwQHJm8arQCP+106vzTyeThrP1XroayWXsbJRdJGgKxEGlylUocxGSW08n1ywV00ZMPi15TUQIWoPSr2+7UzfH5jf6ijz8sZVw73o2xp+QFvn7iTz9tfm0czZKGBAI3Qw7Z6N7oYrfuVBmY1ENxaNOtgL89sbmk/V4H6dFwu+7bqLrd8Sbd3kjTs5oLTjNS8aKNeXkgXLWL5/Mp60rRUAWnCtzdf/G3B1pJY9ohcYdN/tkvKXT10WPnehX5/sZ8n7RHrsd5evk2NRqIbmlB5WsOh++ke7Ktm3gU7KsBOo0/u2WSjnEyAr+Ldc2TrwY682dI9v5f3MWxh9FFdwRHI6jYhMtdFqif0zH+kieAA7VSu3eaHAvfxLEN1/u7hS4hfEQt88ID3/W+I4gudeNCpuK1vCbQM2lfueuy5wHhYFG5LThRe3Fp8QMIthowPvv9mLFXTqHjOay/JFg9X4KN/ubWa0YzT0wznTYm0hMwZon+Y597myEwE+B9p/TxsVi7wFr0s7V5xYD6QOQ/+rZGJiYuI45V/uxX+qwteZIAAAAABJRU5ErkJggg==>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAYCAYAAAAlBadpAAAAu0lEQVR4XmNgGAUsQPwfD24FYka4aiyAFYj7GSCKvaB8DiBWhYqBMDNcNRbwiQGiCBuAGYATgCRPowtCAV7N0QwQSU10CSCIYIDIrUKXgIHDDLhNxmsrCMAUYMOgwMMLsJn+C4sYBhBkgCiahC7BABFfiC6IDHAFljhUHK/mrwzYnbeVASJehC4BA6BkB1KALX5hicYXyvcD4kQQwxIqgY75oQpBIBwqNgXKB7mQJCALxH8ZsHtrFNAcAAD7Jj8NrDWBggAAAABJRU5ErkJggg==>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFkAAAAYCAYAAACRD1FmAAACjUlEQVR4Xu2YvWtUQRTFrxhBMRALUSTIBjshrYJiaaGF1v4HWohNirTbpLCxShFsrEQEW8HCQqwEBRtBkAhBAlY2giJKNHNy5/Jmz5uZnQebfavODy4k58zcNx/vzceKVCqVSoVYZ2HarLr4E4k57x+OeCe91xfHWMhwxMWv4H/uSy7mfZ2QV9IuZ/HTxemm6CgYNCs4IA8si3pvXZwib9psirallKEP44No/Y+BBjBx6Ntdacbi7EiJhvDFO+E11L3jNQx2i+Oi5lM2An6zMEXuufjkYkWazpUSK/tSVP/GRgD6i688BeqHX4ixJupdZ+OmNy6x4bGZmwW6DvIjFjyW5xAbHgzwQxY9R0XrPmFDtA681gR990YKVIgl7IMug3zbxQEWPXjTLNcCeQDr8WcWPfa2YgVgLGfrueMaviXpt3zajGtrSG45AM9Fc+2wMYZtibcBkwX9NRsARmx9MWIJU1yVZiBKowuldS67eMZiBMt3i40EsdOWRXJPs00vtxzwTtwnpYO8JenTQch50XytzzsBJg/lzwWardHvAm2EB6IFUmffRZmdpQJ0GeQSkCu2JuONfcOi6Dode/4Liet7fJWMKbrp2cVkFigZZFxArrAYAWvygEXPGdGBY1LPz47jF0lvEGhA100BdXCm7RJdSHUyJLrxEMiB00cKbG6tY5hovdj+lW3XUNIm9Nin1CfZzoiurTkfXHRxn8UAnJ2R4xrpONZBj+1f3K4fwd974G1FgYHo9bDr1XW/QWetExwMLh83WAywY1tJ2E8IyMce4qD3gWkAm+NSYzWEHcFM/62g/aUnhUmCZ26IPv8xef8cQxYqk+WC6Mmiso/0+UvhfwFuru9ZrFQqk2AX7L/oW/0CqsgAAAAASUVORK5CYII=>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAYCAYAAAAlBadpAAAAoUlEQVR4XmNgGAW4QDgQ/0cXJBaANJKl2RWI/zFANLOgyREEIE0LobQImhxe8BOIVYC4iAGi2RhVGjeIAeJTULYvA0QziCYKvEZiyzBANM9BEsMJgoBYGIkvyADRfABJDCvQZkBEDTp+gqQOK/gLxLLoggwQzd/QBZEBKGRt0QWh4DcDgYQCshUXeM6ARbMmVBAZcyPJu2CRf4YkPwoGPwAAegorUXmsh/8AAAAASUVORK5CYII=>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAYCAYAAADkgu3FAAABOUlEQVR4XmNgGMJAAIjN0AWpDV4jsf8D8S4kPtUADwPEcA4ofw2UTxR4BMRzGYjXIIzEXspApL4JDBCFV6A0yMXowBVdAAkQHXQghU+A2ASIW9HkQAAkhsvFZUCsgi6IC4AMWYguiASeM2C3yAWIV6ML4gLcDBBDNNElkABIHmQZMpAHYlYk/nUkNgqQZoAYgI59kdSgy4HwHiBmwSL+FaoHJwAlzW/ogkhAiQFiEMjnFIG3DBBX4gL4EgJJAGSIDbogEvjHgD0lkgRkGCAW8aJLQAEo54PkQcFHEZjEgD9Y0IMtB4jTkfhEg7sM+C16yIAqj08tXgDS+BtdEAkEM0DU6EBpsgFIMyh54wOgwjMCiBnRJQgBJwZEXQKyiBNJjqoAZDgIg4qcE2hyVAXFDBCL/qJLjIIBBwC+tk5qcUGYlQAAAABJRU5ErkJggg==>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAYCAYAAADtaU2/AAABHUlEQVR4Xu2UvQ4BQRDHR6IgqBQi8QZ0Kr3CAygkPIAnIFHdQyh5A4VEIkqlRC1a0SjVCh8ztzu5NfbWXqFyv+Sf3P5ndvZjNgeQ8s9kUU/URgYs1FBnT831nFhmoBYm5UVMsgCVt0R1tXguj0eou/acPFAtUIk3ETPJgb0YLyzZSsOkjuro77gCTB81FR636SB8YiINJgPvC630mK7ehm1TY1B+U/glUO/BSoDaGWPqL5+aNuXDCZLlh9hOQNdO/lUGLHDP9zLgooIaSFPzrddMG1Qe9d4bV2G6fooHwpdcwF3ngyHqKE2DMvid2ifnDZ9k2hzluTaYaOEiag3RX6aBqsbIVbgAKub9sOgvxQV91QtnRi8+TikpKb/lBanSYVG5dQQmAAAAAElFTkSuQmCC>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAYCAYAAAARfGZ1AAAA1klEQVR4XmNgGAUDCf5DsTK6BBJIZkCoI4Th4B0SuwGIDZH4yIAHiCUZEAbIQ/kwnIUkBwbGQKwP40DBIzQ+OsBwHRp4CGMoAbEHkgQIwCVxAJDBv9EFkcAaZE4QENsyQLz9BVkCCwD5FGR4EZIYyIGHkfi+SGww4GCAhBshMJ8BYrg4ktgqII5G4pMN0FMFofAnGogwQAzazYBIITlA/BVZEblgKQPEcGk0caoEyTcGzCBgAWJWNDGSASxI0A2nCgAlPULpm2RwnQEzZdDMB6NgFNAAAACi5TslwzIrrQAAAABJRU5ErkJggg==>

[image12]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAtCAYAAAATDjfFAAAErUlEQVR4Xu3dzcttUxwH8CWEKIlCyE0mXsrASyllghgwYKJMGMhEBgzE6E78AwoldUcSGZCUMLgxUf4AUuqSGEkGlOTlfDt7uev+nn32PU/Xcy/3+Xxqdfb6rbXP3vvcwfNrvezbGgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKfSpavyVynxxoZ4fHuc8s7U78d29Nyvp9ic8RoXlLZ/U32e8ZnG2MdDfC/lWjfW4OCstvO3reXNf3oDAKe1S9o6eTi3NrR1/Jqh/uKqvDvU72rHJj5nlvp1q/J5iY2+b+u2R2rDHnmtbb6XTfG9kMS0Jo3V+6vy8lBP3z+Hev8OAGAf2JTEPNh2xmv9yEzs1+H48Krc13b2iStX5Zw237ZXlpKkJKMnS0+8ci/Xjg2Dep+pP1ti35U6AHCaqiM3XZ/SHD1c6mnPCNro9eE47RdNn9Unq/JEm2/bK7nWCzU42WY6dtPU7mVtu/PjvLZOkmNTApnp0NuHeh8FTXz0fKkDAKepuZGbSDzTckvS5+YaHPTza1Ly1vT5S1snhidDn0Kcm/pdeoZRpnxvKbGMFL5aYkt+G46fbOt7ylrCJYfazt8QANhH+ijPXEkyskldv1Zl7Vtf/5Z+l0/HZ6zKDUP8gel4Sb2vTWVJpjw39amjhEueW5XbpuPdJmsZIcuGjtE2957232sQANg/5pKFufVr1Q9tuc84Opd+90/HfY1bErel8/9tudbc1G/s9j6StD3Ujk5tbuunGlg52NbXv7jER2l/ugaP4+5VuantTEbnYruVUcbHaxAA2BtJOI7UYFtObrr0WUpYxiQo3/XpqhwYYlnrtttE6UTkWklEqySOB2vwOL5q6w0TcwnYJhlVvLcGJ7m3pd9iqW2TuXOW/r2WJDkHAE6R/FHP1GaV+KbF+ZF1YOmTDQWbjOcnWUvS9uEQy/mJb6O+f2xTWZLr9WnZ0W6SrkiydvZ0nGRv2/PnEqguyVza5xK6vuFgk0NtZ3t+i8TG32QuFo9O8VuH2JdTLM9Xz3uq7Rwlze+R4y+meFw/tWWTBQBwAuof+ugJwvm1YZBkbO7cLuu6xuQomxpq/9TznraTJRsc+maHLi/JvbDEllzdjiZr3TZJ21Vt/bzblOrtNj8KGmP/cQdpEuq5ac/6/X+09f1H3wzRnyU7Yvv6wnFjSK7Tv+eztu7T+/V4ftcD03FdswcAbKkmCQc3xN+b4l1t76VLkjfGP5jiV7R1shP13CRSJ8vPbf6+t/VYDUyS9PTEZ0595qXSNzTUeMr43rU7plhGvu4Z4pH1gnn/XZX+XU+8cv4zU2xuXWFGYOtU8jhFOvY/NMTyvS8NbQAA+06Ssr6Ro8roWn1nW6avM1rX5TUnh4d6ZFS0vsqlJ4l9NDQjZnkNyUdTvSdsuV5PWmvSBwCwb/Xpy1eOic4nTNllmh2io94vI2g9Ieuxb6bPTJUmEcuu2MiIaF4UXJOz8f9g7fd1oO2cQgYAoM0nbHZ6AgD8BxxelTvbsS88ztRn1pONOzgBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4H/kb42mUxNIMvamAAAAAElFTkSuQmCC>

[image13]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAtCAYAAAATDjfFAAAEO0lEQVR4Xu3cz6t1UxgH8KUo8isSiXrfZKLMiIiJEAMTmfkDTIwIMZCJf0AGBkpGSoxkIgMxNJYihfwYSKIo5Mf+dvbqrve5+9xz31v7vm4+n1qdtZ+1zll33z3YT2uvtVsDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgv+jTqfxTypoeb8czTlzT9p/bA1N5YyHefb2jfDGVi6dyU9v7bmLb/NT2+l1S2taWMW+pQQDgZLqqbW7uF9WGlTzcjidh6zLWuzXYNvEbhuML51j3WDmOevz9Qqy7cSqft+3ta8u4j9YgAHAyvdqON6n4cSrv1+CKcm7XldhS0liTul/b/j5fDfXMmN3b9vfp3mybtpdqwzH4rm3Gfr02AAAnU27sf9bgiurM1poyw7SUUCVprPHfy3Ha31qIdS8uxLoP58+0XTo2LDivbR6xLjlKYptE8sm2GfuT0gYAnFC5sT9Tg8VlbdOvl1Eepfb4PW3/mq6xfWlma01LiVkkVmfUqvSpM3Ojv+fP+vsXTOX6tlk/Vtu2eXYqt5bYx23zW2erj5nPzBKOsg4v8VNT+WGuj2OM16r+7buuMwCwkiva5gZ8fm0YvDCVv4bjJDEvz/Xc+Mcbe9/E0NX2b8pxNSYLB5Ur+xd2qN8bS5Kqg6TPQbJ+LdLv2iGeRCgyu7XrN0ZJ2rqjJmtJiK+e67+1M8dPwnXzVJ4b4vnsyfrTQzxyTg/N9VOlrV5nAGBFWV910I23z6qM8shtvOFnHVeXJGZ8jLfU/sFwvLaMn92io8PM8t3VDu6TDQoPzvX064lNHkV2iZ/t+rV8J8naUTeAjDNqWW83nkPWKkYSuf6o95H5M9I3Cfx4PNbrdTzK41oA4AhyI/6yBtve476sbev1Lmu3Mnu0tD4sx3ntRWzbZXlcr7fYtpkisXpOVc77iRocjMlKfuujqZxue7NiWZe2NPYu+U5efXJnbTiEOl42HNRYJFZnVHcl7rVtvM4AwMrqzEncN5U75nralxbeJyGpN/nxtRhJYmr7ODO3LWFK4lPffbZUasKxZFtilnjfMLDNUlIzGs8rf3PGeW+ILSWru3w21JO03TYc73J327xGZLSUUPdH4FW9VtVB1xkAWNHSY7/nSyyJQ17+2mWd0x9zvb+Ytku9H2eN2672tWWsrNeqEj9odiiJWv2/jDKLlverdVkDVvtnhi4bHg4ryVpds3bYpG3bbN7SpockZks7gpfO+e2pXD7Xz+V1BID/rX7TXSrZGDDqsy8pt5e2p+b4z/PxeDOPXe1rqOfTx6uxd+Z498vQVr/bLbVlE8apuf7Klj671GStu78Gim1j9cfBvbw2x3OOmUFdcrrt9f/2zKZzch0BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAI7Jv7XAVohDuqM1AAAAAElFTkSuQmCC>

[image14]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAAAYCAYAAACLM7HoAAAC+0lEQVR4Xu2YTYiOURTHj3xEyGchFpKSKAulRBayILGQQizsUMqOnWYWNhaTbJRkspCPWIko6S0lZWUhJRsiRZJigcL5uec09z1z32feN8NMPc+v/s2959x7Z557zz333hFpaGhoaPgfTFL9Ut2NjgJrVK+71HnrU0suSJpUNC34Ik8ktbum2m3yvl7vt/pX61NLfqrWS5qIb8GXM19Smwg2xohcioa6sEq11coecZ04pToabHMk9bkd7LArGurABGmfxFtWJx2UKE34oCT74mBfopoZbLWgT/U4q5NPPVqZ8G4gb5Ymu7aUJoNUgP1TdBTwHHsjOurKAtWBaDRGyq3OIUntNkZHD5AmuEk8jw7ls6TxufKNJrOiYbSomjRSAv6+YI/8kOpxRsJz+k3V1eBjkjkYv0v3qahEvJWskL/7mztyWMqR4cyT7qK1mzZV8JDo1B/72mjsEW4mpVvJP6HTh+Qw8bSrmnz8RGsVB6U8zgNJUYiP19cUs2+2utv3md3ZYb730h7BmzL7REl9v1idMiy1NgutDtTvWXmdamfmA84W2swN9jZmqO7I0OtntWpRB1VFIjkZX9UhhX+7lbfkDuOd6mw0GnHbAvdevyevVJ2w8nLVOSvzO/3R8dF+AgtwXXVZ1TLbGRl6osMR1X0rk3fzb3+VlYfBH+uT1a32/umZPij6cuVwiD2StHA8bfmgCH04qCIsGB+fw6LQnvGOSxobCIr4u4E7cm6faj+xMT7MVl1RPbM6+KFLuwHVftVbSdE/5rQk5cwqSpMBROS2YCP6Su3JmZ2iumSPz3DGzHeR3zSwT8/s44JBaX9RTc7KzptoMIiceOKz1fP2+NmuRNrDgp2tz+0B/IFDfZmk6HbyhWpl5biAF0N9TGAS/blL1MSDii3Yy3M4f1Iz9oes7Ha2uNtZALbuSxlaIBaa8lOrA303qI5JOqicF6o9Vj4p4zBqSxA1pUu4/4OmoQfIX5ykpa3PZBLVbOmGHjktw3Mm9Eu6yjXUmd8Qp9DIhrvo1gAAAABJRU5ErkJggg==>

[image15]: <data:image/png;base64,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>

[image16]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAYCAYAAACbU/80AAABcElEQVR4Xu2VrUsEURTFr6CgaNli0X/AZFgMgnGL3SCI/4FdsIlYTGK0iEHUpsGkYaNgFsyimMQigoIf93jvc57HGdb52GHD/uAw7577du6dN2/eivTpk3D7T52oxv03lTGn+lTdqBZcL+4teYzrvXtj9rPq+GBDrBDEpHmlaKie2JTsBu7YKMulaoI8xCi+Rz5YY6MbrIo10OREXWBPpC1/LQyLFb/ihLMslr/gRFVsihWY5kQE5kyx6YT9U5gH6XwDzMkCzT2ymYeszy8wKpbf9uuK+yNiJyW8Z9WR+wF86mFj4x6ZdGpgXiw/4DHGg0n6O+aT8i0a/3m96DwUTROD5d+JYp7Dy/+qakcxz88NbhA2IJrHQRaYlN/NAcxv+RgrdR3lChE/AYqjiUWPz8SOdjDr1/iV7KpmfFwInBHtKMbTDKnOPT4Ue8qDnxlW9Fh1qnqXZO/UDhor/f7zgk9038cbkv6v23XWVVts9gxf5mZfw/e2mx0AAAAASUVORK5CYII=>

[image17]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAYCAYAAAAGXva8AAABVklEQVR4Xu2VMS8EURSFr0RBVlY0GgWVRLUFCgkqjVao/ADJ/gGhV2gVSv6AQqPTaSRaElEKq1BodkUiwTm5d5K3NzPZeW8NifiSk3nv3Hfnztx5MyPyz1/mvqROoXHL6YtF6BO6hdZNr+Zt2pzHR/NGNK0/PrwhenLKk+dFMwa9eFOKiz54I4VLaMJ5nLPgsfPJrje+i23RorM+UCV8xnmtrYwh0YJXPtCDtmge86PZE01u+EAJnrxRFiamtHZG9IKTKHpVQuqirxnXTZl3AdWyBcay6JomtOFiXfQqugM92/ga6tjY54xC5zbeFxcfNqNIIQM5HmFrQ3/QzU+gm2AexQp05k1wIN2biOvCou/QVjCPYgFac96RaIFV6M687AeSwTG7lAyfIU9AvYluHn5M5qGlYB032qQd+cf6UXjXya2Nge3Mvtst0Y1VOdPQITTnA7/GF9QMWJGFnxo5AAAAAElFTkSuQmCC>

[image18]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAYCAYAAADpnJ2CAAABOUlEQVR4XmNgGAXDCTwiEm8AYjGoHrKBDRD/B+IbQBwCxd+gYtFQPoh+ChXjgWgjH/xDF2CAGAzC6ACbGElAEIjfowsy4LbwCboAqeAEEEujiYH4IMvmo4mDQBW6ADVAOQPEQmN0CVoBUJxiC06aAA4GiGWn0SVIAIwMuNMABmhlgCjUR5cgEWxlINLRzxmIdBkBAIoWUN4lCAgFxSsg/ovE3w/ErECcyYCavUBmREJpQyRxDIDPQliRBgoFGACpBcXZFCgbWVwIiQ0HnFABXBgZCACxIpI4yKKrCGmGt1AaVFSmI4mjm0MSWM6AsMSUAWEwCwMkwYHAGiAWgbI1GSi08CsQ+0LZC4FYEsreAaVBYA8SGxSvE5D4JAOQ5odAzMcAKVcrGSBB64ekRhuIzaBqdiKJj4JhAAAIUlOqK+aKagAAAABJRU5ErkJggg==>

[image19]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAAAYCAYAAABN9iVRAAAB1UlEQVR4Xu2WOyxFQRCGR1BIBIlClKJQKgSNQrRCLdFpNBJBQqOkELWo5EZJRCvRKhQKlU5x6TRKBfGYP7ubM3fc3T0vqv2SP/fszD5m9u7ZOUSJRCJRP93aYOlkdWgj06/aV6xv1qWya9Anj/6NY/IvOEFZQM+sT/u8LfpMkdkkgE18FT7NMOuAzBzntu00a+2+WGoFyRyxnsi/oEweemP1tfQgaqo2xoR4IDNXl3ZYfLFEwc4XHRxLHv4Q2r+o2hqs9aGNAl8sXk5Y76xB7chB1eTBNavX/s4rn8SdpE1lvxHPvlh+MU2m87p2FCBP8tjUM9ZWq7sFvLcxGmTWGhI2nNZl0Q7SQyage8oumirEkofP3fjutcIlVwaMbadc7JLpPKYdFQglP8DaV7YL8veP4ZJ1N/yabQcZYX1RuXc6Rij5diyQ6b+qHRFwejCuqey51kaJQalpaEdFQsk/Wklc8qfKHmOSzLgdYUO52xDtXCyRmWhOO0rgS36csmMqQfCwzSh7jFh9LwSO0S2Z4HEJlsWXPIKEHSVMcmftRcGYUH0vDe4CTH6oHQHcv6olSxa+4WEbJVNZ8C1RJHGUND2/U+2s0N9M/EJm3j3tSCQSiUSiGj/2eYuEVnylZgAAAABJRU5ErkJggg==>

[image20]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAAAYCAYAAACLM7HoAAACgklEQVR4Xu2WvWsVQRTFr5iAYiSKogZiEbGxEK0MiLVY+wEphRSxsEkEBUHRwiL/QbARqyikEREtLBYt00QQhBALxcoiophAED/uycz47js783bzkvdeivnBgZlzZ3Zn786XSCaTyWQ6zUE2PPvZUPrZ6CJDqn1segbZUHaodpr6btVX1V/VVeMz78S1qdLH0IFBcIVND3zEf6q++DKEwXaTD1L+ICTIUnj/t+qzL0M22YumfELVZ+qWQ6phaTwDP9PqofcL336dk6oF1QUfrEpq0HRzuCvcUw2QF8ZjKYwPvWyKxnnMBoHn/GLTg9V9i81AVVJ7zaq4MWL2BOa9h9kWKEw5Bc/u21S3IGl4xxwHPPjR59gMbPekvpdyUjFD4E0ZrzDlFJi9N8Ut7e8UYx6Je8dh4z1QXfRlbAO8gv5TJ6njqqeqoybWS95KeqaeV71WjTZCTeA8OMBmhLD1WdYkfniXqErqFVPHBv3N1HtF2DcthWrG1C+Ja9POoRqWPuuHbdSKVkl9QnWclmh/nfxuEpJ1hPxJqgO0e8VmDSbE9cWECif+C3FbQi1aJTVGbJZYTkn5D7fSRsCy3kifdt4BwuFoOSY1lz5A51hST0v5waDdgW4WLGPcQWPLGXdRjMle9EG7Y431s/t3JamkYv9AbIR8eKm7W6c4I+Ux7pXGh4YZPNYIrxNLTh02/Y2ppM6q7pCH6Y/218jvNH9Ul0nY4/b4OJL5xpctGOtzNivAFQr9UvfTJLhfhb/IsuBed1/csrorLn68qUXn4fGlxnpD9Uy1S9xdEnF7c6kChy8/H/pkG20VuKbg4Uuyfe6pKZBYjHVZdZZimUwmk8lkMlvEPxCLy2FScZ9mAAAAAElFTkSuQmCC>

[image21]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAAAYCAYAAABN9iVRAAACC0lEQVR4Xu2WvUsdQRTFr0Q7iYKgWEqKdCqI2qQQxUoUCzvBIoTY2KigIBYWsRAb/wERS0XsRLC108Iq2FiYdGkisbBQROcwc/F69r23s2811fzg8N49d+fj7gwzK5JIJBJvS2dQJT44NbDpaKH42OnJ6ZB8Bs/E6N2Zkeygo6+eEOkzud9Oj+H/knlmQPxLAk1Of02OwUveEN/HfohVQ8F/9+Kxcsvk3YgfuN14tnjozumjyYNritGmFj/F99XIiUCmeLyZbTZLsCJ+kC3jfQnekfFQyC8TV4LzExQzGOOBTUOmeGVYfHKSEwXB9ubim4N3a7yY4sGJ+Pb4HaOcRXfSAvmn5n/V4hUcLP8kuwXL0C/VV77Nac9p0eSYaoemZUf8GB3GwzkxbeJoUDw6yztlY0A//NZ1pfTEx0QR45CrBx2DVYqv4jsZ5EQkWtQa+a1O6+QdSP0T1mL1hJ8L8ZswIsU7wyra1c1jXPzzs5zIAf2j3TX5ReebQVfujBMRoF0vm4GrIIsWv0t+Hnqm2CsW1928iQuxKf7Do4sTEehKMHrg9cjLNrVg8vBwNRYh736P5rP4jlY5UQC8tG9OU0bf5eUawiQxBq4wy3nwi4I2te73muAT8sLpMvwvA7asrirLXln4EoT3SfyY9yGOBVca96+KBp+caNDNif/EH/Hj/+BEIpFIJBLleAYoYJH0lPykwAAAAABJRU5ErkJggg==>

[image22]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAYCAYAAACMcW/9AAABqklEQVR4Xu2VQStFURDHRygLiVIosmEhFspXYCGxsHnKxs4HsPAJfAnZWFlYKwtRthY2LNVLSikbRSQx/84Zd+7cufdc9Tbq/upfZ/5n5pw57/TOJWpo+B/0syatWQHyx6wZGWC9sb5ZK2ZO80UhJ6UDKQALToIWGhMQP7H24nhUzYFzNV5UYwsOOk3ZHoi1LqK/KwUAXdvmRC2V98GaUzFAznoc6wMJuY0MfRTqr+xEBAfFj/jLrQ4iXRQWEWZMLMDDAUAPhTqNHMIDjaB+005E0OSQNvZ1EMECvSrGqb1GPynv37C2KFzru/I92lRcE/uMx/GqnvCYYi0Z75WKiwLP72YNGs8DdS+OV4sJ8pPheb7XaB3k2q3OdFIVD6xHa1LnGz2hUDdL4V+O675nremkKlC8bU0qb6jMT+EdvOxPVWCYQnHuSYjcUXFhII/7X/Ea3TBxKfKeel8dXIldGHgbpki9n0nwnpY1Ku/qiPHhHRkvxTKFutpXbXmmsID3hQF4VzE/H+Nr1nE2neSUshvQOtRJdUADl9Y04NduU9hgJz/V0NDQ0Cl+AKxKgc3csZwgAAAAAElFTkSuQmCC>

[image23]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAXCAYAAACBMvbiAAABx0lEQVR4Xu2VwStFQRTGj1CkRCxYPZbWouwtWLAQK7KRbFgpShav/AdWspGFrY2UZOUfsPQ/kESxYMH57sy5873j3q4Spd6vvt79zpk7c2buzDyRJn9Pjw8U0O8Dv8GH6ib+jrkc8+gDRqfqTkIHUHdjOmdXUptzlwPrqn3yGBBtD1SDqlr0UClI9sXnyei3UjpjXPWmaon+WnWY0hkPqhnyO/EXfaPtimpJdZW3cBxLGLxOMV/9sPMGYlgN9qPkuTCjtBBQl+pi8EnKinkh/6qaJr9Gz+BM0sp+CzTGIPcU88UZFu+Kfkp1kdIN76AQ/+krwV5AJzyDqmKwOTm2rLpVbVK89PQUsSphk6GzDZerKob3SRFcSKvqScJ7QxQvBQ25g58Ug9W5JI/2+Fy2HSqxQdqc91icP5OH3/MFTEgaI+NUdcIBCScEL21H/xy9p6xIwx/jRWk8fWDOHjAj67A3T6di7JgeRe9BDBddEbgk+UQCTM4XYxPOQId8cVnMDw6Py8+wJbeb2+MLASOqd/IdMZZTk9DpQvR2ombzFgFrh8FxIjBDPwkDG7TdByPow66NPU78BvPy9T+LGZC08rYATZr8bz4BOMqCapxk0QcAAAAASUVORK5CYII=>

[image24]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAYCAYAAACMcW/9AAABr0lEQVR4Xu2VvytHURjGX6EM8qMsiixMFmVQZpTEQKIsNrMM/hXJ4k+QxCBuViu7pEwMBlnE+3TOcd/73HPvPcqi7qeeuu+vc95zzvecr0hLy/+gVzXGzgj97FA6VJ3G7lO9q75US8bPfIrLadJRKADTkQQrLARk3sYkjyZuF3BlvufMNzOsmpB8DNhW196/HwoAuubmgjZMXkaxcxMDYUGWwkREj7hxbjngwUKxiT/cW8ODI8UgloxspktcnWWVbAsawRxbHPCgyUHrOLSGBwN0ky8jO8adalvcsX4UQyUepLwZ2N0R/71sAzHGVfPslLzRBdWlaiYPFcDlGmBnBDT5FvElMSrVyZnqwNhr4nL5uFMIx87CBiTxpHpmp2eXHeIGv2BnAmfiaifF3XIcN16SFZtUB4p32FlD2InfEqurulQlhsQVF54ED95KxOzjDmITphCr2yS7kvCe4igY/HYQ48FiEzbR9H42gve0qlE0eMNOcfmn7GxgUVxd8lEzL+IGiP3DgD3VibgdwUOO3PVCRj24dOEErI5tUgpTEt81C5rF4K+qWYq1tLS0/BHfukB590wRtHYAAAAASUVORK5CYII=>

[image25]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAXCAYAAACBMvbiAAABu0lEQVR4Xu2VvytFYRjHH6EUgyI/povNLMp/wGARg64sBiWbQrL5DwySxWRglRKGm9FitFiUTRLFQH48X+d5ne957nvcxVXqfurb9f2+v55zzvu+RGr8Pa0+iNDug2rwobqw30HXxtz7IHCi6iA/r3onH1iTZBHo0LWBBdUGeSyIvluqblXBPJRL6MDCQGZI9aKqM3+m2k6bv7hTjZFftd82SfrOqqZVp989Iuyq9lSbqk7XBnol/jTI8DbYD5DnwgI/FgKWfeDAJ8kr5on8s2qU/Bz9DQ4kfbO5VCom7zuHvNn8iOoobc6MQSFL5HNZUV1JOvlUtrliMdicnM2oLlWLlOeeHg82I+MX9z4Qct4nMbiQetWDJON6KM/lRn6vGLydY/Loj8+FvRObs4ySJB3DLVmpGP5MHh7nCxhWNZCPLlSyrM/8o3lPbCzjj3FRsqcPjLOJTXhtWah6x7wHGS66GLgkb12GU+uLyZzkfSk/+1jkLZLh8guEV47bNYYvBPSrXsk3WZYBk+KOaFGdm8euZwqWY3G04Qn59mWwQRt9aGCO8PDr3FANJqT8fxbTJenWmHRtNWr8Tz4BL/F9e1BO+ygAAAAASUVORK5CYII=>

[image26]: <data:image/png;base64,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>

[image27]: <data:image/png;base64,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>

[image28]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAAAYCAYAAABN9iVRAAACOklEQVR4Xu2XzysFURTHjxBCEiWxVoqVUsrSAgsLlpSthX+ANf+AZGNlRbZSFlYsKCV/gFeSUiQrSz/u9809zZnj3nfnvYd5L/Opk5nvvTPu+THn3keUk5NTIZ9aqGd6tVCCbWOLWjTsUxQUl70bG4qn1g5Y3JsWS4D5TVq0NFPscJ/V+o0tC73R6pkxauzG2DSV7zwyXwp2UoNq8Y1lRjnOTxjr0qIC77vSomGd6tz5Dy0oOLvDeoBixw/1QJakdX7A2KMWFefkziz3gns9kDVpnX+huIn54Oxqu5CTaom0zodKHqWOd80LjTP+LLS/gIMeJI3z3cbGtKhAk3P9wz1y62COwkFl8NltadEDJyJIGudD2xvwRbtAbh0gYMda9LBJ7kbqAkEK9aciIedxoPEtXuJz3qXDCTQ/6E/GVsRYj9X5mTaK5+LvgdXBrtU7jc0KHdqMuPcScn6VwplvoOg9rv1dO49SZ3RQ1ii5I3CvaKXvcxeMjdtrHJ/v4qHiXDzjpIPiRWnTuDQGhx79PEwehPBNQ0OAkHEONLIlS54DKOF7HJCw2zBoqnIurqfEfaqST8OJFipgg6IFngkNDsgF41p//+zgAyWbHfqIDAbmcaYRYPSHqkGJ+n7EVItcPCplkpLb5JGxQXsN53jHQbXBeewiANspggMQABy02ukHksYv/Q343bdCwyeB8t+hZP+A80jCqb3Ht/5KkZMo8WtjS3YM1dNCVR6jUT6XWvwvIIIjWszJqT++AI+NqzMSmMh0AAAAAElFTkSuQmCC>

[image29]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAAAYCAYAAABk8drWAAAC0UlEQVR4Xu2YzetOQRTHv2JB3l8KUVI2pCzEio0sWLAQUf4AlDVlZ2FhYyGlRLEQyUJJUtIvNl4WNqSssKCUlLKQvMy3M+Oe5/zOzL1XnucJ86nT797zPWdm7jzz+gMqlUqlMgxuB/th7FrU7qUgxWFMjqe91EGR5cHedLQLMUfzEJPr0faoCR0/M9A0bI3R7gS7HzWPKWhy1wWbPij/4jok5kaw3dFSXno/Euxb9HnwR6H2Ntji6JsVbE/005ZE/9jYCGnIWSsoqH+1TkX6mBzsZE/P5U1YR2Q7JH6DFSKf4Zc3MhZCGvDYCgbGcITlaOvw/cHOGN80SN5z4yfHrCNyC5LDWeHBeqgvs8KoyI0QC2PSFLOshuhHraDw6mA8/euNfzZkanu0tZdltbVlaLCDWPkXKzicsw7FafzeqHiF8mjzaOvQHRhjh76DVL7JCj1hGaXp7pHW1CdWKJByLltBweWDMbk1dqikXzu3K3dhPqSM0vrqsRWSxzWvKymn1Fnpm7g+j5y26ZM4YB2K85AyctM9V36aHX3oktP1m4ZC18o/WofiE8plcFf26Fq3hvHeiSCxCxKz0wqjgscYNmCRFRTPgm22TkWpY24iP/VKeR7sJMbnpvteiL7CChi8eExV/n3R9175+H4VzUabNkw+8wz8Ij67pIq8ayKZifLuTpj/3ToDx5GvmOVS67MhTUByvB9oDkS7a4XAKjTtOBjsUnzmrOO1mayM2tr4zvi5kMHETuTAo5bK4V9+gwuvaQygnQy2FM3RY4uK03BEp5yS8e6d2Obo2nLYOM84anJQZ+do2JYr6p3n3tfB5kFOPLY9CyCbbp8BgIuQgniPPjEo/bXw9OLNHq7DvIwkeHpIa32u43gs7HMi+Sfh8vDA+A5BOkxfJvSI5DP/wWOxo/a/hR3BKcvR+jT6uAScis/8Z4o+FeQ67oN1VCqVSuXP8BMhsuqiqgPEaAAAAABJRU5ErkJggg==>

[image30]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAYCAYAAACMcW/9AAAB20lEQVR4Xu2VvyuGURTHjxgM8qMsio1BRoPCKCUxkFIWo1UGf4DRPyBZDBabJAbxZLX6AyQLA6XIIu7Xucf7fc57n/d9lEU9nzq99/y69zz33HtfkYqK/0dfkG5vjHR5Q6AlSCvpnUHegnwGmSW750M0ppnsWYKxHR27QZ6DnOfd32SiMVjkLo4h/AEXNJ6isQcbMiS1OaCzXEb7piWAtWhkXkULYjLJf+1pzivS4XSQW8jRLjrPtXdE8KGjbEDwPRsCB9HOZE73tIkeBWbB6QwKwRor3hFBkT2mYJsRnJkhgp2AvZdsGY2LuAmyKtrW97yrjlup3wzsbn8cz7HDCvXbb4VOki2Lv9OiZ3is5sqBy1V0IRnM/5KwFZJqPQqHnc9YFmSH9EXRGN/uMljbvaQu8Q+py2SJfH7WaWwg5swbS3Aimjsi2lW0Gy/JPAelOBRN3I+/1vphDkpgH/RbUnlFl6ohVrC1FW8ldH7cQWrBMqTylp1eB7b90dnwjvJEODvQ/WSpBZvR7P0sJBNN5McV+hbpKPCKdANxx97YhBnRvF+3elD0rw//LBOik6TO5kaQI9EdwUOOuKVcRGNw6awDLDhmpUERSHoIMuB8jMU9BRl3voqKioo/4gvpAocgp3Th4gAAAABJRU5ErkJggg==>

[image31]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAYCAYAAACMcW/9AAABxUlEQVR4Xu2VvyuGURTHj1CKREkUWZgsymSwiEFisFAWm8VMmd4/wkIWG2VVBlEmZWViQEoGlCKRH+fbOdd7nvPe93meZFHPp76993zvufee597nuS9RQcH/oInV480UkN/pTaWZ9cL6Yk24PssHSU6WNsIAMBhJsEJhAcR3rG1tj5g+cGDao6btwYP2UXkNxFaH6i+HAQBV++KCZkzes2kHPlklbdsHCiQWcjSQrHHiOxQ8KDbxhzMbKDUkkwQaXRzYYV1pu45knGXaxRYUgjnnfIeCIlutsW4DBRPUmxhFwLswHsCOLpr4lDVPcqyvxo9xSZUPj93t0vak7YjRyxrzJnNO5VcCO9fBekxkCLWsFm9GwDxPES8X3ZSefE3Jd/i3hGP32rdJadywbr1pwGRr+htkX5G87JKM7Sf5ynHc2IQpm5QGBi94k2mnyh1cUs/7eYiNq/ZRVdBGMjhxJSjHrHdvkvh+wTzECp11cVXCfRr718FLH7vGcOx+wSyy7s9MUEi1QlcpXtAQxf00xknG5D5qzz3JBLF/GFAi6R8muYJWWG82IYM9Kh+51aZNysMA68ibDlzCDyQLbLm+goKCgj/iG/c/gYXn02jnAAAAAElFTkSuQmCC>

[image32]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAYCAYAAACMcW/9AAABc0lEQVR4Xu2Uvy5FQRDGR5AoxJ9SotVQKESh14hQiEKi8RS8g0cQjYeQKIRbSrQeAIVGIVGIEGG/7Ex8ZvecvZeruMn+ki85O392Z3fOrkilMlgMB80EjXlHBsQMeWNgIugl6DNo3fmYD4kxJR1bgvGmDtOj5AsB8xJjsCnPBX2v0rcHuXPyvR7GrEu1H1gCuOKBYhMw90GHQSvq84WOuzH4sZADXcE8196hYKNLbLCi+ATf1Zb7DZCcK3RE0i5suTGDQjDPrncoWGeaDfa/8CIdtS2SzWgqFNwE7Uls6+tPV8KtpF3D6c7q9wY7mrAL0cuJGriUU96YAXM8Z2w9gQScdI5Sod1gbfc656ASRxKTRr1D6UehpxLnWJA4D9qNy7rJQW08SXyq2uhHoXaCTNOlSpiUuKsS/1Xojhtn2Zf0PVuW312mEqX3s5WHoG2nptP9a6FrEvO7brXBt86LuXM+U4di2jiTNBc64aBKpVIZIL4An1lx2W2yVHIAAAAASUVORK5CYII=>

[image33]: <data:image/png;base64,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>

[image34]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAYCAYAAACFms+HAAABoElEQVR4Xu2WzytFQRTHj1BEwsKGxdtYiEKyUFaytHxlISsr/wBlZePvsJBsJBsLWxtip5SUBZFSkgVl4cf5ds405517r/RS9+rdT32bOd/z7sy5b6a5Q1RS0jjc/lL7rD59JnemWV+sS1ZV9abegsZo79XrlMfy59MbJAVCnjQvF3pYz96k7MLvvJEXJ6x+5yFG0ZvOB2veKBKrJIVP+ETRwZ5P2yaFpo2k6DOfKDobJIWP+kTReaB/uE1A1jEYQO6QNcD6YD2qf6S5cY0Draxjzc0Zv4vkGN5jjRn/heTj10wyNuboMPlMfip8RFvkZ7V/wzrXfshZMHGT9p+cD4YpPoPfQa+sLfVwwmGOBO0Ui02TpZvi9SBgXwLY4nA6LZJcGVBoRX0UFq4NdjysTouJAQ6JAxPXzS7VnjiYBCcRwIqsx1TixQGW3frbrAsTp/0xf/I98QPZK8C7tjva+sKXKVk4+pMUi7+m2i82DgswZby6sJMOkezBALZGhbWiMdpe7Z+yZrR/pe0SyXiDJHsdIMa4APsdKzKvcUlJw/ANEdhxUSTLONUAAAAASUVORK5CYII=>

[image35]: <data:image/png;base64,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>

[image36]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAAAYCAYAAACLM7HoAAAC/ElEQVR4Xu2YTahNURTH/0KRhChP1CtlwIQSJkxeBgwYSCETMxMxMBBJGRgYkKReoR4jH8lEkkg+JmJqIKVQMpJSBpKP9W/vdc566+599r3l3vd67/xqdc5ZH+fss87ea+99gJaWlpaWQfBA5K+T29H2RJ0Mh9DpT3lnnSJrRT51KZdjjOUnOp9j5abI7Mp7EjAXdePWONtDkefRlmIG6lgmbs54c8VrBJ9bIrujaJxen47XP2KMZyHqmMVRx+Mqo58Uid2I0JhRbzDQ/ssrDfpCOZYgbafuj1cK173CwJgXXhk5jmBf4A2DhF+ZjXjlDQ763PFKQynpZxBKhWURQtx9pye7vCKyGiEmZ5+FYB/zhkFS6mEKfZZ6ZURf9Jg3GFLP4ItTv9zpV4jMdzqFPTR1LwvtufLRd5gkNoATQInUxKFcRDo5JfjipQR56P/VKx0TmtQvCA3Y7A09wns0Df0UWmObSoqnNPTJVgSfXM3tO3w4JTdbd4PWxV6SQw6i9w+qIyJXGgjrM332xutn8Xp75dFnNKklmIAcVxHukRv6ufuzZ+dsOUrt1WXhN6dvivnvlBqp+EZavqP5HqmZnXT7bEspRj8wJzoLy9zAuITQCNa3HG9EtniloelF7yEscVIwppc6rBuMXK3UXuon1J0i+0R+i1xxtreo33/Y2S5EG4+Wc1F/w+krtKGpLSWZh85GehifWrzrziiFrjp6qcPrEWL2ewPCDpC2k94gPEXYEBDu6HTZ9xj1zouxdjnIbfk21Gtehec6CljfswwhOFPOiiwT2RGvR4yfRWfukrzUAOT/EajkYI/wvl7uVt6d2Hu/F/mIkGi75KKPnay13h8xOpax8whb6c8ih40tyzWEG3GYcPczFViJ8Unl+Vg82p7mRxo7GvNAP+0Y/AgcudMe/tyxPZKJIkwWywnZJHIC4QMQjgxN+AbUSf0Qj4qfDKcV2lM59GfGc84TlHUij0QOoE7eUdS1lj1Yz4dF9sTzU5jgfwstLS0tU51/iij4olqSZG4AAAAASUVORK5CYII=>

[image37]: <data:image/png;base64,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>

[image38]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD0AAAAYCAYAAABJA/VsAAACXklEQVR4Xu2WP0hWURjGnyCkyJJCzAghwqVoa21wSEEEh1oC213apATXamoIQpwaag03CRIcxBapVQjchKAhRAh0UMjO873nfPf4fOec+1k0iPcHL9z7Pu97/t1z3nOBhoaG08AlZ4diZKcdUfENnbEh/mzCT5v1eooJdMa/8tqms/v+OcUXlHOzhE7PRL4L3hcmo5xDpV8Vje289tpz0ZTQxpD4N5wteI1jUa6gnMsJ58begmKfOh0HzlbVGcG83+r0bKPc6UOY/kSFCO6yH+pElTujQgT1VG4Lbp3c4LacTarTcxmW91EFT7FTVF+pxHtnL8U3DMv7IH6FMZrbhg0zgI0pL9QR8QaWd10FxxRMy53FnzB9QAXhLTq3djeLRRijuW2mUTX0zlnvETVPaft+hWk898odmPZdhQSP5P04uawHRcKkY0tV7UDY2nWWgnWC2i0VuiDk3lThb+FX4UTrBk3C9r2ngqeUX9Lq+JfcWnjNsPFrKnh+Id/5RZhWKnC53F0cXXRaKEY8dnxnTB2sN1l49lLchXXACaQoDfwBTMsVsVJu4DPS/Xc76dw12qpsi+r0cHVLA6OWa7hU4Mg6TD+vQgR1tqN8gmmpAhngzZC6iVqMIz9wNrykTk8/TE9tX/6JUSvdz/wJYsyaCp5RmJ66Y7lQ1FZU8Aw6e6bOGA5sDNYIry2eXybw/UYV1ia+2mLrQXUc1HI1gYQYTo5xI872nD11No/812TVD7lzsNzH/v12FJeE/6eEX4d/XkxaRuFC/w+ERafxqB2nb8Yzbx81X7ehoaGh4aTyB/mm1C58XgEOAAAAAElFTkSuQmCC>

[image39]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAYCAYAAAB5j+RNAAABrElEQVR4Xu2VTysGURTGj1CKjSgRKTulrO0lKSnvkoUvISVfwMo3IHtlpSwkZWljaUG9JO9CWQgbifN0z3nnzJk71yhlYX71NHOfe+65d+6/Iaqp+Vu6WJ8JvbA629EZ8DTmSZ5brBPWiok7NHEpPWsDTzdrh0LQgvHHWdfirxl/VLxe43WwPsTvN/4Aa1h8CO9W2+LfaoMYGDmCYmhiW54xZQWDevWm4HNYelj73rSg4YU3BZt4UN4xUzH2vEGh81R+YLdCjmUKjad9hWAHtyjvq1l1G+xfbBHPBhXzYzCb8t5HYYmjnFP5lGvihpQnpQydskbET9GkYv4H1oTzomhnulT4iinje7CvtM4qttS6pDFVQoPvjG4onLQycJVcUb6z41xEYJZC3TplJ3SXdWZiSsEJQ+MjX/FDymbjnoqzij4rLSk2JhrjC7/j3RsG5HjzJsUHXbr5Pbp/qtDyhgE5YndfbHCVwFSjYdP5MYYoxOK68OAkP3qTwh8EbVL3WwF8oX6RVWq6D1hzFOLwy0HskpT9X2FefC8f92vYJb2k0BlO65jxa2pq/g1fwAqQb1jfEv8AAAAASUVORK5CYII=>

[image40]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF4AAAAYCAYAAABz00ofAAADYUlEQVR4Xu2Zy+tNURTHl1DkHZFXXhmIQl4TZgYUosxMzEyYUjJgYKaUiULdkYlMlYHBL/4AKcWAojwGklIU8tjf1l6/u846a+9z+t1z/O69nU+tztnfdc7e5+zH2uvcS9TRMaZsC7bcih3tsTXYpXg+N9jfYPP77uFmRbB5VhwRJog7W8B5T5ULzCC+IGdrJ69uny9WoP5zfLeOltlB3O7TYL+NzwN9uVSVce99VS4xO9h14gv3Kn1lsFtRf6x04bgVBmRRsB9WDCymGi/RAmizF48wC8LJfisqcE9lqPkc7I8VI17DG6PWZFh4QbwxWZYRt4Xj/2IWcZtrgt2IR4vXL0CiSC1w4QMrRrwGrjraoKTqO0NpX1vsoeo24Z+wInG4xOqt5Bj1R9eCCuD7ZHSsDnR+U2DZHrJiBLG9qhOa5hFxFEgxh/iZsPI1z9Q5EoULqlwCjXgvtpBYRwgAEl6sHY5+hB3R7kVNeB5sp9E0uQdEfej8V/Ec9rNwRXO8ofL76b6RlW4N737T0XfxbT72YrGX5Gc0qTDzIR4xU7RfBgxxM4VXnyDPI2DDQrmtmC/xHeEmxUfiCTsQaMTbWE8T+w4aHY3ajsLSk9GFT2cnqYESEOpS+4tsrAccbYnSPJCVXbFiDbYQ159LHOCXlT4lZPZctI6IdLJ+SZShe8gXm85OUM51PHzIBDx6wX45Wq4+QdqtTOkMdyhfPyZizl8L2VjtJiF8JfZjoxBQTm2sXgaSGygge4jHNyrn71idtg0PpIF1rrO8o/x9WJ05fy1sPNbsI/ZhYxQkXssswoDoWIuBuqvKANdjgFdTOf3CB0gq9cIqs4MOoF1W502DOr3QK8Cv253SM+Cm1CYhDegwgOxDN/RanQPMUJ2hbCa+fgHxDLQpY262n6LyS+mBRzh7WHQ3Aup/YkWF9qNvchlZATywdGrOzskNCsnrN8Ujfm7QrIs6OvhtsGuxfISKKwdsIF7WKbzViPakfVtfU6D+3E8B+N0GH0m3qfx90yrIXs5bUbGKOJuYGcsYrJN99ySIlXYFaNDOdisSZx1efU2AsIaOz6W+4ESw9VYcFbwfxKaL98F2E4fDNsLXUHHWCtPEUeJZjpQa4S212Y8FmFnDgv5PIhdCx4JcutbR0THy/APljvzycVvxEwAAAABJRU5ErkJggg==>

[image41]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAYCAYAAACIhL/AAAABfElEQVR4Xu2UvyuHURTGH0URZaAQo8liUCYWu9nA7k9QLEoGm6SUDBYLdln0ZmRlUYrJaDJIftzTuZfjcd/7vV8G0v3Uqfc+zzn313vvBQqFv8Wgi9dI7NikBKcuKhZrOMLXcfa9dxKSYrS5OIAWLJGXYhhac8sG0YGPCY2QdwxdpHhJXpCRRIRBn9gwjENzttgwNOoD7dCkczYSDLmYcfGA+oX1QL0zNgjJOWTRsgBNGmOjBjkSYVLX5psJO9wIyelj0XKDvI4CsiNz/ruC1na9u4oMKPoj6TG2WWByVyq0ulg37UVo7ajRhDuvT5D+LZqZYEXtWWjtNOmhTznfP0IOu3SU8+7JzoWBOWQnLbmLnmeBaeaCxAYcgOp7pOdO8J4FJvf9W4HeXkbOpNTzY73p9V7SLRcuJlm0hPfvkg2iG+lFiCfvoaXF61ekBzqRuL3ht3Lwb94wXuyXsSexbPx+o69Bj4NcJmlPmbxfZxc6qWcXq5+tQqHw/3gDqx56hx6bGfwAAAAASUVORK5CYII=>

[image42]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAYCAYAAACMcW/9AAABwklEQVR4Xu2WzytFURDHR1GKSCkpLOyUBSk2lhY2RCzs+APYWFjYWVjb+xP8WGFnIZa2ipSFlSIpZaP8mG8z8968eec+XEpyPzW9e79z7rlz5syc+4gKCv4WdWxvH1h3afQv08C2QRLUsNM72TZVP3b6VxmNwne4Z3uNomKZzcM65X82CSY7iKLynUBv2I6imJdJkkC6ooNpJfHdRccnaCR5tjc68nJI6Yy1kOjn0aHAf0vljG+rbtsdrUn9xpbzIYZTtoGKEYE4odkFZXc8mgw1jVPDeGIbcvfYdsyT4oVtxd2Pk4yt2XgYkGqkBRLfWNAHVe8POjQfuC04skfVOhYIrT7oJZpJBqxGh2JZaXNazDxs3/kN6CiDSCox2ParoFVgjZRV8I8k/g6nZWXKk9VIyBj0naBDWw5aBTg/s146QuI7Czo01GMt4vm5qL/tqvta7lPNtj1ZpxiAjkthmfN1B7BtqcVhnnm9vmY70Wv7TBu49kfhpWoAQZbehyawIGrZkj0QwETo2jWSz+wuVS9ohu2B5F3xDLbA4Htm69F7ZBnz/jgTJMGiIVNMs81FUUHNz1J5cfi/MVV2FxQU/D/eAe0ajHilXQchAAAAAElFTkSuQmCC>

[image43]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAAAYCAYAAABHqosDAAACiUlEQVR4Xu2WzatOURSHl6LIV6IQgxsjH2VABiIGiAEpBqRkZmKm+ANkpsRIUneoZCofycAAMSUShYmRlDJAYT/tte5Z7+/d98WI7j1Prc67fmudvfda55y9X7Oenp6ef8OtYj/FrnvsfiRNJ+ZY14i1ErtT7IHHphWbrRZ9XgMJ4t9VnMostlr0Ew0I5NxQcSoTn8/vIGepilMVCqXgrxpocEUF55F1zR0v9rLYyhR/77FX7r92H/vm2nbRZrgOs1LsdLG5ycdirqw9dE05Yl3OsWIXrI4/xAerSTs18AeweO49mLSTrq1ynw19vf+OBQXzkkZegP8m+T+szvXOY1tSbJ9rnxqaghYPB267NjNpE8TCeAp/yzMbXsB+0c74dZHru1JsSUMDtOfJf5F0ne+Ea7mxR13LMIfmjbvWpDVZELFsefPF/5h84A28JxpcteETDU3njrdwq+ig88PnYjdF+2KD4/JG4GveqNpHB51WTrwB50RH2ysaUECrKB13T0MLWg1D020ALT8w7pns3vzJDnDNasKo04Y433lmjevLk8YCo6jZ1u0z0cQV7gdobxtaNDs3qPV5tLSFrjE3exhvcHxuSjSLWvShTez4k3VundW43kjh6POTxgYYC2DRQasAQIs9CCgGjeLgcYo9teEmoum4NDW0s8UOW/cQM5xuaNRBbRsHw5VlVpOwi1bfgvgnfMmvbJQKjeBo5ZQgh8G57vBYECdfJhabj+XYC1Zbd4wHMb5q7CcZctC2FTuVdBrB3wSOdu4b8+vuYne7tDaXrWtQawNtMVbsQPJ5AhyXGRa7QTRoaTTqkF8zx8UH/ocsUNFqsZiyyerYAdtH9nt6enp6ev4zfgEuz9E3+X7PggAAAABJRU5ErkJggg==>

[image44]: <data:image/png;base64,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>

[image45]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD4AAAAYCAYAAACiNE5vAAACfUlEQVR4Xu2WT6tOURTGH6GIQuQSgxsZkJIUkyulDAwYKBn4AD4CPoCBiYGUMsFASqa6KemNmZliohQTBpJSFPJnP/Za9yzP2fs9h/cOcM+vVvusP3u/71pnnb03MDAwsFCZTfJd5Jb57nuQ8Rjt2JI89wkBjenid+N7sxzNojvEdzfJA/NF1ic5avYPSTYG2ZbkivlGFq9w/mfkmGXiizDuG3Ic15439iIvelkdAfq/qDFxCtk3ow7jaZLTajS2J9mDPJ9jiVVoiq6Fn4i1yAs+UofAmNtqRE6MviXqMEaoF+WcjZzPApZ4k2QRcsxD8U1E30oyZkqNKM/3hMjLJCuDHvF5HEfB7mxOshRNV7BD5gUmwgU/qaMAv9cSpcT7rMdvmt8tYXFeB5/z0caraP/GRPDHuGCtFbtYhybxKO9jUAV2hXfGdbQT8xYntY74Y/yPjttRx+Eb23E0uzl1vqEuWPQt9nwSeV7cJ07Y6MXl6VFjsRoSO9UQ8cS7qG08bEWdz4TWiK1EnOcF22V6PD1umE/x/06ZDvZXSfbb8yH86pujb+Lv1IBmp30h9oui17gXntlxXOtYkrNJ9gVfqbjkiBoMjeWp0+ISciDbqcYTNBWMdJ3f42CLe5s7XOsO2i1dezlMfDrJVrFrrOo/8bf2TB3GCtR3c15DObd2fo+j1BW1BGkrnd9fkW+b3At4+3N0DdXn2IDmR88jf2+sJvWDIc7xWJU+V8m3aM9z+LzbnjeZrrLa/Aqvy961cc2S3uIachArGS8gfyN8WYeDzsT9yquJqv5Pw+PvQNCZXDzz/XjmeNOe/xvO2HgB+Y073JP8xODIK+/AwMAC4Qc1HMPVmMKFjQAAAABJRU5ErkJggg==>

[image46]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEUAAAAYCAYAAACsnTAAAAACsUlEQVR4Xu2Yz8tOQRTHj1CEJPIjFjYWWEms2IiFwkJZ+QP8CcrGQha2KCX12NjIVqg3PbFjpYiUwoKVlFDIj/l2zume+70z9z69Gb3pfur0zMz3zMydmTM/3ldkZGRk5N9wJ9lvspum3Xcn44l0fXP2yisE2OdwW+4wJ23/3W25Dsul6XAHafeSPTAtsj7ZMSv/kmxTsG3Jrpo2NX9mgzR9XiQtsjPZZ1G/I6RVY69oh1dYCED/wYWJU6LaPhaMZ8lOc6FxMNlj0fpvSItMkn2QfP9VWCv6UY9YIOBziwtFBw1tCQvGVMoThvZOitb/RZpzyH7hcyMKNfHwHQI+CHcmV/98SCMCVoZ8xOvl2gC7kp2TZouua8t18D39jYUMOB9y5AY0S3sYILYEwHnEbQDfLlPJ61V4L9pZKbyHwMB8UqJ9ik4FfOuAqXQH7dsG5Ca+Gt7ZMhZmxA/ZE9LcOshPolMBRMEaS2O7xUEvEo0eB1rMV2XWFcDgc3yVbn1Enw+2jxhNeHOgHT+z4i2zyrTSN8wH3Ia+dTvMOikfuUB0NVH3NZX3vTci10Lat+GeZEuTbQ3acdP+5iGLhSt+52UZ7vBpsv1cKMPvkz5Qh6MJbV2S7gJgRRGRkdWi/huTbbH085aH8l1Uw/djsg8ke2tl70TfSR18tV+yYKyQ8q2Dpzvqlt4nfdzmAmmiFu8mLuf3yQv7xdvGB8aPv58hjTY2U74XzLZ/0AXRw/Ko5TGzjPuyod4QGATXcx6KrjrwM4bNF2CxaLT57QViW+hnQnkHfRS3DnNdtGHMcHx8LVRwpfsWRBTESUF6u6VxUMfIPBO0/444CTg4sZA4IxFNUUPEIDp8oT1q4Defrb9g8dvKweGMm8vPP+TxR+7ZZHdFzyn8mwPgtY2zFBM5MjIyUo0/RGfUjPganccAAAAASUVORK5CYII=>

[image47]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAA6CAYAAAAN3QXmAAAE10lEQVR4Xu3dT6htUxwH8CUUeROeQpRHShggf4oMDAxQDCgpMwZvohRFmb+ZkZRIvSiFTCQTGdwYmjJRb0AykV4JE/mzv/Ze7rrr7b3vfXjvvvN8PrU6+/zW2uec7uT+Wmvt3yoFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABWnDu0P7oWX/09opSDTd9Sa3200tdqx9zW9QEAMPimzCdUS4lWYhd0scuneC/jPijzffFeGfve7zsAABglWUrSNOfNoR3pYpeW5eTr1z5QxkTsQFm+J9J3Th8EAKCU78t6IvXG0C7qYkeHdqx53yZ0W811VT9/7nuOD+3hMt8HAEAZE6UkYCcj99zTvV/z+fSacVc18UNDO39oPwzt5yYOAMDkcBmTqH4GbTe5p201IZuT5dMbpuuMzXdWHy/EAQCYbJXdZ8d6/f61K8r6U53tgwS5b2u6/rCLt/vX2mTwkin23NBuHNqTQ7tligEAnPWyP20tYbu/nPggwNtl5z119mxJO/bLof1SxmXQQ028/w1fd++jHdOPBwA4a11YxuSnL89RfdcHyjh+7knQJe1y6YtlvD8PGlRJ+JLEtZKw3V7Gmm+VhA0A+N9KUdy5BGguFok/2wcXPDq0B5v3WTrtPzcJXb9/rSZ0l5XtciPtQwn9ZwAAGyr/7H8q4z/366fYddvdNJ4v49+ptsd2dv+l7a9tTTuuJmBZXn1kus5y614+r8bbWb2lsQDAhvgnFft795X5eJbvMiM01xdJCNP3RN/Bnp03tHeb69+m6/ZvvvT3BwA2QGZylv6Zfza0T7rYlWV5/NzG962hPVCW76lHLPHvHC0nJt459uqLMu53y5mnAMAGStmHtWTphaFd28XqweTV4811jmTqZezF02vv0+l1rg8AgDImSt/2wUabjFW558fu/ZokeNGPS5mKVPDPpvpU7QcAoJNjkpJE9TNou8k9beuXTHv18zM2BWOrnMcZqTOWczFPpTyh2f/uudYWrAUA2HdJTvpZr91kRiz31MKweXpxLeFra5Xlvoem6yzFtnEAAGb0e9F6OU7pmi7W3/Nycz3nSHPdzmC1M2prv2Gvfu8Dp0g/I7fJDQDYAHMFWVtzfYm1xVh3035GniDNvW1tsDvK/PecjJQNyWkAa54qJyYsc+2tegMAwJkiScrcHrQ8vdmfhxkZfzL10tqHCeoZnO3nZv9am7ClhljKhmTsS0N7Zmi3Nv0pW5FDzOuM2utlvD+vSf4AAM5KdXbpzqFdPV33+pmouTGtdlw9WzMJ1avTdcqFzH1ellzbo5VuLttHOm1Nr9F+/26/BQCA/9ixsj0LN5eYZQk0CV+1VpYEAIBToE3SsvR5UxfP64EyLs1mH16ePM3s4CZLuZO5mcuDU+y1Lg4AsK+yDFolYWn3vGW5NO5uYvc215sqyWfKo/QJW8zFAAA4zeqTt0nO7mo7ys69ewAA7JN61NfTZeeMWgoVrxUmBgDgNMiSb1sqJQlbyptEPYcVAIB91Ne1S8JWn3y1fw0A4AzQnxzxStlO1MywAQCcAfqELZKwvVPsXwMA2HfZv3a4Dw6OF8uhAAD7rhbKTZubZavnpQIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAsFd/AjFtZV+FhPN4AAAAAElFTkSuQmCC>

[image48]: <data:image/png;base64,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>

[image49]: <data:image/png;base64,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>

[image50]: <data:image/png;base64,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>

[image51]: <data:image/png;base64,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>

[image52]: <data:image/png;base64,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>

[image53]: <data:image/png;base64,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>

[image54]: <data:image/png;base64,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>

[image55]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIcAAAAYCAYAAADQ1+6cAAAD0klEQVR4Xu2YS8hOXRSAl1C/kPzkEnKJgUtRIgZkgJJI/EUxU8xNDIyNlAHKRMlQGLoMJDEgykxKqS+5FMnIX5LLftpn9a5vvXufy6vvEvup1XvOWvvde5211957nSNSKBQKhUKhMH44GOSnV/6BrJf4nF6WmDbeNtZx+Rrkh1cmmBTkdUu5GmRq/Fs9E2R8BGG04Hk/SHzeTUEmDjfL5CBfJNpXONtoY5N5h7N5Dkts9zTIf5WQVOgOVfdHg3yudK34Lr1OyL6/gabF8DzIfq8cA/BxevVb5y+k7Ln/kfyteBDkisROZjvbn0ouaAq2aV45yrDD3amu1d/c4l0W5IVXSvxP6kh66BUpOM/ghMSO2MbGG3ukPtOvBbnllTXoSrzpDYb3XlED/u32SgP+DZJo78w1Rwo+5+LwRvrH0CPppNND4654JMiT6poHpCN+LQsrva4ysjO36m5Lz5ayTwnyv/Ts84K8GtYiDwVz6oFmBLnrlQ3slTj+dm+oYMWe9soGOJpT/pEYXf2DpdIfQz361zh9jssS2y/whjZ8NNeaBJeMjiDploRNr7VYUzZW9/8aHXBUKYsltmEylVwS5SBBmARl0MB/kvpxKez8KmwD/h0w9/hnn7cLPlbA4uoSM9p988o2kOWzzP1MiZ3dNzpW1oUg/1S2zZWepLIOphwmSKvNPXb6sqDrsn2DTgCBu+dsbWkal2p/UEhe/CMxBvUPdEf3aKxZuHVQO9Luujc0waTpIF44uzycWX7yFXXCypAMT7zHld6DbpdXtuCRpIusNuiRkhtXX+t/B/w75pUdSBWWCq+kuXmykBS0m+sNTZDdi7xSYmfUBJ4hyQeM3QXbWm8waNJYqK7RtfoQY+Do4iihAGQX6Qr/ZVyK0hQUcU2Br4PdgjE4egfxb470x8qj8aQuycFx0tRPH8uDbPHKitQkAjrO6RSaHHWk+uVNQbf2truABl4hQWwN0gbG9b5YsDVt2Tnwz9YJ+GdrkDYwfmrhWjSBmp6jzp6kLpi5DtGd88oKLZJSK/FZ9atVtsIXSNvnUM+UhR2DtyFP1wmgbmJs6igPdRjF9SCQGCn/2EG6+MfOrV83dwaZn5HcXCnYWhWjK6XXmYrdznXyrOg7thaqddU7H9Fog9M8ENfnjV2TgR3reJAbQS4GeRnkjOQ/7CinJBZ4Odi96gpMzzqJ/pCc+MwrPfcbbKMO4J9/s7DgX5vP8Hzw8vPQJNRzQG3hbVZGjG1ekYCVeFb6v5NYWA1bzf0+GbuPbquCvJUYuEFehwuFQqFQKBQKhUKhMGL8ApZvK+xV2sDOAAAAAElFTkSuQmCC>

[image56]: <data:image/png;base64,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>

[image57]: <data:image/png;base64,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>

[image58]: <data:image/png;base64,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>

[image59]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAAAYCAYAAAAMLpqrAAAHX0lEQVR4Xu2aW6huUxTHh1Dklntycs7RoURRLg9S5yREInHcUjrlgaQURfFyhAcp91KijwedwoOSXNOJkiheSInadMqDJIpCLutnzf/+xhp7zm+ttfc++9tl/mr2rTXmmGvNy5hjjjnXZ1apVCqVSqVSqVQqa8ptTbokCivri0Ob9E9I8NOixvriYJvW84uQJ3xbzg55y+VAW9pPvr/WmqHvj/n02XcD0zOpzFri23VIyMtxsS0dD9I87NfbSMk2l3CptQX2cbKDkiwO3rx42tq6HOVkquPNTha5xVqd/WLGCti/SS9b+9yHm7RvN3tNOaBJf1r/YO8K9xrbW5u0vUnXpfvf0z3pviT7NZUZy4VRMJLXbLz9/WZtmW3WOup5cYz122YHlA+LQmsHd3cUzomtTTo/yM6z/gmGcS5E4SpA34w1kL0BjpN60BclCEW9g8WR4Zw8N1j7nAuC/MEmvRBkQ6DcSvvn7yZNorAHOZd5c6b12+YidHqp0t826fIoXEe8YuW6C/LvjsIVQsfy3E9ixhwYMtisbh4mSIS28BxWVg8T8MogG8L31j82s6AelKd9Y1gvkxDnMbgedDLKW2JGwwNRsM7o6/AhBrocCDGWYyB7A1b6WX3AXunNIMvpl/pyjw3bk0V4FhNxueA4c/WZBSs8ZZgA86bUn1lkUKTnbVgc/YZNy/gXsVeS7C7r7itJG6aqHR6yrp4PnW508ggyGaESdRCTJMuhME5pzL5H7/T1nAX7Rv+u3CHR9TbNp82PWrct4hrrPkupxEKTTozCDH3P8cS+8+WinPSuywfswOdtbdIZHY223kPrI8Y6R18P0ofd7P94ybp1JWKIdYWJTfU+T78LXqEPXxGl3KnSOdbmHRHk2jOQB4SxXJ+b7uGyJIvQYd5T/2XT5z3VpGttOugbpeRkXzkZneTfobZEaFuUj9n3lJ4bkVO6KsiR0TZ/79tBfyCLK3jUYx+PjLC8xJdRkEEryKzniG9sadtZtby9MOnRwQlHGF9fXqeacU+LbIxjhDH7dPSijfM+9s+CurKYiFJdo54OuaJeL8TgMk6lSE6OgZ2arhkgyOnJS0WYOHESHpeupa9GeVhNkHlDjXtErlUnof2cnwTAe4eSa1+O3GQHZBgMcILIPcfaYpJknpxe36EMUU08aMmhsSk9R8ipxD22HKzGonQoo6N7jFmUtgzIng2yWYzZp2Oz6Maoj8VDIXTuZDZX16F6o7nf2odoMoC8pU8LTTrS6QjyolfFy0QZ3GTdZxK6RZTnyZ16cpomvZKBxvCV5L1YH8daW2YSMxKvp18Zxe5p1iJ6r3RURsT2lvR0olliiEHC0BWEA56c3hPWymXUjEPu8Ify5Hl0IOQ5PskOD/JZ3GFtmVIoynuxCUUPufFDR6svOrm6Rqde0lsIsiKlQdJM9htyPCqy052sBHre+PVh/RQn8+jbjlIEWVy5kEWP7MuXvBEd9kuQjaFvsPV+2s91biVCjjOQTnQUyPxgq++j3qzBlhPqQxM8Glek5AjAn4TqVDPuQ1U+OmI/ZmI5hzIKk0v7dPob5LiiLfr2zaor4y/U1pxetM0sxOuxsMiFEzKEPnLe+SMnw7ttTtfIfBioVcbjQ1HCJnUCMv/hXkb3WLr3BuqfySQcs/+LzFo1frC2vhBDNKEog/qWQnRkTDgMhTHK6am9muRxLLlXXWYxNBSVI416W5JcW5JoO+yxeIciqei8kKnuCtH5naTruG8rwXNiHwlsQt/BSxNcBzCQqytjgUzjST/k9OT89akn9lcH/kcYl1HBQ4h1PYrnc8fVn7rrnHemnN4VDyT8JNSG3vOjTfeMDIhODNHz4QrG7Z9F/j3pWl4QeNYH7l6wT4gHThF5Pv88scHaPHli6sa9P5zQnooDLtDAegiNNYgYJ4Pap4dh5Iy7tCp4tIJEZ5EDvfj/07jvZV/l7+M1/SQ2JhmOBGOdJDky9vxAqDsEysQ+Am13RM7GAJk/9Ip1JU/lqKv6dqheFkKIi6wtgKdi/6eB3TRV6/C+tfnoquyTHY1WFg2COJv0WZPudHJ037H2eUwY7v3BA+xq0uPW/m3N/6vnaGv1T0q/P7s8wIm816QXbWlHoP+xtZ0nz81/Z0soCuhLO5O+0FE179FnGD9gQJ9/neTkb0q/9O/bU7WOHv24yaZ6uUOlnVHgYHWKdVd61elFtPoyMa5O13xa8eDMkJ+Wfj0bk4wx+6NJt6f756zbBiKKe60/RJZT7Et7VCBxVpJzQMT/YrmO46/JRDuo6wnpHtv2dR2qlwUDATpW3ustyx8re2j4I9aGWzl2REECY8k9G6Pabm0jSmCAJ0ehtYdCTCIt/RG8YGkPy2pEfpwUqw11w2i3BbkHo6APBGG5vxfS8/3IffyeiNOIzmy1wF6uSCk6N8G4EArn8tU25VH3XFvZdviDwdUGh87/ZunTErm60u7IUL3K/wgcaqVSmRObbdgH+kqlspfgIMvvnSuVyhoz9Ei/UqlUKpVKZU78C7wloTp19pIaAAAAAElFTkSuQmCC>

[image60]: <data:image/png;base64,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>

[image61]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOkAAAAYCAYAAAAf+dpfAAAGaUlEQVR4Xu2aW6h3QxTAlxByv+SuL0KJotwiJFE88OASxcNXHvi+PIgi8vBJkvLgVnLJCYnc3lxCOlESbyKlTx0SIYmQSy7718w6//VfZ2b27HM6/32+78yvpv/+rzWz957Zs2bWmhmRRqPRaDQajUaj0Wg01h5bu/Rfl77u0jfx+rOpHLNlTsI7+KQckNC9bfRjcqVMv+uY7CVL2+nnLu0g4T0/nWRdxOf3ba/s1KWvKtMXXdo9FFvkKln6DJu+69Lpi7nXMTQcDfKKkx8c5fc5+SzZVSYf7HCng31kot/f6caCzp/r1LNGB95rnfyKLv0UdTc5nXK0BP0/km/bqyXk+UiCwV3epTuj7M34n6TPSkF7/S1Bf0iU7Rivv4/yjVG+LjlNQiPwm2I3CfotTj5L+jo8uj29cETo1P9KeC9mmjHYWcLzf/AKww1Sfkc1wPO9woD+QCfDYJEzwFq+df8tpW+sdXnOK9YDNC6Vf8QrHOSh040Fz+/7wGuJd7v0lIT3wiUfg1KnV5ipmMFyqLHljBhS4VCuv/zmBQbK/O6Fhpr6bJfUVrw232pwqYRn50ZzXKW7vbDAa13a2wsNpY5Uw5/xFxeS9z7Z6Erc2KWTvNCAwZSMxXK9hGff5RWOgyTv6gL3WPBCw5Fd2sPJqC/lbnVyyPUhwhh013mFYcw+OBp8ICrNIlEfYzbQvIRne9dJoVMc5YU9cL+UoWKgl3nhAK7p0ofx+mIJz+G3FvKf4oUSDPQxLyyg36vPqDEwb2TKcZI3thJzEsod5hUFbpdQpuR1jNkHR2NBQqX7OrhduCmhM8eQVAP5Sq4uHXg5vCPThrrSGRRs/KezwxNGVsNtMr0+QP2IyWrBq+C5L3nFQGpc3RRDvq2Ca1xydWE5993mqa00bib55p18FuhoXnJna+qQg7IYKgbKVsRKwC23K6D7yvLbjXIYKoYy1MjZ5qB8LjyopbZ/eIaW00ngWa8w6FabhhLbA8dKqNMvXmEhQ83soY1O7Ddr5iU82++tKbi6pVm2D+rEKH6oVwzkeJm0k0814USKL7t0oRdWwDfluTk3VqHjf+6FhpKxUZZwycOsSxkGilp05i+5uixOkSf1zLVCaqGsj7OkHIdXGSmdhHw3e8WMKHUUmJOVbQ2xVUIMyjP2c7ohcJ8jvFDCffvcuBQYDzEo9z3T6frQmbTPSB+W8iDAPRa8MJLbCqHTUa60GOVhkC19Y+qBnj3XtQpe06teWAEhSWlwkg9kunH0hMy9RsZ/NqFrYMHDnzAppZrRVvcac5T2AEswg2IAlhclvZjUBxv+Z3thpG+QSYGB2hiUvczcHnaKEyQ8szhCd7zgBYbS/ugFknc7OblEuSFxbF8blfSPS9A9amSsOP8V5biUwCTDoQ4OSCB/Pso/kdDfdf3goigHXfjjMIX1Is8xcu5HX/41/udaYdDWAxx2AtDym+NvEd0jZbmehn8myh+KvxhRrYGuFozYuYq8LsMWVCwYKDGkh2cNNVRv7JZSB0uBgab2rHnGEENl8OK5uRCl77uqsaVW1JEzcKRAV9p3TZErw7vT6TG4VD0ot0EmoQZw8MYuJCJHtkXCgE+9749yvAgMmmu8FtpM40P6htaRdRFd4WZA1u9DOfbC4cf4q9CH7HsQuqhcj63iyVT1jUskZKQCnI9kZHg6ys4z+caEI4m8D8fY2Hxn5NPGXw52tEuhg1UJXdCyycbN6gHYxFnoEjy3NOhslGEuuc4mb3XpGAkzLLOJDsIp/DvnksXrbDp3km0KOqvP6xMDkx4R9LzRpTOcTE/GWfivAw3XdobXtvQDhC6UcpTxli69H+XqoXg46WbluhBGeTwSvgN2pfG6gqubOjOd5WMJN2DKvkemt2WGuC6rBfuP2ukecLpGHlwubTc6Re787bZGylhw71PGonhjBGJJv1WlJ8U8xJypxSFmXSvXwxweXGn/Pn0hSRZGKG62QcKsmnqxRmNMvBFwUotZyy7SEW/qYtOJkl7MYnvLrxjj2toVeVztTRJCr/cSclxd3SJknYdDHP79npSlRso1EyDvPRgqxA004QY3GmsJVuRPjddMJHfEa10fINZ8OV7Dg5JeRfWxJGB8akyEH7o4qYf8gVla5Rg0hkYoobEzawt6/YeEUMjel7iU611MvsGogS77Bo1Go9FoNBqNRqPRaCT4Hyv3BG7fVJk3AAAAAElFTkSuQmCC>

[image62]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAeEAAAAYCAYAAADNoEVrAAAMRklEQVR4Xu2de8h92RjHH6HIncklNGaSYoQSIpppokYuf2AMSU1RDPIHRSaZ3+8P5RIJNZHp5Q8MjVIa45YOCoM/0Ihc6iWXEKLInfOZvb6/8/yes9be6+z9vmef97zrU6v37GetfVv7Wc961rPW3q9Zo9FoNBqNRqPRaDQajUaj0Wg0Go1GY8/55zLdPQobe8fLl+leUTgTd7BO7xrb4fJl+nYU1nDLMv0vpE+mvC+rkOM1tl6e9GNfKPGQZfpFZboh7eP5pq2fx6dbV0VPHW+w9fr4c8q7apkuSL/FA2y9vFKO+HxK6dPLdP+0j3iRrZ/Dp98u0x3Pld5//hQFtl6PpfTdZXpB2uc0MdV2zMlty/TBKJyB/4TtO9l63ZXSz5bpbt1upwac5AdF4QB3Cdt3XaYvBVkRCssoPirkfX6ZvprycuBhad/H2vqFiJusK4OhxpCQtJ+26UxQltK5aIzk/dq6jgSorCuTnPTAJD8t/NS6+35ZkFMn70h5Jb5hXf5rl+l+IU881boyP7LVc/pbkr0kbfP3V0mWG+Fx7H9Zly/FpuN99DL9LsmvTvJ95vpl+n2QYQy5f0Ypql85w+90MpxgZM/pdjtVHIXtmAs93zlB7y4JMtos18VoDUeZOjybZF9I2yScxrmvf9t8yrrBAc4T9x7bLEj/cFLoj/gdHR1A/owojDzRuoI8qBLkY0RL6IJK0DHn8kv7LaIg8Uzryj8hZiT+avnj7SN3trKCiFL9iqF8+G8UWHm/nAzwosn7aMxIHFiXj8HaVf4SBSPgHnFaPTdnZHJYIshyTs4+c1S2Y05wZD8ThRuAXRvLFZavJ2QxakWHjDwOpH4TtvcZ6prBgYc6PBNk0j8lBrI5LrZ8/Z+DEQoFvhUzApTBGy1Bfl8njdf1/iCTh/iDIIdroyCBwWKfaLSEvLsHx4w9pGSEPD+3/ucydIz7WD58Wtrvl1GQeLp15UvOE+ch/40xY4eYYgiBhp3T9Vw9luo3J9t3jsp2zM2UZzdF92i/uXr6YRRYd405p3vK+U8a1AH2yIO+YUs9i7DdB8eMjs05So09QhmFfyOPtGEDmjsH5ZE/PsjvYV3YOcfQ9XKsoWvZB1QPJWdEMJfzuih0cIzDKHQwDx8dGrbZ7yDIoWQA6Zz7nhuQHxV9l5hqiP5g3XSNhzBgTlepi9z5Sk7OPpPTmzG2Y2643lL7GCKnC7Vw3qh3F9l6RKXPduaewb4i2+p5nnXrnzyLsN3HW60QBdTinH/EjAx9Cwvea91xorEe4tDqOhJProI8zJeVFGmfGKoHcZ2tNzZR4zzlKBnAPoaul2skf587Ye6v6A07+pycRsehbW475obrxSkewxTdq9U79I2ym9rxfeMntrJXl1u3xihnuxbpL+sUPuLkOYgAZqeziPNzcOYrpsAx+kKeOTTPs8kSbu2T9SgShF0oUwp7bhM5OZukGvCqKNs3PVCD5n82nYclXFV7rYLyLOYq8QrryvQ927mZYghZjFZbZzdbVzaGxBodY2zHLoCDWasDkbG6t4nebWKD9p1L7Xy7nIuuIH9y2M69FQQaZKyhE9R4SSU0l7dph6A5QuZ7ahmaVwTd06Ydy0kCb5p7pD6mwDF2zXmSUjNfxXYMo83JWEMICvXVUOPksChvKjwXVmQPnWvXGGM7doGFja/rsbqH3tW2cdnORmd/PmCrOiHFNndN2NagpgR5a5Gb2kpnlFLiQ9YdoxTCKB1fo/BNqNmn9p5OMjRI7rEUZhYX2PrqR0HnxjFKoWg6xdwaAI3CN+kctQ/XUyL33HILRLYB7/XpemrTELWdsFZS0q76qDlWDTjRjLyPmk2jQJtQYwfetUwXRuExQjtieqePhQ1fd6yXocSajT7Qu5oOXAvdxobL50R9UG0agjK8MST8Nxj6BneapisNjshbs9m1F5VbHSuIc/cdo9TAa8/toTydQwkmzynz3JixZ2gkvPZAA3FFqWfIeSp1gDUGMDK0j0I1vJsoSq+lzEmNMStR2wmPcXKmwGiyZDR2lTG247ipeYVnYeOve6zu1XbC+hZA3yLO0wBfN8tFDjQvrCgsr8p+fZV9O+qESwMb8taizhhpMvpGKLct09Oi0NHXIHgvruQ59O2Xg47VV0LkKuvyL4wZ1n0UQufz4QB9yYmPRQi2b7TVYjOV5zcVrzBpDYQv4pdnhlINvOrCNfRFKF5pqy+d5eirf14s93Mdnr79cqiDLYWi72tdPt6mB0WWgxc/tffCJL/U1p/3J1Le64P8IMnfHuSbUGPMSmhkOMRQKJqPqpD/UidjG6eKj+zwmw+w9MH8FnWKnsfFIg+1/DO+Z5LlPkawbXLX5+He/PoDjKXK6+M0j1hlr0GbpxxfnGO1dYSP1nAM7AELd2i3bPO3z6GZY064Vu80HVSy1/QDis74+uf++f3ZtO1RPUWbrSkQ+hWFeF9l3cd+QB8CiuHfbYDzWxrocU1ajKo68J8kZXEWsoudTBTnhFE2MkqTyXxgoW9VNLB/btR01gontdWHGzaZV1xYWUlkIAgjRp5iq+t4j628FEb3WnLOcn06LTo3UOWieDQ0nBV1fMrnHuZESlCiL3oBpf0fY3m5KO1XQs5TbvGf9C92snBoK4OPUhPlAJ6xdBInz3udvPPun6HgOaqxEJkZiiCUGGsIRU29DdUvhgujpjJX2KqBKxzKdZa+qkWdSzfY15/rFju/TerLZhhDtXHawtj6OwqGbMcl6a/vhOmIFrayc0NRCfLQF+mnd9ypO7aVB5qjHoIyY18xm6J7tdeWGwECeoKNpIyvw+/Y6uuE/hy+bsD3D96JowyROD5ygS2O17Bwv7dF7pkLf09MA8RRbV/Ej869uDBVw2wSowQanl7zwcvJwchZ+/QlP1+hBl9KJWK5XGJ0WoL82HFzLR9323i7eKn3tlVYxsNo7SYrN/w5QEnkUX7RuucmR+F9rlwk1l0pCRpIzMuVi/DsY9mY+kZV5CtCgwIvrDP+3hjxPHxDILTKft4Zw6v9t3Wf32M0/myXtylTDCEcWn6kpNFvLuFYCBkGXimUA4nuct/eeLFfaX6SPB2H/WQgFf6nnliQ4h0jtYlbrfxp0+NkE9tBWyWKI7nu1Zcj5M872zkY7Wk6S/OkgrrydkPQsRI5G4JjjZ0qm6J7nDend7EefbpsVez2OgWvY9ShdCx2uvwm+oAu0Ua1P/V3oEJpG9SG2U+2Gse7pk6PgzPWXYsiwNem7QiyV1vnpF6ftnWvEWxPKUx9jg9bdxAMIxW8D2DEc40Nw+yNFArKCAlKnS0KuIurMQm7qjPm2vcFr/Q0RhSY+SrfMEsNgyRjye+hRU61TDGEwPSH9GwsCi96xxJ99c8+Vy8QQ5Psp+thZJOLJIkbbFW3uw5Oue8s9QaH4DmWDCLl1Cn4iIPycs5NSR6Jz20Tpuge552qd9Sh1zE/Bx4jKvzOrWnw9YTzGK/Jd/IHVl6vsg3oWP9o3TXfaPl/MIPzQR5lvh/yItybD12fGrjpOBf5LOuMjw831CpQY3sQmQDvZdMJa07mSUmOx4wTpZG3kBHGeCmUDY+z8eHUr0TBCLjGKY0R44eTTL34UZ4MFqNWnEUiGIKFfJSNnbDqD+PK/nj8HuaO42iwGFLbIXS9WpiIE3aYfoPyz6S/RJKuSb/9vVJv2A855eR5u3HWyYHzlDpZIheKXoxhiu4pQjYF7k06pikBwW86YkU+2fZz6bGe4MA6/dKAD5srx8jr3ElcrR2JTsqpg5vHIGH4ZNj5/e70GyPtQ0SlysqNqBvHB88Bb5Q5uCuTjG3mgzGEGE7KqOETDros/f5YKgO8aqA50Ict05vT77nAqCyicAPQVxwRb5S9ztLgMW5+ioZ8LeJTXbwlyQkv6zU2omDqrP+eZPDi9Pdt1v9PXnYF6ohpNukAbdcvYiR8/HA734lRHbJAEPtwkXULi5iiYy0JECmQ3bjaVqM6Rjkc6/lpO0fJrmwL9G6s8wne/uH0+vtRp6v7p40q+oQDrHpC92iP1y3T56zTve+lPCJcmn7SFNibbH3h5UmE6SPupdFo7AgY822u/MRA+mhAY52vRcERgnPj3zudCzm2je3Bc+9zzhqNxkz0LUo7avrCpI2ubo5q3UCEkdyuOEBESLapd6cdIipzR0AajcYO4OcxG+vM/bpho9FoNBqNRmNb/B8U0Tm8NKh/AAAAAABJRU5ErkJggg==>

[image63]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEcAAAAYCAYAAACoaOA9AAAB5ElEQVR4Xu2Xuy8FQRTGP6EgJBISr0biH1AQIlEJCY2CQqOnptDqRKJTqNGRaIRKRKnWaEhERKGRSFTiMV/Ozr2z5+5jyGU3Mb/kZHfOOTN79tuzs/cCgUAgUA5ujH0aezD2GJ1fxzLKRTukxjYdqCetkIscKX9P5N9S/rJgH2CvDtSLEcgFeEyiBRJfV/6iOTb2BqltXMXqQhdk8R0dUDDnQzsLhvUMQWpbUrG6wIVpefjm/RUHxhqMdUPq2o2HK5xC9qU0XrXDYhfm5ptHmcTpRLUWbsQ8v6hEa2E8SSAKM6+dljvIxAHl1zTDT5wVVPN87SdwHrvGHb844yTOERcotWMsvgVOQvIulL8I2CmLyud7H8yhQBRmQcVqYHKugqhe3H1aRcDr685zLQ/O5ybepwNJ+IgzDclb1YEC4Kd7TTvhL847ZI9hboeK1XCJ+KJsNY43HR/Hz844i2Fj99+wW5nmBZ86v1BJ5InDuRTG5RDJm3QF+xtn2diUsf3Ivx0dWbyvML/NGdJf6zxxKMycdkLmZAo0C0niuzhqrNHYXuSbcPKKwt64tRkndpIQ1yKxQ7OwDZHJFWThJ2MbiH/em5zzf88YRKh+SBeV7W9DoQwi3qZ83QIOVpi0TTAQCAR8+QLd+5anwz5VmAAAAABJRU5ErkJggg==>

[image64]: <data:image/png;base64,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>

[image65]: <data:image/png;base64,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>

[image66]: <data:image/png;base64,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>

[image67]: <data:image/png;base64,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>

[image68]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGMAAAAYCAYAAADu3kOXAAAD6UlEQVR4Xu2YT+gNURTHj1CKQhRK+ZGNKEoSWVhIKSxIKUsLssNCyEpWSpJioV4WsmEhiYXFxEZZ2NBvYfOSUgorCvlzv787xzvvO+fOvS8PC/Op03vzPXfuzNxz7rl3RqSj4z9mUbCZLHb8fY7Vv2uC/bCOjjQYrGss/iaYEQjA7GBz6v9ZlgSbx2IBuADOTbGHBYe5LASmBZvOIoHz8HBqSmW0F0bP8T3YDBYJXPNLsDvBLpIvx1nJBOOCxAYHgj0LNjnsbuV2sLfB9kvs4+Gw+1cmpGx93a6qj78Fe2X8XpA8tL0FmQjtEOltvGbBAfe4VGLfH8mncHLOkvhczyUmmctKidlgeSLNB/P4HOwDaXgYOxN2SDMAaj3TriLffeMrgfsDW2o9l+kKShRKShtIWB2bM+IP7BtpJqWCBRzne+dNTWE+cZeUBQNtuL6ekBgk5ZL5b+EgVnQ8Csg63IvOMuVWsK+ktYEkzPFY8mMD/27S7ODD3yjdyBg4MICWFbW+lnTLfIltEDiLZqNm2HnjUzDNJ0ir6HgUcP/eAEErLVG4X04QD/TpXUvZJk3/vWDvzDH8y83xFKhrXjBUx5RMgSz0gqE6guKBaeotelX9u13iTN04cGXpB3tK2kKJ97Gv/s0NYk/an9f24fWH0sQ+9WPd075PGn0IHbhUMK6TbtFSlgoG9wl0JnpUwa6a470S27q11ZAqUTdqfZnREGRkqQevmynQ5ykWDTYII5EauD8VjJuSvtGjLEhs+4BFwisL4JM09bY1JLW2WTTwbeUbfl6Di8iVKdYtuTLFOoCeykwPtOcBZfrit4HWJw3Z7wXjHAsJdGeYQoOFNXdkdB/Og657aGRdCix43qBvqPVVpAPvWkBf3PgFryQYqTZ8LS2RldGU0hKF0ocZlyI1S4vBSwtn6yhbW57eqZ2NZhUHD2Baw4cXR0tqoBXdufUkDrbdDUHHIq5crjVeg7CwonyWgKDx81qwiFfmeNL8L+KwNLd0eDgeBGxHYRa04QtW4j8cHiIVDAThEYsS299l0YA1DW0wG7GvtwMFHdtve8z3D/DsmOUl6LVSwK/vDxPBXg5c5aATDYiWKPxaoHGA9G1yXX2MTyncRsHsg493Pcpxid96UHfxQGiLbWkbqyW2Oy3NzxKVRB8WW/zuHPIOKHnRAzoL28AMRylDcl0h30hgMHCxPukl9CWeiz5SYF3AN6w29B7eB9tMvhQInn6eZhYEOyixjQfKGD6BlIAvDblggCPBtrLYkafPgoMmGdYLLucdYwILfm4XpVt8/R61adjdMS6whpUMLoIAW8yOjvFRUv87Ojr+KT8B5U0uerPYDk0AAAAASUVORK5CYII=>

[image69]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIUAAAAYCAYAAADUIj6hAAAEUElEQVR4Xu2ZTahNURTHl1BEISKhh1CiJAyUIUVh4GPEjCIxIeRjhqmBlDJ5GUhhJhOkWybKQCkpUVeJIsmAknzs/9tnvbvu/6xz7jnnvvcK+1er+85/7X3OPvuss9be54kkEolEIpEYQz6z8C8zN9h0FiswR2LfqjwPtozFEn73sPOdpqPO5mC3zfE06R6L0jIa7rcpRySe40OwieSrwj7Jz1eRdXExE/cEexrsRbe7EAyST1ylL9qtYbEHCDz0w+RMzTT8Ls303E0Flki9YK3C22CLWBR/DFMy7QDpVcH84h6U1+bvqmCOMAc6voHsWO2Q8Q2Di/6yQuCx5G/Qg/vtlNjvDukWHUDdoFgusd9GdgQuSPQdJR3aA9L6pSjoca1B0jZk+gTSq3KNhT7IPXjijT1AauOJ2yblJwDjxL+Qpyn3gu2XZkGhD34SOwKXJPr4jYS2nbR+QKlYz6LEMXn3hDLzg7Q64J4tmiGbgPGVjWW4JCKC0fhkxzfE4kxfRTrjBQAiDhrSvWVysL0Sb8ybwF6gD1K3hzcOZBTW+qUoS2D+vGt5gVqXL8HmBzsR7Bb5qoK5xlhsJsUzfmSOkQiG0FrDQaE61hh18R4Q+Jj9NgkKrc2n2SExxcKH8gLeZ8dsCrIia2Cto1k0M3q0gz0hbZbE9ruzX++aVZkp8fpNGZR4bfui3pSC56sRVBQUdWvaOYn9VpP+LtiK7O8mQaGlw7Njpp0Fvi2kYSuJCfayCFIra5a7EnceTFHpuJ7pA0ZDQOI8Yw3PmZrLSAcF+vxkUeJaQmkSFPr2M3h7cD3+bqDlDxnG0s5+vYU0jj+RZuH2ihdg4Jvk9V5rDMy73W2MBJqx7ktnx3E42FfbyNKrfLBeBh6OtwjjIGkSFGjPE6xoANj0jbexqD2Aj9cH0Nx0mlE0F23xrwWtTRp2a0VBofMC62dByWjGmkd64b1qreYbxsIGurf983gp+ZoKdBdTZlVAO2QLDyyG4bd7eEx+2bnhs6VA36YZRrOgLRbKHkX3Ac3Oqy7qW0ZjsIuCjSRexsJYSj+EIY1wnauyJVWuStyqWcr6asmqmin0+wSvDxSMH/7ZRuPJt18UcR4eH94mTadeWuX2FvgGJU60LWPQEWzK5UzrZ8HYBFyzbPwuByVfk3GTfCKUAS4F2CY9C7aLjPta6gaFfoPg9QF4KNGHGmmBtiP7e2GwBR2XG/BI6QgMwHOxUvKlxoJzrZP4PcS+5dBt5sExz99YgOsWlaxS0FEnQ0sHfi0ccbYGsrU6zbrgdvZ8DMbDbdmwh/fSOnx4yK+CXSEfgP9GsLMSH9RxieXnlOTP913ymdCCc52RfIZpSfRpedva5R1dsPXkuVKrBbZ26NQm/W9kvMRv+t7XTwA/Mpr9pxwyyCZzrHDmYHAN/ryuYPuLf0gVjSPxF4IVu/fPr8R/DEpMIjEMUj7WE4nEMPhHFu9qEolEIiF/AFRqcUQWpy+EAAAAAElFTkSuQmCC>

[image70]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAYCAYAAAAMAljuAAADnklEQVR4Xu2YTahNURTHl1Dko0Qk9EoMFBkIKSMhBhQDFHMGRibK6EkGDHkDST1GykxiIIM78zVgoJSom5SRlJiQj/2393p33f9Z+5z37nneHdi/Wt27/2vvs8/Z65y9194ihUKhUPgP+c3CdLKMBWJpsBUsZlgZbCGLxDwWJkFH4iDk7JXE+5wJZgU7Tpq9F/jBKqPdT1ojqPyNRQP8L4LdTP/n9nl7PJPovx7sc7DD/e4J7kqsNwgIpD4gAq/gv+oLjA5mB9tDWluOBZvDosRx+kHacon3tZv0PjYFexlsn+QDgijDN590aGtIQwBOmPIvqQ76+2CXJfbFvqmAtp9YlDhAGhSLp7Uldz3oZ0nDl5Sr75ILyEnxLwTtiSmfSprlQ7CfpCltAqKDfoUd0vt68DJYoHVJa8MO6X9+BdM++sI0ZXme9EmTCwg+Pe9C0KzO5SbaBARvH9ouYkfgnUQfpggLtJ2ktQEB51kDjIv/XN5LUksuILmBZl3LR83/S8bPtAmIDjqzWqL+KJV1mmDTxGSX0Sw6TXvrg/KRhUTuuaA9SL+w79Jb9F1QaToCYhd7LPAPTdmSu/Em7BrB9tjUs2C6QBAtp4NdSP/RdqvxXZTqomzZIPlsE9fqkoYvGbq+KCD3Uk0A53QExLI/aV4aOmhAMO2gHQaFGRXfB+0MaZg+8IZiLYDffg14++vS0w4LBq8vZJr8rI1ryr8IyJak3SIdDBqQrtS34/tAcHjALZwJIl1Gea3RLEvEHyegz8t9IRvskMb3WQFOr6NcQ9a5DPQGO6SDQQPi9WNhPzKxpvqvTRn7hLr6YxKnO49x8ac6XO+go9X189fpBQSdeA2h2X2A14EGBKkz0yYgX1hMaEJxz2h8X5zpwGfXD6TqWp/3EqDunuHTNm/SL04roNtTCWRn0LBVyIIKXkB0h8kZATTsVJVO0iy6h+G2YJCA6B7jBjsC68R/BmgYZIXbwm93+yjrfXkbT3whHjrwyPSAfQmh22nsjsRNdAW9iGeWkaRhccYRBB7a+2yRRbyVmGldlep1APejVnfupScJTXZEGxjw4NicnpeYajJoh+fRqQpZIX5xtMNv8CiVGfSDkwoe7PUS+x6ReG2MUWu2B/sq8cIHyGe5JrHTp+JvnIbBXqlmXpZtwQ6ZMupuNmWFpzuPc8EWsyjxmAlHRrkzwMIUwaJ8m8XC8MA6lNsMFoaAd5BYGBLI7jayWCgUZoo/V6tUi8ZTtvsAAAAASUVORK5CYII=>

[image71]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAXCAYAAAD6FjQuAAABEUlEQVR4XmNgGAXDCfwHYh40sbdArIPEB8nPB2JuJDEQAOkFYWU0caygmAG7ZV+h4ugYGbxDYjcAsSESHwOALLrDgNuyaUB8AYgb0eRAwBiI9dHEHqHxUcA/BogmXJbhA0pA7IEm9hCNDweboTS5loFAEBDbMkD0fkGTgwMVIH4NZeOzbDJUDoZlUFRAAAcQS6ILIoP3SGxclj1H4ysyQNQJo4njBeEMqAbjsgwbAKk7jS6IC7AyYCZfUi1D148TLGRAjQN0DEsUF6F8MSgfBkiyDBsoZ8D02SeoGCiekAFI7DeaGEkAm2Wg5HwXiQ8CoLhGV0c0ACVXXMEIAtsZICUHMwMkyYPkryDJj4JRMEQAAM0gTqgKMrWFAAAAAElFTkSuQmCC>
