# @pipeworx/stocktwits

[StockTwits](https://api.stocktwits.com/developers/docs) MCP — stock-focused social sentiment. Keyless read endpoints, 200 req/hr per IP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1857+ live data sources. This is an independent, unofficial integration — not affiliated with, endorsed by, or published by the upstream provider.

## Tools

- `symbol_stream(symbol, since?, max?, limit?, filter?)` — messages mentioning a ticker
- `user_stream(user_id, since?, max?, limit?)` — messages from a user
- `trending_symbols(limit?)` — top trending tickers
- `trending_messages(limit?)` — trending messages
- `suggested_symbols(limit?)` — editorial suggested
- `symbol_search(q, limit?)` — symbol search
- `chart_data(symbol, period?)` — OHLCV price bars for a ticker; `period` is 1D (default, 5-minute bars), 1W, 1M, 3M, 6M, YTD, 1Y, 5Y or ALL
- `watchlists(user_id)` — user's watchlists
- `watchlist(watchlist_id, since?, max?, limit?)` — messages from a watchlist

## Notes

StockTwits public read endpoints are keyless but rate-limited (200/hr/IP). The gateway egress IP is shared so heavy use may be throttled; the upstream returns 429 in that case and this pack surfaces it cleanly.

## Data source

`https://api.stocktwits.com/api/2` for streams, trending, search and watchlists; `https://ql.stocktwits.com/chart` (the chart feed behind stocktwits.com) for `chart_data`.

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

Both URLs reach the same gateway and the same 1857+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/symbol_stream \
  -H 'Content-Type: application/json' \
  -d '{"symbol":"TSLA"}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/symbol_stream`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Run it from npm

`@pipeworx/mcp-stocktwits` is a local stdio bridge to the Pipeworx gateway: your MCP client
starts it with `npx`, and it forwards every call to the same
`https://gateway.pipeworx.io/stocktwits/mcp` endpoint shown above. It needs network access;
there is no offline mode.

```json
{
  "mcpServers": {
    "stocktwits": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-stocktwits"]
    }
  }
}
```

Without a key it calls anonymously, capped at 50 calls a day. A free account
raises that to 200 a day: get a key at https://pipeworx.io/signup and add
`"env": { "PIPEWORX_API_KEY": "<your key>" }` to the server entry.
The key is sent as a Bearer token, the same way a hosted connection sends it,
so calls are metered and billed exactly as they are there.

It lists **only** this pack's tools by default. Set `PIPEWORX_META_TOOLS=1` to
also list `ask_pipeworx` and the other gateway-wide tools.

Behind an HTTPS proxy: Node's built-in `fetch` does not read `HTTPS_PROXY` by
default. Newer Node releases honour it when `NODE_USE_ENV_PROXY=1` is set; check
your Node version's documentation.

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
