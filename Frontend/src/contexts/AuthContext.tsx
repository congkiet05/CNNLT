"use client"

import { createContext, useContext, useState, useEffect } from "react"

export type UserRole = "user" | "admin"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

// Mock accounts
const MOCK_ACCOUNTS: (AuthUser & { password: string })[] = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    email: "user@cooksmart.ai",
    password: "123456",
    role: "user",
    avatar: "",
  },
  {
    id: "2",
    name: "Admin",
    email: "admin@cooksmart.ai",
    password: "admin123",
    role: "admin",
    avatar: "",
  },
]

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("mock_auth_user")
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem("mock_auth_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800))

    const account = MOCK_ACCOUNTS.find(
      (a) => a.email === email && a.password === password
    )

    if (!account) {
      return { success: false, error: "Email hoặc mật khẩu không đúng" }
    }

    const { password: _, ...authUser } = account
    setUser(authUser)
    localStorage.setItem("mock_auth_user", JSON.stringify(authUser))
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("mock_auth_user")
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
