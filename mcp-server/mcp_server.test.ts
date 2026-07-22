import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "./index";

describe("Tiny Insulation Calculator MCP Server Integration Tests", () => {
  let client: Client;

  beforeAll(async () => {
    const server = createServer();
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    client = new Client(
      {
        name: "test-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);
  });

  test("should list all 4 registered tools", async () => {
    const result = await client.listTools();
    const toolNames = result.tools.map((t) => t.name);

    expect(toolNames).toContain("calculate_heat_loss");
    expect(toolNames).toContain("calculate_assembly_rvalue");
    expect(toolNames).toContain("estimate_r_value_from_hvac");
    expect(toolNames).toContain("run_passive_simulation");
  });

  test("should execute calculate_heat_loss tool with valid output", async () => {
    const response = await client.callTool({
      name: "calculate_heat_loss",
      arguments: {
        buildingShape: "rectangle",
        length: 20,
        width: 10,
        height: 10,
        roofPitch: 0,
        indoorTemp: 70,
        outdoorTemp: 20,
        groundTemp: 50,
        roofRValue: 10,
        floorRValue: 10,
        windowArea: 0,
        doorArea: 0,
        airSealing: "good",
      },
    });

    expect(response.content).toHaveLength(1);
    expect(response.content[0].type).toEqual("text");

    const textOutput = (response.content[0] as { type: "text"; text: string }).text;
    console.log("CALCULATE_HEAT_LOSS OUTPUT:", textOutput);
    const data = JSON.parse(textOutput);
    expect(data.summary.heatingLoadBTUPerHour).toBeGreaterThan(3000);
    expect(data.summary.heatingLoadBTUPerHour).toBeLessThan(6000);
    expect(data.surfaceAreasSquareFeet.wall).toBe(600);
    expect(data.surfaceAreasSquareFeet.roof).toBe(200);
    expect(data.surfaceAreasSquareFeet.floor).toBe(200);
  });

  test("should execute calculate_assembly_rvalue tool", async () => {
    const response = await client.callTool({
      name: "calculate_assembly_rvalue",
      arguments: {
        layers: [
          { name: "Outside Air Film", type: "sheathing", r: 0.17, thickness: 0 },
          { name: "Plywood Sheathing", type: "sheathing", r: 0.62, thickness: 0.5 },
          { name: "Fiberglass Batt", type: "insulation", r: 13, thickness: 3.5 },
          { name: "Gypsum Board", type: "sheathing", r: 0.45, thickness: 0.5 },
        ],
      },
    });

    const data = JSON.parse((response.content[0] as { type: "text"; text: string }).text);
    expect(data.rValueWinter).toBeGreaterThan(13);
    expect(data.rValueSummer).toBeGreaterThan(13);
  });

  test("should execute estimate_r_value_from_hvac tool", async () => {
    const response = await client.callTool({
      name: "estimate_r_value_from_hvac",
      arguments: {
        spaceLength: 20,
        spaceWidth: 10,
        spaceHeight: 8,
        tIndoorAir: 70,
        tOutdoorAir: 20,
        qHvac: 5000,
        hvacMode: "heating",
        targetComponentArea: 600,
        achRate: 0.5,
        areaWindows: 20,
        areaOtherWallsCeilings: 200,
        areaFloor: 200,
      },
    });

    const data = JSON.parse((response.content[0] as { type: "text"; text: string }).text);
    expect(data.rValueImperialOverall).toBeDefined();
    expect(parseFloat(data.rValueImperialOverall)).toBeGreaterThan(0);
  });

  test("should execute run_passive_simulation tool", async () => {
    const response = await client.callTool({
      name: "run_passive_simulation",
      arguments: {
        buildingShape: "rectangle",
        length: 20,
        width: 10,
        height: 8,
        simDuration: 24,
        simLowTemp: 15,
        simHighTemp: 35,
        simInternalGain: 300,
      },
    });

    const data = JSON.parse((response.content[0] as { type: "text"; text: string }).text);
    expect(data.simulationSummary.durationHours).toBe(24);
    expect(data.hourlyData).toHaveLength(25);
  });

  test("should list and read materials resource", async () => {
    const resources = await client.listResources();
    const uris = resources.resources.map((r) => r.uri);
    expect(uris).toContain("materials://library");
    expect(uris).toContain("internal_gains://library");

    const readResponse = await client.readResource({ uri: "materials://library" });
    expect(readResponse.contents).toHaveLength(1);

    const materialsData = JSON.parse((readResponse.contents[0] as { text: string }).text);
    expect(materialsData).toBeDefined();
  });

  test("should list and get audit prompt preset", async () => {
    const prompts = await client.listPrompts();
    const names = prompts.prompts.map((p) => p.name);
    expect(names).toContain("audit_tiny_home_insulation");

    const promptResponse = await client.getPrompt({
      name: "audit_tiny_home_insulation",
      arguments: {
        buildingShape: "rectangle",
        locationOrClimate: "Zone 5 Winter (-5°F)",
      },
    });

    const messageContent = promptResponse.messages[0].content as { type: "text"; text: string };
    expect(messageContent.text).toContain("rectangle");
    expect(messageContent.text).toContain("Zone 5 Winter");
  });
});
