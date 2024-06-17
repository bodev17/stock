/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor () {
    super(Logger)
  }

  public async handle(error: any, ctx: HttpContextContract) {
    /**
     * Self handle the validation exception
     */
    if (error.code === 'E_VALIDATION_FAILURE') {
      let message = 'Validation failed'
      try {
        if (error?.messages?.errors && error.messages.errors[0]?.message && error.messages.errors[0]?.field) {
          const firstErrorMessage = error.messages.errors[0].message
          const fieldName = error.messages.errors[0].field
          message = `Field ${fieldName} ${firstErrorMessage}`
        }
      } catch (e) {
        console.log(e)
      }

      return ctx.response.status(422).json({
        success: false,
        message: message,
        code: 422,
        errors: error
      });
    }

    if (error.code === 'E_ROUTE_NOT_FOUND') {
      return ctx.response.status(404).json({
        success: false,
        message: error.messages,
        code: 404,
        errors: error
      });
    }
    /**
     * Forward rest of the exceptions to the parent class
     */
    return super.handle(error, ctx)
  }
}
