import User from "App/Models/User";

export default class UserService {
  public async getDataUser(userId: number[], select: string[] = ['*']) {
    const users = await User.query().select(select).whereIn('id', userId)

    return users.map((user) => user.toJSON())
  }
}
