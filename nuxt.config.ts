import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  modules: [],
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'default-secret',
    dbHost: process.env.DB_HOST,
    dbPort: process.env.DB_PORT,
    dbName: process.env.DB_NAME,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
  },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})
