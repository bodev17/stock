import {schema, CustomMessages, rules} from '@ioc:Adonis/Core/Validator'
import type {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import {ChatType} from 'App/Enums/ChatType'

export default class ChatValidator {
  constructor(protected ctx: HttpContextContract) {
  }

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string([ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string([
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */
  public schema = schema.create({
    type: schema.enum(Object.values(ChatType)),
    name: schema.string.optional([
      rules.alphaNum({
        allow: ['space']
      }),
      rules.minLength(5),
      rules.maxLength(200),
      rules.escape(),
      rules.requiredWhen('type', '=', ChatType.GROUP)
    ]),
    send_to: schema.number.optional([
      rules.requiredWhen('type', '=', ChatType.USER)
    ]),
    members: schema.array.optional([
      rules.minLength(2),
      rules.maxLength(100),
      rules.requiredWhen('type', '=', ChatType.GROUP)
    ]).members(schema.number())
  })

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages: CustomMessages = {}
}
