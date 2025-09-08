// types/user.ts
export interface User {
  id: string
  email: string
  name: string
  created_at: Date
  updated_at: Date
}

export interface UserRegister {
  email: string
  password: string
  name: string
}

export interface UserLogin {
  email: string
  password: string
}