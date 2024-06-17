import WithdrawRepositoryInterface from "App/Interface/WithdrawRepositoryInterface";
import Withdraw from "App/Models/Withdraw";

export default class WithDrawRepository implements WithdrawRepositoryInterface {
  public async create(newRecharge: {}): Promise<any> {
    const recharge = await Withdraw.create(newRecharge)
    return Promise.resolve(recharge.$isPersisted);
  }

  getHistories(): Promise<any> {
    return Promise.resolve(undefined);
  }
}
