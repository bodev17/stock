import {HttpContextContract} from "@ioc:Adonis/Core/HttpContext";
import {inject} from "@adonisjs/fold";
import LevelService from "App/Services/LevelService";

@inject()
export default class RechargeController {
  public constructor(
    private levelService: LevelService
  ) {
  }

  public async getConfigLevel({response, auth}: HttpContextContract) {
    if (!auth.user) {
      throw new Error('Unauthorized')
    }

    try {
      const data = this.levelService.getConfigLevel()
      return response.status(200).json({
        success: true,
        message: "Success.",
        data: data
      })
    } catch (e) {
      console.log(e)

      return response.status(500).json({
        success: false,
        message: "An error occurred, please try again later.",
        data: [],
        errors: []
      })
    }
  }
}
