import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.decimal('money_real', 20,4).notNullable().defaultTo(0)
      table.decimal('money_temp', 20,4).notNullable().defaultTo(0)
    })
  }

  public async down () {
    // this.schema.dropTable(this.tableName)
  }
}
