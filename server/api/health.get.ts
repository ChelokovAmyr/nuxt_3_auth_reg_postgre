// server/api/health.get.ts
import { checkConfig } from '~/server/utils/configChecker'

export default defineEventHandler(async (event) => {
  const configValid = checkConfig()
  const dbConnected = await testConnection()

  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    config: {
      valid: configValid,
      hasJwtSecret: !!useRuntimeConfig().jwtSecret,
      hasJwtRefreshSecret: !!useRuntimeConfig().jwtRefreshSecret
    },
    database: {
      connected: dbConnected
    }
  }
})