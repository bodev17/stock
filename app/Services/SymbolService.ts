import Symbol from "App/Models/Symbol";
import Cache from "@ioc:Kaperskyguru/Adonis-Cache";
import {SymbolStatus} from "App/Enum/SymbolStatus";

export default class SymbolService {
  private readonly CACHE_KEY_LIST_SYMBOLS = 'list_symbols';

  public async getActiveSymbols() {
    let symbols = await Cache.get(this.CACHE_KEY_LIST_SYMBOLS)
    if (Array.isArray(symbols)) {
      return symbols;
    }

    const symbolsData: Symbol[] = await Symbol.query().where('status', SymbolStatus.ACTIVE).pojo()
    return symbolsData;
  }
}
