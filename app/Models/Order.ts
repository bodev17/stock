import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Order extends BaseModel {
  static table: string = 'orders'

  @column({ isPrimary: true })
  public id: number

  @column()
  public user_id: number

  @column()
  public type: string

  @column()
  public side: string

  @column()
  public symbol: string

  @column()
  public price: string

  @column()
  public quantity: number

  @column()
  public quantity_match: number

  @column()
  public status: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
