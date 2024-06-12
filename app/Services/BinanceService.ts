import { Server } from 'socket.io'
import AdonisServer from '@ioc:Adonis/Core/Server'
import Binance from "node-binance-api";
import Config from "@ioc:Adonis/Core/Config";

class BinanceService {
  public io: Server
  private booted = false
  public binance: Binance;

  public boot() {
    /**
     * Ignore multiple calls to the boot method
     */
    if (this.booted) {
      return
    }

    this.booted = true
    this.io = new Server(AdonisServer.instance!)

    this.binance = new Binance().options({
      APIKEY: Config.get('trade.binance_api_key'),
      APISECRET: Config.get('trade.binance_api_secret'),
      useServerTime: true,
      test: true
    });
  }
}

export default new BinanceService()
