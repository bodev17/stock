import {HttpContextContract} from "@ioc:Adonis/Core/HttpContext";
import BinanceService from "App/Services/BinanceService";
import {processMarketDataV2} from "App/Helper/TradeHelper";
import {SymbolPrice} from "App/Interface/SymbolPrice"
import SymbolService from "App/Services/SymbolService";
import {inject} from "@adonisjs/fold";

@inject()
export default class TradeController {
  public constructor(private symbolService: SymbolService) {
  }

  public async getListSymbols({response}: HttpContextContract) {
    const symbols = await this.symbolService.getActiveSymbols()
    const tickers = await BinanceService.binance.futuresDaily();
    const tickersArray = Object.values(tickers);
    const filteredTickers = tickersArray.filter((ticker: SymbolPrice) => symbols.includes(ticker.symbol));

    const processedData: SymbolPrice[] = filteredTickers.map(processMarketDataV2);

    return response.status(200).json({
      success: true,
      message: "Success.",
      data: processedData
    })
  }

  public async createOrder({request, response, auth}: HttpContextContract) {
    return response.status(200).json({
      success: true,
      message: "Success.",
      data: []
    })
  }
}
