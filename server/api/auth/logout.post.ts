// server/api/auth/logout.post.ts
import { authService } from '~/server/utils/imports'

export default defineEventHandler(async (event) => {
  try {
    // Получаем токены из cookie
    const refreshToken = getCookie(event, 'refresh_token')
    const accessToken = getCookie(event, 'auth_token')

    // Отзываем refresh token через сервис (если есть)
    if (refreshToken) {
      try {
        await authService.revokeRefreshToken(refreshToken)
      } catch (error) {
        console.error('Error revoking refresh token:', error)
      }
    }

    // Удаляем cookies безопасно
    deleteCookie(event, 'auth_token', { path: '/' })
    deleteCookie(event, 'refresh_token', { path: '/' })

    return {
      message: 'Logged out successfully',
      revoked: !!refreshToken
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Logout failed: ' + error.message
    })
  }
})
