// server/api/db-test.get.ts
export default defineEventHandler(async (event) => {
  const { testConnection } = await import('~/server/utils/db')
  const isConnected = await testConnection()

  return {
    connected: isConnected,
    message: isConnected ? 'Database connected successfully' : 'Database connection failed'
  }
})