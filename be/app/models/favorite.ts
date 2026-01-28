import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Audio from './audio.js'
import User from './user.js'

export default class Favorite extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare audioId: number

  @belongsTo(() => User, {
    foreignKey: 'userId',
    localKey: 'id'
  })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Audio, {
    foreignKey: 'audioId',
    localKey: 'id'
  })
  declare audio: BelongsTo<typeof Audio>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
