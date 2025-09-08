// server/api/auth/login.post.ts
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

    // Устанавливаем cookies
    setCookie(event, 'auth_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60, // 15 минут
      path: '/'
    })

    setCookie(event, 'refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 дней
      path: '/'
    })

    return {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    }
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }
})