import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '~/server/utils/db'
import { User, UserRegister, UserLogin, UserDb } from '~/types/user'

export const authService = {
  // Регистрация пользователя
  async register(userData: UserRegister): Promise<{ user: Omit<User, 'password'>; accessToken: string; refreshToken: string }> {
    const config = useRuntimeConfig()

    // Проверяем конфигурацию
    if (!config.jwtSecret || !config.jwtRefreshSecret) {
      throw new Error('JWT secrets are not configured')
    }

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

    // Генерируем токены
    const tokens = await this.generateTokens({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      created_at: newUser.created_at,
      updated_at: newUser.updated_at
    })

    return {
      user: newUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    }
  },

  // Авторизация пользователя
  async login(credentials: UserLogin): Promise<{ user: Omit<User, 'password'>; accessToken: string; refreshToken: string }> {
    const config = useRuntimeConfig()

    // Проверяем конфигурацию
    if (!config.jwtSecret || !config.jwtRefreshSecret) {
      throw new Error('JWT secrets are not configured')
    }

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

    // Генерируем токены
    const tokens = await this.generateTokens({
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
      updated_at: user.updated_at
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    }
  },

  // Генерация токенов
  async generateTokens(user: Omit<User, 'password'>): Promise<{ accessToken: string; refreshToken: string }> {
    const config = useRuntimeConfig()

    if (!config.jwtSecret || !config.jwtRefreshSecret) {
      throw new Error('JWT secrets are not configured')
    }

    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        type: 'access'
      },
      config.jwtSecret,
      { expiresIn: '15m' } // 15 минут
    )

    const refreshToken = jwt.sign(
      {
        userId: user.id,
        type: 'refresh'
      },
      config.jwtRefreshSecret,
      { expiresIn: '7d' } // 7 дней
    )

    // Сохраняем refresh token в БД
    await query(
      'INSERT INTO user_refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    )

    return { accessToken, refreshToken }
  },

  // Обновление access token
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const config = useRuntimeConfig()

    if (!config.jwtSecret || !config.jwtRefreshSecret) {
      throw new Error('JWT secrets are not configured')
    }

    try {
      // Проверяем refresh token
      const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as any

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type')
      }

      // Проверяем существование в БД
      const tokenRecord = await query(
        `SELECT * FROM user_refresh_tokens
         WHERE token = $1 AND expires_at > NOW() AND revoked = FALSE`,
        [refreshToken]
      )

      if (!tokenRecord.rows.length) {
        throw new Error('Invalid refresh token')
      }

      // Получаем пользователя
      const userResult = await query(
        'SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1',
        [decoded.userId]
      )

      const user = userResult.rows[0]

      if (!user) {
        throw new Error('User not found')
      }

      // Отзываем старый refresh token
      await this.revokeRefreshToken(refreshToken)

      // Генерируем новые токены
      const tokens = await this.generateTokens(user)

      return tokens
    } catch (error) {
      // В случае ошибки отзываем токен
      await this.revokeRefreshToken(refreshToken).catch(() => {})
      throw error
    }
  },

  // Отзыв refresh token
  async revokeRefreshToken(token: string): Promise<void> {
    try {
      await query(
        'UPDATE user_refresh_tokens SET revoked = TRUE WHERE token = $1',
        [token]
      )
    } catch (error) {
      console.error('Error revoking refresh token:', error)
      throw error
    }
  },

  // Отзыв всех refresh tokens пользователя
  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    try {
      await query(
        'UPDATE user_refresh_tokens SET revoked = TRUE WHERE user_id = $1',
        [userId]
      )
    } catch (error) {
      console.error('Error revoking all user tokens:', error)
      throw error
    }
  },

  // Валидация access token
  async validateAccessToken(token: string): Promise<Omit<User, 'password'> | null> {
    const config = useRuntimeConfig()

    if (!config.jwtSecret) {
      console.error('JWT secret is not configured')
      return null
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any

      // Проверяем тип токена
      if (decoded.type !== 'access') {
        return null
      }

      const result = await query(
        'SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1',
        [decoded.userId]
      )

      return result.rows[0] || null
    } catch (error) {
      console.error('Access token validation failed:', error)
      return null
    }
  },

  // Валидация refresh token
  async validateRefreshToken(token: string): Promise<boolean> {
    const config = useRuntimeConfig()

    if (!config.jwtRefreshSecret) {
      console.error('JWT refresh secret is not configured')
      return false
    }

    try {
      const decoded = jwt.verify(token, config.jwtRefreshSecret) as any

      if (decoded.type !== 'refresh') {
        return false
      }

      const tokenRecord = await query(
        `SELECT * FROM user_refresh_tokens
         WHERE token = $1 AND expires_at > NOW() AND revoked = FALSE`,
        [token]
      )

      return tokenRecord.rows.length > 0
    } catch (error) {
      console.error('Refresh token validation failed:', error)
      return false
    }
  },

  // Получение пользователя по ID
  async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
    try {
      const result = await query(
        'SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1',
        [userId]
      )

      return result.rows[0] || null
    } catch (error) {
      console.error('Error getting user by ID:', error)
      return null
    }
  },

  // Получение пользователя по email
  async getUserByEmail(email: string): Promise<Omit<User, 'password'> | null> {
    try {
      const result = await query(
        'SELECT id, email, name, created_at, updated_at FROM users WHERE email = $1',
        [email]
      )

      return result.rows[0] || null
    } catch (error) {
      console.error('Error getting user by email:', error)
      return null
    }
  },

  // Обновление данных пользователя
  async updateUser(userId: string, updates: Partial<{ name: string; email: string }>): Promise<Omit<User, 'password'> | null> {
    try {
      const fields = []
      const values = []
      let paramCount = 1

      if (updates.name) {
        fields.push(`name = $${paramCount}`)
        values.push(updates.name)
        paramCount++
      }

      if (updates.email) {
        fields.push(`email = $${paramCount}`)
        values.push(updates.email)
        paramCount++
      }

      if (fields.length === 0) {
        throw new Error('No fields to update')
      }

      fields.push(`updated_at = $${paramCount}`)
      values.push(new Date())
      paramCount++

      values.push(userId)

      const result = await query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount}
         RETURNING id, email, name, created_at, updated_at`,
        values
      )

      return result.rows[0] || null
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  },

  // Удаление пользователя
  async deleteUser(userId: string): Promise<boolean> {
    try {
      // Сначала отзываем все refresh tokens
      await this.revokeAllUserRefreshTokens(userId)

      // Затем удаляем пользователя
      const result = await query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [userId]
      )

      return result.rows.length > 0
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  },

  // Проверка существования пользователя
  async userExists(email: string): Promise<boolean> {
    try {
      const result = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      )

      return result.rows.length > 0
    } catch (error) {
      console.error('Error checking user existence:', error)
      return false
    }
  },

  // Получение всех активных сессий пользователя
  async getUserSessions(userId: string): Promise<any[]> {
    try {
      const result = await query(
        `SELECT id, token, created_at, expires_at, revoked
         FROM user_refresh_tokens
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
      )

      return result.rows
    } catch (error) {
      console.error('Error getting user sessions:', error)
      return []
    }
  },

  // Очистка просроченных refresh tokens
  async cleanupExpiredTokens(): Promise<number> {
    try {
      const result = await query(
        'DELETE FROM user_refresh_tokens WHERE expires_at < NOW() RETURNING id',
        []
      )

      return result.rows.length
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error)
      return 0
    }
  }
}