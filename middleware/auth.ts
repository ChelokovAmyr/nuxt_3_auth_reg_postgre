// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const { user, fetchUser } = useAuthUser()

  // Если пользователь еще не загружен, загружаем его
  if (!user.value) {
    await fetchUser()
  }

  // Если роут требует аутентификации и пользователь не авторизован
  if (to.meta.requiresAuth && !user.value) {
    return navigateTo('/')
  }

  // Если пользователь авторизован и пытается зайти на гостевые страницы
  if (user.value && to.meta.guestOnly) {
    return navigateTo('/dashboard')
  }
})