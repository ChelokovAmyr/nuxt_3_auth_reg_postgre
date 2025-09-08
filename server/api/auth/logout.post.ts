// server/api/auth/logout.post.ts
import { authService } from '~/server/utils/imports'

export default defineEventHandler(async (event) => {
  const refreshToken = getCookie(event, 'refresh_token')
  const accessToken = getCookie(event, 'auth_token')

  // Отзываем refresh token если есть
  if (refreshToken) {
    try {
      await authService.revokeRefreshToken(refreshToken)
    } catch (error) {
      console.error('Error revoking refresh token:', error)
    }
  }

  // Удаляем cookies
  deleteCookie(event, 'auth_token')
  deleteCookie(event, 'refresh_token')

  return {
    message: 'Logged out successfully',
    revoked: !!refreshToken
  }
})