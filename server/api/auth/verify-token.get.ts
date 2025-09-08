import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'auth_token')

    if (!token) {
      throw createError({ statusCode: 401, statusMessage: 'No token provided' })
    }

    const decoded = jwt.verify(token, config.jwtSecret) as any

    return {
      valid: true,
      user: {
        id: decoded.id,
        email: decoded.email
      },
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
