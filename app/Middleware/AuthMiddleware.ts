import type {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import AuthBackend from "App/Services/AuthBackend";

export default class AuthMiddleware {
  public async handle({request, response, auth}: HttpContextContract, next: () => Promise<void>) {
    const token = request.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return response.status(401).json({
        success: false,
        message: 'Unauthorized',
        code: 401,
        errors: []
      });
    }
    // Call to auth service check
    const backendAuth = new AuthBackend();
    const tokenBackend = await backendAuth.getToken()
    if (tokenBackend?.success) {
      const userInfo = await backendAuth.getUser(
        tokenBackend.access_token,
        token
      )
      if (userInfo?.success && userInfo?.data?.id) {
        await auth.loginViaId(userInfo?.data?.id)
        await next()
        return
      } else {
        return response.status(401).json({
          success: false,
          message: 'Unauthorized.',
          code: 401,
          errors: []
        });
      }
    } else {
      return response.status(401).json({
        success: false,
        message: 'Unauthorized.',
        code: 401,
        errors: []
      });
    }
  }
}
