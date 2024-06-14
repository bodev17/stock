import { BaseCommand } from '@adonisjs/core/build/standalone'
// import SymbolService from "App/Services/SymbolService";
import UserService from "App/Services/UserService";

export default class TestCommand extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'test:command'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = ''

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest`
     * afterwards.
     */
    loadApp: false,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  }

  public async run() {
    const userService: UserService = this.application.container.use('ioc:App/Contracts/ServiceContract')
    const users = await userService.getDataUser([1]);
    // const symbols = await new SymbolService().getActiveSymbols()
    // this.logger.info(symbols)
  }
}
