import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  modules: [],
  runtimeConfig: {
      // Секреты для JWT
      jwtSecret: process.env.JWT_SECRET || 'fallback-dev-secret-change-in-production',
      jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-dev-refresh-secret-change-in-production',

      // Настройки базы данных
      dbHost: process.env.DB_HOST,
      dbPort: process.env.DB_PORT,
      dbName: process.env.DB_NAME,
      dbUser: process.env.DB_USER,
      dbPassword: process.env.DB_PASSWORD,

      // Публичные переменные (доступны на клиенте)
      public: {
        siteUrl: process.env.SITE_URL || 'http://localhost:3000'
      }
  },
  css: ['~/assets/css/main.css'],
    // Опционально: настройки TypeScript
  typescript: {
    typeCheck: false,
    shim: false
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})
