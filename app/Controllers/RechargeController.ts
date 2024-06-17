import {HttpContextContract} from "@ioc:Adonis/Core/HttpContext";
import {inject} from "@adonisjs/fold";
import RechargeService from "App/Services/RechargeService";
import {schema, rules} from '@ioc:Adonis/Core/Validator'
import {RechargeStatus} from "App/Enum/RechargeStatus";
import {isNumber} from "@poppinss/utils/build/src/Helpers/types";

@inject()
export default class TradeController {
  public constructor(private rechargeService: RechargeService) {
  }

  public async getHistories({request, response}: HttpContextContract) {
    const inputData = schema.create({
      page: schema.number.optional([
        rules.unsigned(),
      ]),
      limit: schema.number.optional([
        rules.unsigned(),
        rules.range(1, 100),
      ]),
      status: schema.enum.optional(Object.values(RechargeStatus).filter((item) => {
        return isNumber(item);
      }).map(item => item + ""))
    })
    const input = await request.validate({schema: inputData})

    try {
      const histories = await this.rechargeService.getHistories(input)
      return response.status(200).json({
        success: true,
        message: "Success.",
        data: histories
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
