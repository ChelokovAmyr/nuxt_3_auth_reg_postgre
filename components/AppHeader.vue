<!-- components/AppHeader.vue -->
<template>
  <header class="bg-blue-600 text-white p-4">
    <div class="container mx-auto flex justify-between items-center">
      <NuxtLink to="/" class="text-xl font-bold">Nuxt Auth App</NuxtLink>

      <nav>
        <ul class="flex space-x-4">
          <li v-if="!isAuthenticated">
            <NuxtLink to="/" class="hover:underline">Home</NuxtLink>
          </li>
          <li v-if="isAuthenticated">
            <NuxtLink to="/dashboard" class="hover:underline">Dashboard</NuxtLink>
          </li>
          <li v-if="isAuthenticated">
            <button @click="logout" class="hover:underline">Logout</button>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const { user, isAuthenticated, logout } = useAuthUser()
</script>