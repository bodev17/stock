import {inject} from "@adonisjs/fold";
import RechargeRepository from "App/Repository/RechargeRepository";
import {RechargeStatus} from "App/Enum/RechargeStatus";
import User from "App/Models/User";

@inject()
export default class RechargeService {
  constructor(private rechargeRepository: RechargeRepository) {
  }

  public async create(input: {content: string, money: number}, user?: User) {
    const dataInsert = {
      'status': RechargeStatus.PENDING,
      'user_id': user?.id,
      'money': input.money,
      'trace': input.content,
    }

    const result = await this.rechargeRepository.create(dataInsert)
    console.log(result)
  }

  public async getHistories(input: PaginateInterface = {}, user?: User) {
    if (input.page === undefined || input.page < 1) {
      input.page = 1
    }
    if (input.limit === undefined  || input.limit < 1 || input.limit > 100) {
      input.limit = 10
    }
    input.user_id = user?.id

    const recharges = this.rechargeRepository.getHistories(input)
    return Promise.resolve(recharges);
  }
}
