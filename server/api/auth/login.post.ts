import { UserLogin } from '~/types/user'
import { authService } from '~/server/utils/imports'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<UserLogin>(event)

    if (!body.email || !body.password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email and password are required'
      })
    }

    const result = await authService.login(body)

    setCookie(event, 'auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    })

    return {
      user: result.user,
      token: result.token
    }
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }
})