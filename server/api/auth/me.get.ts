// server/api/auth/me.get.ts
import { authService } from '~/server/utils/imports'

export default defineEventHandler(async (event) => {
  try {
    const accessToken = getCookie(event, 'auth_token')
    const refreshToken = getCookie(event, 'refresh_token')

    // Если нет токенов — возвращаем null
    if (!accessToken && !refreshToken) {
      return { user: null }
    }

    let user = null

    // Попытка верифицировать access token
    if (accessToken) {
      user = await authService.validateAccessToken(accessToken)
    }

    // Если access token истёк и есть refresh token
    if (!user && refreshToken) {
      try {
        const tokens = await authService.refreshAccessToken(refreshToken)

        // Обновляем cookies
        setCookie(event, 'auth_token', tokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 15 * 60,
          path: '/'
        })

        setCookie(event, 'refresh_token', tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60,
          path: '/'
        })

        // Верифицируем новый access token
        user = await authService.validateAccessToken(tokens.accessToken)
      } catch {
        // Если refresh не удался — чистим куки
        deleteCookie(event, 'auth_token', { path: '/' })
        deleteCookie(event, 'refresh_token', { path: '/' })
        return { user: null }
      }
    }

    return { user }
  } catch (error) {
    // На всякий случай чистим куки при ошибках
    deleteCookie(event, 'auth_token', { path: '/' })
    deleteCookie(event, 'refresh_token', { path: '/' })
    return { user: null }
  }
})
