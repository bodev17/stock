import BaseRepository from "App/Repository/BaseRepository";
import SymbolRepositoryInterface from "App/Interface/SymbolRepositoryInterface";
import Symbols from "App/Models/Symbols";
import {SymbolStatus} from "App/Enum/SymbolStatus";

export default class SymbolRepository extends BaseRepository implements SymbolRepositoryInterface {
  constructor() {
    super(Symbols);
  }

  public async getActiveSymbols(input: PaginateInterface = {}): Promise<any> {
    input.status = SymbolStatus.ACTIVE
    const recharges = this.queryBuilder(input).select(['key']).pojo()
    return Promise.resolve(recharges);
  }
}
