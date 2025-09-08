// server/api/auth/register.post.ts
import { UserRegister } from '~/types/user'
import { authService } from '~/server/utils/imports'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<UserRegister>(event)

    // Проверяем обязательные поля
    if (!body.email || !body.password || !body.name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email, password and name are required'
      })
    }

    // Регистрируем пользователя через сервис
    const result = await authService.register(body)

    // Устанавливаем access token (15 минут)
    setCookie(event, 'auth_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',        // для локальной разработки
      maxAge: 15 * 60,
      path: '/'
    })

    // Устанавливаем refresh token (7 дней)
    setCookie(event, 'refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
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
