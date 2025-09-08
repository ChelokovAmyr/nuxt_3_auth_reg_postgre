<template>
  <div class="min-h-screen bg-gray-100">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Products</h1>

      <!-- Таблица продуктов -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <table class="min-w-full border border-gray-200">
          <thead>
            <tr class="bg-gray-100">
              <th class="py-2 px-4 border-b">ID</th>
              <th class="py-2 px-4 border-b">Name</th>
              <th class="py-2 px-4 border-b">Price</th>
              <th class="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in paginatedProducts" :key="product.id">
              <td class="py-2 px-4 border-b">{{ product.id }}</td>
              <td class="py-2 px-4 border-b">
                <input v-model="product.name" class="border rounded px-2 py-1 w-full" />
              </td>
              <td class="py-2 px-4 border-b">
                <input v-model.number="product.price" type="number" class="border rounded px-2 py-1 w-full" />
              </td>
              <td class="py-2 px-4 border-b space-x-2">
                <button @click="updateProduct(product)" class="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">Save</button>
                <button @click="deleteProduct(product.id)" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Пагинация -->
        <div class="flex justify-between items-center mt-4">
          <button @click="prevPage" :disabled="page === 1" class="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400">Prev</button>
          <span>Page {{ page }} / {{ totalPages }}</span>
          <button @click="nextPage" :disabled="page === totalPages" class="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400">Next</button>
        </div>

        <!-- Добавление продукта -->
        <div class="mt-6 flex space-x-2">
          <input v-model="newProduct.name" placeholder="Name" class="border rounded px-2 py-1" />
          <input v-model.number="newProduct.price" type="number" placeholder="Price" class="border rounded px-2 py-1" />
          <button @click="addProduct" class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Add Product</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Product {
  id: number
  name: string
  price: number
}

// состояния
const products = ref<Product[]>([])
const page = ref(1)
const perPage = 5
const newProduct = ref({ name: '', price: 0 })

// вычисляемые свойства
const totalPages = computed(() => Math.ceil(products.value.length / perPage))
const paginatedProducts = computed(() =>
  products.value.slice((page.value - 1) * perPage, page.value * perPage)
)

// функции пагинации
const nextPage = () => {
  if (page.value < totalPages.value) page.value++
}
const prevPage = () => {
  if (page.value > 1) page.value--
}

// CRUD функции
const fetchProducts = async () => {
  try {
    const { data, error } = await useFetch('/api/products', { method: 'GET' })
    if (error.value) {
      console.error(error.value)
      products.value = []
    } else {
      products.value = data.value || []
    }
  } catch (err) {
    console.error(err)
    products.value = []
  }
}

const addProduct = async () => {
  if (!newProduct.value.name || newProduct.value.price <= 0) return
  try {
    const { data } = await useFetch('/api/products', {
      method: 'POST',
      body: newProduct.value
    })
    products.value.push(data.value)
    newProduct.value = { name: '', price: 0 }
  } catch (err) {
    console.error(err)
  }
}

const updateProduct = async (product: Product) => {
  try {
    await useFetch(`/api/products/${product.id}`, {
      method: 'PUT',
      body: { name: product.name, price: product.price }
    })
  } catch (err) {
    console.error(err)
  }
}

const deleteProduct = async (id: number) => {
  try {
    await useFetch(`/api/products/${id}`, { method: 'DELETE' })
    products.value = products.value.filter(p => p.id !== id)
  } catch (err) {
    console.error(err)
  }
}

// при загрузке страницы
onMounted(() => {
  fetchProducts()
})
</script>
