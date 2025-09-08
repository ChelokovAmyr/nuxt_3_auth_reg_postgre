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

    // Устанавливаем access token (15 минут)
    setCookie(event, 'auth_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',        // Чтобы на localhost работало
      maxAge: 15 * 60,        // 15 минут
      path: '/'
    })

    // Устанавливаем refresh token (7 дней)
    setCookie(event, 'refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',        // Чтобы на localhost работало
      maxAge: 7 * 24 * 60 * 60, // 7 дней
      path: '/'
    })

    // Возвращаем только данные пользователя
    return {
      user: result.user
    }
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }
})
