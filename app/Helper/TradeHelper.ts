export function formatNumber(number: number, decimals = 2) {
  return number.toFixed(decimals).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

export function processMarketData(symbol: string, market: MarketBinance) {
  const price = parseFloat(market.close);
  const openPrice = parseFloat(market.open);
  const volume = parseFloat(market.volume);
  const change = ((price - openPrice) / openPrice) * 100;

  const direction: Direction = price > openPrice ? Direction.UP : Direction.DOWN;

  return {
    symbol: symbol,
    price: `$${formatNumber(price, 2)}`,
    change: `${change.toFixed(2)}%`,
    volume: `$${formatNumber(volume, 2)}`,
    direction: direction
  };
}
