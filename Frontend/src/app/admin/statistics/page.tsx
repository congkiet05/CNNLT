"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  TrendingUp,
  TrendingDown,
  Users,
  Utensils,
  Eye,
  Search,
  MessageSquare,
  Star,
  Calendar,
  Download
} from "lucide-react"

const overviewStats = [
  {
    title: "Tổng Lượt Xem",
    value: "1,234,567",
    change: "+15.3%",
    trend: "up",
    icon: Eye,
    description: "So với tháng trước"
  },
  {
    title: "Tổng Tìm Kiếm",
    value: "456,789",
    change: "+8.7%",
    trend: "up",
    icon: Search,
    description: "So với tháng trước"
  },
  {
    title: "Người Dùng Mới",
    value: "2,345",
    change: "+23.5%",
    trend: "up",
    icon: Users,
    description: "So với tháng trước"
  },
  {
    title: "Đánh Giá Trung Bình",
    value: "4.7",
    change: "-0.1",
    trend: "down",
    icon: Star,
    description: "Trên tổng số đánh giá"
  }
]

const topRecipes = [
  { rank: 1, name: "Phở Bò Hà Nội", views: 45678, searches: 12345, rating: 4.9 },
  { rank: 2, name: "Bún Chả Hà Nội", views: 38901, searches: 10234, rating: 4.8 },
  { rank: 3, name: "Cơm Tấm Sài Gòn", views: 34567, searches: 8901, rating: 4.8 },
  { rank: 4, name: "Bánh Mì Thịt", views: 29012, searches: 7890, rating: 4.7 },
  { rank: 5, name: "Gỏi Cuốn Tôm Thịt", views: 25678, searches: 6789, rating: 4.6 },
  { rank: 6, name: "Canh Chua Cá Lóc", views: 23456, searches: 5678, rating: 4.5 },
  { rank: 7, name: "Bún Bò Huế", views: 21234, searches: 4567, rating: 4.7 },
  { rank: 8, name: "Chả Giò", views: 19012, searches: 3456, rating: 4.4 },
  { rank: 9, name: "Cà Phê Sữa Đá", views: 17890, searches: 2345, rating: 4.9 },
  { rank: 10, name: "Chè Ba Màu", views: 15678, searches: 1234, rating: 4.3 },
]

const searchTrends = [
  { keyword: "Phở bò", count: 12345, change: "+15%" },
  { keyword: "Bún chả", count: 10234, change: "+12%" },
  { keyword: "Món ăn nhanh", count: 8901, change: "+25%" },
  { keyword: "Canh chua", count: 7890, change: "-5%" },
  { keyword: "Đồ ăn healthy", count: 6789, change: "+30%" },
  { keyword: "Món chay", count: 5678, change: "+18%" },
  { keyword: "Bánh mì", count: 4567, change: "+8%" },
  { keyword: "Nước ép", count: 3456, change: "+22%" },
]

const categoryStats = [
  { name: "Món Chính", recipes: 156, views: 456789, percentage: 35 },
  { name: "Khai Vị", recipes: 89, views: 234567, percentage: 18 },
  { name: "Canh/Súp", recipes: 68, views: 178901, percentage: 14 },
  { name: "Nướng/BBQ", recipes: 45, views: 145678, percentage: 11 },
  { name: "Tráng Miệng", recipes: 72, views: 156789, percentage: 12 },
  { name: "Đồ Uống", recipes: 53, views: 128901, percentage: 10 },
]

const weeklyData = [
  { day: "T2", users: 1234, views: 5678, searches: 890 },
  { day: "T3", users: 1456, views: 6234, searches: 1023 },
  { day: "T4", users: 1678, views: 7012, searches: 1156 },
  { day: "T5", users: 1890, views: 7890, searches: 1289 },
  { day: "T6", users: 2123, views: 8567, searches: 1456 },
  { day: "T7", users: 2567, views: 9234, searches: 1678 },
  { day: "CN", users: 2345, views: 8901, searches: 1567 },
]

export default function AdminStatisticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Thống Kê</h1>
          <p className="text-muted-foreground">Phân tích chi tiết hoạt động hệ thống</p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="7days">
            <SelectTrigger className="w-[150px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hôm nay</SelectItem>
              <SelectItem value="7days">7 ngày qua</SelectItem>
              <SelectItem value="30days">30 ngày qua</SelectItem>
              <SelectItem value="90days">90 ngày qua</SelectItem>
              <SelectItem value="year">Năm nay</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Xuất Báo Cáo
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
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
        {/* Weekly Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt Động Trong Tuần</CardTitle>
            <CardDescription>Lượt xem, người dùng và tìm kiếm theo ngày</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyData.map((day) => (
                <div key={day.day} className="flex items-center gap-4">
                  <span className="w-8 text-sm font-medium text-muted-foreground">{day.day}</span>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${(day.views / 10000) * 100}%` }}
                      />
                      <span className="text-xs text-muted-foreground">{day.views.toLocaleString()} xem</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-2 rounded-full bg-accent"
                        style={{ width: `${(day.users / 3000) * 100}%` }}
                      />
                      <span className="text-xs text-muted-foreground">{day.users.toLocaleString()} người dùng</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span className="text-muted-foreground">Lượt xem</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-accent" />
                <span className="text-muted-foreground">Người dùng</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Phân Bố Theo Danh Mục</CardTitle>
            <CardDescription>Số lượng món ăn và lượt xem theo danh mục</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.map((cat) => (
                <div key={cat.name}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{cat.name}</span>
                    <span className="text-muted-foreground">{cat.recipes} món • {cat.views.toLocaleString()} xem</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div 
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Recipes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-primary" />
              Top 10 Món Ăn
            </CardTitle>
            <CardDescription>Món ăn được xem và tìm kiếm nhiều nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topRecipes.map((recipe) => (
                <div key={recipe.rank} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    recipe.rank <= 3 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {recipe.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{recipe.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {recipe.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Search className="h-3 w-3" />
                        {recipe.searches.toLocaleString()}
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

        {/* Search Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Xu Hướng Tìm Kiếm
            </CardTitle>
            <CardDescription>Từ khóa được tìm kiếm nhiều nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {searchTrends.map((trend, idx) => (
                <div key={trend.keyword} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-foreground">{trend.keyword}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{trend.count.toLocaleString()}</span>
                    <Badge 
                      variant="secondary"
                      className={trend.change.startsWith("+") ? "text-green-600" : "text-red-600"}
                    >
                      {trend.change.startsWith("+") ? (
                        <TrendingUp className="mr-1 h-3 w-3" />
                      ) : (
                        <TrendingDown className="mr-1 h-3 w-3" />
                      )}
                      {trend.change}
                    </Badge>
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
