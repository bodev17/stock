import BinanceService from "App/Services/BinanceService";

BinanceService.boot()

const circulatingSupplyBTC = 21000000; // Giả định: 18 triệu BTC

function formatNumber(number, decimals = 2) {
  return number.toFixed(decimals).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// BinanceService.binance.websockets.miniTicker((markets) => {
//   if (markets.BTCUSDT) {
//
//     const closePriceBTC = parseFloat(markets.BTCUSDT.close);
//     const openPriceBTC = parseFloat(markets.BTCUSDT.open);
//     const changeBTC = ((closePriceBTC - openPriceBTC) / openPriceBTC) * 100;
//     const volume24hBTC = parseFloat(markets.BTCUSDT.volume);
//     const marketCapBTC = closePriceBTC * circulatingSupplyBTC;
//
//     console.log(`BTC Price: ${formatNumber(closePriceBTC, 2)}`);
//     console.log(`BTC Change: ${formatNumber(changeBTC, 2)}`);
//     console.log(`BTC 24h Volume: ${formatNumber(volume24hBTC, 2)}`);
//     console.log(`BTC Market Cap: ${formatNumber(marketCapBTC, 2)}`);
//   }
// })

// BinanceService.io.on('connection', (socket) => {
//
// })

import { OrderBook } from 'hft-limit-order-book';

const lob = new OrderBook();
lob.createOrder('limit', 'buy',1, 10, 1)
lob.createOrder('limit', 'buy',100, 2, 2)
const a=  lob.createOrder('limit', 'sell',50, 10, 3)
console.log(a)
console.log(lob.toString())
