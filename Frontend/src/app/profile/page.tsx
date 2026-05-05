"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { 
  Camera, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Heart,
  ChefHat,
  Star,
  Edit,
  Save,
  Clock,
  Eye
} from "lucide-react"
import Link from "next/link"

const user = {
  name: "Nguyễn Văn A",
  email: "nguyenvana@email.com",
  phone: "0123456789",
  address: "Hà Nội, Việt Nam",
  avatar: "",
  joinedDate: "15/01/2024",
  bio: "Đam mê nấu ăn và khám phá ẩm thực Việt Nam"
}

const favoriteRecipes = [
  {
    id: 1,
    name: "Phở Bò Hà Nội",
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300&h=200&fit=crop",
    rating: 4.8,
    time: "60 phút"
  },
  {
    id: 2,
    name: "Bún Chả Hà Nội",
    image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=300&h=200&fit=crop",
    rating: 4.9,
    time: "45 phút"
  },
  {
    id: 3,
    name: "Cà Phê Sữa Đá",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&h=200&fit=crop",
    rating: 4.9,
    time: "5 phút"
  }
]

const searchHistory = [
  { id: 1, keyword: "Phở bò", date: "Hôm nay", results: 15 },
  { id: 2, keyword: "Bún chả", date: "Hôm qua", results: 12 },
  { id: 3, keyword: "Món ăn với thịt bò", date: "2 ngày trước", results: 28 },
  { id: 4, keyword: "Canh chua", date: "3 ngày trước", results: 8 },
]

const stats = [
  { label: "Món yêu thích", value: 12, icon: Heart },
  { label: "Công thức đã xem", value: 156, icon: Eye },
  { label: "Đánh giá đã gửi", value: 24, icon: Star },
]

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(user)

  const handleSave = () => {
    setIsEditing(false)
    // Save logic here
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar 
        isLoggedIn={true} 
        user={{ name: user.name, email: user.email }}
      />
      
      <main className="flex-1 bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <Card className="mb-6 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20" />
            <CardContent className="relative px-6 pb-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
                <div className="relative -mt-16">
                  <Avatar className="h-28 w-28 border-4 border-card">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-primary text-3xl text-primary-foreground">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
                  <p className="text-muted-foreground">{user.bio}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {user.address}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Tham gia {user.joinedDate}
                    </span>
                  </div>
                </div>
                <Button 
                  variant={isEditing ? "default" : "outline"}
                  className="gap-2"
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                >
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4" />
                      Lưu Thay Đổi
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4" />
                      Chỉnh Sửa
                    </>
                  )}
                </Button>
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="info" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="info">Thông Tin</TabsTrigger>
              <TabsTrigger value="favorites">Yêu Thích</TabsTrigger>
              <TabsTrigger value="history">Lịch Sử</TabsTrigger>
            </TabsList>

            {/* Info Tab */}
            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle>Thông Tin Cá Nhân</CardTitle>
                  <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Họ và tên</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="pl-10"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="pl-10"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Địa chỉ</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="pl-10"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleSave}>Lưu Thay Đổi</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>Hủy</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Change Password */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Đổi Mật Khẩu</CardTitle>
                  <CardDescription>Đảm bảo tài khoản của bạn được bảo mật</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Mật khẩu mới</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  <Button>Cập Nhật Mật Khẩu</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Món Ăn Yêu Thích
                  </CardTitle>
                  <CardDescription>Các món ăn bạn đã lưu</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {favoriteRecipes.map((recipe) => (
                      <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                        <Card className="group overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
                          <div className="relative aspect-[3/2] overflow-hidden">
                            <img
                              src={recipe.image}
                              alt={recipe.name}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                            <button className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 backdrop-blur">
                              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                            </button>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-foreground group-hover:text-primary">
                              {recipe.name}
                            </h3>
                            <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {recipe.time}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-accent text-accent" />
                                {recipe.rating}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>

                  {favoriteRecipes.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Heart className="mb-4 h-12 w-12 text-muted-foreground" />
                      <h3 className="text-lg font-semibold text-foreground">Chưa có món yêu thích</h3>
                      <p className="text-muted-foreground">Hãy khám phá và lưu các món ăn bạn thích</p>
                      <Link href="/recipes">
                        <Button className="mt-4">Khám Phá Món Ăn</Button>
                      </Link>
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
                    <Clock className="h-5 w-5 text-primary" />
                    Lịch Sử Tìm Kiếm
                  </CardTitle>
                  <CardDescription>Các tìm kiếm gần đây của bạn</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {searchHistory.map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <ChefHat className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{item.keyword}</p>
                            <p className="text-sm text-muted-foreground">{item.date}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{item.results} kết quả</Badge>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 text-center">
                    <Button variant="outline">Xóa Lịch Sử</Button>
                  </div>
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
