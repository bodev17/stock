import Application from '@ioc:Adonis/Core/Application'
import SymbolService from "App/Services/SymbolService";
import { OrderBook } from 'hft-limit-order-book';


const symbolService = Application.container.make(SymbolService)
symbolService.getActiveSymbols().then((symbols: string[]) => {
  Application.container.singleton('App/Globals', () => {
    return Object.fromEntries(symbols.map(item => [item, new OrderBook()]))
  })
})
