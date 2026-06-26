interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * StockTwits MCP (keyless public read).
 */


const BASE = 'https://api.stocktwits.com/api/2';
const UA = 'pipeworx-mcp-stocktwits/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'symbol_stream',
    description: '"What are people saying about [ticker]" / "StockTwits sentiment for [TICKER]" / "retail / WSB / Twitter chatter on [stock]" / "Stocktwits feed for [symbol]" — recent messages mentioning a ticker on StockTwits (the largest finance-focused social-media platform). Returns user posts with bullish/bearish sentiment tags, timestamps, like counts. Use for retail-investor sentiment, social-volume tracking, contrarian signal.',
    inputSchema: {
      type: 'object',
      properties: { symbol: { type: 'string' }, since: { type: 'number' }, max: { type: 'number' }, limit: { type: 'number' }, filter: { type: 'string' } },
      required: ['symbol'],
    },
  },
  {
    name: 'user_stream',
    description: 'Recent StockTwits posts from a specific user (by user_id string). Supports since/max cursor pagination and a limit cap. Returns messages with sentiment tags, timestamps, and ticker cashtags. Use to follow a particular trader\'s commentary stream.',
    inputSchema: {
      type: 'object',
      properties: { user_id: { type: 'string' }, since: { type: 'number' }, max: { type: 'number' }, limit: { type: 'number' } },
      required: ['user_id'],
    },
  },
  { name: 'trending_symbols', description: '"What stocks are trending today" / "most talked-about tickers" / "hot stocks on social media" / "WSB / retail trending names" — top trending tickers on StockTwits by message volume right now. Use for retail-attention scans, meme-stock detection, social-momentum trading.', inputSchema: { type: 'object', properties: { limit: { type: 'number' } } } },
  { name: 'trending_messages', description: '"Most popular posts on StockTwits right now" / "trending stock chatter" — most-engaged-with messages across all StockTwits streams. Use for general market-zeitgeist sense-making.', inputSchema: { type: 'object', properties: { limit: { type: 'number' } } } },
  { name: 'suggested_symbols', description: 'StockTwits editorially curated trending equities — a hand-picked selection distinct from raw-volume trending_symbols. Returns symbol tickers, names, and watch counts. Use when you want editorial picks rather than algorithmic social-volume rank.', inputSchema: { type: 'object', properties: { limit: { type: 'number' } } } },
  { name: 'symbol_search', description: '"Look up StockTwits ticker for [company]" / "search for symbol on StockTwits" — symbol search on StockTwits to confirm a ticker exists or find variant tickers (e.g. crypto, ETFs).', inputSchema: { type: 'object', properties: { q: { type: 'string' }, limit: { type: 'number' } }, required: ['q'] } },
  { name: 'chart_data', description: '"Chart data for [ticker]" / "sparkline data for [stock]" — price sparkline data for a ticker from StockTwits. Use for embedded thumbnail charts; prefer dedicated finance packs (yahoo-finance, alphavantage) for serious price analysis.', inputSchema: { type: 'object', properties: { symbol: { type: 'string' }, period: { type: 'string' } }, required: ['symbol'] } },
  { name: 'watchlists', description: 'List a StockTwits user\'s public watchlists by user_id. Returns watchlist IDs, names, and ticker counts. Use to discover a trader\'s followed symbols; then pass a watchlist_id to the watchlist tool for the message stream.', inputSchema: { type: 'object', properties: { user_id: { type: 'string' } }, required: ['user_id'] } },
  {
    name: 'watchlist',
    description: 'Recent StockTwits messages for all tickers in a specific watchlist (by watchlist_id). Supports since/max cursor pagination and a limit cap. Use to track social chatter across a curated list of symbols in one call.',
    inputSchema: { type: 'object', properties: { watchlist_id: { type: 'string' }, since: { type: 'number' }, max: { type: 'number' }, limit: { type: 'number' } }, required: ['watchlist_id'] },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const get = async (path: string, params?: Record<string, unknown>) => {
    const p = new URLSearchParams();
    if (params) for (const [k, v] of Object.entries(params)) if (v != null) p.set(k, String(v));
    const url = `${BASE}${path}${[...p].length ? `?${p}` : ''}`;
    const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': UA } });
    if (res.status === 429) throw new Error('StockTwits: 429 rate limit (200 req/hr/IP free).');
    if (res.status === 404) throw new Error('StockTwits: 404 — symbol/user/watchlist not found.');
    if (!res.ok) throw new Error(`StockTwits: ${res.status}`);
    return res.json();
  };
  const reqStr = (k: string, ex: string) => {
    const v = args[k];
    if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${k}" is missing. Pass a string like ${ex}.`);
    return v;
  };
  switch (name) {
    case 'symbol_stream':
      return get(`/streams/symbol/${encodeURIComponent(reqStr('symbol', '"AAPL"'))}.json`, { since: args.since, max: args.max, limit: args.limit, filter: args.filter });
    case 'user_stream':
      return get(`/streams/user/${encodeURIComponent(reqStr('user_id', '"<user>"'))}.json`, { since: args.since, max: args.max, limit: args.limit });
    case 'trending_symbols':
      return get('/trending/symbols.json', { limit: args.limit });
    case 'trending_messages':
      return get('/streams/trending.json', { limit: args.limit });
    case 'suggested_symbols':
      return get('/trending/symbols/equities.json', { limit: args.limit });
    case 'symbol_search':
      return get('/search/symbols.json', { q: reqStr('q', '"AAPL"'), limit: args.limit });
    case 'chart_data':
      return get(`/symbols/${encodeURIComponent(reqStr('symbol', '"AAPL"'))}/chart.json`, { period: args.period });
    case 'watchlists':
      return get(`/watchlists/user/${encodeURIComponent(reqStr('user_id', '"<user>"'))}.json`);
    case 'watchlist':
      return get(`/streams/watchlist/${encodeURIComponent(reqStr('watchlist_id', '"<id>"'))}.json`, { since: args.since, max: args.max, limit: args.limit });
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
