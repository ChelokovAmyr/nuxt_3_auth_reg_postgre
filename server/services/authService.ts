// server/services/authService.ts
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '~/server/utils/db'
import { User, UserRegister, UserLogin, UserDb } from '~/types/user'

export const authService = {
  // Регистрация пользователя
  async register(userData: UserRegister): Promise<{ user: Omit<User, 'password'>; token: string }> {
    // Проверяем существование пользователя
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [userData.email]
    )

    if (existingUser.rows.length > 0) {
      throw new Error('User already exists')
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(userData.password, 12)

    // Создаем пользователя
    const result = await query(
      `INSERT INTO users (email, password_hash, name, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING id, email, name, created_at, updated_at`,
      [userData.email, hashedPassword, userData.name]
    )

    const newUser = result.rows[0]

    // Создаем JWT токен
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      useRuntimeConfig().jwtSecret,
      { expiresIn: '7d' }
    )

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        created_at: newUser.created_at,
        updated_at: newUser.updated_at
      },
      token
    }
  },

  // Авторизация пользователя
  async login(credentials: UserLogin): Promise<{ user: Omit<User, 'password'>; token: string }> {
    // Ищем пользователя
    const result = await query(
      'SELECT id, email, password_hash, name, created_at, updated_at FROM users WHERE email = $1',
      [credentials.email]
    )

    if (result.rows.length === 0) {
      throw new Error('User not found')
    }

    const user: UserDb = result.rows[0]

    // Проверяем пароль
    const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash)
    if (!isValidPassword) {
      throw new Error('Invalid password')
    }

    // Создаем JWT токен
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      useRuntimeConfig().jwtSecret,
      { expiresIn: '7d' }
    )

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      token
    }
  },

  // Валидация токена
  async validateToken(token: string): Promise<Omit<User, 'password'> | null> {
    try {
      const decoded = jwt.verify(token, useRuntimeConfig().jwtSecret) as any

      const result = await query(
        `SELECT id, email, name, created_at, updated_at
         FROM users
         WHERE id = $1 AND email = $2`,
        [decoded.userId, decoded.email]
      )

      if (result.rows.length === 0) {
        return null
      }

      return result.rows[0]
    } catch (error) {
      return null
    }
  },

  // Получение пользователя по ID
  async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
    const result = await query(
      'SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    )

    return result.rows[0] || null
  }
}