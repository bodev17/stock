import {inject} from "@adonisjs/fold";
import RechargeRepository from "App/Repository/RechargeRepository";
import db from '@adonisjs/lucid/services/db'

@inject()
export default class RechargeService {
  constructor(private rechargeRepository: RechargeRepository) {
  }

  public async getHistories(input: {} = {}) {
    if (input.page < 1) {
      input.page = 1
    }
    if (input.limit < 1 || input.limit > 100) {
      input.limit = 10
    }

    const recharges = this.rechargeRepository.getHistories(input)
    return Promise.resolve(recharges);
  }
}
