import BinanceService from "App/Services/BinanceService";
import User from "App/Models/User";
import {processMarketData} from "App/Helper/TradeHelper";
import Application from '@ioc:Adonis/Core/Application'
import SymbolService from "App/Services/SymbolService";

BinanceService.boot()

BinanceService.io.on('connection', async (socket) => {
  // @ts-ignore
  const user: User = socket.user
  if (user) {
    socket.join(`${user.id}`)
  }

  const symbolService = Application.container.make(SymbolService)
  const symbols = await symbolService.getActiveSymbols()
  // new price
  BinanceService.binance.websockets.miniTicker((markets) => {
    symbols.forEach((symbol: string) => {
      if (markets[symbol]) {
        const data = processMarketData(symbol, markets[symbol]);
        socket.to(`${user.id}`).emit('new_symbol_change', data)
      }
    });
  })
})
