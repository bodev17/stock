import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Symbols extends BaseModel {
  static table: string = 'symbols'

  @column({ isPrimary: true })
  public id: number

  @column()
  public key: string

  @column()
  public title: string

  @column()
  public status: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
