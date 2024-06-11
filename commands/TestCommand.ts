import { BaseCommand } from '@adonisjs/core/build/standalone'
import CryptoJS from 'crypto-js'

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
    const encrypted = CryptoJS.AES.encrypt("Start Group Chat", 'w4rR_vVA9F282fGkAxkogPXKzggPtdb5')
    this.logger.info(encrypted)
    this.logger.info(encrypted.toString());
    this.logger.info(CryptoJS.AES.decrypt('U2FsdGVkX19b/eQUKTMxnXma3uol+aKyHGTF+bLV26iBepApG9C8KjzjME20YjHU', "w4rR_vVA9F282fGkAxkogPXKzggPtdb5").toString(CryptoJS.enc.Utf8))
  }
}
