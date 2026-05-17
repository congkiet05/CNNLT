"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Loader2, ChefHat, Soup, Salad, IceCream, Flame, ArrowRight } from "lucide-react"
import { recipeApi } from "@/apis"

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop"

const CATEGORY_META = [
  {
    id: "main",
    name: "Món Chính",
    description: "Cơm, phở, bún, mì và các món ăn chính",
    icon: ChefHat,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
    color: "from-orange-500/20 to-red-500/20",
    keywords: ["cơm","bún","phở","mì","hủ tiếu","miến","nui","xôi"],
  },
  {
    id: "soup",
    name: "Canh / Súp",
    description: "Các món canh, súp nóng hổi bổ dưỡng",
    icon: Soup,
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop",
    color: "from-green-500/20 to-teal-500/20",
    keywords: ["canh","súp","lẩu"],
  },
  {
    id: "stir-fry",
    name: "Món Xào",
    description: "Các món xào nhanh, đậm đà hương vị",
    icon: Flame,
    image: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=600&h=400&fit=crop",
    color: "from-yellow-500/20 to-orange-500/20",
    keywords: ["xào"],
  },
  {
    id: "fried",
    name: "Món Chiên",
    description: "Các món chiên giòn, hấp dẫn",
    icon: Flame,
    image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&h=400&fit=crop",
    color: "from-red-500/20 to-orange-500/20",
    keywords: ["chiên","rán","giòn"],
  },
  {
    id: "grilled",
    name: "Nướng / BBQ",
    description: "Các món nướng thơm ngon",
    icon: Flame,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop",
    color: "from-red-500/20 to-pink-500/20",
    keywords: ["nướng","bbq"],
  },
  {
    id: "salad",
    name: "Gỏi / Salad",
    description: "Các món gỏi, salad tươi mát",
    icon: Salad,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop",
    color: "from-lime-500/20 to-green-500/20",
    keywords: ["gỏi","salad","trộn"],
  },
  {
    id: "appetizer",
    name: "Khai Vị",
    description: "Các món khai vị, cuốn, nem",
    icon: Salad,
    image: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=600&h=400&fit=crop",
    color: "from-teal-500/20 to-cyan-500/20",
    keywords: ["cuốn","nem","chả giò","bánh","gyoza","snack"],
  },
  {
    id: "dessert",
    name: "Tráng Miệng",
    description: "Chè, bánh ngọt và các món tráng miệng",
    icon: IceCream,
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&h=400&fit=crop",
    color: "from-pink-500/20 to-purple-500/20",
    keywords: ["chè","kem","muffin","pancake"],
  },
]

function countByCategory(recipes: any[], keywords: string[]): number {
  return recipes.filter(r =>
    keywords.some(kw => r.name.toLowerCase().includes(kw))
  ).length
}

function getPreviewRecipes(recipes: any[], keywords: string[]): any[] {
  return recipes
    .filter(r => keywords.some(kw => r.name.toLowerCase().includes(kw)))
    .slice(0, 3)
}

export default function CategoriesPage() {
  const [allRecipes, setAllRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Lấy tối đa 200 món để đếm và preview
    recipeApi.list(1, 200).then(data => {
      if (data.success) setAllRecipes(data.recipes)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-muted/30">
        {/* Header */}
        <div className="bg-gradient-to-b from-primary/10 to-transparent py-16 relative overflow-hidden">
          <div className="container relative z-10 mx-auto px-4 text-center">
            <h1 className="mb-6 font-heading text-5xl md:text-6xl font-bold text-foreground tracking-tight drop-shadow-sm">
              Khám Phá <span className="bg-gradient-to-r from-primary via-orange-500 to-yellow-500 bg-clip-text text-transparent">Danh Mục</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Khám phá {allRecipes.length > 0 ? allRecipes.length : "hàng trăm"} công thức món ăn được phân loại tinh tế,
              giúp bạn dễ dàng tìm kiếm hương vị yêu thích.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Categories Grid */}
            <div className="container mx-auto px-4 py-12">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {CATEGORY_META.map((cat) => {
                  const count = countByCategory(allRecipes, cat.keywords)
                  const previews = getPreviewRecipes(allRecipes, cat.keywords)
                  return (
                    <Link key={cat.id} href={`/recipes?category=${cat.id}`}>
                      <Card className="group h-full overflow-hidden border-0 bg-card shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} to-transparent`} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-card/90 shadow-xl backdrop-blur transition-transform group-hover:scale-110">
                              <cat.icon className="h-8 w-8 text-primary" />
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-5">
                          <div className="mb-1 flex items-center justify-between">
                            <h3 className="font-heading text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                              {cat.name}
                            </h3>
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              {count} món
                            </span>
                          </div>
                          <p className="mb-3 text-sm text-muted-foreground">{cat.description}</p>

                          {/* Preview avatars */}
                          <div className="flex items-center justify-between">
                            <div className="flex -space-x-2">
                              {previews.map((r) => (
                                <img
                                  key={r.id}
                                  src={r.image_url || PLACEHOLDER_IMG}
                                  alt={r.name}
                                  className="h-7 w-7 rounded-full border-2 border-card object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG }}
                                />
                              ))}
                              {count > 3 && (
                                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-medium text-muted-foreground">
                                  +{count - 3}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                              Xem tất cả
                              <ArrowRight className="h-3 w-3" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Top 3 món mới nhất trong mỗi danh mục */}
            <div className="bg-card py-16">
              <div className="container mx-auto px-4">
                <h2 className="mb-10 text-center font-heading text-4xl font-bold text-foreground tracking-tight">
                  Nổi Bật Trong Mỗi Danh Mục
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {CATEGORY_META.slice(0, 6).map((cat) => {
                    const previews = getPreviewRecipes(allRecipes, cat.keywords)
                    if (previews.length === 0) return null
                    return (
                      <Card key={cat.id} className="overflow-hidden">
                        <CardContent className="p-6">
                          <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <cat.icon className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="font-heading text-xl font-bold text-foreground">{cat.name}</h3>
                          </div>
                          <div className="space-y-3">
                            {previews.map((recipe, idx) => (
                              <Link
                                key={recipe.id}
                                href={`/recipes/${recipe.id}`}
                                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                              >
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                                  {idx + 1}
                                </span>
                                <img
                                  src={recipe.image_url || PLACEHOLDER_IMG}
                                  alt={recipe.name}
                                  className="h-10 w-10 rounded-lg object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG }}
                                />
                                <span className="line-clamp-1 text-sm font-medium text-foreground">
                                  {recipe.name}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
