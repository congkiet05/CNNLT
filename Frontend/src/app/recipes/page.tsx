"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { 
  Search, 
  Heart, 
  Clock, 
  Star,
  Filter,
  ChefHat,
  Flame
} from "lucide-react"

const categories = [
  { id: "all", name: "Tất cả", icon: ChefHat },
  { id: "main", name: "Món chính", icon: Flame },
  { id: "soup", name: "Canh/Súp", icon: Flame },
  { id: "appetizer", name: "Khai vị", icon: Flame },
  { id: "dessert", name: "Tráng miệng", icon: Flame },
  { id: "drink", name: "Đồ uống", icon: Flame },
]

const recipes = [
  {
    id: 1,
    name: "Phở Bò Hà Nội",
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&h=300&fit=crop",
    category: "main",
    time: "60 phút",
    difficulty: "Trung bình",
    rating: 4.8,
    reviews: 234,
    calories: 450,
    isFavorite: false
  },
  {
    id: 2,
    name: "Bún Chả Hà Nội",
    image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop",
    category: "main",
    time: "45 phút",
    difficulty: "Dễ",
    rating: 4.9,
    reviews: 189,
    calories: 520,
    isFavorite: true
  },
  {
    id: 3,
    name: "Bánh Mì Thịt",
    image: "https://images.unsplash.com/photo-1600454021178-b3c1d7a6bdf1?w=400&h=300&fit=crop",
    category: "main",
    time: "30 phút",
    difficulty: "Dễ",
    rating: 4.7,
    reviews: 156,
    calories: 380,
    isFavorite: false
  },
  {
    id: 4,
    name: "Gỏi Cuốn Tôm Thịt",
    image: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&h=300&fit=crop",
    category: "appetizer",
    time: "25 phút",
    difficulty: "Dễ",
    rating: 4.6,
    reviews: 145,
    calories: 180,
    isFavorite: false
  },
  {
    id: 5,
    name: "Canh Chua Cá Lóc",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop",
    category: "soup",
    time: "40 phút",
    difficulty: "Trung bình",
    rating: 4.5,
    reviews: 98,
    calories: 220,
    isFavorite: true
  },
  {
    id: 6,
    name: "Cơm Tấm Sườn Bì Chả",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
    category: "main",
    time: "50 phút",
    difficulty: "Trung bình",
    rating: 4.8,
    reviews: 267,
    calories: 650,
    isFavorite: false
  },
  {
    id: 7,
    name: "Chè Ba Màu",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop",
    category: "dessert",
    time: "30 phút",
    difficulty: "Dễ",
    rating: 4.4,
    reviews: 87,
    calories: 280,
    isFavorite: false
  },
  {
    id: 8,
    name: "Cà Phê Sữa Đá",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop",
    category: "drink",
    time: "5 phút",
    difficulty: "Dễ",
    rating: 4.9,
    reviews: 312,
    calories: 120,
    isFavorite: true
  }
]

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("popular")
  const [favorites, setFavorites] = useState<number[]>(
    recipes.filter(r => r.isFavorite).map(r => r.id)
  )

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || recipe.category === selectedCategory
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    if (sortBy === "popular") return b.reviews - a.reviews
    if (sortBy === "rating") return b.rating - a.rating
    if (sortBy === "newest") return b.id - a.id
    return 0
  })

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fId => fId !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 bg-muted/30">
        {/* Header */}
        <div className="bg-gradient-to-b from-primary/10 to-transparent py-12">
          <div className="container mx-auto px-4">
            <h1 className="mb-4 text-3xl font-bold text-foreground">Khám Phá Món Ăn</h1>
            <p className="mb-8 text-muted-foreground">
              Hơn 500 công thức nấu ăn ngon từ khắp Việt Nam
            </p>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1 lg:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm món ăn..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Phổ biến nhất</SelectItem>
                    <SelectItem value="rating">Đánh giá cao</SelectItem>
                    <SelectItem value="newest">Mới nhất</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Categories Sidebar */}
            <aside className="lg:w-64">
              <div className="sticky top-20 rounded-xl bg-card p-4 shadow-sm">
                <h3 className="mb-4 font-semibold text-foreground">Danh Mục</h3>
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        selectedCategory === category.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <category.icon className="h-4 w-4" />
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Recipe Grid */}
            <div className="flex-1">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Tìm thấy <span className="font-medium text-foreground">{filteredRecipes.length}</span> món ăn
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredRecipes.map((recipe) => (
                  <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                    <Card className="group h-full overflow-hidden border-0 bg-card shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={recipe.image}
                          alt={recipe.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <button 
                          onClick={(e) => toggleFavorite(recipe.id, e)}
                          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-card/80 backdrop-blur transition-colors hover:bg-card"
                        >
                          <Heart 
                            className={`h-5 w-5 transition-colors ${
                              favorites.includes(recipe.id) 
                                ? "fill-red-500 text-red-500" 
                                : "text-muted-foreground"
                            }`} 
                          />
                        </button>
                        <Badge className="absolute left-3 top-3 bg-card/80 text-foreground backdrop-blur">
                          {categories.find(c => c.id === recipe.category)?.name}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary">
                          {recipe.name}
                        </h3>
                        <div className="mb-3 flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {recipe.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <Flame className="h-4 w-4" />
                            {recipe.calories} kcal
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-accent text-accent" />
                            <span className="font-medium text-foreground">{recipe.rating}</span>
                            <span className="text-sm text-muted-foreground">({recipe.reviews})</span>
                          </div>
                          <Badge variant="secondary">{recipe.difficulty}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {filteredRecipes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ChefHat className="mb-4 h-16 w-16 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold text-foreground">Không tìm thấy món ăn</h3>
                  <p className="text-muted-foreground">
                    Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
