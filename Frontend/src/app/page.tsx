"use client"

import { useEffect, useState } from "react"
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
  Utensils,
  Loader2,
} from "lucide-react"
import { recipeApi } from "@/apis"

const features = [
  {
    icon: Camera,
    title: "Chụp Ảnh Nguyên Liệu",
    description: "Chỉ cần chụp ảnh các nguyên liệu có sẵn trong bếp, hệ thống sẽ tự động nhận diện.",
  },
  {
    icon: Sparkles,
    title: "AI Nhận Diện Thông Minh",
    description: "Sử dụng Gemini AI tiên tiến để nhận diện chính xác các loại nguyên liệu từ hình ảnh.",
  },
  {
    icon: Utensils,
    title: "Gợi Ý Món Ăn Phù Hợp",
    description: "Dựa trên nguyên liệu đã nhận diện, hệ thống gợi ý các món ăn ngon và phù hợp.",
  },
  {
    icon: Youtube,
    title: "Video Hướng Dẫn",
    description: "Xem video hướng dẫn nấu ăn chi tiết từ YouTube cho mỗi món ăn.",
  },
]

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop"

export default function HomePage() {
  const [popularRecipes, setPopularRecipes] = useState<any[]>([])
  const [totalRecipes, setTotalRecipes] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    recipeApi.list(1, 4).then((data) => {
      if (data.success) {
        setPopularRecipes(data.recipes)
        setTotalRecipes(data.pagination.total)
      }
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const stats = [
    { icon: Utensils, value: totalRecipes > 0 ? `${totalRecipes}+` : "...", label: "Món Ăn" },
    { icon: Users,    value: "10K+",  label: "Người Dùng" },
    { icon: Star,     value: "4.8",   label: "Đánh Giá" },
    { icon: Youtube,  value: "1000+", label: "Video" },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 z-0">
            <img src="/hero-bg.png" alt="Fresh ingredients" className="h-full w-full object-cover brightness-[0.4] transition-transform duration-1000 hover:scale-105" />
          </div>
          <div className="container relative z-10 mx-auto px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="mx-auto max-w-3xl text-center rounded-3xl bg-background/20 p-8 backdrop-blur-md border border-white/10 shadow-2xl dark:bg-black/40">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm border border-primary/30">
                <Sparkles className="h-4 w-4" />
                Công nghệ AI tiên tiến
              </div>
              <h1 className="mb-6 text-balance font-heading text-5xl font-bold tracking-tight text-white md:text-8xl drop-shadow-lg">
                Biến Nguyên Liệu Thành<br />
                <span className="bg-gradient-to-r from-primary via-orange-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-none">Món Ăn Ngon</span>
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg text-gray-200 drop-shadow">
                Chỉ cần chụp ảnh nguyên liệu trong bếp, AI sẽ nhận diện và gợi ý những món ăn
                ngon nhất cùng video hướng dẫn chi tiết từ YouTube.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/scan">
                  <Button size="lg" className="gap-2 h-14 px-8 text-lg rounded-full shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:shadow-[0_0_30px_rgba(234,88,12,0.6)] transition-all">
                    <Camera className="h-6 w-6" />
                    Bắt Đầu Ngay
                  </Button>
                </Link>
                <Link href="/recipes">
                  <Button size="lg" variant="outline" className="gap-2 h-14 px-8 text-lg rounded-full bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all">
                    <Search className="h-6 w-6" />
                    Khám Phá Món Ăn
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          {/* Decorative gradients */}
          <div className="absolute -bottom-1/2 left-1/2 -translate-x-1/2 h-[500px] w-[1000px] rounded-[100%] bg-primary/20 blur-[120px] pointer-events-none" />
        </section>

        {/* Stats */}
        <section className="relative z-20 -mt-16 container mx-auto px-4 mb-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <div className="rounded-3xl border border-border/50 bg-card/80 p-8 backdrop-blur-xl shadow-2xl dark:bg-card/40">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center group">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 transition-transform group-hover:-translate-y-1 group-hover:bg-primary/20">
                    <stat.icon className="h-7 w-7 text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-foreground md:text-4xl">{stat.value}</p>
                  <p className="text-sm font-medium text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="mb-4 font-heading text-5xl font-bold text-foreground tracking-tight">Cách Hoạt Động</h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Chỉ với 3 bước đơn giản, bạn sẽ có ngay công thức món ăn phù hợp với nguyên liệu hiện có.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { num: 1, icon: Camera,   title: "Chụp Ảnh",    desc: "Chụp ảnh hoặc tải lên hình ảnh các nguyên liệu có sẵn trong bếp của bạn." },
                { num: 2, icon: Sparkles, title: "AI Nhận Diện", desc: "Hệ thống AI sử dụng Gemini để nhận diện và liệt kê các nguyên liệu trong ảnh." },
                { num: 3, icon: ChefHat,  title: "Nhận Gợi Ý",  desc: "Xem danh sách món ăn phù hợp, công thức chi tiết và video hướng dẫn từ YouTube." },
              ].map(({ num, icon: Icon, title, desc }) => (
                <Card key={num} className="relative overflow-hidden border-0 bg-card shadow-lg hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2">
                  <div className="absolute top-0 right-0 p-4 opacity-5 transition-opacity duration-500 group-hover:opacity-10">
                    <Icon className="h-32 w-32 text-primary rotate-12 transform group-hover:rotate-0 transition-transform duration-500" />
                  </div>
                  <div className="absolute -right-4 -top-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-[0_0_20px_rgba(249,115,22,0.4)] text-2xl font-bold text-primary-foreground z-10 transition-transform group-hover:scale-110">
                    {num}
                  </div>
                  <CardContent className="relative p-8 pt-12 z-10">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-inner group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="mb-3 font-heading text-3xl font-semibold text-foreground">{title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-muted/50 py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-heading text-4xl font-bold text-foreground">Tính Năng Nổi Bật</h2>
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
                    <h3 className="mb-2 font-heading text-2xl font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Recipes */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="mb-12 flex items-center justify-between">
              <div>
                <h2 className="mb-3 font-heading text-5xl font-bold text-foreground tracking-tight">Món Ăn Mới Nhất</h2>
                <p className="text-lg text-muted-foreground">Khám phá những công thức mới được thêm vào hệ thống.</p>
              </div>
              <Link href="/recipes">
                <Button variant="outline" className="hidden gap-2 rounded-full px-6 hover:bg-primary hover:text-primary-foreground sm:flex transition-all shadow-sm">
                  Xem Tất Cả
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {popularRecipes.map((recipe) => (
                  <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                    <Card className="group overflow-hidden border-0 bg-card shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        <img
                          src={recipe.image_url || PLACEHOLDER_IMG}
                          alt={recipe.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <button className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur shadow-sm transition-all hover:bg-primary hover:text-primary-foreground hover:scale-110">
                          <Heart className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-white" />
                        </button>
                      </div>
                      <CardContent className="relative p-5 z-10">
                        <h3 className="mb-3 font-heading line-clamp-2 text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {recipe.name}
                        </h3>
                        <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                          {recipe.cook_time && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4 text-primary/70" />
                              {recipe.cook_time}
                            </div>
                          )}
                          {recipe.difficulty && (
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20">
                              {recipe.difficulty}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-10 text-center sm:hidden">
              <Link href="/recipes">
                <Button variant="outline" className="gap-2 rounded-full px-8 h-12 text-base shadow-sm">
                  Xem Tất Cả
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 font-heading text-5xl font-bold text-primary-foreground">Sẵn Sàng Nấu Ăn?</h2>
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
