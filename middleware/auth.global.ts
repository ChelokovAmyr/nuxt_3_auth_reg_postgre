// middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const { user, fetchUser } = useAuthUser()

  // Если пользователь еще не загружен, загружаем его
  if (!user.value) {
    await fetchUser()
  }

  // Защищаем роуты, требующие аутентификации
  if (to.meta.requiresAuth && !user.value) {
    return navigateTo('/')
  }

  // Если пользователь авторизован, редиректим с login/register страниц
  if (user.value && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/')
  }
})