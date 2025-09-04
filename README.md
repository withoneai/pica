<p align="center">
  <a href="https://picaos.com">
    <img alt="Pica Logo" src="https://assets.picaos.com/github/header.svg" style="border-radius: 10px;">
  </a>
</p>

<p align="center"><b>Pica</b> - <i>Ensuring outcomes for the AI-first world</i></p>

<p align="center">
  <b>
    <a href="https://www.picaos.com">Website</a>
    ·
    <a href="https://docs.picaos.com">Documentation</a>
    ·
    <a href="https://app.picaos.com">Dashboard</a>
    ·
    <a href="https://docs.picaos.com/changelog">Changelog</a>
    ·
    <a href="https://x.com/picahq">X</a>
    ·
    <a href="https://www.linkedin.com/company/picahq">LinkedIn</a>
  </b>
</p>

---

Connect LLMs to 25,000+ actions with Pica-verified knowledge and developer-friendly SDKs. No keys, no configs, no headaches.

Pica makes it simple to build and manage AI agents with 3 key products:
1. **OneTool**: Connect agents to over [150+ integrations](https://picaos.com/integrations) with a single SDK. Zero-shot execution that gets smarter with every use.
2. **AuthKit**: Streamline authentication for multi-tenant applications with secure, end-to-end OAuth flows and automated token management. Handles the complexity of authentication so you don't have to.
3. **BuildKit**: Create AI tools for integrations or empower vibe coding with integrations that work zero-shot.

Built in Rust for blazing speed and ultra-low latency execution. Full logging and action traceability gives developers complete visibility into their agents' decisions and activities. Our tools simplify building and running AI agents so developers can focus on results.

# Getting started 👋

Follow this tutorial to build a tool to fetch your Gmail emails in under 5 minutes.

> 📖 **Full Demo**: For a comprehensive walkthrough with all IDE and framework options, visit [buildkit.picaos.com](https://buildkit.picaos.com)

> 🎥 **Demo Video**: Watch the [4-minute tutorial](https://youtu.be/EnbRfu-BsJE)

## What we'll do:

1. Install the Pica MCP Server
2. Connect your Gmail account  
3. Set up a starter project with Vercel AI SDK
4. Add some rules for the LLMs to understand BuildKit
5. Prompt the LLM to build your tool

## Step 1: Install the Pica MCP Server

In the Cursor menu, select "MCP Settings" and update the MCP JSON file to include the following:

```json
{
  "mcpServers": {
    "pica": {
      "command": "npx",
      "args": ["@picahq/mcp"],
      "env": {
        "PICA_SECRET": "your-pica-secret-key"
      }
    }
  }
}
```

**Note:** Replace `your-pica-secret-key` with your actual Pica secret key from the dashboard: [Get API Key](https://app.picaos.com/settings/api-keys)

## Step 2: Connect your Gmail account

Now we need to connect your Gmail account so we can test our tool after we build it.

[**Add Gmail Connection →**](https://app.picaos.com/connections)

## Step 3: Set up a starter project

#### 1. Clone and install dependencies

```bash
git clone https://github.com/picahq/buildkit-vercel-ai-starter.git && cd buildkit-vercel-ai-starter
```

```bash
npm install
```

#### 2. Set up environment variables

Create a `.env.local` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

#### 3. Run the development server

```bash
npm run dev
```

#### 4. Open your browser

Navigate to `http://localhost:3000` to see the chat interface.

## Step 4: Add some rules for the LLMs to understand BuildKit

### BuildKit Rules for Cursor

Create a `.cursor/rules/buildkit.mdc` file in the root of your project and copy the rules from our local file:

📋 **Copy the rules**: [buildkit/rules/cursor/buildkit.mdc](buildkit/rules/cursor/buildkit.mdc)

### ✅ Verify Setup

You can verify setup by asking "What connections do I have in Pica?" - it should show your Gmail connection.

## Step 5: Prompt the LLM to build your tool

Now you can ask Cursor to build a Gmail tool for you! Copy this prompt:

> Create me a tool called fetchGmailEmails in my Vercel AI SDK agent for fetching my Gmail unread emails and returning the content using BuildKit

🎉 **You now have a working AI tool to fetch your Gmail unread emails in under 5 minutes!**

---

## 🚀 What's Next?

Ready to build more AI tools? Pica connects to 150+ platforms with zero-shot execution.

**🔗 [Explore All Integrations](https://buildkit.picaos.com/integrations)** - Discover integrations for HubSpot, Salesforce, Slack, GitHub, and more

**⚡ [Launch Pica Dashboard](https://app.picaos.com)** - Manage connections, support multi-tenant authentication, monitor usage, and scale your AI agents

