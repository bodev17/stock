import User from "App/Models/User";
import {UserContract} from "@ioc:App/Contracts/ServiceContract";

export default class UserService implements UserContract {
  public async getDataUser(userId: number[], select: string[] = ['*']) {
    const users = await User.query().select(select).whereIn('id', userId)

    return users.map((user) => user.toJSON())
  }
}
