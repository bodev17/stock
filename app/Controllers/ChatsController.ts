import type {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import {prisma} from '@ioc:Adonis/Addons/Prisma'
import Logger from "@ioc:Adonis/Core/Logger";
import UserService from "App/Services/UserService";
import CryptoJS from 'crypto-js'
import Config from '@ioc:Adonis/Core/Config'
import SendSmsValidator from "App/Validators/SendSmsValidator";
import User from "App/Models/User";

export default class ChatsController {
  private userService: UserService

  public constructor() {
    this.userService = new UserService()
  }

  public async sendMessage ({auth, response, request}: HttpContextContract) {
    try {
      const user: User = auth.user
      const payload = await request.validate(SendSmsValidator)
      const conversation = await prisma.conversations.findUnique({
        where: {
          id: payload.conversation_id,
          members: {
            has: user.id
          }
        }
      })

      if (!conversation) {
        return response.status(422).json({
          success: false,
          message: 'Conversation not found.',
          code: 1005,
        });
      }
      const appKey = Config.get('app.appKey');
      const message = await prisma.messages.create({
        data: {
          conversationId: `${payload.conversation_id}`,
          senderId: user.id,
          file: null,
          content: CryptoJS.AES.encrypt(payload.message, appKey).toString(),
          readBy: [],
        }
      });
      message.content = payload.message

      return response.status(200).json({
        success: true,
        message: "Success.",
        data: message
      })
    } catch (error) {
      Logger.error(error)
      if(error.code == 'E_VALIDATION_FAILURE'){
        let message = 'Validation failed'
        if (error?.messages?.errors && error.messages.errors[0]?.message && error.messages.errors[0]?.field) {
          const firstErrorMessage = error.messages.errors[0].message
          const fieldName = error.messages.errors[0].field
          message = `Field ${fieldName} ${firstErrorMessage}`
        }

        return response.status(422).json({
          success: false,
          message: message,
          code: 422,
          errors: error.messages.errors,
        });
      }

      return response.status(200).json({
        success: false,
        message: 'An error occurred.',
        code: 1000,
      });
    }
  }
}
