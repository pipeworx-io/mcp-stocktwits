# @pipeworx/stocktwits

[StockTwits](https://api.stocktwits.com/developers/docs) MCP — stock-focused social sentiment. Keyless read endpoints, 200 req/hr per IP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

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

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/stocktwits/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Stocktwits data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
