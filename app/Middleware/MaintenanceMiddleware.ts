import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BinanceService from "App/Services/BinanceService";
import Setting from "App/Models/Setting";
import {SettingStatus} from "App/Enum/SettingStatus";

export default class MaintenanceMiddleware {
  public async handle({response}: HttpContextContract, next: () => Promise<void>) {

    await BinanceService.binance.systemStatus(function (status) {
      if (!status) {
        return response.status(503).json({
          success: false,
          message: "Maintenance",
          code: 502,
          errors: []
        });
      }
    })

    const setting = await Setting.query().where('key', 'maintain').where('status', SettingStatus.ACTIVE).first()
    if (setting) {
      return response.status(503).json({
        success: false,
        message: "Maintenance",
        code: 502,
        errors: []
      });
    }

    await next()
  }
}
