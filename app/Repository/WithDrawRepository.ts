import BaseRepository from "App/Repository/BaseRepository";
import WithdrawRepositoryInterface from "App/Interface/WithdrawRepositoryInterface";
import Withdraw from "App/Models/Withdraw";

export default class WithDrawRepository extends BaseRepository implements WithdrawRepositoryInterface {
  constructor() {
    super(Withdraw);
  }

  public async getHistories(input: PaginateInterface = {}): Promise<any> {
    const page = input.page
    const limit = input.limit

    const recharges = this.queryBuilder(input).paginate(page, limit)
    return Promise.resolve(recharges);
  }
}
