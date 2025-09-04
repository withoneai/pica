---
description:
globs:
alwaysApply: true
---

# Pica Buildkit – LLM Rules

**Role**  
You are an expert integration developer working with **Pica MCP**. You can:
- Build tools for **Vercel AI SDK** and **LangChain**
- Scaffold and implement **full MCP servers** (model context protocol)
- Use the **Pica MCP** utilities to discover actions, fetch schemas/knowledge, and execute API calls.

Pica is not in your training set; always follow the discovery steps below to build correctly.

---

## 0) Hard Requirements & Guardrails

1. **Do not overwrite existing projects**  
   - Before generating/scaffolding, check the current directory.  
   - If a project is detected (e.g., `package.json`, `pnpm-lock.yaml`/`yarn.lock`/`package-lock.json`, `.git`, `mcp.json`, `src/` with buildkit markers), **do not** create a new project. Instead, add or modify files minimally and explicitly.

2. **Always discover before coding**  
   - Use Pica MCP tools to discover integrations and actions, and to fetch **action knowledge** (input schema, path, verbs, content-types, pagination, auth notes, rate limits) **before writing any tool code**.

3. **Prefer Pica MCP if available**  
   - If the Pica MCP is available in the environment, use its tools to list integrations, fetch platform actions, and get action knowledge; only then implement.

4. **Use the provided executor**  
   - When executing a Pica action from a tool or MCP, use `picaToolExecutor` (below).  
   - Build its `path`, `method`, `query`/`body`, and `contentType` from **get_pica_action_knowledge**.

5. **Secrets**  
   - Never print secrets. Expect `PICA_API_KEY` and user-provided `{PLATFORM}_CONNECTION_KEY` at runtime. Validate and fail fast if missing.

6. **Output discipline**  
   - Generate **ready-to-run code** with minimal placeholders.  
   - Provide install/run/test snippets when you scaffold.

7. **Connection key environment**  
   - Remember to add the connection key to the environment and not as an argument to the tool. As PLATFORM_CONNECTION_KEY (i.e. GMAIL_CONNECTION_KEY)

8. **Type generation from action knowledge**  
   - Remember to add types for what you need to based on the action knowledge.

---

## 1) Pica MCP Utilities (Call These First)

When asked to build a tool or MCP, follow this order:

1) **list_pica_integrations**  
   _Goal_: Surface connectable platforms and their slugs/ids.  
   _User help_: Tell the user how to add/authorize integrations at `https://app.picaos.com/connections`.

2) **get_pica_platform_actions(platformId | slug)**  
   _Goal_: Find the action the user cares about (e.g., Gmail `listMessages`, Notion `queryDatabase`, Slack `chat.postMessage`).

3) **get_pica_action_knowledge(actionId)**  
   _Goal_: Fetch the **canonical contract** for that action — HTTP method, path template, parameters (query, path, body), headers, content-type, limits, pagination rules, success/error shapes, and sample requests.

> Only after step (3) do you write code.

---

## 2) Pica Tool Executor (Boilerplate Example)

> **Note**: This is **boilerplate** — do **not** treat as final or language-specific. It simply shows how to call the Pica passthrough API. You may adapt it to any language or SDK as long as the call structure is preserved.

```ts
export async function picaToolExecutor(
  path: string,
  actionId: string,
  connectionKey: string,
  options: {
    method?: string;
    queryParams?: URLSearchParams;
    body?: any;
    contentType?: string;
  } = {}
) {
  const { method = 'GET', queryParams, body, contentType } = options;

  const baseUrl = 'https://api.picaos.com/v1/passthrough';
  const url = queryParams
    ? `${baseUrl}${path}?${queryParams.toString()}`
    : `${baseUrl}${path}`;

  // Default to JSON unless overridden by action knowledge
  const headers: Record<string, string> = {
    'content-type': contentType || 'application/json',
    'x-pica-secret': process.env.PICA_API_KEY || '',
    'x-pica-connection-key': connectionKey,
    'x-pica-action-id': actionId,
  };

  const fetchOptions: RequestInit = { method, headers };

  if (body && method !== 'GET') {
    fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Pica API call failed: ${response.status} ${response.statusText} :: ${text}`);
  }
  return response.json().catch(() => ({}));
}
```

**Key Points**  
- Default `content-type` = `application/json` unless overridden by `get_pica_action_knowledge`.  
- No Gmail-specific logic.  
- Example only — adapt freely to your language/runtime.

---

## 3) Building Tools (Vercel AI SDK & LangChain)

1. Ask the user which **integration** & **action** they want (or infer from their ask).  
2. Call the Pica MCP utilities (Section 1).  
3. From `get_pica_action_knowledge`, derive:
   - `actionId`
   - `method`, `path`, `query` keys, `body` shape, `contentType`
   - Pagination fields and rate limits
4. Write the tool with a strict `inputSchema` and a clear `execute` that:
   - Validates user input
   - Builds query/body safely
   - Calls `picaToolExecutor`
   - Normalizes output (add a short `summary`)

### Complete Gmail Tool Example

Here's a real-world example of a Gmail tool that fetches email contents with proper filtering:

```ts
import { z } from 'zod';
import { tool } from 'ai';
import { picaToolExecutor } from '../picaToolExecutor';

export const loadGmailEmails = tool({
  description: 'Load Gmail emails with specific filtering by label and number. Returns sender, receiver, time, subject, and body for each email.',
  inputSchema: z.object({
    label: z.string().optional().describe('Gmail label to filter by (e.g., "INBOX", "SENT", "UNREAD", or custom labels)'),
    numberOfEmails: z.number().min(1).max(50).default(10).describe('Number of emails to retrieve (1-50, default: 10)'),
    query: z.string().optional().describe('Additional Gmail search query (e.g., "from:john@example.com", "subject:project")'),
  }),
  execute: async ({ label, numberOfEmails = 10, query }) => {
    try {
      // Build the search query
      let searchQuery = '';
      if (label) {
        searchQuery += `label:${label}`;
      }
      if (query) {
        searchQuery += searchQuery ? ` ${query}` : query;
      }

      // Prepare query parameters for list messages
      const queryParams = new URLSearchParams({
        maxResults: numberOfEmails.toString(),
        ...(searchQuery && { q: searchQuery })
      });

      const connectionKey = process.env.GMAIL_CONNECTION_KEY;

      // First, get the list of message IDs using picaToolExecutor
      const listMessagesResult = await picaToolExecutor(
        '/users/me/messages',
        'conn_mod_def::F_JeIVCQAiA::oD2p47ZVSHu1tF_maldXVQ',
        connectionKey,
        { queryParams }
      );

      if (!listMessagesResult?.messages || listMessagesResult.messages.length === 0) {
        return {
          emails: [],
          totalFound: 0,
          message: 'No emails found matching the criteria',
          summary: 'No emails found matching the criteria'
        };
      }

      // Extract email details from each message
      const emails = [];
      
      for (const messageRef of listMessagesResult.messages) {
        try {
          // Prepare query parameters for get message
          const messageQueryParams = new URLSearchParams();
          messageQueryParams.set('format', 'full');
          messageQueryParams.append('metadataHeaders', 'From');
          messageQueryParams.append('metadataHeaders', 'To');
          messageQueryParams.append('metadataHeaders', 'Subject');
          messageQueryParams.append('metadataHeaders', 'Date');

          // Get full message details using picaToolExecutor
          const messageResult = await picaToolExecutor(
            `/users/me/messages/${messageRef.id}`,
            'conn_mod_def::F_JeIErCKGA::Q2ivQ5-QSyGYiEIZT867Dw',
            connectionKey,
            { queryParams: messageQueryParams }
          );

          if (messageResult?.payload?.headers) {
            const headers = messageResult.payload.headers;
            
            // Extract header information
            const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || '';
            const to = headers.find((h: any) => h.name.toLowerCase() === 'to')?.value || '';
            const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '';
            const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';
            
            // Extract body content
            let body = '';
            if (messageResult.payload.body?.data) {
              // Decode base64 body
              body = Buffer.from(messageResult.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
            } else if (messageResult.payload.parts) {
              // Look for text/plain or text/html parts
              for (const part of messageResult.payload.parts) {
                if (part.mimeType === 'text/plain' && part.body?.data) {
                  body = Buffer.from(part.body.data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
                  break;
                } else if (part.mimeType === 'text/html' && part.body?.data && !body) {
                  body = Buffer.from(part.body.data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
                }
              }
            }

            emails.push({
              sender: from,
              receiver: to,
              time: date,
              subject: subject,
              body: body.substring(0, 2000) + (body.length > 2000 ? '...' : ''), // Limit body length
              // Useful IDs for further operations
              messageId: messageRef.id,
              threadId: messageResult.threadId || messageRef.threadId || '',
              labelIds: messageResult.labelIds || [],
              historyId: messageResult.historyId || '',
              internalDate: messageResult.internalDate || '',
              snippet: messageResult.snippet || body.substring(0, 100) + (body.length > 100 ? '...' : '')
            });
          }
        } catch (messageError) {
          console.warn(`Failed to get details for message ${messageRef.id}:`, messageError);
          // Continue with other messages
        }
      }

      return {
        emails,
        totalFound: emails.length,
        requestedCount: numberOfEmails,
        label: label || 'No label specified',
        query: query || 'No additional query',
        message: `Successfully retrieved ${emails.length} emails`,
        summary: `Retrieved ${emails.length} Gmail emails${label ? ` from ${label}` : ''}${query ? ` matching "${query}"` : ''}`
      };

    } catch (error) {
      console.error('Gmail load error:', error);
      return {
        emails: [],
        totalFound: 0,
        error: String(error),
        message: `Failed to load Gmail emails: ${error}`,
        summary: `Failed to load Gmail emails: ${error}`
      };
    }
  },
});
```

### Key Implementation Patterns

1. **Multiple API calls**: List messages first, then fetch details for each
2. **Proper error handling**: Try-catch blocks and graceful degradation
3. **Data transformation**: Extract and decode Gmail's base64 encoded content
4. **Pagination support**: Use maxResults and search queries
5. **Rich return format**: Include both raw data and user-friendly summaries

---

## 4) MCP Server Implementation (Gmail Example)

For building complete MCP servers with Pica integration, follow this structure:

### Project Structure
```
gmail-mcp-server/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts          # Main MCP server
│   ├── tools/
│   │   ├── gmail.ts      # Gmail tool implementations
│   │   └── index.ts      # Tool registry
│   └── utils/
│       └── pica.ts       # Pica executor
└── dist/                 # Compiled output
```

### package.json
```json
{
  "name": "gmail-mcp-server",
  "version": "1.0.0",
  "description": "MCP server for Gmail integration via Pica",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

### src/index.ts (Main MCP Server)
```ts
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { gmailTools } from './tools/gmail.js';

class GmailMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'gmail-mcp-server',
        version: '1.0.0',
        description: 'MCP server for Gmail integration via Pica'
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'load_gmail_emails',
            description: 'Load Gmail emails with specific filtering by label and number. Returns sender, receiver, time, subject, and body for each email.',
            inputSchema: {
              type: 'object',
              properties: {
                label: {
                  type: 'string',
                  description: 'Gmail label to filter by (e.g., "INBOX", "SENT", "UNREAD", or custom labels)'
                },
                numberOfEmails: {
                  type: 'number',
                  minimum: 1,
                  maximum: 50,
                  default: 10,
                  description: 'Number of emails to retrieve (1-50, default: 10)'
                },
                query: {
                  type: 'string',
                  description: 'Additional Gmail search query (e.g., "from:john@example.com", "subject:project")'
                }
              },
              required: []
            }
          }
        ]
      };
    });

    // Execute tools
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'load_gmail_emails':
            return await gmailTools.loadEmails(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Gmail MCP Server running on stdio');
  }
}

const server = new GmailMCPServer();
server.run().catch(console.error);
```

### src/tools/gmail.ts (Gmail Tool Implementation)
```ts
import { z } from 'zod';
import { picaToolExecutor } from '../utils/pica.js';

const LoadGmailEmailsSchema = z.object({
  label: z.string().optional(),
  numberOfEmails: z.number().min(1).max(50).default(10),
  query: z.string().optional()
});

export const gmailTools = {
  async loadEmails(args: any) {
    const input = LoadGmailEmailsSchema.parse(args);
    
    if (!process.env.PICA_API_KEY) {
      throw new Error('PICA_API_KEY environment variable is required');
    }

    const connectionKey = process.env.GMAIL_CONNECTION_KEY;

    try {
      // Build the search query
      let searchQuery = '';
      if (input.label) {
        searchQuery += `label:${input.label}`;
      }
      if (input.query) {
        searchQuery += searchQuery ? ` ${input.query}` : input.query;
      }

      // First, get the list of message IDs
      const queryParams = new URLSearchParams({
        maxResults: input.numberOfEmails.toString(),
        ...(searchQuery && { q: searchQuery })
      });

      const listMessagesResult = await picaToolExecutor(
        '/users/me/messages',
        'conn_mod_def::F_JeIVCQAiA::oD2p47ZVSHu1tF_maldXVQ',
        connectionKey,
        { queryParams }
      );

      if (!listMessagesResult?.messages || listMessagesResult.messages.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                emails: [],
                totalFound: 0,
                message: 'No emails found matching the criteria'
              }, null, 2)
            }
          ]
        };
      }

      // Get details for each message
      const emails = [];
      for (const messageRef of listMessagesResult.messages) {
        try {
          const messageQueryParams = new URLSearchParams();
          messageQueryParams.set('format', 'full');
          messageQueryParams.append('metadataHeaders', 'From');
          messageQueryParams.append('metadataHeaders', 'To');
          messageQueryParams.append('metadataHeaders', 'Subject');
          messageQueryParams.append('metadataHeaders', 'Date');

          const messageResult = await picaToolExecutor(
            `/users/me/messages/${messageRef.id}`,
            'conn_mod_def::F_JeIErCKGA::Q2ivQ5-QSyGYiEIZT867Dw',
            connectionKey,
            { queryParams: messageQueryParams }
          );

          if (messageResult?.payload?.headers) {
            const headers = messageResult.payload.headers;
            
            const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || '';
            const to = headers.find((h: any) => h.name.toLowerCase() === 'to')?.value || '';
            const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '';
            const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';
            
            // Extract and decode body content
            let body = '';
            if (messageResult.payload.body?.data) {
              body = Buffer.from(messageResult.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
            } else if (messageResult.payload.parts) {
              for (const part of messageResult.payload.parts) {
                if (part.mimeType === 'text/plain' && part.body?.data) {
                  body = Buffer.from(part.body.data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
                  break;
                } else if (part.mimeType === 'text/html' && part.body?.data && !body) {
                  body = Buffer.from(part.body.data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
                }
              }
            }

            emails.push({
              sender: from,
              receiver: to,
              time: date,
              subject: subject,
              body: body.substring(0, 2000) + (body.length > 2000 ? '...' : ''),
              messageId: messageRef.id,
              threadId: messageResult.threadId || messageRef.threadId || '',
              snippet: messageResult.snippet || body.substring(0, 100) + (body.length > 100 ? '...' : '')
            });
          }
        } catch (messageError) {
          console.warn(`Failed to get details for message ${messageRef.id}:`, messageError);
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              emails,
              totalFound: emails.length,
              requestedCount: input.numberOfEmails,
              label: input.label || 'No label specified',
              query: input.query || 'No additional query',
              summary: `Retrieved ${emails.length} Gmail emails${input.label ? ` from ${input.label}` : ''}${input.query ? ` matching "${input.query}"` : ''}`
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to load Gmail emails: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};
```

### src/utils/pica.ts (Pica Integration)
```ts
export async function picaToolExecutor(
  path: string,
  actionId: string,
  connectionKey: string,
  options: {
    method?: string;
    queryParams?: URLSearchParams;
    body?: any;
    contentType?: string;
  } = {}
) {
  const { method = 'GET', queryParams, body, contentType } = options;

  const baseUrl = 'https://api.picaos.com/v1/passthrough';
  const url = queryParams
    ? `${baseUrl}${path}?${queryParams.toString()}`
    : `${baseUrl}${path}`;

  const headers: Record<string, string> = {
    'content-type': contentType || 'application/json',
    'x-pica-secret': process.env.PICA_API_KEY || '',
    'x-pica-connection-key': connectionKey,
    'x-pica-action-id': actionId,
  };

  const fetchOptions: RequestInit = { method, headers };

  if (body && method !== 'GET') {
    fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Pica API call failed: ${response.status} ${response.statusText} :: ${text}`);
  }
  return response.json().catch(() => ({}));
}
```

### MCP Configuration
Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "gmail": {
      "command": "node",
      "args": ["/path/to/gmail-mcp-server/dist/index.js"],
      "env": {
        "PICA_API_KEY": "your-pica-api-key"
      }
    }
  }
}
```

---

## 5) Pagination, Rate Limits, and Errors

- Use fields defined by `get_pica_action_knowledge` (e.g., `nextPageToken`, `cursor`, `page`, `limit`).
- Loop until requested `limit` is reached or no `next` token remains.
- On `429`, backoff before retrying.
- Always return meaningful error messages and structured responses.

---

## 6) Security & Secrets

- Require `PICA_API_KEY` at runtime.  
- Treat `{PLATFORM}_CONNECTION_KEY` as sensitive.  
- No secrets in logs or errors.
- Validate all inputs with Zod schemas.

---

## 7) Project Detection (No Overwrite)

- If project markers exist (`package.json`, `src/`, `.git`, etc.), **do not** scaffold new project.  
- Only add minimal new files for new tools or MCP endpoints.

---

## 8) Developer Experience

- Provide complete installation instructions:
  - `npm install @modelcontextprotocol/sdk zod`
  - `npm install -D @types/node tsx typescript`
- Build and run scripts:  
  - `"build": "tsc"`
  - `"dev": "tsx src/index.ts"`
  - `"start": "node dist/index.js"`

---

## 9) Done Criteria

- Used Pica MCP discovery before coding
- MCP server/tool compiles and runs with `PICA_API_KEY` + `{PLATFORM}_CONNECTION_KEY`
- Tools are properly registered and callable
- Input/output validation with Zod schemas
- Error handling with meaningful responses
- Follows MCP protocol correctly
- Pagination & rate-limits handled if needed
- Minimal changes to existing project structure

---
