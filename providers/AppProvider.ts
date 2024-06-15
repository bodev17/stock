import type { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AppProvider {
  constructor (protected app: ApplicationContract) {
  }

  public register () {
  }

  public async boot () {
    // IoC container is ready
  }

  public async ready () {
    await this.setupSymbolBinding()
    // App is ready
    if (this.app.environment === 'web') {
      await import('../start/socket')
    }
  }

  public async shutdown () {
    // Cleanup, since app is going down
  }

  public async setupSymbolBinding() {
    const { default: SymbolRepository } = await import("App/Repository/SymbolRepository")

    const { default: SymbolService } = await import("App/Services/SymbolService")

    const { default: TradeController } = await import('App/Controllers/TradeController')

    this.app.container.singleton(
      'App/Interface/SymbolRepositoryInterface',
      () => new SymbolRepository(),
    )

    this.app.container.singleton('App/Services/SymbolService', () => {
      const repo = this.app.container.use(
        'App/Interface/SymbolRepositoryInterface',
      )
      return new SymbolService(repo)
    })

    this.app.container.singleton('App/Controllers/TradeController', () => {
      const service = this.app.container.use('App/Services/SymbolService')
      return new TradeController(service)
    })
  }
}
