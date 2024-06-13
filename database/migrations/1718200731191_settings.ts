import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'settings'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('key').index().unique()
      table.text('value').nullable()
      table.integer('status').defaultTo(1)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
