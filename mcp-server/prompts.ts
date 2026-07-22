import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer): void {
  server.prompt(
    "audit_tiny_home_insulation",
    {
      buildingShape: z
        .enum(["rectangle", "a-frame", "gothic-arch", "cargo-van"])
        .describe("The general structural shape of the tiny home or vehicle"),
      locationOrClimate: z
        .string()
        .optional()
        .describe("Location, climate zone, or outdoor design winter temperature"),
    },
    (args) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Please conduct a detailed thermal insulation and heat loss audit for a ${
              args.buildingShape
            } tiny structure${
              args.locationOrClimate ? ` located in/designed for ${args.locationOrClimate}` : ""
            }.

Use the available tools:
1. Use \`calculate_heat_loss\` to calculate envelope heat loss, infiltration, and heating requirements.
2. Use \`calculate_assembly_rvalue\` to evaluate specific wall, roof, or floor insulation layer stacks.
3. Use \`estimate_r_value_from_hvac\` if empirical HVAC energy data is available.
4. Use \`run_passive_simulation\` to simulate thermal battery and temperature float over a 24-hour diurnal cycle.

Provide actionable recommendations on continuous insulation, thermal bridging mitigation (especially for steel/van ribs), and window/door solar gain balance.`,
          },
        },
      ],
    })
  );
}
