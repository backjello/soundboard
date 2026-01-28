import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'favorites'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('audio_id').unsigned().references('id').inTable('audio').onDelete('CASCADE')
      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Ensure a user can only favorite an audio file once
      table.unique(['user_id', 'audio_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
