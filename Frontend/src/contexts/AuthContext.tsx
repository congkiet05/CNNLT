"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { authApi, tokenStorage, type AuthUser } from "@/apis"

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateUser: (data: Partial<AuthUser>) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Khôi phục session khi load trang
  useEffect(() => {
    async function restoreSession() {
      const token = tokenStorage.getAccessToken()
      if (!token) {
        setIsLoading(false)
        return
      }
      const me = await authApi.getMe()
      setUser(me)
      setIsLoading(false)
    }
    restoreSession()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const data = await authApi.login(email, password)
      if (!data.success) {
        return { success: false, error: data.message ?? "Đăng nhập thất bại" }
      }
      tokenStorage.setTokens(data.access_token, data.refresh_token)
      setUser(data.user)
      return { success: true }
    } catch (err) {
      return { success: false, error: "Không thể kết nối đến server" }
    }
  }, [])

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    try {
      const data = await authApi.register(email, password, displayName)
      if (!data.success) {
        return { success: false, error: data.message ?? "Đăng ký thất bại" }
      }
      return { success: true }
    } catch (err) {
      return { success: false, error: "Không thể kết nối đến server" }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch (err) {
      console.error("Logout error:", err)
    }
    setUser(null)
  }, [])

  const updateUser = useCallback((data: Partial<AuthUser>) => {
    setUser(prev => prev ? { ...prev, ...data } : null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}

// Re-export type để các component khác dùng
export type { AuthUser }
