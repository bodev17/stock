import User from "App/Models/User";
import {Order} from "App/Interface/Order";
import {inject} from "@adonisjs/fold";
import OrderRepository from "App/Repository/OrderRepository";
import Database from "@ioc:Adonis/Lucid/Database";
import Application from "@ioc:Adonis/Core/Application";
import SymbolService from "App/Services/SymbolService";
import {OrderStatus} from "App/Enum/OrderStatus";

@inject()
export default class TradeService {
  constructor(protected orderRepository: OrderRepository) {
  }

  public async getHistoriesOrder(input: PaginateInterface, user: User) {
    if (input.page === undefined || input.page < 1) {
      input.page = 1
    }
    if (input.limit === undefined  || input.limit < 1 || input.limit > 100) {
      input.limit = 10
    }
    input.user_id = user?.id

    const page = input.page
    const limit = input.limit

    const histories = this.orderRepository.queryBuilder(input).paginate(page, limit)
    return Promise.resolve(histories);
  }

  public async getOpenOrder (user: User) {
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

    //check side
    input.user_id = user.id

    const trx = await Database.transaction();
    try {
      const result = await this.orderRepository.create(input)

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
}