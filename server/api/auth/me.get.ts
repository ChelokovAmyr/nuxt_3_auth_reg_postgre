// server/api/auth/me.get.ts
import { authService } from '~/server/utils/imports'

export default defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, 'auth_token')

    if (!token) {
      return { user: null }
    }

    const user = await authService.validateAccessToken(token)

    if (!user) {
      // Пытаемся обновить токен если access token истек
      const refreshToken = getCookie(event, 'refresh_token')
      if (refreshToken) {
        try {
          const tokens = await authService.refreshAccessToken(refreshToken)

          setCookie(event, 'auth_token', tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60,
            path: '/'
          })

          setCookie(event, 'refresh_token', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60,
            path: '/'
          })

          // Получаем пользователя с новым токеном
          const newUser = await authService.validateAccessToken(tokens.accessToken)
          return { user: newUser }
        } catch (refreshError) {
          // Если refresh не удался - очищаем cookies
          deleteCookie(event, 'auth_token')
          deleteCookie(event, 'refresh_token')
          return { user: null }
        }
      }

      deleteCookie(event, 'auth_token')
      return { user: null }
    }

    return { user }
  } catch (error: any) {
    deleteCookie(event, 'auth_token')
    deleteCookie(event, 'refresh_token')
    return { user: null }
  }
})