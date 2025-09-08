// nuxt.config.ts
export default defineNuxtConfig({
  modules: [],
  typescript: {
    strict: true
  },
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'default-secret',
    dbHost: process.env.DB_HOST,
    dbPort: process.env.DB_PORT,
    dbName: process.env.DB_NAME,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
  },
})
