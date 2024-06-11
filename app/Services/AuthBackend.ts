import {config} from "Config/authbackend";
import axios from "axios";
import {base64} from "@poppinss/utils/build/src/Helpers";
import Logger from "@ioc:Adonis/Core/Logger";
import Cache from "@ioc:Kaperskyguru/Adonis-Cache";

export default class AuthBackend {
  // @ts-ignore
  private readonly domain: string
  private readonly tokenSecretKey: string
  private readonly CACHE_KEY_SAVE_TOKEN_BACKEND = 'save_token_auth';

  public constructor() {
    // @ts-ignore
    this.tokenSecretKey = base64.encode(config.client + ":" + config.secret_key)
    // @ts-ignore
    this.domain = config.domain
  }

  public async getToken() {
    // @ts-ignore
    const configGetToken = config.body.get_token
    const cacheKey = this.CACHE_KEY_SAVE_TOKEN_BACKEND

    let cacheToken = await Cache.get(cacheKey)
    cacheToken = JSON.parse(cacheToken)
    if (cacheToken && cacheToken?.access_token) {
      return cacheToken
    }
    return axios({
      method: configGetToken.method,
      url: this.domain + configGetToken.path,
      headers: {
        Authorization: `Bearer ${this.tokenSecretKey}`
      }
    }).then(async function (response) {
      const data = response?.data
      if (data?.data?.access_token) {
        const result = {
          success: true,
          access_token: data?.data?.access_token
        }
        const expires_in = data?.data?.expires_in || 0
        await Cache.set(cacheKey, result, expires_in / 60 / 2)

        return result
      }
    }).catch(function (error) {
      Logger.error(error)

      return {
        success: false,
        access_token: null
      }
    });
  }

  public async getUser(token: string, tokenUser: string) {
    // @ts-ignore
    const configGetToken = config.body.get_user

    return axios({
      method: configGetToken.method,
      url: this.domain + configGetToken.path,
      data: {
        token: tokenUser
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(function (response) {
      const data = response?.data
      if (data?.data) {
        return {
          success: true,
          data: data?.data
        }
      }
    }).catch(async function () {
      return {
        success: false,
        data: null
      }
    });
  }
}
