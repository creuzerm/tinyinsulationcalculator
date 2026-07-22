import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as fs from "fs";
import * as path from "path";

export function registerResources(server: McpServer): void {
  const rootDir = path.resolve(__dirname, "..");

  server.resource(
    "materials-library",
    "materials://library",
    async (uri) => {
      const filePath = path.join(rootDir, "materials.json");
      const content = fs.readFileSync(filePath, "utf-8");
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: content,
          },
        ],
      };
    }
  );

  server.resource(
    "internal-gains-library",
    "internal_gains://library",
    async (uri) => {
      const filePath = path.join(rootDir, "internal_gains.json");
      const content = fs.readFileSync(filePath, "utf-8");
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: content,
          },
        ],
      };
    }
  );
}
