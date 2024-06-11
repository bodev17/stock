import { Server } from "socket.io"
import AdonisServer from '@ioc:Adonis/Core/Server'
import AuthBackend from "App/Services/AuthBackend";
import Logger from "@ioc:Adonis/Core/Logger";
import User from "App/Models/User";

export default new class Ws {
  public io: Server
  private booted:boolean = false

  constructor() {
  }

  public boot () {
    if (this.booted) {
      return
    }

    this.booted = true
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
