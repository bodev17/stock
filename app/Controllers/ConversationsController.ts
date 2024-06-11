import UserService from "App/Services/UserService";
import type {HttpContextContract} from "@ioc:Adonis/Core/HttpContext";
import {rules, schema} from "@ioc:Adonis/Core/Validator";
import {prisma} from "@ioc:Adonis/Addons/Prisma";
import Config from "@ioc:Adonis/Core/Config";
import {isArray, isNull} from "@poppinss/utils/build/src/Helpers/types";
import Logger from "@ioc:Adonis/Core/Logger";
import ChatValidator from "App/Validators/ChatValidator";
import {ChatType} from "App/Enums/ChatType";
import CryptoJS from 'crypto-js'
import User from "App/Models/User";
import Ws from "App/Services/ChatService";

export default class ConversationsController {
  private userService: UserService

  public constructor() {
    this.userService = new UserService()
  }

  public async listChat({auth, response, request}: HttpContextContract) {
    const user = auth.user
    if (user) {
      try {
        const taskSchema = schema.create({
          page: schema.number(),
          limit: schema.number(),
        })
        const payload = await request.validate({schema: taskSchema})

        if (payload.page < 1 || payload.limit > 100) {
          return response.status(200).json({
            success: false,
            message: 'Page and Limit validation failed.',
            code: 422,
            errors: [],
          });
        }

        const conversations = await prisma.conversations.findMany({
          where: {
            members: {
              has: user.id,
            },
          },
          include: {
            messages: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 1
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip: payload.limit * (payload.page - 1),
          take: payload.limit,
        });

        const allSenderIds: Array<number> = [];
        const appKey = Config.get('app.appKey');
        conversations.forEach(conversation => {
          if (conversation.type === 'user') {
            const sendTo = conversation.members.filter((member) => {return member != user.id})
            if (sendTo[0]) {
              allSenderIds.push(sendTo[0]);
            }
          }
          if (isArray(conversation?.messages)) {
            conversation.messages.forEach(message => {
              try {
                message.content = CryptoJS.AES.decrypt(message.content, appKey).toString(CryptoJS.enc.Utf8)
              } catch (e) {
                Logger.error(e)
                message.content = '#Not found'
              }
              if (message?.senderId) {
                allSenderIds.push(message.senderId);
              }
            });
          }
        });

        const senderIds = [...new Set(allSenderIds)];
        const userInfo = await this.userService.getDataUser(senderIds, ['id', 'name'])

        conversations.forEach(conversation => {
          if (conversation.type === 'user') {
            const sendTo = conversation.members.filter((member) => {return member != user.id})
            if (sendTo[0]) {
              const userSendTo = userInfo.find(user => user.id == sendTo[0])
              conversation.name = userSendTo?.name || '#User'
            }
          }

          if (isArray(conversation?.messages)) {
            conversation.messages.forEach(message => {
              if (isNull(message?.senderId)) {
                message.name = '#System'
              } else {
                const user = userInfo.find(user => user.id == message?.senderId)
                message.name = user?.name || '#User'
              }
            });
          }
        });

        return response.status(200).json({
          success: true,
          message: "Success",
          data: conversations
        });
      } catch (error) {
        if (error.code == 'E_VALIDATION_FAILURE') {
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

        Logger.error(error)
      }
    }

    return response.status(200).json({
      success: false,
      message: "Error when get data chat."
    });
  }

  public async createChat({auth, response, request}: HttpContextContract) {
    try {
      const payload = await request.validate(ChatValidator)

      let result: object
      if (payload.type == ChatType.USER) {
        result = await this.createUserChat(payload.send_to, auth);
      } else {
        result = await this.createGroupChat(payload.name, payload.members, auth);
      }

      return response.status(200).json({
        success: true,
        message: "Success.",
        data: result
      })
    } catch (error) {
      Logger.error(error)

      if (error.code == 'E_VALIDATION_FAILURE') {
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

  private async createUserChat(sendTo: number, auth: any): Promise<object> {
    const appKey = Config.get('app.appKey');

    return prisma.conversations.create({
      data: {
        "name": null,
        "type": ChatType.USER,
        "members": [auth.user.id, sendTo],
        messages: {
          create: [
            {
              "senderId": null,
              "file": null,
              "content": CryptoJS.AES.encrypt("Start Chat", appKey).toString(),
              "readBy": []
            }
          ]
        }
      }
    });
  }

  private createGroupChat(groupName: string, members: number[], auth: any): object {
    members.push(auth.user.id)
    const appKey = Config.get('app.appKey');

    return prisma.conversations.create({
      data: {
        "name": groupName,
        "type": ChatType.GROUP,
        "members": [...new Set(members)],
        messages: {
          create: [
            {
              "senderId": null,
              "file": null,
              "content": CryptoJS.AES.encrypt("Start Group Chat", appKey).toString(),
              "readBy": []
            }
          ]
        }
      }
    });
  }

  public async getDetail({auth, response, params, request}: HttpContextContract) {
    // check user in message
    if (!params.conversation_id) {
      return response.status(422).json({
        success: false,
        message: 'Please choose conversation.',
        code: 422,
      });
    }
    const user = auth.user

    const conversation = await prisma.conversations.findUnique({
      where: {
        id: params.conversation_id,
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

    try {
      const taskSchema = schema.create({
        page: schema.number(),
        limit: schema.number(),
      })
      const payload = await request.validate({schema: taskSchema})

      if (payload.page < 1 || payload.limit > 100) {
        return response.status(200).json({
          success: false,
          message: 'Page and Limit validation failed.',
          code: 422,
          errors: [],
        });
      }

      const messages = await prisma.messages.findMany({
        where: {
          conversationId: params.conversation_id
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: payload.limit * (payload.page - 1),
        take: payload.limit,
      })

      const sortMessageByDate = (a: object, b: object) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateA - dateB;
      };
      messages.sort(sortMessageByDate);

      const appKey = Config.get('app.appKey');
      const allSenderIds: number[] = [];
      messages.forEach(message => {
        try {
          message.content = CryptoJS.AES.decrypt(message.content, appKey).toString(CryptoJS.enc.Utf8)
        } catch (e) {
          Logger.error(e)
          message.content = '#Not found'
        }
        if (message?.senderId) {
          allSenderIds.push(message.senderId);
        }
      });

      const senderIds = [...new Set(allSenderIds)];
      const userInfo = await this.userService.getDataUser(senderIds, ['id', 'name'])

      messages.forEach(message => {
        if (isNull(message?.senderId)) {
          message.name = '#System'
        } else {
          const user = userInfo.find(user => user.id == message?.senderId)
          message.name = user?.name || '#User'
        }
      });

      return response.status(200).json({
        success: true,
        message: "Success",
        data: messages
      });
    } catch (error) {
      if (error.code == 'E_VALIDATION_FAILURE') {
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

      Logger.error(error)
    }

    return response.status(200).json({
      success: false,
      message: "Error when get data chat."
    });
  }

  public async deleteChat({auth, response, params}: HttpContextContract) {
    const user: User = auth.user

    const conversation = await prisma.conversations.findUnique({
      where: {
        id: params.conversation_id,
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
    const deleteConversation = await prisma.conversations.delete({
      where: {
        id: params.conversation_id,
      },
    })

    if (deleteConversation) {
      Ws.boot()
      Ws.io.to(params.conversation_id).emit("delete_conversation", conversation);
    }

    return response.status(200).json({
      success: true,
      message: "Success",
      data: {
        status: deleteConversation,
      }
    });
  }

  public async outConversation({auth, response, params}: HttpContextContract) {
    const user: User = auth.user

    const conversation = await prisma.conversations.findUnique({
      where: {
        id: params.conversation_id,
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

    try {
      const update = await prisma.conversations.update({
        where: {
          id: conversation.id
        },
        data: {
          members: {
            set: conversation.members.filter((id) => id !== user.id),
          },
        },
      });

      if (update) {
        const appKey = Config.get('app.appKey');
        const message = await prisma.messages.create({
          data: {
            conversationId: `${conversation.id}`,
            senderId: null,
            file: null,
            content: CryptoJS.AES.encrypt(user.username + ' out group.', appKey).toString(),
            readBy: [],
          }
        });
        message.name = user.name
        message.content = user.username + ' out group.'

        Ws.boot()
        Ws.io.to(conversation.id).emit("new_message", message);
        Ws.io.to(params.conversation_id).emit("out_conversation", conversation);
      }

      return response.status(200).json({
        success: true,
        message: 'Success.',
        data: update,
      });
    } catch (e) {
      Logger.error(e)
      return response.status(200).json({
        success: false,
        message: 'Fail out conversation, please try again.',
        code: 1006,
      });
    }
  }

  public async addMember({auth, response, request, params}: HttpContextContract) {
    try {
      const taskSchema = schema.create({
        members: schema.array([
          rules.required(),
          rules.minLength(1),
          rules.maxLength(100),
        ]).members(schema.number())
      })
      const payload = await request.validate({schema: taskSchema})

      const user: User = auth.user

      const conversation = await prisma.conversations.findUnique({
        where: {
          id: params.conversation_id,
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

      const infoMembers = await this.userService.getDataUser(payload.members)
      const membersAdd = infoMembers.map(member => member.id)
      const members = membersAdd.concat(conversation.members)

      const update = await prisma.conversations.update({
        where: {
          id: conversation.id
        },
        data: {
          members: {
            set: members,
          },
        },
      });

      if (update) {
        Ws.boot()
        const appKey = Config.get('app.appKey');

        for (const member of infoMembers) {
          const message = await prisma.messages.create({
            data: {
              conversationId: `${conversation.id}`,
              senderId: null,
              file: null,
              content: CryptoJS.AES.encrypt(member.username + ' join group.', appKey).toString(),
              readBy: [],
            }
          });
          message.name = member.name
          message.content = member.username + ' join group.'
          Ws.io.to(conversation.id).emit("new_message", message);
        }

        const members = membersAdd.map((num: { toString: () => any; }) => num.toString())
        Ws.io.to(members).emit("new_conversation", conversation);
      }

      return response.status(200).json({
        success: true,
        message: 'Success.',
        data: update,
      });

    } catch (error) {
      if (error.code == 'E_VALIDATION_FAILURE') {
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

      Logger.error(error)
    }

    return response.status(200).json({
      success: false,
      message: "Error when get add member."
    });
  }
}
