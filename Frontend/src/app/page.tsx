"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { 
  Camera, 
  Sparkles, 
  Youtube, 
  Heart, 
  Search, 
  ChefHat,
  ArrowRight,
  Star,
  Clock,
  Users,
  Utensils
} from "lucide-react"

const features = [
  {
    icon: Camera,
    title: "Chụp Ảnh Nguyên Liệu",
    description: "Chỉ cần chụp ảnh các nguyên liệu có sẵn trong bếp, hệ thống sẽ tự động nhận diện."
  },
  {
    icon: Sparkles,
    title: "AI Nhận Diện Thông Minh",
    description: "Sử dụng Gemini AI tiên tiến để nhận diện chính xác các loại nguyên liệu từ hình ảnh."
  },
  {
    icon: Utensils,
    title: "Gợi Ý Món Ăn Phù Hợp",
    description: "Dựa trên nguyên liệu đã nhận diện, hệ thống gợi ý các món ăn ngon và phù hợp."
  },
  {
    icon: Youtube,
    title: "Video Hướng Dẫn",
    description: "Xem video hướng dẫn nấu ăn chi tiết từ YouTube cho mỗi món ăn."
  }
]

const popularRecipes = [
  {
    id: 1,
    name: "Phở Bò Hà Nội",
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&h=300&fit=crop",
    time: "60 phút",
    difficulty: "Trung bình",
    rating: 4.8,
    reviews: 234
  },
  {
    id: 2,
    name: "Bún Chả Hà Nội",
    image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop",
    time: "45 phút",
    difficulty: "Dễ",
    rating: 4.9,
    reviews: 189
  },
  {
    id: 3,
    name: "Bánh Mì Thịt",
    image: "https://images.unsplash.com/photo-1600454021178-b3c1d7a6bdf1?w=400&h=300&fit=crop",
    time: "30 phút",
    difficulty: "Dễ",
    rating: 4.7,
    reviews: 156
  },
  {
    id: 4,
    name: "Gỏi Cuốn Tôm Thịt",
    image: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&h=300&fit=crop",
    time: "25 phút",
    difficulty: "Dễ",
    rating: 4.6,
    reviews: 145
  }
]

const stats = [
  { icon: Utensils, value: "500+", label: "Món Ăn" },
  { icon: Users, value: "10K+", label: "Người Dùng" },
  { icon: Star, value: "4.8", label: "Đánh Giá" },
  { icon: Youtube, value: "1000+", label: "Video" }
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Công nghệ AI tiên tiến
              </div>
              <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl">
                Biến Nguyên Liệu Thành{" "}
                <span className="text-primary">Món Ăn Ngon</span>
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg text-muted-foreground">
                Chỉ cần chụp ảnh nguyên liệu trong bếp, AI sẽ nhận diện và gợi ý những món ăn 
                ngon nhất cùng video hướng dẫn chi tiết từ YouTube.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/scan">
                  <Button size="lg" className="gap-2">
                    <Camera className="h-5 w-5" />
                    Bắt Đầu Ngay
                  </Button>
                </Link>
                <Link href="/recipes">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Search className="h-5 w-5" />
                    Khám Phá Món Ăn
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        </section>

        {/* Stats Section */}
        <section className="border-y border-border bg-card py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground md:text-3xl">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground">Cách Hoạt Động</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Chỉ với 3 bước đơn giản, bạn sẽ có ngay công thức món ăn phù hợp với nguyên liệu hiện có.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="relative overflow-hidden border-2 border-dashed border-primary/20 bg-card">
                <div className="absolute -right-4 -top-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  1
                </div>
                <CardContent className="p-6 pt-12">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <Camera className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">Chụp Ảnh</h3>
                  <p className="text-muted-foreground">
                    Chụp ảnh hoặc tải lên hình ảnh các nguyên liệu có sẵn trong bếp của bạn.
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-2 border-dashed border-primary/20 bg-card">
                <div className="absolute -right-4 -top-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  2
                </div>
                <CardContent className="p-6 pt-12">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <Sparkles className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">AI Nhận Diện</h3>
                  <p className="text-muted-foreground">
                    Hệ thống AI sử dụng Gemini để nhận diện và liệt kê các nguyên liệu trong ảnh.
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-2 border-dashed border-primary/20 bg-card">
                <div className="absolute -right-4 -top-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  3
                </div>
                <CardContent className="p-6 pt-12">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <ChefHat className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">Nhận Gợi Ý</h3>
                  <p className="text-muted-foreground">
                    Xem danh sách món ăn phù hợp, công thức chi tiết và video hướng dẫn từ YouTube.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-muted/50 py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground">Tính Năng Nổi Bật</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Khám phá những tính năng độc đáo giúp việc nấu ăn trở nên dễ dàng và thú vị hơn.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card key={feature.title} className="border-0 bg-card shadow-md transition-shadow hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Recipes */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 flex items-center justify-between">
              <div>
                <h2 className="mb-2 text-3xl font-bold text-foreground">Món Ăn Phổ Biến</h2>
                <p className="text-muted-foreground">Những món ăn được yêu thích nhất từ cộng đồng.</p>
              </div>
              <Link href="/recipes">
                <Button variant="outline" className="hidden gap-2 sm:flex">
                  Xem Tất Cả
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {popularRecipes.map((recipe) => (
                <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                  <Card className="group overflow-hidden border-0 bg-card shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={recipe.image}
                        alt={recipe.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <button className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 backdrop-blur transition-colors hover:bg-card">
                        <Heart className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="mb-2 font-semibold text-foreground group-hover:text-primary">
                        {recipe.name}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {recipe.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-accent text-accent" />
                          {recipe.rating} ({recipe.reviews})
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link href="/recipes">
                <Button variant="outline" className="gap-2">
                  Xem Tất Cả
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold text-primary-foreground">
                Sẵn Sàng Nấu Ăn?
              </h2>
              <p className="mb-8 text-lg text-primary-foreground/80">
                Đăng ký ngay để lưu món yêu thích, xem lịch sử tìm kiếm và nhận gợi ý cá nhân hóa.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="gap-2">
                    Đăng Ký Miễn Phí
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/scan">
                  <Button size="lg" variant="outline" className="gap-2 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                    Thử Ngay Không Cần Đăng Ký
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
