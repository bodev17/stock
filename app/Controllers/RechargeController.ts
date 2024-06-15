import {HttpContextContract} from "@ioc:Adonis/Core/HttpContext";

export default class TradeController {
  public constructor() {
  }

  public async getListSymbols({response}: HttpContextContract) {
    return response.status(200).json({
      success: true,
      message: "Success.",
      data: []
    })
  }
}
