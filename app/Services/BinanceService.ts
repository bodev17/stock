import { Server } from 'socket.io'
import AdonisServer from '@ioc:Adonis/Core/Server'
import Binance from "node-binance-api";
import Config from "@ioc:Adonis/Core/Config";
import Logger from "@ioc:Adonis/Core/Logger";
import AuthBackend from "App/Services/AuthBackend";
import User from "App/Models/User";

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

    this.binance = new Binance().options({
      APIKEY: Config.get('trade.binance_api_key'),
      APISECRET: Config.get('trade.binance_api_secret'),
      useServerTime: true,
      test: true,
      'family': 4,
    });

    const io: Server = new Server(AdonisServer.instance!, {
      cors: {
        origin: '*'
      }
    })

    io.use(async (socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        socket.disconnect()
        return;
      }

      try {
        // Call to auth service check
        const backendAuth = new AuthBackend();
        const tokenBackend = await backendAuth.getToken()
        if (tokenBackend?.success) {
          const userInfo = await backendAuth.getUser(
            tokenBackend.access_token,
            token
          )
          if (!userInfo?.success) {
            socket.disconnect()
            return;
          }

          if (userInfo?.success && userInfo?.data?.id) {
            const user = await User.find(userInfo?.data?.id)

            if (user) {
              // @ts-ignore
              socket.user = user.$original
              return next()
            }
          }
        }
      } catch (e) {
        // if token is invalid, close connection
        Logger.error(e)
      }
      socket.disconnect()
      return;
    })

    this.io = io
  }
}

export default new BinanceService()
