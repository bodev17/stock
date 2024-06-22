import {HttpContextContract} from "@ioc:Adonis/Core/HttpContext";
import BinanceService from "App/Services/BinanceService";
import {processMarketDataV2} from "App/Helper/TradeHelper";
import {SymbolPrice} from "App/Interface/SymbolPrice"
import SymbolService from "App/Services/SymbolService";
import {inject} from "@adonisjs/fold";
import TradeService from "App/Services/TradeService";
import CreateOrderValidator from "App/Validators/CreateOrderValidator";
import {TypeOrder} from "App/Enum/TypeOrder";
import {SideOrder} from "App/Enum/SideOrder";
import {rules, schema} from "@ioc:Adonis/Core/Validator";
import {OrderStatus} from "App/Enum/OrderStatus";
import UpdateOrderValidator from "App/Validators/UpdateOrderValidator";

@inject()
export default class TradeController {
  public constructor(
    private symbolService: SymbolService,
    private tradeService: TradeService
  ) {
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

  public async updateOrder({request, response, auth}: HttpContextContract) {
    const input: {side: SideOrder, price: number, quantity: number, id: number,} = await request.validate(UpdateOrderValidator)

    if (!auth.user) {
      throw new Error('Unauthorized')
    }

    try {
      const result: {success: boolean, data?: any, error_code?: number} = await this.tradeService.updateOrder(input.id, input, auth.user)

      if (result.success) {
        return response.status(200).json({
          success: true,
          message: "Success.",
          data: result?.data || []
        })
      } else {
        return response.status(200).json({
          success: false,
          error_code: result.error_code,
          message: "An error create order, please try again later.",
          data: []
        })
      }
    } catch (e) {
    }

    return response.status(200).json({
      success: true,
      error_code: 4000,
      message: "An error occurred please try again.",
      data: []
    })
  }
  public async cancelOrder({request, response, auth}: HttpContextContract) {
    const inputData = schema.create({
      id: schema.number([
        rules.required(),
        rules.unsigned(),
      ]),
    })
    const input: {id: number} = await request.validate({schema: inputData})

    if (!auth.user) {
      throw new Error('Unauthorized')
    }

    try {
      const result = await this.tradeService.cancelOrder(input.id, auth.user)
      return response.status(200).json({
        success: true,
        message: "Success.",
        data: result?.data || []
      })
    } catch (e) {
      console.log(e)

      return response.status(500).json({
        success: false,
        message: "An error occurred, please try again later.",
        data: [],
        errors: []
      })
    }
  }

  public async getHistoriesOrder({request, response, auth}: HttpContextContract) {
    const inputData = schema.create({
      page: schema.number.optional([
        rules.unsigned(),
      ]),
      limit: schema.number.optional([
        rules.unsigned(),
        rules.range(1, 100),
      ]),
      status: schema.enum.optional(Object.values(OrderStatus))
    })
    const input: PaginateInterface = await request.validate({schema: inputData})

    if (!auth.user) {
      throw new Error('Unauthorized')
    }

    try {
      const histories = await this.tradeService.getHistoriesOrder(input, auth.user)
      return response.status(200).json({
        success: true,
        message: "Success.",
        data: histories
      })
    } catch (e) {
      console.log(e)

      return response.status(500).json({
        success: false,
        message: "An error occurred, please try again later.",
        data: [],
        errors: []
      })
    }
  }

  public async getOpenOrder({response, auth}: HttpContextContract) {
    if (!auth.user) {
      throw new Error('Unauthorized')
    }

    const result = await this.tradeService.getOpenOrder(auth.user)

    return response.status(200).json({
      success: true,
      message: "Success.",
      data: result
    })
  }

  public async createOrder({request, response, auth}: HttpContextContract) {
    const input: {type: TypeOrder, side: SideOrder, symbol: string, price: number, quantity: number} = await request.validate(CreateOrderValidator)

    if (!auth.user) {
      throw new Error('Unauthorized')
    }

    try {
      const result: {success: boolean, data?: any, error_code?: number} = await this.tradeService.createOrder(input, auth.user)

      if (result.success) {
        return response.status(200).json({
          success: true,
          message: "Success.",
          data: result?.data || []
        })
      } else {
        return response.status(200).json({
          success: false,
          error_code: result.error_code,
          message: "An error create order, please try again later.",
          data: []
        })
      }
    } catch (e) {
    }

    return response.status(200).json({
      success: true,
      error_code: 4000,
      message: "An error occurred please try again.",
      data: []
    })
  }
}
