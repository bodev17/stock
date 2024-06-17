import RechargeRepositoryInterface from "App/Interface/RechargeRepositoryInterface";
import Recharge from "App/Models/Recharge";
import BaseRepository from "App/Repository/BaseRepository";

export default class RechargeRepository extends BaseRepository implements RechargeRepositoryInterface {
  constructor() {
    super(Recharge);
  }

  public async getHistories(input: {} = {}): Promise<any> {
    const page = input.page
    const limit = input.limit

    const recharges = this.query(input).paginate(page, limit)
    return Promise.resolve(recharges);
  }
}
