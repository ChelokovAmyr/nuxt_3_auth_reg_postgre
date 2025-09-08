import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  await query('DELETE FROM products WHERE id = $1', [id])
  return { success: true }
})
