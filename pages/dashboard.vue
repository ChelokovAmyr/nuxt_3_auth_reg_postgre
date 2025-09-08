<!-- pages/dashboard.vue -->
<template>
  <div class="min-h-screen bg-gray-100">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold text-center mb-8">Dashboard</h1>

      <div class="max-w-2xl mx-auto">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-semibold mb-4">Protected Dashboard</h2>
          <p class="text-gray-600 mb-4">This page is protected by authentication.</p>

          <div v-if="user" class="mb-6">
            <h3 class="text-lg font-semibold mb-2">User Info:</h3>
            <p><strong>ID:</strong> {{ user.id }}</p>
            <p><strong>Name:</strong> {{ user.name }}</p>
            <p><strong>Email:</strong> {{ user.email }}</p>
            <p><strong>Registered:</strong> {{ new Date(user.created_at).toLocaleDateString() }}</p>
          </div>

          <button
            @click="logout"
            class="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <!-- Проверка токена -->
        <div class="bg-white p-6 rounded-lg shadow-md mt-6">
          <h3 class="text-lg font-semibold mb-4">Token Verification</h3>
          <button
            @click="verifyToken"
            class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mb-4"
          >
            Verify Token
          </button>
          <div v-if="tokenInfo">
            <p class="text-green-600 mb-2">✅ Token is valid!</p>
            <pre class="bg-gray-100 p-3 rounded text-sm">{{ tokenInfo }}</pre>
          </div>
          <p v-if="tokenError" class="text-red-600">{{ tokenError }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  requiresAuth: true // Эта страница требует аутентификации
})

const { user, logout } = useAuthUser()
const tokenInfo = ref(null)
const tokenError = ref('')

const verifyToken = async () => {
  try {
    const { data } = await useFetch('/api/auth/verify-token')
    tokenInfo.value = data.value
    tokenError.value = ''
  } catch (error: any) {
    tokenError.value = error.message
    tokenInfo.value = null
  }
}
</script>