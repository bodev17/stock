import SymbolRepositoryInterface from "App/Interface/SymbolRepositoryInterface";
import Symbol from "App/Models/Symbol";
import {SymbolStatus} from "App/Enum/SymbolStatus";
import BaseRepository from "App/Repository/BaseRepository";
import {inject} from "@adonisjs/fold";

@inject()
export default class SymbolRepository implements SymbolRepositoryInterface {
  public async getActiveSymbols(): Promise<any> {
    const symbol = await Symbol.all()
    return Promise.resolve(symbol);
  }
}
