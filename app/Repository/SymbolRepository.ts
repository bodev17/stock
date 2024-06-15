import SymbolRepositoryInterface from "App/Interface/SymbolRepositoryInterface";
import Symbol from "App/Models/Symbol";
import {SymbolStatus} from "App/Enum/SymbolStatus";

export default class SymbolRepository implements SymbolRepositoryInterface {
  public async getActiveSymbols(): Promise<any> {
    const symbol = await Symbol.query().where('status', SymbolStatus.ACTIVE)
    return Promise.resolve(symbol);
  }
}
