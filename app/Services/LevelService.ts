import {inject} from "@adonisjs/fold";

@inject()
export default class LevelService {
  public getConfigLevel() {
    return [
      {
        level: 1,
        trade_money: 1000000000,
        total_trade: 1000,
        recharge_money: 10000000,
        ref: 20,
        recharge_money_ref: 0,
        trade_money_ref: 0,
        total_trade_ref: 0,
      },
      {
        level: 2,
        trade_money: 5000000000,
        total_trade: 4000,
        recharge_money: 20000000,
        ref: 40,
        recharge_money_ref: 100000,
        trade_money_ref: 0,
        total_trade_ref: 2000000000,
      },
      {
        level: 3,
        trade_money: 20000000000,
        total_trade: 10000,
        recharge_money: 100000000,
        ref: 120,
        recharge_money_ref: 500000,
        trade_money_ref: 0,
        total_trade_ref: 5000000000,
      },
    ];
  }
}
