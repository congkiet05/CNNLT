"use client"

import { useState, useEffect, useCallback } from "react"
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
  Clock,
  Filter,
  ChefHat,
  Flame,
  Soup,
  Salad,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { recipeApi } from "@/apis"

// searchKeyword: từ khóa gửi lên API để tìm theo tên món
const SIDEBAR_CATEGORIES = [
  { id: "all",      name: "Tất cả",       icon: ChefHat, searchKeyword: "" },
  { id: "main",     name: "Món Chính",    icon: ChefHat, searchKeyword: "cơm bún phở mì xôi" },
  { id: "soup",     name: "Canh / Súp",   icon: Soup,    searchKeyword: "canh" },
  { id: "stir-fry", name: "Món Xào",      icon: Flame,   searchKeyword: "xào" },
  { id: "fried",    name: "Món Chiên",    icon: Flame,   searchKeyword: "chiên" },
  { id: "braised",  name: "Kho / Hầm",   icon: Flame,   searchKeyword: "kho" },
  { id: "grilled",  name: "Nướng / BBQ",  icon: Flame,   searchKeyword: "nướng" },
  { id: "salad",    name: "Gỏi / Salad",  icon: Salad,   searchKeyword: "gỏi salad" },
  { id: "appetizer",name: "Khai Vị",      icon: Salad,   searchKeyword: "cuốn" },
  { id: "dessert",  name: "Tráng Miệng",  icon: ChefHat, searchKeyword: "chè" },
]

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop"

export default function RecipesPage() {
  const [searchQuery, setSearchQuery]     = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy]               = useState("newest")
  const [recipes, setRecipes]             = useState<any[]>([])
  const [total, setTotal]                 = useState(0)
  const [page, setPage]                   = useState(1)
  const [totalPages, setTotalPages]       = useState(1)
  const [loading, setLoading]             = useState(true)
  const LIMIT = 12

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400)
    return () => clearTimeout(t)
  }, [searchQuery])

  // Reset page khi filter thay đổi
  useEffect(() => { setPage(1) }, [debouncedSearch, selectedCategory, sortBy])

  const fetchRecipes = useCallback(async () => {
    setLoading(true)
    try {
      // Kết hợp search của user + keyword của category
      const cat = SIDEBAR_CATEGORIES.find(c => c.id === selectedCategory)
      const catKeywords = cat?.searchKeyword?.split(" ") ?? []

      // Nếu có category cụ thể: lấy nhiều hơn để lọc đủ kết quả
      const fetchLimit = selectedCategory === "all" ? LIMIT : 200
      const data = await recipeApi.list(selectedCategory === "all" ? page : 1, fetchLimit, debouncedSearch)

      if (data.success) {
        let rows = data.recipes

        // Lọc theo category keyword
        if (selectedCategory !== "all" && catKeywords.length > 0) {
          rows = rows.filter(r =>
            catKeywords.some(kw => r.name.toLowerCase().includes(kw.toLowerCase()))
          )
        }

        // Sắp xếp
        if (sortBy === "newest") {
          rows = [...rows].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        } else if (sortBy === "name") {
          rows = [...rows].sort((a, b) => a.name.localeCompare(b.name, "vi"))
        }

        if (selectedCategory === "all") {
          // Dùng phân trang từ server
          setRecipes(rows)
          setTotal(data.pagination.total)
          setTotalPages(data.pagination.total_pages)
        } else {
          // Phân trang client-side sau khi lọc
          const start = (page - 1) * LIMIT
          setRecipes(rows.slice(start, start + LIMIT))
          setTotal(rows.length)
          setTotalPages(Math.max(1, Math.ceil(rows.length / LIMIT)))
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, selectedCategory, sortBy])

  useEffect(() => { fetchRecipes() }, [fetchRecipes])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-muted/30">
        {/* Header */}
        <div className="bg-gradient-to-b from-primary/10 to-transparent py-12">
          <div className="container mx-auto px-4">
            <h1 className="mb-2 text-3xl font-bold text-foreground">Khám Phá Món Ăn</h1>
            <p className="mb-8 text-muted-foreground">
              {total > 0 ? `${total} công thức nấu ăn ngon` : "Đang tải..."}
            </p>

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
                    <SelectItem value="newest">Mới nhất</SelectItem>
                    <SelectItem value="name">Tên A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Sidebar */}
            <aside className="lg:w-56">
              <div className="sticky top-20 rounded-xl bg-card p-4 shadow-sm">
                <h3 className="mb-4 font-semibold text-foreground">Danh Mục</h3>
                <div className="space-y-1">
                  {SIDEBAR_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        selectedCategory === cat.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <cat.icon className="h-4 w-4 shrink-0" />
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Grid */}
            <div className="flex-1">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Tìm thấy <span className="font-medium text-foreground">{recipes.length}</span> món ăn
                </p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : recipes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ChefHat className="mb-4 h-16 w-16 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold text-foreground">Không tìm thấy món ăn</h3>
                  <p className="text-muted-foreground">Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {recipes.map((recipe) => (
                      <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                        <Card className="group h-full overflow-hidden border-0 bg-card shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">
                          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                            <img
                              src={recipe.image_url || PLACEHOLDER_IMG}
                              alt={recipe.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG }}
                            />
                          </div>
                          <CardContent className="p-4">
                            <h3 className="mb-2 line-clamp-2 text-base font-semibold text-foreground group-hover:text-primary">
                              {recipe.name}
                            </h3>
                            <div className="mb-3 flex items-center gap-4 text-sm text-muted-foreground">
                              {recipe.cook_time && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {recipe.cook_time}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              {recipe.difficulty ? (
                                <Badge variant="secondary">{recipe.difficulty}</Badge>
                              ) : (
                                <span />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Trang {page} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
