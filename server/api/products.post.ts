import { query } from '~/server/utils/db'
import { readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, description, price } = body

  if (!name || !price) {
    throw createError({ statusCode: 400, statusMessage: 'Name and price are required' })
  }

  const result = await query(
    'INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING *',
    [name, description || '', price]
  )

  return { product: result.rows[0] }
})
