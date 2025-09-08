<!-- components/LoginForm.vue -->
<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-6">
    <h2 class="text-2xl font-semibold mb-4">Login</h2>
    <form @submit="handleSubmit">
      <div class="mb-4">
        <label class="block text-gray-700 mb-2">Email</label>
        <input
          v-model="email"
          type="email"
          class="w-full px-3 py-2 border rounded-md"
          required
          placeholder="Enter your email"
        >
      </div>
      <div class="mb-4">
        <label class="block text-gray-700 mb-2">Password</label>
        <input
          v-model="password"
          type="password"
          class="w-full px-3 py-2 border rounded-md"
          required
          placeholder="Enter your password"
        >
      </div>
      <button
        type="submit"
        class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        :disabled="loading"
      >
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
      <p v-if="error" class="text-red-500 mt-2 text-center">{{ error }}</p>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      error: ''
    }
  },
  methods: {
    async handleSubmit(e) {
      e.preventDefault()
      this.loading = true
      this.error = ''

      try {
        const { login } = useAuthUser()
        await login(this.email, this.password)
        this.email = ''
        this.password = ''
      } catch (err) {
        this.error = err.message || 'Login failed'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>