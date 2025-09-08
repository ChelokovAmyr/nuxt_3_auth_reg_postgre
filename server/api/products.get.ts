import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const url = getQuery(event)
  const page = Number(url.page) || 1
  const limit = Number(url.limit) || 5
  const offset = (page - 1) * limit

  const result = await query('SELECT * FROM products ORDER BY id DESC LIMIT $1 OFFSET $2', [limit, offset])
  const countResult = await query('SELECT COUNT(*) FROM products')
  const total = Number(countResult.rows[0].count)

  return {
    data: result.rows,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  }
})
