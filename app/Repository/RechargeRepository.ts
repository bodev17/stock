import RechargeRepositoryInterface from "App/Interface/RechargeRepositoryInterface";
import Recharge from "App/Models/Recharge";

export default class RechargeRepository implements RechargeRepositoryInterface {
  public async create(newRecharge: {}): Promise<any> {
    const recharge = await Recharge.create(newRecharge)
    return Promise.resolve(recharge.$isPersisted);
  }

  getHistories(): Promise<any> {
    return Promise.resolve(undefined);
  }
}
