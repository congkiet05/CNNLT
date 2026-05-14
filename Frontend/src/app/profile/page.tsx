"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  Calendar,
  Heart,
  ChefHat,
  Edit,
  Save,
  Clock,
  Loader2,
  Camera,
  History,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { scanSessionApi } from "@/apis"

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop"

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [sessions, setSessions] = useState<any[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [sessionPagination, setSessionPagination] = useState({ total: 0, total_pages: 1 })

  // Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (!isLoading && !user) router.push("/login")
  }, [isLoading, user, router])

  // Sync display name
  useEffect(() => {
    if (user) setDisplayName(user.display_name)
  }, [user])

  // Lấy lịch sử scan
  useEffect(() => {
    if (!user) return
    scanSessionApi.getHistory(1, 10).then(data => {
      if (data.success) {
        setSessions(data.sessions)
        setSessionPagination(data.pagination)
      }
    }).catch(console.error).finally(() => setSessionsLoading(false))
  }, [user])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const joinedDate = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <Card className="mb-6 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20" />
            <CardContent className="relative px-6 pb-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
                <div className="relative -mt-16">
                  <Avatar className="h-28 w-28 border-4 border-card">
                    <AvatarFallback className="bg-primary text-3xl text-primary-foreground">
                      {user.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground">{user.display_name}</h1>
                  <p className="text-muted-foreground">{user.email}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Tham gia {joinedDate}
                    </span>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role === "admin" ? "Admin" : "Người dùng"}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  className="gap-2"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <><Save className="h-4 w-4" />Lưu</>
                  ) : (
                    <><Edit className="h-4 w-4" />Chỉnh Sửa</>
                  )}
                </Button>
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-3">
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <History className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{sessionPagination.total}</p>
                  <p className="text-sm text-muted-foreground">Lần quét ảnh</p>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <ChefHat className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">97+</p>
                  <p className="text-sm text-muted-foreground">Công thức có sẵn</p>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">—</p>
                  <p className="text-sm text-muted-foreground">Món yêu thích</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="info" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-[300px]">
              <TabsTrigger value="info">Thông Tin</TabsTrigger>
              <TabsTrigger value="history">Lịch Sử Quét</TabsTrigger>
            </TabsList>

            {/* Info Tab */}
            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle>Thông Tin Cá Nhân</CardTitle>
                  <CardDescription>Thông tin tài khoản của bạn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Tên hiển thị</Label>
                      <Input
                        id="name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user.email}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Vai trò</Label>
                      <Input value={user.role === "admin" ? "Quản trị viên" : "Người dùng"} disabled className="bg-muted" />
                    </div>
                  </div>
                  {isEditing && (
                    <div className="flex gap-3 pt-4">
                      <Button onClick={() => setIsEditing(false)}>Lưu Thay Đổi</Button>
                      <Button variant="outline" onClick={() => { setIsEditing(false); setDisplayName(user.display_name) }}>Hủy</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Lịch Sử Quét Ảnh
                  </CardTitle>
                  <CardDescription>Các lần quét nguyên liệu gần đây</CardDescription>
                </CardHeader>
                <CardContent>
                  {sessionsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Camera className="mb-4 h-12 w-12 text-muted-foreground" />
                      <h3 className="text-lg font-semibold text-foreground">Chưa có lịch sử quét</h3>
                      <p className="text-muted-foreground">Hãy thử quét ảnh nguyên liệu để nhận gợi ý món ăn</p>
                      <Link href="/scan">
                        <Button className="mt-4 gap-2">
                          <Camera className="h-4 w-4" />
                          Quét Ngay
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map((session) => {
                        const ingredients = Array.isArray(session.ingredient_list)
                          ? session.ingredient_list
                          : []
                        const ingredientNames = ingredients
                          .slice(0, 4)
                          .map((i: any) => i.ten_nguyen_lieu)
                          .join(", ")
                        const date = new Date(session.created_at).toLocaleDateString("vi-VN", {
                          day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
                        })
                        return (
                          <div
                            key={session.id}
                            className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                <Camera className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground line-clamp-1">
                                  {ingredientNames || "Không có nguyên liệu"}
                                  {ingredients.length > 4 && ` +${ingredients.length - 4} khác`}
                                </p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {date}
                                </p>
                              </div>
                            </div>
                            <Badge variant="secondary">{ingredients.length} nguyên liệu</Badge>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
