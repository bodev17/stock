import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BinanceService from "App/Services/BinanceService";

export default class MaintenanceMiddleware {
  public async handle({response}: HttpContextContract, next: () => Promise<void>) {

    // if (BinanceService.binance.systemStatus()) {
    //   return response.status(401).json({
    //     success: false,
    //     message: 'Unauthorized',
    //     code: 401,
    //     errors: []
    //   });
    // }
    await next()
  }
}
