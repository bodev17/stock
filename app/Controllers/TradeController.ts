import {HttpContextContract} from "@ioc:Adonis/Core/HttpContext";
import BinanceService from "App/Services/BinanceService";
import {formatNumber} from "App/Helper/TradeHelper";

const symbols = [
  'BTCUSDT', 'ETHBTC', 'BNBUSDT', 'SOLBNB', 'USDCBNB', 'XRPBTC', 'DOGEBNB',
  'ADABTC', 'AVAXBNB', 'SHIBUSDT', 'WBTCUSDT', 'TRXUSDT', 'DOTUSDT', 'LINKUSDT',
  'BCHUSDT', 'NEARUSDT', 'MATICUSDT', 'UNIUSDT', 'LTCUSDT', 'PEPEUSDT'
];

function processMarketData(market) {
  const price = parseFloat(market.lastPrice);
  const openPrice = parseFloat(market.openPrice);
  const volume = parseFloat(market.volume);
  const change = ((price - openPrice) / openPrice) * 100;

  const direction = price > openPrice ? 'green' : 'red';

  return {
    symbol: market.symbol,
    price: `$${formatNumber(price, 2)}`,
    change: `${change.toFixed(2)}%`,
    volume: `$${formatNumber(volume, 2)}`,
    direction: direction
  };
}

export default class TradeController {
  public constructor() {
  }

  public async getListSymbols({response}: HttpContextContract) {
    const tickers = await BinanceService.binance.futuresDaily();
    const tickersArray = Object.values(tickers); // Chuyển đổi object thành array
    const filteredTickers = tickersArray.filter(ticker => symbols.includes(ticker.symbol));
    const processedData = filteredTickers.map(processMarketData);


    return response.status(200).json({
      success: true,
      message: "Success.",
      data: processedData
    })
  }
}
