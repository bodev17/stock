import {inject} from "@adonisjs/fold";
import RechargeRepositoryInterface from "App/Interface/RechargeRepositoryInterface";

@inject()
export default class SymbolService {
  constructor(private rechargeRepository: RechargeRepositoryInterface) {
  }

  public async getHistories() {
  }
}
