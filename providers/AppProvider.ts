import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import {SymbolStatus} from "App/Enum/SymbolStatus";
import { OrderBook } from 'hft-limit-order-book';

export default class AppProvider {
  constructor (protected app: ApplicationContract) {
  }

  public async register() {
  }

  public async boot () {
    // IoC container is ready
  }

  public async ready () {
    // build hft
    const symbolModel = this.app.container.use('App/Models/Symbols').default
    const symbols = await symbolModel.query().where('status', SymbolStatus.ACTIVE).pojo()

    this.app.container.singleton('hftOrder', () => {
      return Object.fromEntries(symbols.map((item: { key: string; }) => [item.key, new OrderBook()]))
    })

    // App is ready
    if (this.app.environment === 'web') {
      await import('../start/socket')
    }
  }

  public async shutdown () {
    // Cleanup, since app is going down
  }
}
