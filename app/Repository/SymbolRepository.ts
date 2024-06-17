import SymbolRepositoryInterface from "App/Interface/SymbolRepositoryInterface";
import Symbol from "App/Models/Symbol";
import {SymbolStatus} from "App/Enum/SymbolStatus";
import BaseRepository from "App/Repository/BaseRepository";

export default class SymbolRepository extends BaseRepository implements SymbolRepositoryInterface {
  constructor() {
    super(Symbol);
  }

  public async getActiveSymbols(): Promise<any> {
    const symbol = await Symbol.query().where('status', SymbolStatus.ACTIVE)
    return Promise.resolve(symbol);
  }
}
