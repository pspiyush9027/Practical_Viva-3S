import dotenv from 'dotenv';

dotenv.config();

// External stock market data API integration: Yahoo Finance public endpoints.
// Note: this is an unofficial integration inferred from Yahoo Finance web traffic.
const CHART_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';
const SEARCH_URL = 'https://query1.finance.yahoo.com/v1/finance/search';

const fetchYahooJson = async (url) => {
  // All live stock search/quote requests go through Yahoo Finance public endpoints.
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      Accept: 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Yahoo Finance request failed with status ${response.status}`);
  }

  return data;
};

export const searchSymbols = async (keywords) => {
  const url = new URL(SEARCH_URL);
  url.searchParams.set('q', keywords);
  url.searchParams.set('quotesCount', '10');
  url.searchParams.set('newsCount', '0');

  const data = await fetchYahooJson(url);
  const matches = data.quotes || [];

  return matches
    .filter((match) => match.symbol)
    .map((match) => ({
      symbol: match.symbol,
      name: match.shortname || match.longname || match.symbol,
      type: match.quoteType || '',
      region: match.exchange || match.exchangeDisplay || '',
      marketOpen: '',
      marketClose: '',
      timezone: match.exchangeTimezoneName || '',
      currency: match.currency || '',
      matchScore: Number(match.score || 0),
    }));
};

export const getLiveQuote = async (symbol) => {
  const url = new URL(`${CHART_URL}/${encodeURIComponent(symbol)}`);
  url.searchParams.set('interval', '1d');
  url.searchParams.set('range', '1d');

  const data = await fetchYahooJson(url);
  const chart = data?.chart?.result?.[0];
  const meta = chart?.meta;

  if (!meta?.symbol) {
    throw new Error('No quote data found for this symbol');
  }

  return {
    symbol: meta.symbol,
    name: meta.shortName || meta.longName || meta.symbol,
    market: meta.exchangeName || meta.fullExchangeName || '',
    open: Number(meta.regularMarketOpen || meta.previousClose || 0),
    high: Number(meta.regularMarketDayHigh || meta.regularMarketPrice || 0),
    low: Number(meta.regularMarketDayLow || meta.regularMarketPrice || 0),
    price: Number(meta.regularMarketPrice || 0),
    volume: Number(meta.regularMarketVolume || 0),
    latestTradingDay: meta.regularMarketTime
      ? new Date(meta.regularMarketTime * 1000).toISOString()
      : null,
    previousClose: Number(meta.previousClose || 0),
    change: Number(meta.regularMarketPrice || 0) - Number(meta.previousClose || 0),
    changePercent:
      meta.previousClose
        ? `${(((Number(meta.regularMarketPrice || 0) - Number(meta.previousClose || 0)) / Number(meta.previousClose)) * 100).toFixed(2)}%`
        : null,
    currency: meta.currency || '',
  };
};
