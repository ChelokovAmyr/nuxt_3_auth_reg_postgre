// server/api/auth/verify-token.get.ts
import { authService } from '~/server/utils/imports'

export default defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, 'auth_token')

    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No token provided'
      })
    }

    const user = await authService.validateToken(token)

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }

    // Декодируем токен чтобы показать информацию
    const jwt = require('jsonwebtoken')
    const decoded = jwt.decode(token)

    return {
      valid: true,
      user: user,
      tokenInfo: {
        issuedAt: new Date(decoded.iat * 1000).toLocaleString(),
        expiresAt: new Date(decoded.exp * 1000).toLocaleString(),
        payload: decoded
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Token verification failed: ' + error.message
    })
  }
})