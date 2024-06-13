import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.integer('level').defaultTo(0)
      table.string('bank_name').nullable()
      table.string('bank_number').nullable()
      table.string('bank_username').nullable()
      table.bigInteger('user_ref').index().nullable()
      table.integer('point').defaultTo(0)
    })
  }

  public async down () {
    // this.schema.dropTable(this.tableName)
  }
}
