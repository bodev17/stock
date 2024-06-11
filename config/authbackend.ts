import Env from '@ioc:Adonis/Core/Env'

export const config: Object = {
  domain: Env.get('BASE_URL_AUTH'),
  body: {
    get_token: {
      path: "/api/auth/server/get-token",
      method: "GET"
    },
    verify: {
      path: "/api/auth/server/verify",
      method: "GET"
    },
    get_user: {
      path: "/api/auth/server/get-user",
      method: "GET"
    }
  },
  client: Env.get('AUTH_CLIENT'),
  secret_key: Env.get('AUTH_SECRET_KEY')
}
