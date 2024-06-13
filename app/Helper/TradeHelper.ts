import {MarketBinance, MarketBinanceV2} from "App/Interface/MarketBinance"
import {Direction} from "App/Enum/Direction"

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


export function processMarketDataV2(market: MarketBinanceV2) {
  const price = parseFloat(market.lastPrice);
  const openPrice = parseFloat(market.openPrice);
  const volume = parseFloat(market.volume);
  const change = ((price - openPrice) / openPrice) * 100;

  const direction: Direction = price > openPrice ? Direction.UP : Direction.DOWN;

  return {
    symbol: market.symbol,
    price: `$${formatNumber(price, 2)}`,
    change: `${change.toFixed(2)}%`,
    volume: `$${formatNumber(volume, 2)}`,
    direction: direction
  };
}
