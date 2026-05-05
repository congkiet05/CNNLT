"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { 
  ChefHat,
  Soup,
  Salad,
  IceCream,
  Coffee,
  Flame,
  ArrowRight
} from "lucide-react"

const categories = [
  {
    id: "main",
    name: "Món Chính",
    description: "Các món ăn chính như cơm, phở, bún, mì...",
    icon: ChefHat,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
    count: 156,
    color: "from-orange-500/20 to-red-500/20"
  },
  {
    id: "soup",
    name: "Canh / Súp",
    description: "Các món canh, súp nóng hổi bổ dưỡng",
    icon: Soup,
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop",
    count: 68,
    color: "from-green-500/20 to-teal-500/20"
  },
  {
    id: "appetizer",
    name: "Khai Vị",
    description: "Các món khai vị, gỏi cuốn, nem rán...",
    icon: Salad,
    image: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=600&h=400&fit=crop",
    count: 89,
    color: "from-lime-500/20 to-green-500/20"
  },
  {
    id: "grill",
    name: "Nướng / BBQ",
    description: "Các món nướng, xiên que, BBQ",
    icon: Flame,
    image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&h=400&fit=crop",
    count: 45,
    color: "from-red-500/20 to-orange-500/20"
  },
  {
    id: "dessert",
    name: "Tráng Miệng",
    description: "Chè, bánh ngọt, kem và các món tráng miệng",
    icon: IceCream,
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&h=400&fit=crop",
    count: 72,
    color: "from-pink-500/20 to-purple-500/20"
  },
  {
    id: "drink",
    name: "Đồ Uống",
    description: "Cà phê, trà, sinh tố, nước ép...",
    icon: Coffee,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&h=400&fit=crop",
    count: 53,
    color: "from-amber-500/20 to-yellow-500/20"
  }
]

const featuredRecipes = {
  main: [
    { id: 1, name: "Phở Bò Hà Nội", image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=200&h=200&fit=crop" },
    { id: 2, name: "Cơm Tấm Sài Gòn", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop" },
    { id: 3, name: "Bún Bò Huế", image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=200&h=200&fit=crop" },
  ]
}

export default function CategoriesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 bg-muted/30">
        {/* Header */}
        <div className="bg-gradient-to-b from-primary/10 to-transparent py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="mb-4 text-4xl font-bold text-foreground">Danh Mục Món Ăn</h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Khám phá hàng trăm công thức món ăn được phân loại theo từng danh mục, 
              giúp bạn dễ dàng tìm kiếm món ăn phù hợp.
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link key={category.id} href={`/recipes?category=${category.id}`}>
                <Card className="group h-full overflow-hidden border-0 bg-card shadow-lg transition-all hover:-translate-y-2 hover:shadow-xl">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${category.color} to-transparent`} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-card/90 shadow-xl backdrop-blur transition-transform group-hover:scale-110">
                        <category.icon className="h-10 w-10 text-primary" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary">
                        {category.name}
                      </h3>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                        {category.count} món
                      </span>
                    </div>
                    <p className="mb-4 text-muted-foreground">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {featuredRecipes.main.slice(0, 3).map((recipe) => (
                          <img
                            key={recipe.id}
                            src={recipe.image}
                            alt={recipe.name}
                            className="h-8 w-8 rounded-full border-2 border-card object-cover"
                          />
                        ))}
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-medium text-muted-foreground">
                          +{category.count - 3}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        Xem tất cả
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Popular in Each Category */}
        <div className="bg-card py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-center text-3xl font-bold text-foreground">
              Phổ Biến Trong Mỗi Danh Mục
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categories.slice(0, 3).map((category) => (
                <Card key={category.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <category.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground">{category.name}</h3>
                    </div>
                    <div className="space-y-3">
                      {featuredRecipes.main.map((recipe, idx) => (
                        <Link 
                          key={recipe.id}
                          href={`/recipes/${recipe.id}`}
                          className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                        >
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                            {idx + 1}
                          </span>
                          <img
                            src={recipe.image}
                            alt={recipe.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                          <span className="text-sm font-medium text-foreground">{recipe.name}</span>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
