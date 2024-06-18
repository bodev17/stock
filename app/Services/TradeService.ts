import User from "App/Models/User";
import {Order} from "App/Interface/Order";
import {inject} from "@adonisjs/fold";
import OrderRepository from "App/Repository/OrderRepository";
import Database from "@ioc:Adonis/Lucid/Database";
import Application from "@ioc:Adonis/Core/Application";
import SymbolService from "App/Services/SymbolService";

@inject()
export default class TradeService {
  constructor(protected orderRepository: OrderRepository) {
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
