import BinanceService from "App/Services/BinanceService";
import User from "App/Models/User";
import {processMarketData} from "App/Helper/TradeHelper";

BinanceService.boot()

const symbols = [
  'BTCUSDT',
  'ETHBTC',
  'BNBUSDT',
  'SOLBNB',
  'USDCBNB',
  'XRPBTC',
  'DOGEBNB',
  'ADABTC',
  'AVAXBNB',
  'SHIBUSDT',
  'WBTCUSDT',
  'TRXUSDT',
  'DOTUSDT',
  'LINKUSDT',
  'BCHUSDT',
  'NEARUSDT',
  'MATICUSDT',
  'UNIUSDT',
  'LTCUSDT',
  'PEPEUSDT',
  'USDCUSDT',
];

BinanceService.io.on('connection', (socket) => {
  // @ts-ignore
  const user: User = socket.user
  if (user) {
    socket.join(`${user.id}`)
  }

  // new price
  BinanceService.binance.websockets.miniTicker((markets) => {
    symbols.forEach(symbol => {
      if (markets[symbol]) {
        const data = processMarketData(symbol, markets[symbol]);
        socket.to(`${user.id}`).emit('new_symbol_change', data)
      }
    });
  })
})

// import { OrderBook } from 'hft-limit-order-book';
//
// const lob = new OrderBook();
// lob.createOrder('limit', 'buy',1, 10, 1)
// lob.createOrder('limit', 'buy',100, 2, 2)
// const a=  lob.createOrder('limit', 'sell',50, 10, 3)
// console.log(a)
// console.log(lob.toString())
