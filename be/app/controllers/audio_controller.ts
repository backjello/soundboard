import Audio from '#models/audio'
import Favorite from '#models/favorite'
import type { HttpContext } from '@adonisjs/core/http'
import { exec } from 'child_process'
import fs from 'fs/promises'
import path, { dirname } from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)
const audioVolume = 100

export default class AudioController {
  /**
   * Play audio file through server speakers
   */
  async play({ request, response, params }: HttpContext) {
    try {
      const filePath = params.id
      console.log(path.join(process.cwd(), '/audio/', filePath))
      // Check if file exists
      try {
        await fs.access(process.cwd() + '/audio/' + filePath)
      } catch {
        return response.notFound({
          error: 'Audio file not found'
        })
      }

      // Get file extension to determine audio type
      const ext = path.extname(filePath).toLowerCase()
      const supportedFormats = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac']

      if (!supportedFormats.includes(ext)) {
        return response.badRequest({
          error: `Unsupported audio format. Supported formats: ${supportedFormats.join(', ')}`
        })
      }

      // Try different audio players based on what's available on the system
      let command = ''
      let playerFound = false

      // Check for available audio players
      const players = [
        {
          name: 'aplay',
          command: (file: string, vol?: number) => `aplay "${file}"`,
          formats: ['.wav']
        },
        // {
        //   name: 'mpg123',
        //   command: (file: string, vol?: number) => `mpg123 "${file}"`,
        //   formats: ['.mp3']
        // },
        // {
        //   name: 'ogg123',
        //   command: (file: string, vol?: number) => `ogg123 "${file}"`,
        //   formats: ['.ogg']
        // },
        {
          name: 'ffplay',
          command: (file: string, vol?: number) => `ffplay -nodisp -autoexit -volume ${vol || 100} "${file}"`,
          formats: ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac']
        },
        {
          name: 'paplay',
          command: (file: string, vol?: number) => `paplay "${file}"`,
          formats: ['.wav']
        },
        {
          name: 'cvlc',
          command: (file: string, vol?: number) => `cvlc --play-and-exit --gain ${(vol || 100) / 10} "${file}"`,
          formats: ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac']
        }
      ]

      // Find a suitable player for the audio format
      for (const player of players) {
        if (player.formats.includes(ext)) {
          try {
            const fullPath = path.join(process.cwd(), 'audio', filePath)
            command = player.command(fullPath, audioVolume)
            playerFound = true
            break
          } catch (e) {
            // Player not found, try next one
            console.log(e)
            continue
          }
        }
      }

      if (!playerFound) {
        return response.badRequest({
          error: 'No suitable audio player found on the system. Please install one of: ffplay, cvlc, mpg123, ogg123, aplay, or paplay'
        })
      }

      // Execute the audio playback command
      try {
        execAsync(command)

        return response.ok({
          message: 'Audio playback completed successfully',
          file: path.basename(filePath),
          volume: audioVolume
        })
      } catch (error) {
        console.error('Audio playback error:', error)
        return response.internalServerError({
          error: 'Failed to play audio file',
          details: error instanceof Error ? error.message : 'Unknown error'
        })
      }

    } catch (error) {
      console.error('Audio controller error:', error)
      return response.internalServerError({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
  async index({ request, response, auth }: HttpContext) {
    const { search, favorites } = request.qs()
    const user = auth.user!

    let query = Audio.query().preload('uploadedBy')

    // Add search functionality
    if (search) {
      query = query.where('name', 'ILIKE', `%${search}%`)
    }

    // Filter for favorites only
    if (favorites === 'true') {
      query = query.whereHas('favorites', (favQuery) => {
        favQuery.where('user_id', user.id)
      })
    }

    if (user?.id)
      // Load favorites information for each audio
      query = query.preload('favorites', (favQuery) => {
        favQuery.where('user_id', user.id)
      })

    const audio = await query.orderBy('name', 'asc')

    // Add isFavorited flag to each audio item
    const audioWithFavorites = audio.map((item) => {
      return {
        ...item.toJSON(),
        isFavorited: item.favorites && item.favorites.length > 0
      }
    })

    return response.ok(audioWithFavorites || [])
  }

  async show({ request, response, params }: HttpContext) {
    const audio = await Audio.find(params.id)
    await audio?.load('uploadedBy')
    return response.ok(audio)
  }

  async store({ request, response, params, auth }: HttpContext) {
    const { name } = request.only(['name'])
    const user = auth.user!
    const file = request.file('file', {
      size: '2mb',
      extnames: ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac']
    })

    await file?.move(process.cwd() + '/audio')

    const audio = await Audio.create({
      path: file?.fileName || '',
      name,
      uploadedById: user.id
    })

    return response.ok({
      message: 'Audio uploaded successfully',
      audio
    })
  }


  async update({ request, response, params, auth }: HttpContext) {
    const { name } = request.only(['name'])

    if (!name || name.trim().length === 0) {
      return response.badRequest({
        message: 'Name is required'
      })
    }

    const audio = await Audio.findOrFail(params.id)

    // Check if the authenticated user is the owner of the audio file
    if (audio.uploadedById !== auth.user?.id) {
      return response.unauthorized({
        message: 'You are not authorized to rename this audio file'
      })
    }

    // Update the audio name
    audio.name = name.trim()
    await audio.save()
    await audio.load('uploadedBy')

    return response.ok({
      message: 'Audio renamed successfully',
      audio
    })
  }

  async addToFavorites({ request, response, params, auth }: HttpContext) {
    const user = auth.user!
    const audioId = params.id

    // Check if audio exists
    const audio = await Audio.findOrFail(audioId)

    // Check if already favorited
    const existingFavorite = await Favorite.query()
      .where('user_id', user.id)
      .where('audio_id', audioId)
      .first()

    if (existingFavorite) {
      return response.badRequest({
        message: 'Audio is already in favorites'
      })
    }

    // Add to favorites
    await Favorite.create({
      userId: user.id,
      audioId: audioId
    })

    return response.ok({
      message: 'Audio added to favorites',
      isFavorited: true
    })
  }

  async removeFromFavorites({ request, response, params, auth }: HttpContext) {
    const user = auth.user!
    const audioId = params.id

    // Find and remove favorite
    const favorite = await Favorite.query()
      .where('user_id', user.id)
      .where('audio_id', audioId)
      .first()

    if (!favorite) {
      return response.badRequest({
        message: 'Audio is not in favorites'
      })
    }

    await favorite.delete()

    return response.ok({
      message: 'Audio removed from favorites',
      isFavorited: false
    })
  }

  async destroy({ request, response, params, auth }: HttpContext) {
    const audio = await Audio.findOrFail(params.id)
    if (audio.uploadedById !== auth.user?.id) {
      return response.badRequest({
        message: 'You are not authorized to delete this audio'
      })
    }
    await audio.delete()
    return response.ok({
      message: 'Audio deleted successfully'
    })
  }
}
