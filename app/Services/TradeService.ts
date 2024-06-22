import User from "App/Models/User";
import {Order} from "App/Interface/Order";
import {inject} from "@adonisjs/fold";
import OrderRepository from "App/Repository/OrderRepository";
import Database from "@ioc:Adonis/Lucid/Database";
import Application from "@ioc:Adonis/Core/Application";
import SymbolService from "App/Services/SymbolService";
import {OrderStatus} from "App/Enum/OrderStatus";
import {OrderBook} from "hft-limit-order-book/dist/types";
// @ts-ignore
import {Order as OrderModel} from "App/Models/Order";
import BinanceService from "App/Services/BinanceService";

@inject()
export default class TradeService {
  constructor(protected orderRepository: OrderRepository) {
    BinanceService.boot()
  }

  private getHftOrderSymbol(symbol: string | number): OrderBook | null {
    const hftOrder = Application.container.use('hftOrder')
    return hftOrder[symbol] || null
  }

  public async getHistoriesOrder(input: PaginateInterface, user: User) {
    if (input.page === undefined || input.page < 1) {
      input.page = 1
    }
    if (input.limit === undefined || input.limit < 1 || input.limit > 100) {
      input.limit = 10
    }
    input.user_id = user?.id

    const page = input.page
    const limit = input.limit

    const histories = this.orderRepository.queryBuilder(input).paginate(page, limit)
    return Promise.resolve(histories);
  }

  public async getOpenOrder(user: User) {
    const input = {
      user_id: user.id,
      status: [
        OrderStatus.STATUS_OPEN,
        OrderStatus.STATUS_MATCH,
      ],
    }

    const openOrders = this.orderRepository.queryBuilder(input).pojo()
    return Promise.resolve(openOrders);
  }

  public async createOrder(input: Order, user: User) {
    if ((user?.money_temp - input.price) <= 0) {
      return {
        success: false,
        error_code: 1200
      }
    }

    const symbolService = Application.container.make(SymbolService)
    const symbols = await symbolService.getActiveSymbols()
    if (!symbols.includes(input.symbol)) {
      return {
        success: false,
        error_code: 5002
      }
    }

    const hftOrderSymbol = this.getHftOrderSymbol(input?.symbol || 'BTCUSDT')
    if (!hftOrderSymbol) {
      return {
        success: false,
        error_code: 5003
      }
    }

    //check side
    input.user_id = user.id

    const trx = await Database.transaction();
    try {
      const result = await this.orderRepository.create(input)
      const afterMatchOrder = hftOrderSymbol.createOrder(
        // @ts-ignore
        input.type,
        input.side,
        input.quantity,
        input.price,
        result.id,
      )

      if (afterMatchOrder.done) {
        for (const matchDoneOrder of afterMatchOrder.done) {
          const order = matchDoneOrder.toObject()
          OrderModel.query().where('id', order.id).update({
            status: OrderStatus.STATUS_CLOSE,
            updated_at: order.time
          })
          BinanceService.io.to("" + user.id).emit('event_order', OrderModel.query().where('id', order.id).first())
        }
      }

      if (afterMatchOrder.partial) {
        const orderPartial = afterMatchOrder.partial.toObject()
        OrderModel.query().where('id', orderPartial.id).update({
          quantity_match: orderPartial.size,
          status: OrderStatus.STATUS_MATCH,
          updated_at: orderPartial.time
        })
        BinanceService.io.to("" + user.id).emit('event_order', OrderModel.query().where('id', orderPartial.id).first())
      }

      user.money_temp = user.money_temp - input.price
      await user.save()

      await trx.commit();
      return {
        success: true,
        data: result
      }
    } catch (e) {
      console.log(e)
      await trx.rollback()
    }

    return {
      success: false,
      data: [],
      error_code: 5000
    }
  }

  public async updateOrder(id: number, input: Order, user: User) {
    const order: OrderModel = OrderModel.query().where('id', id).first()
    if (!order) {
      return {
        success: false,
        error_code: 5005
      }
    }

    const hftOrderSymbol:OrderBook | null  = this.getHftOrderSymbol(order.symbol)
    if (!hftOrderSymbol) {
      return {
        success: false,
        error_code: 5003
      }
    }
    // @ts-ignore
    delete input.type

    const update = order.update(input)

    if (update) {
      const result = hftOrderSymbol.modify("" + id, input);
      if (result.err) {
        return {
          success: false,
          error_code: 5004
        }
      }

      BinanceService.io.to("" + user.id).emit('event_order', OrderModel.query().where('id', id).first())

      return {
        success: true,
        data: order
      }
    }
    return {
      success: false,
      error_code: 5005
    }
  }

  public async cancelOrder(id: number, user: User) {
    const order: OrderModel = OrderModel.query().where('id', id).first()
    if (!order) {
      return {
        success: false,
        error_code: 5005
      }
    }

    order.update({
      status: OrderStatus.STATUS_CLOSE
    })
    const hftOrderSymbol: OrderBook | null = this.getHftOrderSymbol(order.symbol)
    if (!hftOrderSymbol) {
      return {
        success: false,
        error_code: 5003
      }
    }

    hftOrderSymbol.cancel("" + id)
    BinanceService.io.to("" + user.id).emit('event_order', OrderModel.query().where('id', id).first())

    return {
      success: true,
      data: order
    }
  }
}
