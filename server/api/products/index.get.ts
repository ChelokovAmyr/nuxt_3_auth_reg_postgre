import { query } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const res = await query('SELECT * FROM products ORDER BY id ASC')
  return res.rows
})
