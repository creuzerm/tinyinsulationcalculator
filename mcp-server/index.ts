import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools";
import { registerResources } from "./resources";
import { registerPrompts } from "./prompts";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "tiny-insulation-calculator",
    version: "1.0.0",
  });

  registerTools(server);
  registerResources(server);
  registerPrompts(server);

  return server;
}

async function main(): Promise<void> {
  const server = createServer();

  if (process.argv.includes("--sse")) {
    const http = await import("http");
    const { SSEServerTransport } = await import(
      "@modelcontextprotocol/sdk/server/sse.js"
    );

    const port = Number(process.env.PORT) || 3001;
    let sseTransport: InstanceType<typeof SSEServerTransport> | null = null;

    const httpServer = http.createServer(async (req, res) => {
      if (req.url === "/sse") {
        sseTransport = new SSEServerTransport("/messages", res);
        await server.connect(sseTransport);
      } else if (req.url === "/messages" && req.method === "POST") {
        if (sseTransport) {
          await sseTransport.handlePostMessage(req, res);
        } else {
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("SSE session not established yet");
        }
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
      }
    });

    httpServer.listen(port, () => {
      console.error(
        `Tiny Insulation Calculator MCP Server listening on http://localhost:${port}/sse`
      );
    });
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error in MCP Server:", error);
    process.exit(1);
  });
}
