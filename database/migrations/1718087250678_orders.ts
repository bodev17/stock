import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.bigInteger('user_id').index().notNullable()
      table.string('type', 20).notNullable()
      table.string('side', 20).notNullable()
      table.string('symbol', 20).notNullable()
      table.decimal('price', 20,4).notNullable()
      table.integer('quantity').defaultTo(0).notNullable()
      table.integer('quantity_match').nullable()
      table.string('status', 10).defaultTo('open').notNullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
