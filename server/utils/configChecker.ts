// server/utils/configChecker.ts
export const checkConfig = () => {
  const config = useRuntimeConfig()

  const missingConfigs = []

  if (!config.jwtSecret || config.jwtSecret.includes('fallback')) {
    missingConfigs.push('JWT_SECRET')
  }

  if (!config.jwtRefreshSecret || config.jwtRefreshSecret.includes('fallback')) {
    missingConfigs.push('JWT_REFRESH_SECRET')
  }

  if (!config.dbHost) missingConfigs.push('DB_HOST')
  if (!config.dbName) missingConfigs.push('DB_NAME')
  if (!config.dbUser) missingConfigs.push('DB_USER')

  if (missingConfigs.length > 0) {
    console.warn('⚠️  Missing or default configuration for:', missingConfigs.join(', '))
    console.warn('   Please check your .env file and environment variables')
  }

  return missingConfigs.length === 0
}