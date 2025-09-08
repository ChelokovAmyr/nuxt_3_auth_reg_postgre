<!-- components/RegisterForm.vue -->
<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-2xl font-semibold mb-4">Register</h2>
    <form @submit="handleSubmit">
      <div class="mb-4">
        <label class="block text-gray-700 mb-2">Name</label>
        <input
          v-model="name"
          type="text"
          class="w-full px-3 py-2 border rounded-md"
          required
          placeholder="Enter your name"
        >
      </div>
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
        class="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
        :disabled="loading"
      >
        {{ loading ? 'Registering...' : 'Register' }}
      </button>
      <p v-if="error" class="text-red-500 mt-2 text-center">{{ error }}</p>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: '',
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
        const { register } = useAuthUser()
        await register(this.name, this.email, this.password)
        this.name = ''
        this.email = ''
        this.password = ''
      } catch (err) {
        this.error = err.message || 'Registration failed'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>