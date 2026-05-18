"use client"

import { useState, useEffect } from "react" // Thêm useEffect
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Search, 
  MoreHorizontal, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Upload,
  CloudSun // Thêm icon thời tiết
} from "lucide-react"

const recipes = [
  {
    id: 1,
    name: "Phở Bò Hà Nội",
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=100&h=100&fit=crop",
    category: "Món chính",
    author: "Chef Minh",
    status: "published",
    rating: 4.8,
    views: 12500,
    comments: 234,
    createdAt: "15/03/2024"
  },
  {
    id: 2,
    name: "Bún Chả Hà Nội",
    image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=100&h=100&fit=crop",
    category: "Món chính",
    author: "Chef Lan",
    status: "published",
    rating: 4.9,
    views: 10200,
    comments: 189,
    createdAt: "12/03/2024"
  },
  {
    id: 3,
    name: "Bánh Mì Thịt",
    image: "https://images.unsplash.com/photo-1600454021178-b3c1d7a6bdf1?w=100&h=100&fit=crop",
    category: "Món chính",
    author: "Chef Hùng",
    status: "draft",
    rating: 0,
    views: 0,
    comments: 0,
    createdAt: "20/03/2024"
  },
  {
    id: 4,
    name: "Gỏi Cuốn Tôm Thịt",
    image: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=100&h=100&fit=crop",
    category: "Khai vị",
    author: "Chef Mai",
    status: "pending",
    rating: 0,
    views: 0,
    comments: 0,
    createdAt: "18/03/2024"
  },
  {
    id: 5,
    name: "Canh Chua Cá Lóc",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=100&h=100&fit=crop",
    category: "Canh/Súp",
    author: "Chef Minh",
    status: "published",
    rating: 4.5,
    views: 8900,
    comments: 98,
    createdAt: "10/03/2024"
  },
]

const categories = [
  "Món chính",
  "Khai vị",
  "Canh/Súp",
  "Tráng miệng",
  "Đồ uống"
]

export default function AdminRecipesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  
  // --- PHẦN BỔ SUNG: STATE CHO THỜI TIẾT ---
  const [weatherInfo, setWeatherInfo] = useState<any>(null)
  const [isWeatherLoading, setIsWeatherLoading] = useState(false)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        setIsWeatherLoading(true)
        try {
          const res = await fetch('/api/weather-recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat: position.coords.latitude,
              lon: position.coords.longitude
            })
          })
          const data = await res.json()
          setWeatherInfo(data)
        } catch (error) {
          console.error("Lỗi fetch weather:", error)
        } finally {
          setIsWeatherLoading(false)
        }
      })
    }
  }, [])
  // ------------------------------------------

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recipe.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || recipe.status === statusFilter
    const matchesCategory = categoryFilter === "all" || recipe.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-700">Đã xuất bản</Badge>
      case "draft":
        return <Badge variant="secondary">Bản nháp</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700">Chờ duyệt</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản Lý Món Ăn</h1>
          <p className="text-muted-foreground">Quản lý tất cả công thức món ăn trong hệ thống</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Thêm Món Ăn
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm Món Ăn Mới</DialogTitle>
              <DialogDescription>
                Tạo công thức món ăn mới
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="recipe-name">Tên món ăn</Label>
                  <Input id="recipe-name" placeholder="VD: Phở Bò Hà Nội" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipe-category">Danh mục</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="recipe-time">Thời gian nấu</Label>
                  <Input id="recipe-time" placeholder="VD: 60 phút" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipe-servings">Khẩu phần</Label>
                  <Input id="recipe-servings" type="number" placeholder="VD: 4" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipe-description">Mô tả</Label>
                <Textarea 
                  id="recipe-description" 
                  placeholder="Mô tả ngắn về món ăn..." 
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Hình ảnh</Label>
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Kéo thả hoặc click để tải ảnh lên
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipe-video">Link Video YouTube</Label>
                <Input id="recipe-video" placeholder="https://youtube.com/watch?v=..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Hủy</Button>
              <Button>Lưu Bản Nháp</Button>
              <Button variant="default">Xuất Bản</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* --- PHẦN BỔ SUNG: UI GỢI Ý THỜI TIẾT --- */}
      {weatherInfo && (
        <Card className="border-orange-200 bg-orange-50/40 dark:bg-orange-950/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <CloudSun className="h-5 w-5" />
              Gợi ý từ Trợ lý AI ({weatherInfo.city})
              <Badge variant="outline" className="ml-auto bg-orange-100 text-orange-700 border-orange-200">
                {weatherInfo.temp}°C
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-orange-900 dark:text-orange-200 mb-3">
              {weatherInfo.message}
            </p>
            <div className="flex flex-wrap gap-2">
              {weatherInfo.suggestedRecipes?.map((recipe: any) => (
                <Badge 
                  key={recipe.id} 
                  variant="secondary" 
                  className="bg-white hover:bg-orange-100 cursor-pointer border-orange-100 text-orange-800 shadow-sm"
                >
                  <Star className="mr-1 h-3 w-3 fill-orange-400 text-orange-400" />
                  {recipe.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* ------------------------------------------ */}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên món ăn hoặc tác giả..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="published">Đã xuất bản</SelectItem>
                  <SelectItem value="draft">Bản nháp</SelectItem>
                  <SelectItem value="pending">Chờ duyệt</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Xuất
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Món Ăn</CardTitle>
          <CardDescription>
            Tổng cộng {filteredRecipes.length} món ăn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Món ăn</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Tác giả</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Đánh giá</TableHead>
                <TableHead className="text-center">Lượt xem</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={recipe.image}
                        alt={recipe.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <span className="font-medium text-foreground">{recipe.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{recipe.category}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{recipe.author}</TableCell>
                  <TableCell>{getStatusBadge(recipe.status)}</TableCell>
                  <TableCell className="text-center">
                    {recipe.rating > 0 ? (
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        <span>{recipe.rating}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {recipe.views > 0 ? recipe.views.toLocaleString() : "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{recipe.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {recipe.status === "pending" && (
                          <>
                            <DropdownMenuItem className="cursor-pointer text-green-600">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Phê duyệt
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-orange-600">
                              <XCircle className="mr-2 h-4 w-4" />
                              Từ chối
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem className="cursor-pointer text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}