export default defineEventHandler(async (event) => {
  deleteCookie(event, 'auth_token')

  return {
    message: 'Logged out successfully'
  }
})