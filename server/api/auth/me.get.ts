import { authService } from '~/server/utils/imports'

export default defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, 'auth_token')

    if (!token) {
      return { user: null }
    }

    const user = await authService.validateToken(token)

    if (!user) {
      deleteCookie(event, 'auth_token')
      return { user: null }
    }

    return { user }
  } catch (error: any) {
    deleteCookie(event, 'auth_token')
    return { user: null }
  }
})