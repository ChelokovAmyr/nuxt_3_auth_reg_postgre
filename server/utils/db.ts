// server/utils/db.ts
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'shop',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

export const query = (text: string, params?: any[]) => pool.query(text, params)

// Проверка подключения
export const testConnection = async () => {
  try {
    const res = await query('SELECT NOW()')
    console.log('✅ PostgreSQL connected successfully')
    return true
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error)
    return false
  }
}