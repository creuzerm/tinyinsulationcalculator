import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as path from "path";

// Import core calculation engines from the parent directory
// eslint-disable-next-line @typescript-eslint/no-var-requires
const calculator = require("../calculator.js");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const insulationCalculator = require("../insulation_calculator.js");

// Pure-function estimator helper for headless R-Value estimation
function estimateRValueHeadless(args: {
  spaceLength: number;
  spaceWidth: number;
  spaceHeight: number;
  tIndoorAir: number;
  tOutdoorAir: number;
  qHvac: number;
  hvacMode?: string;
  targetComponentArea: number;
  achRate?: number;
  areaWindows?: number;
  areaOtherWallsCeilings?: number;
  areaFloor?: number;
  tTargetSurfaceIndoor?: number;
  tTargetSurfaceOutdoor?: number;
}) {
  const BTU_TO_W = 0.293071;
  const FT_TO_M = 0.3048;
  const R_VALUE_IMPERIAL_TO_SI = 0.1761101838;
  const AIR_DENSITY_KG_PER_M3 = 1.2;
  const AIR_SPECIFIC_HEAT_J_PER_KG_K = 1000;

  const DEFAULT_U_WINDOWS = 2.8;
  const DEFAULT_U_OTHER_WALLS_CEILINGS = 0.5;
  const DEFAULT_U_FLOOR = 0.3;

  const fahrenheitToCelsius = (f: number) => (f - 32) * (5 / 9);

  let qHvacBtuh = args.qHvac;
  if (args.hvacMode === "cooling") {
    qHvacBtuh = -Math.abs(qHvacBtuh);
  } else {
    qHvacBtuh = Math.abs(qHvacBtuh);
  }

  const spaceVolumeM3 = args.spaceLength * args.spaceWidth * args.spaceHeight * FT_TO_M ** 3;
  const tIndoorAirC = fahrenheitToCelsius(args.tIndoorAir);
  const tOutdoorAirC = fahrenheitToCelsius(args.tOutdoorAir);
  const deltaT_Air_C = tIndoorAirC - tOutdoorAirC;

  if (deltaT_Air_C === 0) {
    throw new Error("Temperature difference between indoor and outdoor air cannot be zero.");
  }

  const qHvacW = qHvacBtuh * BTU_TO_W;
  const targetComponentAreaM2 = args.targetComponentArea * FT_TO_M ** 2;
  const areaWindowsM2 = (args.areaWindows || 0) * FT_TO_M ** 2;
  const areaOtherWallsCeilingsM2 = (args.areaOtherWallsCeilings || 0) * FT_TO_M ** 2;
  const areaFloorM2 = (args.areaFloor || 0) * FT_TO_M ** 2;
  const achRate = args.achRate || 0.5;

  const qWindows = DEFAULT_U_WINDOWS * areaWindowsM2 * deltaT_Air_C;
  const qOtherWallsCeilings = DEFAULT_U_OTHER_WALLS_CEILINGS * areaOtherWallsCeilingsM2 * deltaT_Air_C;
  const qFloor = DEFAULT_U_FLOOR * areaFloorM2 * deltaT_Air_C;
  const qInfiltration =
    ((spaceVolumeM3 * achRate) / 3600) *
    AIR_DENSITY_KG_PER_M3 *
    AIR_SPECIFIC_HEAT_J_PER_KG_K *
    deltaT_Air_C;

  const qTargetComponentW = qHvacW - (qWindows + qOtherWallsCeilings + qFloor + qInfiltration);
  const qFluxTargetComponentW_per_m2 = qTargetComponentW / targetComponentAreaM2;

  const estimatedRValueSIOverall = deltaT_Air_C / qFluxTargetComponentW_per_m2;
  const estimatedRValueImperialOverall = estimatedRValueSIOverall / R_VALUE_IMPERIAL_TO_SI;

  let estimatedRValueImperialMaterial: string | undefined;
  let estimatedRValueSIMaterial: string | undefined;

  if (
    args.tTargetSurfaceIndoor !== undefined &&
    args.tTargetSurfaceOutdoor !== undefined
  ) {
    const tTargetSurfaceIndoorC = fahrenheitToCelsius(args.tTargetSurfaceIndoor);
    const tTargetSurfaceOutdoorC = fahrenheitToCelsius(args.tTargetSurfaceOutdoor);
    const deltaT_Surface_C = tTargetSurfaceIndoorC - tTargetSurfaceOutdoorC;

    if (deltaT_Surface_C !== 0) {
      const estimatedRValueSIMat = deltaT_Surface_C / qFluxTargetComponentW_per_m2;
      const estimatedRValueImpMat = estimatedRValueSIMat / R_VALUE_IMPERIAL_TO_SI;
      estimatedRValueImperialMaterial = estimatedRValueImpMat.toFixed(2);
      estimatedRValueSIMaterial = estimatedRValueSIMat.toFixed(2);
    }
  }

  return {
    rValueImperialOverall: estimatedRValueImperialOverall.toFixed(2),
    rValueSIOverall: estimatedRValueSIOverall.toFixed(2),
    rValueImperialMaterial: estimatedRValueImperialMaterial,
    rValueSIMaterial: estimatedRValueSIMaterial,
  };
}

export function registerTools(server: McpServer): void {
  // -------------------------------------------------------------
  // Tool 1: calculate_heat_loss
  // -------------------------------------------------------------
  server.tool(
    "calculate_heat_loss",
    "Calculate tiny structure envelope heat loss, UA values, floor coupling, infiltration loss, and total heating load (BTU/hr & Watts).",
    {
      buildingShape: z
        .enum(["rectangle", "a-frame", "gothic-arch", "cargo-van"])
        .describe("Structural shape of the building"),
      length: z.number().positive().describe("Length in feet"),
      width: z.number().positive().describe("Width in feet"),
      height: z.number().positive().describe("Wall/Peak height in feet"),
      roofPitch: z.number().nonnegative().optional().default(4).describe("Roof pitch (rise over 12)"),
      springWallHeight: z.number().nonnegative().optional().default(2).describe("Spring wall height in feet for Gothic Arch"),
      indoorTemp: z.number().optional().default(70).describe("Indoor target design temperature in °F"),
      outdoorTemp: z.number().optional().default(20).describe("Outdoor design winter temperature in °F"),
      groundTemp: z.number().optional().default(50).describe("Ground design temperature in °F"),
      wallAssemblyType: z.enum(["stick", "mass"]).optional().default("stick"),
      wallStudSize: z.enum(["2x4", "2x6", "2x8", "2x10", "2x12"]).optional().default("2x4"),
      wallStudMaterial: z.enum(["wood", "wood_truss", "steel", "van_ribs"]).optional().default("wood"),
      wallStudSpacing: z.enum(["16", "24"]).optional().default("16"),
      wallCavityInsulation: z.string().optional().default("fiberglass_batt"),
      wallContinuousInsulation: z.number().nonnegative().optional().default(0),
      wallFastenerType: z.enum(["galvanized", "stainless", "adhesive"]).optional().default("galvanized"),
      wallFastenerDensity: z.number().nonnegative().optional().default(0),
      wallMassMaterial: z.string().optional().default("cmu_standard"),
      wallMassThickness: z.number().positive().optional().default(8),
      wallMassInsulation: z.number().nonnegative().optional().default(0),
      roofRValue: z.number().positive().optional().default(30).describe("Effective Roof R-value"),
      floorRValue: z.number().positive().optional().default(19).describe("Effective Floor R-value"),
      windowArea: z.number().nonnegative().optional().default(20).describe("Window area in sq ft"),
      windowRValue: z.number().positive().optional().default(2).describe("Window R-value"),
      doorArea: z.number().nonnegative().optional().default(20).describe("Door area in sq ft"),
      doorRValue: z.number().positive().optional().default(3).describe("Door R-value"),
      airSealing: z.enum(["passive_house", "tight", "good", "average", "leaky", "poor"]).optional().default("average").describe("Air tightness rating"),
      skirtRValue: z.number().nonnegative().optional().default(0).describe("Skirting R-value"),
      skirtHeight: z.number().nonnegative().optional().default(0).describe("Skirting height in feet"),
      skirtSeal: z.enum(["sealed", "vented", "leaky"]).optional().default("vented"),
      massFloorMaterial: z.enum(["concrete", "stone", "rammed_earth", "packed_soil", "wood", "metal"]).optional().default("wood"),
      slabThickness: z.number().positive().optional().default(4).describe("Floor slab thickness in inches"),
    },
    async (args) => {
      // Calculate effective wall R-value
      const wallAssembly = {
        type: args.wallAssemblyType,
        studSize: args.wallStudSize,
        studMaterial: args.wallStudMaterial,
        spacing: args.wallStudSpacing,
        cavityInsulation: args.wallCavityInsulation,
        continuousInsulation: args.wallContinuousInsulation,
        fastenerType: args.wallFastenerType,
        fastenerDensity: args.wallFastenerDensity,
        massMaterial: args.wallMassMaterial,
        massThickness: args.wallMassThickness,
        massInsulation: args.wallMassInsulation,
      };

      const rWall = calculator.calculateEffectiveR(wallAssembly, "wall");

      // Calculate surface areas manually via pure calculation
      const L = args.length;
      const W = args.width;
      const H = args.height;
      const pitch = args.roofPitch;
      const shape = args.buildingShape;

      const areas = { wall: 0, roof: 0, floor: 0, perimeter: 0, total: 0 };
      if (shape === "rectangle") {
        areas.wall = 2 * L * H + 2 * W * H;
        areas.floor = L * W;
        areas.perimeter = 2 * L + 2 * W;
        if (pitch === 0) {
          areas.roof = L * W;
        } else {
          const rise = (W / 2) * (pitch / 12);
          const slope = Math.sqrt((W / 2) ** 2 + rise ** 2);
          const gableArea = 2 * (0.5 * W * rise);
          areas.roof = 2 * L * slope + gableArea;
        }
      } else if (shape === "a-frame") {
        const slope = Math.sqrt((W / 2) ** 2 + H ** 2);
        areas.roof = 2 * L * slope;
        areas.wall = W * H;
        areas.floor = L * W;
        areas.perimeter = 2 * L + 2 * W;
      } else if (shape === "gothic-arch") {
        const spring = args.springWallHeight || 2;
        const r = W / 2;
        areas.floor = L * W;
        areas.wall = 2 * L * spring + Math.PI * r ** 2 + 2 * W * spring;
        areas.roof = L * (Math.PI * r);
        areas.perimeter = 2 * L + 2 * W;
      } else if (shape === "cargo-van") {
        areas.floor = L * W;
        areas.roof = L * W;
        areas.wall = 2 * L * H + 2 * W * H;
        areas.perimeter = 2 * L + 2 * W;
      }
      areas.total = areas.wall + areas.roof;

      const data = {
        buildingShape: args.buildingShape,
        height: args.height,
        rWall,
        rRoof: args.roofRValue,
        rFloor: args.floorRValue,
        wArea: args.windowArea,
        wR: args.windowRValue,
        dArea: args.doorArea,
        dR: args.doorRValue,
        tightness: args.airSealing,
        skirtR: args.skirtRValue,
        skirtHeight: args.skirtHeight,
        skirtSeal: args.skirtSeal,
        massMat: args.massFloorMaterial,
        thickness: args.slabThickness,
      };

      const dtAir = Math.max(0, args.indoorTemp - args.outdoorTemp);
      const dtGround = Math.max(0, args.indoorTemp - args.groundTemp);

      const loss = calculator.calculateHeatLoss(areas, data, dtAir, dtGround);
      const capacity = calculator.calculateMassCapacity(areas, data);

      const totalLossBTU = Math.round(loss.totalLoss);
      const totalLossWatts = Math.round(totalLossBTU * 0.293071);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                summary: {
                  heatingLoadBTUPerHour: totalLossBTU,
                  heatingLoadWatts: totalLossWatts,
                  totalUA: Number(loss.ua.toFixed(2)),
                  effectiveWallRValue: Number(rWall.toFixed(2)),
                  thermalMassCapacityBTUPerDegreeF: Math.round(capacity),
                  temperatureDropRateFPerHour: Number(
                    (loss.totalLoss / Math.max(capacity, 1)).toFixed(2)
                  ),
                },
                surfaceAreasSquareFeet: {
                  wall: Math.round(areas.wall),
                  roof: Math.round(areas.roof),
                  floor: Math.round(areas.floor),
                  perimeterFeet: Math.round(areas.perimeter),
                  totalEnvelope: Math.round(areas.total),
                },
                heatLossBreakdownBTUPerHour: {
                  wall: Math.round(loss.breakdown.Wall),
                  roof: Math.round(loss.breakdown.Roof),
                  window: Math.round(loss.breakdown.Window),
                  door: Math.round(loss.breakdown.Door),
                  floor: Math.round(loss.breakdown.Floor),
                  infiltration: Math.round(loss.breakdown.Infiltration),
                },
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // -------------------------------------------------------------
  // Tool 2: calculate_assembly_rvalue
  // -------------------------------------------------------------
  server.tool(
    "calculate_assembly_rvalue",
    "Calculate effective Winter and Summer R-values for a custom insulation layer stack assembly (with radiant barrier and compression checks).",
    {
      layers: z
        .array(
          z.object({
            name: z.string().describe("Layer material name"),
            type: z
              .enum(["insulation", "structure", "air", "radiant", "sheathing"])
              .describe("Layer classification type"),
            r: z.number().nonnegative().describe("Nominal R-value of layer"),
            thickness: z.number().nonnegative().describe("Thickness in inches"),
          })
        )
        .describe("Ordered list of assembly layers from exterior to interior"),
    },
    async (args) => {
      const result = insulationCalculator.calculate(args.layers);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                rValueWinter: Number(result.r_winter),
                rValueSummer: Number(result.r_summer),
                warnings: result.warnings,
                notes: result.notes,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // -------------------------------------------------------------
  // Tool 3: estimate_r_value_from_hvac
  // -------------------------------------------------------------
  server.tool(
    "estimate_r_value_from_hvac",
    "Reverse-engineer an unknown component's R-value from empirical HVAC power consumption, space dimensions, and temperatures.",
    {
      spaceLength: z.number().positive().describe("Space length in feet"),
      spaceWidth: z.number().positive().describe("Space width in feet"),
      spaceHeight: z.number().positive().describe("Space ceiling height in feet"),
      tIndoorAir: z.number().describe("Indoor air temperature in °F"),
      tOutdoorAir: z.number().describe("Outdoor air temperature in °F"),
      qHvac: z.number().describe("HVAC power output in BTU/hr"),
      hvacMode: z.enum(["heating", "cooling"]).optional().default("heating"),
      targetComponentArea: z.number().positive().describe("Target component surface area in sq ft"),
      achRate: z.number().nonnegative().optional().default(0.5).describe("Air changes per hour"),
      areaWindows: z.number().nonnegative().optional().default(0).describe("Window area in sq ft"),
      areaOtherWallsCeilings: z.number().nonnegative().optional().default(0).describe("Area of other walls/ceilings in sq ft"),
      areaFloor: z.number().nonnegative().optional().default(0).describe("Floor area in sq ft"),
      tTargetSurfaceIndoor: z.number().optional().describe("Indoor surface temperature in °F"),
      tTargetSurfaceOutdoor: z.number().optional().describe("Outdoor surface temperature in °F"),
    },
    async (args) => {
      const result = estimateRValueHeadless(args);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // -------------------------------------------------------------
  // Tool 4: run_passive_simulation
  // -------------------------------------------------------------
  server.tool(
    "run_passive_simulation",
    "Run 24-hour or 7-day finite-difference passive thermal simulation to model indoor temperature float without heating.",
    {
      buildingShape: z.enum(["rectangle", "a-frame", "gothic-arch", "cargo-van"]).optional().default("rectangle"),
      length: z.number().positive().optional().default(20),
      width: z.number().positive().optional().default(10),
      height: z.number().positive().optional().default(8),
      roofPitch: z.number().nonnegative().optional().default(4),
      indoorTemp: z.number().optional().default(70),
      groundTemp: z.number().optional().default(50),
      wallRValue: z.number().positive().optional().default(13),
      roofRValue: z.number().positive().optional().default(30),
      floorRValue: z.number().positive().optional().default(19),
      windowArea: z.number().nonnegative().optional().default(20),
      simDuration: z.number().positive().optional().default(24).describe("Simulation duration in hours (24 or 168)"),
      simLowTemp: z.number().optional().default(15).describe("Diurnal outdoor low temp in °F"),
      simHighTemp: z.number().optional().default(35).describe("Diurnal outdoor high temp in °F"),
      simInternalGain: z.number().nonnegative().optional().default(300).describe("Internal heat gains in BTU/hr"),
      vehicleColor: z.enum(["light", "dark"]).optional().default("light"),
      massFloorMaterial: z.enum(["concrete", "stone", "rammed_earth", "packed_soil", "wood", "metal"]).optional().default("wood"),
      slabThickness: z.number().positive().optional().default(4),
    },
    async (args) => {
      const L = args.length;
      const W = args.width;
      const H = args.height;
      const pitch = args.roofPitch;
      const shape = args.buildingShape;

      const areas = { wall: 0, roof: 0, floor: 0, perimeter: 0, total: 0 };
      if (shape === "rectangle") {
        areas.wall = 2 * L * H + 2 * W * H;
        areas.floor = L * W;
        areas.perimeter = 2 * L + 2 * W;
        areas.roof = pitch === 0 ? L * W : 2 * L * Math.sqrt((W / 2) ** 2 + ((W / 2) * (pitch / 12)) ** 2) + 2 * (0.5 * W * ((W / 2) * (pitch / 12)));
      } else {
        areas.floor = L * W;
        areas.roof = L * W;
        areas.wall = 2 * L * H + 2 * W * H;
        areas.perimeter = 2 * L + 2 * W;
      }
      areas.total = areas.wall + areas.roof;

      const dataA = {
        rWall: args.wallRValue,
        rRoof: args.roofRValue,
        rFloor: args.floorRValue,
        wArea: args.windowArea,
        wR: 2,
        dArea: 0,
        dR: 3,
        tightness: "average",
        skirtR: 0,
        skirtHeight: 0,
        skirtSeal: "vented",
        massMat: args.massFloorMaterial,
        thickness: args.slabThickness,
      };

      const dtAir = Math.max(0, args.indoorTemp - args.simLowTemp);
      const dtGround = Math.max(0, args.indoorTemp - args.groundTemp);

      const lossA = calculator.calculateHeatLoss(areas, dataA, dtAir, dtGround);
      const capA = calculator.calculateMassCapacity(areas, dataA);

      const simResult = calculator.calculateSimulationData({
        isAB: false,
        lossA,
        lossB: null,
        capA,
        capB: null,
        tIn: args.indoorTemp,
        tGround: args.groundTemp,
        duration: args.simDuration,
        low: args.simLowTemp,
        high: args.simHighTemp,
        iGain: args.simInternalGain,
        buildingShape: shape,
        vehicleColor: args.vehicleColor,
        windowArea: args.windowArea,
      });

      const minIndoorTemp = Number(Math.min(...simResult.simA).toFixed(1));
      const maxIndoorTemp = Number(Math.max(...simResult.simA).toFixed(1));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                simulationSummary: {
                  durationHours: args.simDuration,
                  outdoorLowTempF: args.simLowTemp,
                  outdoorHighTempF: args.simHighTemp,
                  minIndoorTempF: minIndoorTemp,
                  maxIndoorTempF: maxIndoorTemp,
                  thermalBatteryCapacityBTUPerF: Math.round(capA),
                },
                hourlyData: simResult.simA.map((temp: number, index: number) => ({
                  hour: index,
                  outdoorTempF: Number(simResult.simOut[index].toFixed(1)),
                  indoorTempF: Number(temp.toFixed(1)),
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}
