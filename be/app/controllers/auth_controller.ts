import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {

  async login({ request, response, auth }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    const user = await User.verifyCredentials(email, password)
    return {
      token: await User.accessTokens.create(user),
      user
    }
  }

  async register({ request, response }: HttpContext) {
    const { email, password, fullName } = request.only(['email', 'password', 'fullName'])
    const user = await User.create({ email, password, fullName })
    return response.ok(user)
  }



  async me({ response, auth }: HttpContext) {
    return auth.user
  }
}
