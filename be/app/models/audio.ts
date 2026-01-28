import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Favorite from './favorite.js'
import User from './user.js'

export default class Audio extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare path: string

  @column()
  declare uploadedById: number

  @belongsTo(() => User, {
    foreignKey: 'uploadedById',
    localKey: 'id'
  })
  declare uploadedBy: BelongsTo<typeof User>

  @hasMany(() => Favorite, {
    foreignKey: 'audioId',
    localKey: 'id'
  })
  declare favorites: HasMany<typeof Favorite>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
