// server/api/auth/refresh.post.ts
import { authService } from '~/server/utils/imports'

export default defineEventHandler(async (event) => {
  const refreshToken = getCookie(event, 'refresh_token')

  if (!refreshToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Refresh token required'
    })
  }

  try {
    const tokens = await authService.refreshAccessToken(refreshToken)

    // Устанавливаем новые cookies
    setCookie(event, 'auth_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60, // 15 минут
      path: '/'
    })

    setCookie(event, 'refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 дней
      path: '/'
    })

    return {
      success: true,
      accessToken: tokens.accessToken
    }
  } catch (error: any) {
    // Удаляем невалидные cookies
    deleteCookie(event, 'auth_token')
    deleteCookie(event, 'refresh_token')

    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid refresh token'
    })
  }
})