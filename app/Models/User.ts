import { DateTime } from 'luxon'
import { column, BaseModel } from '@ioc:Adonis/Lucid/Orm'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public username: string

  @column()
  public name: string

  @column()
  public email: string

  @column()
  public email_verified_at: DateTime

  @column()
  public phone: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public money_real: number

  @column()
  public money_temp: number

  @column()
  public level: number

  @column()
  public point: number

  @column()
  public user_ref: number

  @column()
  public bank_name: string

  @column()
  public bank_number: string

  @column()
  public bank_username: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
