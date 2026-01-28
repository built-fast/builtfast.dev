---
title: MCP Integration
description: Manage Vector Pro through natural language using Claude Desktop's Model
  Context Protocol.
category: Tools
order: 2
---

Manage Vector Pro through natural language using Claude Desktop with the Model Context Protocol (MCP).

## What is MCP?

The Model Context Protocol allows Claude Desktop to interact with external services through structured tools. The Vector Pro MCP server exposes Vector Pro operations as natural language commands.

## Setup

Add to your Claude Desktop configuration:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "vector": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-remote", "https://api.builtfast.com/mcp/vector"],
      "env": {
        "API_KEY": "YOUR_VECTOR_API_KEY"
      }
    }
  }
}
```

Restart Claude Desktop to apply changes.

## Natural Language Commands

Once configured, you can use natural language to manage Vector Pro:

### Site Management

```
"List my Vector sites"
"Show me the details for site 12345"
"Create a new site for customer acme-corp"
"Suspend the site for client xyz"
```

### Deployments

```
"Deploy site abc123 to staging"
"Deploy to production"
"Roll back the last production deployment"
"Show me the deployment history for production"
```

### Cache & CDN

```
"Purge the CDN cache for production"
"Purge the cache for example.com/blog/"
"Clear all cached images"
```

### Security

```
"Block IP 192.168.1.100"
"Show me the blocked IPs for site 12345"
"Add 10.0.0.1 to the allowed list"
```

### Environments

```
"Create a staging environment with PHP 8.3"
"List environments for site abc123"
"Delete the feature-branch environment"
```

### Monitoring

```
"Show me the logs for site xyz789"
"What's the status of the latest deployment?"
"Show me recent events"
```

## Example Conversations

### Creating a Complete Setup

**You:** "I need to set up a new WordPress site for client Acme Corp"

**Claude:** "I'll create a new site for Acme Corp."

*Creates site, waits for provisioning*

"The site is ready. Here are the credentials:
- Dev URL: happy-panda.vectorpages.com
- SFTP: vector_12345@sftp.vector.app
- Would you like me to create a production environment as well?"

**You:** "Yes, with the domain acme-corp.com"

**Claude:** "I'll create a production environment with that domain."

*Creates environment, sets up domain*

### Troubleshooting

**You:** "The production site for client 12345 is slow"

**Claude:** "Let me check the site status and recent deployments."

*Retrieves site info, deployment history, logs*

"I found the issue. The last deployment failed partially. Would you like me to roll back to the previous working version?"

## Available Tools

The MCP server exposes these tools:

| Tool | Description |
|------|-------------|
| `list_sites` | List all sites |
| `get_site` | Get site details |
| `create_site` | Create new site |
| `deploy` | Create deployment |
| `rollback` | Roll back deployment |
| `purge_cache` | Purge CDN cache |
| `block_ip` | Block IP address |
| `get_logs` | Retrieve site logs |

## Security Notes

- Your API key is stored in the local Claude Desktop configuration
- Commands execute with the full permissions of your API key
- Use separate API keys for MCP vs production integrations if desired

## Next Steps

- [CLI](/docs/vector-pro/tools/cli/) - Terminal-based management
- [API Keys](/docs/vector-pro/security/api-keys/) - Create dedicated MCP keys
- [Audit Logs](/docs/vector-pro/security/audit-logs/) - Monitor MCP activity
