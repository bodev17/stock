import Cache from "@ioc:Kaperskyguru/Adonis-Cache";
import {inject} from "@adonisjs/fold";
import SymbolRepository from "App/Repository/SymbolRepository";

@inject()
export default class SymbolService {
  constructor(private symbolRepository: SymbolRepository) {
  }

  private readonly CACHE_KEY_LIST_SYMBOLS = 'list_symbols_';

  public async getActiveSymbols() {
    let symbols = await Cache.get(this.CACHE_KEY_LIST_SYMBOLS)
    if (Array.isArray(symbols)) {
      return symbols;
    }

    const symbolsData = await this.symbolRepository.getActiveSymbols()
    const symbolCache = symbolsData.map((item: { key: string; }) => item.key);

    await Cache.set(this.CACHE_KEY_LIST_SYMBOLS, symbolCache, 10)

    return symbolCache;
  }
}
