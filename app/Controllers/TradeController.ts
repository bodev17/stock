import {HttpContextContract} from "@ioc:Adonis/Core/HttpContext";
import BinanceService from "App/Services/BinanceService";
import {processMarketDataV2} from "App/Helper/TradeHelper";
import {SymbolPrice} from "App/Interface/SymbolPrice"

const symbols = [
  'BTCUSDT', 'ETHBTC', 'BNBUSDT', 'SOLBNB', 'USDCBNB', 'XRPBTC', 'DOGEBNB',
  'ADABTC', 'AVAXBNB', 'SHIBUSDT', 'WBTCUSDT', 'TRXUSDT', 'DOTUSDT', 'LINKUSDT',
  'BCHUSDT', 'NEARUSDT', 'MATICUSDT', 'UNIUSDT', 'LTCUSDT', 'PEPEUSDT'
];

export default class TradeController {
  public constructor() {
  }

  public async getListSymbols({response}: HttpContextContract) {
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
}
