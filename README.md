# @pipeworx/stocktwits

[StockTwits](https://api.stocktwits.com/developers/docs) MCP — stock-focused social sentiment. Keyless read endpoints, 200 req/hr per IP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `symbol_stream(symbol, since?, max?, limit?, filter?)` — messages mentioning a ticker
- `user_stream(user_id, since?, max?, limit?)` — messages from a user
- `trending_symbols(limit?)` — top trending tickers
- `trending_messages(limit?)` — trending messages
- `suggested_symbols(limit?)` — editorial suggested
- `symbol_search(q, limit?)` — symbol search
- `chart_data(symbol, period?)` — sparkline data for a ticker
- `watchlists(user_id)` — user's watchlists
- `watchlist(watchlist_id, since?, max?, limit?)` — messages from a watchlist

## Notes

StockTwits public read endpoints are keyless but rate-limited (200/hr/IP). The gateway egress IP is shared so heavy use may be throttled; the upstream returns 429 in that case and this pack surfaces it cleanly.

## Data source

`https://api.stocktwits.com/api/2`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "stocktwits": {
      "url": "https://gateway.pipeworx.io/stocktwits/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Stocktwits data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
