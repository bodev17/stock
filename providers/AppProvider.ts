import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
// import UserService from "App/Services/UserService";

export default class AppProvider {
  constructor (protected app: ApplicationContract) {
  }

  public register () {
    // Register your own bindings
    // this.app.container.bind('ioc:App/Contracts/ServiceContract', () => {
    //   return new UserService()
    // })
    //
    // this.app.container.singleton('App/Services/UserService', () => {
    //   const UserService = require('App/Services/UserService').default
    //   return new UserService()
    // })

  }

  public async boot () {
    // IoC container is ready
  }

  public async ready () {
    // App is ready
    if (this.app.environment === 'web') {
      await import('../start/socket')
    }
  }

  public async shutdown () {
    // Cleanup, since app is going down
  }
}
