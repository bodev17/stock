import Ws from "App/Services/ChatService";
import ConversationService from "App/Services/ConversationService";
import User from "App/Models/User";
import {isArray} from "@poppinss/utils/build/src/Helpers/types";

Ws.boot()
const conversationService = new ConversationService()
import {validator} from '@ioc:Adonis/Core/Validator'
import ChatValidator from "App/Validators/ChatValidator";
import {HttpContextContract} from "@ioc:Adonis/Core/HttpContext";
import Logger from "@ioc:Adonis/Core/Logger";
import {prisma} from "@ioc:Adonis/Addons/Prisma";
import CryptoJS from "crypto-js";
import Config from "@ioc:Adonis/Core/Config";

// Mock HttpContextContract
const ctx: HttpContextContract = {
  // @ts-ignore
  request: {},
  // @ts-ignore
  response: {},
}
const appKey = Config.get('app.appKey');

/**
 * Listen for incoming socket connections
 */
Ws.io.on('connection', (socket) => {
  const user: User = socket.user
  if (user) {
    socket.join(`${user.id}`)
  }

  socket.on('join_conversation', async (data) => {
    if (user) {
      // check user in conversation
      if (typeof data.conversationId === 'string') {
        const conversation = await conversationService.isInConversation(
          data.conversationId,
          user.id
        )
        if (conversation) {
          socket.join(data.conversationId)
        }
      }

      if (isArray(data.conversationId)) {
        const conversations = await conversationService.isInConversations(
          data.conversationId,
          user.id
        )

        conversations.map(conversation => socket.join(conversation.id))
      }
    }

    return false
  })

  socket.on('send_message', async (data) => {
    if (user) {
      const conversation = await conversationService.isInConversation(
        data.conversationId,
        user.id
      )
      if (conversation) {
        const message = await conversationService.sendMessage(
          data.conversationId,
          user.id,
          data.message
        )
        message.name = user.name
        // socket.to(data.conversationId).emit("new_message", message);
        // push to chatbox and list chat
        Ws.io.to(data.conversationId).emit("new_message", message);
      }
    }

    return false
  })

  socket.on('create_conversation', async (data, callbackFn) => {
    if (user) {
      try {
        const input = await validator.validate({
          schema: new ChatValidator(ctx).schema,
          data: data
        })

        const conversation = await conversationService.createConversation(input, user)
        // join all user to conversation
        if (conversation) {
          const members = conversation.members.map((num: { toString: () => any; }) => num.toString())

          conversation.messages = await prisma.messages.findMany({
            where: {
              conversationId: conversation.id
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          })
          for (const message of conversation.messages) {
            try {
              const userSender = await User.find(message.senderId)
              if (userSender) {
                message.name = userSender?.name || '#User'
              }
              message.content = CryptoJS.AES.decrypt(message.content, appKey).toString(CryptoJS.enc.Utf8)
            } catch (e) {
              Logger.error(e)
              message.content = '#Not found'
            }
            message.name = '#System'
          }
          if (conversation.type == 'user') {
            const sendTo = conversation.members.filter((member: number) => {return member != user.id})
            conversation.name = '#System'
            if (sendTo[0]) {
              const userSendTo = await User.find(sendTo[0])
              conversation.name = userSendTo?.name || '#User'
            }
          }
          const conversationCurrentUser = JSON.parse(JSON.stringify(conversation));

          members.filter((member: number) => {return member != user.id})
          if (conversation.type == 'user') {
            conversation.name = user.name
          }

          socket.to(members).emit("new_conversation", conversation);

          socket.emit("find_new_conversation", conversationCurrentUser);
        }
      } catch (error) {
        if (error.code == 'E_VALIDATION_FAILURE') {
          const firstField = Object.keys(error.messages)[0]; // Get the first field name
          const firstMessage = error.messages[firstField][0]; // Get the first error message for the first field
          const message = `Field ${firstField} ${firstMessage}`

          callbackFn({
            success: false,
            message: message,
            code: 422,
          });
        } else {
          Logger.error(error)
        }
        callbackFn({
          success: false,
          message: 'Fail creating conversation, please try again!',
          code: 1000,
        });
      }
    }
  })
})
