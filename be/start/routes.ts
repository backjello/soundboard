/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import User from '#models/user'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

// Audio routes


router.group(() => {

  router.get('/', '#controllers/audio_controller.index')  // Get all audio files
  router.get('/:id', '#controllers/audio_controller.show')  // Get specific audio file
  router.get('/play/:id', '#controllers/audio_controller.play')  // Play audio file


  router.group(() => {
    router.post('/', '#controllers/audio_controller.store')//.middleware('auth')  // Upload audio file
    router.put('/:id', '#controllers/audio_controller.update')//.middleware('auth')  // Update/rename audio file
    router.delete('/:id', '#controllers/audio_controller.destroy')//.middleware('auth')  // Delete audio file
    router.post('/:id/favorite', '#controllers/audio_controller.addToFavorites')  // Add to favorites
    router.delete('/:id/favorite', '#controllers/audio_controller.removeFromFavorites')  // Remove from favorites
  }).use(middleware.auth())


}).prefix('/audio')


router.group(() => {
  router.post('/login', '#controllers/auth_controller.login')
  router.post('/register', '#controllers/auth_controller.register')
  router.get('/me', '#controllers/auth_controller.me').use(middleware.auth())
}).prefix('/auth')

// Auth routes (you'll need to create these controllers)
// router.post('/auth/login', '#controllers/auth_controller.login')
// router.post('/auth/register', '#controllers/auth_controller.register')
// router.get('/auth/me', '#controllers/auth_controller.me').middleware('auth')

// await User.create({
//   email: 'jackbello97@gmail.com',
//   password: '123prova',
//   fullName: 'backjello'
// })
