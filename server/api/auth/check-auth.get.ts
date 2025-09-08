// server/api/auth/check-auth.get.ts
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')

  return {
    hasToken: !!token,
    tokenLength: token?.length || 0,
    cookies: {
      auth_token: getCookie(event, 'auth_token') ? 'present' : 'missing',
      refresh_token: getCookie(event, 'refresh_token') ? 'present' : 'missing'
    },
    timestamp: new Date().toISOString()
  }
})