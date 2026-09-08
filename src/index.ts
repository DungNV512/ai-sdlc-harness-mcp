#!/usr/bin/env node
/**
 * ai-sdlc-harness-mcp
 *
 * A small MCP server built for the AI-SDLC harness POC (Stockbook project).
 * First tool: create_confluence_page, a working alternative to Atlassian's
 * hosted Rovo MCP `createConfluencePage`, which returned a persistent 404
 * in our testing (see README.md for the full writeup).
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { createConfluencePage, loadConfigFromEnv } from "./confluence.js";

const CreateConfluencePageInputSchema = z.object({
  spaceId: z
    .string()
    .describe("Numeric Confluence space ID, or a space key (e.g. 'DAS') to resolve automatically."),
  title: z.string().describe("Title of the new page."),
  bodyHtml: z
    .string()
    .describe(
      "Page body in Confluence 'storage format' HTML (not Markdown, not the visual editor's format)."
    ),
  parentId: z.string().optional().describe("Optional numeric ID of the parent page."),
  status: z
    .enum(["current", "draft"])
    .optional()
    .describe("Page status. Defaults to 'current' (published)."),
});

const server = new Server(
  {
    name: "ai-sdlc-harness-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_confluence_page",
        description:
          "Create a new Confluence Cloud page via the REST API v2 (storage-format body). " +
          "Built as a working alternative to the hosted Rovo MCP createConfluencePage tool, " +
          "which returns a persistent 404. Requires CONFLUENCE_SITE, ATLASSIAN_EMAIL and " +
          "ATLASSIAN_API_TOKEN to be set in the environment.",
        inputSchema: {
          type: "object",
          properties: {
            spaceId: {
              type: "string",
              description: "Numeric Confluence space ID, or a space key (e.g. 'DAS') to resolve automatically.",
            },
            title: { type: "string", description: "Title of the new page." },
            bodyHtml: {
              type: "string",
              description:
                "Page body in Confluence 'storage format' HTML (not Markdown, not the visual editor's format).",
            },
            parentId: { type: "string", description: "Optional numeric ID of the parent page." },
            status: {
              type: "string",
              enum: ["current", "draft"],
              description: "Page status. Defaults to 'current' (published).",
            },
          },
          required: ["spaceId", "title", "bodyHtml"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "create_confluence_page") {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  const input = CreateConfluencePageInputSchema.parse(request.params.arguments);
  const cfg = loadConfigFromEnv();

  try {
    const result = await createConfluencePage(cfg, input);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              id: result.id,
              title: result.title,
              version: result.version,
              url: result.url,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${err instanceof Error ? err.message : String(err)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("ai-sdlc-harness-mcp: server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error running server:", err);
  process.exit(1);
});
