"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Utensils, 
  MessageSquare, 
  Star,
  TrendingUp,
  TrendingDown,
  Eye,
  Search,
  ArrowUpRight,
  ChefHat
} from "lucide-react"

const stats = [
  {
    title: "Tổng Người Dùng",
    value: "12,456",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    color: "text-blue-600 bg-blue-100"
  },
  {
    title: "Tổng Món Ăn",
    value: "543",
    change: "+8.2%",
    trend: "up",
    icon: Utensils,
    color: "text-green-600 bg-green-100"
  },
  {
    title: "Bình Luận Mới",
    value: "1,234",
    change: "+23.1%",
    trend: "up",
    icon: MessageSquare,
    color: "text-orange-600 bg-orange-100"
  },
  {
    title: "Đánh Giá TB",
    value: "4.7",
    change: "-0.3%",
    trend: "down",
    icon: Star,
    color: "text-yellow-600 bg-yellow-100"
  }
]

const recentSearches = [
  { keyword: "Phở bò", count: 1234, trend: "up" },
  { keyword: "Bún chả", count: 987, trend: "up" },
  { keyword: "Cơm tấm", count: 876, trend: "down" },
  { keyword: "Bánh mì", count: 765, trend: "up" },
  { keyword: "Gỏi cuốn", count: 654, trend: "down" },
]

const popularRecipes = [
  { id: 1, name: "Phở Bò Hà Nội", views: 12500, rating: 4.9 },
  { id: 2, name: "Bún Chả Hà Nội", views: 10200, rating: 4.8 },
  { id: 3, name: "Cơm Tấm Sài Gòn", views: 9800, rating: 4.8 },
  { id: 4, name: "Bánh Mì Thịt", views: 8900, rating: 4.7 },
  { id: 5, name: "Gỏi Cuốn Tôm Thịt", views: 7600, rating: 4.6 },
]

const recentUsers = [
  { id: 1, name: "Nguyễn Văn A", email: "nguyenvana@email.com", date: "2 phút trước", status: "active" },
  { id: 2, name: "Trần Thị B", email: "tranthib@email.com", date: "15 phút trước", status: "active" },
  { id: 3, name: "Lê Văn C", email: "levanc@email.com", date: "1 giờ trước", status: "inactive" },
  { id: 4, name: "Phạm Thị D", email: "phamthid@email.com", date: "2 giờ trước", status: "active" },
]

const pendingComments = [
  { id: 1, user: "Nguyễn Văn A", recipe: "Phở Bò", content: "Công thức rất chi tiết...", date: "5 phút trước" },
  { id: 2, user: "Trần Thị B", recipe: "Bún Chả", content: "Đã thử nấu theo...", date: "10 phút trước" },
  { id: 3, user: "Lê Văn C", recipe: "Cơm Tấm", content: "Món này ngon quá...", date: "30 phút trước" },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Tổng quan hệ thống CookSmart AI</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <Badge 
                  variant="secondary" 
                  className={stat.trend === "up" ? "text-green-600" : "text-red-600"}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )}
                  {stat.change}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Popular Recipes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Món Ăn Phổ Biến</CardTitle>
              <CardDescription>Top 5 món ăn được xem nhiều nhất</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Xem tất cả
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularRecipes.map((recipe, index) => (
                <div key={recipe.id} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{recipe.name}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {recipe.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-accent text-accent" />
                        {recipe.rating}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Searches */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Tìm Kiếm Phổ Biến</CardTitle>
              <CardDescription>Từ khóa được tìm kiếm nhiều nhất</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Xem tất cả
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSearches.map((search, index) => (
                <div key={search.keyword} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium text-foreground">{search.keyword}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{search.count.toLocaleString()}</span>
                    {search.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Người Dùng Mới</CardTitle>
              <CardDescription>Người dùng đăng ký gần đây</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Xem tất cả
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={user.status === "active" ? "default" : "secondary"}>
                      {user.status === "active" ? "Hoạt động" : "Không HĐ"}
                    </Badge>
                    <p className="mt-1 text-xs text-muted-foreground">{user.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Comments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Bình Luận Chờ Duyệt</CardTitle>
              <CardDescription>Cần xem xét và phê duyệt</CardDescription>
            </div>
            <Badge variant="destructive">{pendingComments.length} mới</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingComments.map((comment) => (
                <div key={comment.id} className="rounded-lg border border-border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ChefHat className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{comment.recipe}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{comment.date}</span>
                  </div>
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{comment.user}:</span>{" "}
                    {comment.content}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="default">Duyệt</Button>
                    <Button size="sm" variant="outline">Từ chối</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
