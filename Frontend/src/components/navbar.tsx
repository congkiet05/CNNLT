"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChefHat, Menu, X, User, Heart, History, LogOut, Settings, Shield } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <ChefHat className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">CookSmart AI</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Trang Chủ
          </Link>
          <Link href="/recipes" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Món Ăn
          </Link>
          <Link href="/scan" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Nhận Diện Nguyên Liệu
          </Link>
          <Link href="/categories" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Danh Mục
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
              Admin
            </Link>
          )}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url ?? ""} alt={user.display_name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{user.display_name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  {user.role === "admin" && (
                    <p className="text-xs font-medium text-primary">Admin</p>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex cursor-pointer items-center">
                    <User className="mr-2 h-4 w-4" />
                    Hồ Sơ Cá Nhân
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/favorites" className="flex cursor-pointer items-center">
                    <Heart className="mr-2 h-4 w-4" />
                    Món Yêu Thích
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/history" className="flex cursor-pointer items-center">
                    <History className="mr-2 h-4 w-4" />
                    Lịch Sử Tìm Kiếm
                  </Link>
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex cursor-pointer items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng Xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Đăng Nhập</Button>
              </Link>
              <Link href="/register">
                <Button>Đăng Ký</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-card md:hidden">
          <nav className="container mx-auto flex flex-col gap-4 px-4 py-4">
            <Link href="/" className="text-sm font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>
              Trang Chủ
            </Link>
            <Link href="/recipes" className="text-sm font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>
              Món Ăn
            </Link>
            <Link href="/scan" className="text-sm font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>
              Nhận Diện Nguyên Liệu
            </Link>
            <Link href="/categories" className="text-sm font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>
              Danh Mục
            </Link>
            {user?.role === "admin" && (
              <Link href="/admin" className="text-sm font-medium text-primary" onClick={() => setMobileMenuOpen(false)}>
                Admin Dashboard
              </Link>
            )}
            <div className="flex flex-col gap-2 pt-4">
              {user ? (
                <>
                  <div className="px-1 text-sm text-muted-foreground">
                    Xin chào, <span className="font-medium text-foreground">{user.display_name}</span>
                  </div>
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Hồ Sơ Cá Nhân</Button>
                  </Link>
                  <Button variant="destructive" className="w-full" onClick={handleLogout}>
                    Đăng Xuất
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Đăng Nhập</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">Đăng Ký</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
