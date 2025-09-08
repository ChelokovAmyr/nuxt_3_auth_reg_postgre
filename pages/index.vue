<!-- pages/index.vue -->
<template>
  <div class="min-h-screen bg-gray-100">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold text-center mb-8">Nuxt Auth App</h1>

      <!-- Навигация -->
      <nav class="flex justify-center mb-8 space-x-4">
        <NuxtLink
          to="/"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Home
        </NuxtLink>
        <NuxtLink
          to="/dashboard"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          v-if="isAuthenticated"
        >
          Dashboard
        </NuxtLink>
        <button
          v-if="isAuthenticated"
          @click="logout"
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </nav>

      <div v-if="!isAuthenticated" class="max-w-md mx-auto">
        <LoginForm />
        <RegisterForm />
      </div>

      <div v-else class="max-w-md mx-auto">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-semibold mb-4">Welcome, {{ user?.name }}!</h2>
          <p class="text-gray-600 mb-4">You are successfully logged in.</p>
          <p class="text-gray-600 mb-4">Email: {{ user?.email }}</p>
          <NuxtLink
            to="/dashboard"
            class="block w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 text-center mb-4"
          >
            Go to Dashboard
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  guestOnly: true // Только для гостей
})

const { user, isAuthenticated, logout } = useAuthUser()

// Автоматически загружаем пользователя при загрузке страницы
onMounted(async () => {
  if (!user.value) {
    await useAuthUser().fetchUser()
  }
})
</script>