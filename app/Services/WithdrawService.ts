import {inject} from "@adonisjs/fold";
import WithdrawRepositoryInterface from "App/Interface/WithdrawRepositoryInterface";

@inject()
export default class SymbolService {
  constructor(private withdrawRepository: WithdrawRepositoryInterface) {
  }

  public async getHistories() {
  }
}
