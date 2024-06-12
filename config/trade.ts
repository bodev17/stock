import Env from "@ioc:Adonis/Core/Env";

export const binance_api_secret: string = Env.get('BINANCE_API_SECRET', null)
export const binance_api_key: string = Env.get('BINANCE_API_KEY', null)
