// composables/useAuthUser.ts
export const useAuthUser = () => {
  const user = useState<User | null>('user', () => null)
  const isAuthenticated = computed(() => !!user.value)

  const login = async (email: string, password: string) => {
    const { data, error } = await useFetch('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })

    if (error.value) {
      throw new Error(error.value.data?.statusMessage || 'Login failed')
    }

    user.value = data.value?.user || null
    return data.value
  }

  const register = async (name: string, email: string, password: string) => {
    const { data, error } = await useFetch('/api/auth/register', {
      method: 'POST',
      body: { name, email, password }
    })

    if (error.value) {
      throw new Error(error.value.data?.statusMessage || 'Registration failed')
    }

    user.value = data.value?.user || null
    return data.value
  }

  const logout = async () => {
    try {
      await useFetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      user.value = null
    }
  }

  // composables/useAuthUser.ts
  const fetchUser = async () => {
    try {
      const { data, error } = await useFetch('/api/auth/me')

      if (!error.value && data.value?.user) {
        user.value = data.value.user
      } else {
        user.value = null
      }
    } catch (error) {
      console.error('Token validation failed:', error)
      user.value = null
    }
  }

  return {
    user: readonly(user),
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser
  }
}