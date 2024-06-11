import {prisma} from "@ioc:Adonis/Addons/Prisma";
import Config from "@ioc:Adonis/Core/Config";
import CryptoJS from 'crypto-js'
import {ChatType} from "App/Enums/ChatType";
import User from "App/Models/User";
import Logger from "@ioc:Adonis/Core/Logger";

interface ConversationRequestCreate {
  type: string,
  name?: string | null,
  send_to?: number | null,
  members?: number[] | null,
}

export default class ConversationService {
  public isInConversation(conversationId: string, userId: number) {
    return prisma.conversations.findUnique({
      where: {
        id: conversationId,
        members: {
          has: userId
        }
      }
    });
  }

  public isInConversations(conversationId: Array<string>, userId: number) {
    return prisma.conversations.findMany({
      where: {
        id: {
          in: conversationId
        },
        members: {
          has: userId
        }
      }
    });
  }

  public async sendMessage(conversationId: string, userId: number, content: string) {
    const appKey = Config.get('app.appKey');
    const message = await prisma.messages.create({
      data: {
        conversationId: `${conversationId}`,
        senderId: userId,
        file: null,
        content: CryptoJS.AES.encrypt(content, appKey).toString(),
        readBy: [],
      }
    });
    message.content = content

    return message
  }

  public async createConversation(conversation: ConversationRequestCreate, user: User) {
    try {
      let result: object
      if (conversation.type == ChatType.USER) {
        result = await this.createUserChat(conversation.send_to, user);
      } else {
        result = await this.createGroupChat(conversation.name, conversation.members, user);
      }

      return result;
    } catch (e) {
      Logger.error(e)
    }

    return false
  }

  private async createUserChat(sendTo: number, user: User): Promise<object> {
    const appKey = Config.get('app.appKey');

    const conversation = await prisma.conversations.findMany({
      where: {
        type: 'user',
        members: {
          hasEvery: [sendTo, user.id]
        }
      },
      take: 1,
    });

    if (conversation[0]) {
      return conversation[0];
    }

    return prisma.conversations.create({
      data: {
        "name": null,
        "type": ChatType.USER,
        "members": [user.id, sendTo],
        messages: {
          create: [
            {
              "senderId": null,
              "file": null,
              "content": CryptoJS.AES.encrypt(user.username + " Start Chat", appKey).toString(),
              "readBy": []
            }
          ]
        }
      }
    });
  }

  private async createGroupChat(groupName: string, members: number[], user: User): Promise<object> {
    members.push(user.id)
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
              "content": CryptoJS.AES.encrypt(user.username + " Start Group Chat", appKey).toString(),
              "readBy": []
            }
          ]
        }
      }
    });
  }
}
