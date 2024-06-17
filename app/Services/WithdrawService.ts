import {inject} from "@adonisjs/fold";
import User from "App/Models/User";
import WithDrawRepository from "App/Repository/WithDrawRepository";
import {WithdrawStatus} from "App/Enum/WithdrawStatus";
import Database from '@ioc:Adonis/Lucid/Database';

@inject()
export default class WithdrawService {
  constructor(private withDrawRepository: WithDrawRepository) {
  }

  public async create(input: {content: string, money: number}, user: User) {
    if (!user) {
      throw new Error('Unauthorized')
    }

    if ((user?.money_temp - input.money) <= 0) {
      return {
        success: false,
        error_code: 1200
      }
    }

    const dataInsert = {
      'status': WithdrawStatus.PENDING,
      'user_id': user?.id,
      'money': input.money,
      'trace': input.content,
    }

    const trx = await Database.transaction();

    const result = await this.withDrawRepository.create(dataInsert)

    user.money_temp = user.money_temp - input.money
    await user.save()

    if (result.$isPersisted) {
      await trx.commit();
      return {
        success: true,
        data: result
      }
    }
    await trx.rollback()

    return {
      success: false,
      error_code: 1201
    }
  }

  public async getHistories(input: PaginateInterface = {}, user?: User) {
    if (input.page === undefined || input.page < 1) {
      input.page = 1
    }
    if (input.limit === undefined  || input.limit < 1 || input.limit > 100) {
      input.limit = 10
    }
    input.user_id = user?.id

    const recharges = this.withDrawRepository.getHistories(input)
    return Promise.resolve(recharges);
  }
}
