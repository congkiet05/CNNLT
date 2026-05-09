"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { recipeApi, type SuggestedRecipe } from "@/apis"
import {
  Clock,
  ChefHat,
  Play,
  CheckCircle,
  ArrowLeft,
  Loader2,
  AlertCircle
} from "lucide-react"

function getYouTubeSearchUrl(recipeName: string): string {
  const query = encodeURIComponent(`${recipeName} cách làm nấu ăn`)
  return `https://www.youtube.com/results?search_query=${query}`
}

function getFallbackImage(name: string, recipeId: number): string {
  const n = name.toLowerCase()
  let topic = "food"
  if (n.includes("tôm") || n.includes("cua") || n.includes("mực")) topic = "seafood"
  else if (n.includes("bò")) topic = "beef"
  else if (n.includes("gà")) topic = "chicken"
  else if (n.includes("heo") || n.includes("lợn")) topic = "pork"
  else if (n.includes("cá")) topic = "fish"
  else if (n.includes("canh") || n.includes("súp")) topic = "soup"
  else if (n.includes("bún") || n.includes("phở") || n.includes("mì")) topic = "noodles"
  else if (n.includes("cơm")) topic = "rice"
  else if (n.includes("trứng")) topic = "eggs"
  return `https://picsum.photos/seed/${topic}-${recipeId}/800/500`
}

type VideoItem = {
  video_id: string
  title: string
  thumbnail: string
  channel: string
  embed_url: string
}

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [recipe, setRecipe] = useState<SuggestedRecipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [imageError, setImageError] = useState(false)
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

  useEffect(() => {
    async function loadRecipe() {
      try {
        setLoading(true)
        const [recipeData, videoData] = await Promise.all([
          recipeApi.getById(Number(id)),
          recipeApi.getVideos(Number(id)).catch(() => ({ success: false, videos: [], recipe_name: "" }))
        ])
        if (recipeData.success) {
          setRecipe(recipeData.recipe)
        } else {
          setError("Không tìm thấy công thức")
        }
        if (videoData.success && videoData.videos.length > 0) {
          setVideos(videoData.videos)
          setSelectedVideo(videoData.videos[0].embed_url)
        }
      } catch (err: any) {
        setError(err.message || "Lỗi tải công thức")
      } finally {
        setLoading(false)
      }
    }
    loadRecipe()
  }, [id])

  const toggleStep = (stepNum: number) => {
    setCompletedSteps(prev =>
      prev.includes(stepNum) ? prev.filter(s => s !== stepNum) : [...prev, stepNum]
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Đang tải công thức...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-lg font-medium">{error || "Không tìm thấy công thức"}</p>
            <Button variant="outline" onClick={() => router.back()}>Quay lại</Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const imageUrl = imageError
    ? getFallbackImage(recipe.name, recipe.id)
    : ((recipe as any).image_url || getFallbackImage(recipe.name, recipe.id))

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-muted/30">
        {/* Hero */}
        <div className="relative h-[350px] overflow-hidden md:h-[450px]">
          <img
            src={imageUrl}
            alt={recipe.name}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent" />
          <div className="absolute inset-0 flex items-end">
            <div className="container mx-auto px-4 pb-8">
              <button
                onClick={() => router.back()}
                className="mb-4 inline-flex items-center gap-2 text-sm text-white/80 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </button>
              <div>
                <Badge className="mb-3 bg-primary">{recipe.difficulty || "Dễ"}</Badge>
                <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">{recipe.name}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-white/80">
                  {recipe.cook_time && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-5 w-5" />
                      <span>{recipe.cook_time}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <ChefHat className="h-5 w-5" />
                    <span>{recipe.ingredients?.length || 0} nguyên liệu</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="recipe" className="w-full">
                <TabsList className="mb-6 grid w-full grid-cols-2">
                  <TabsTrigger value="recipe">Công Thức</TabsTrigger>
                  <TabsTrigger value="video">Video YouTube</TabsTrigger>
                </TabsList>

                {/* Tab: Công thức */}
                <TabsContent value="recipe" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ChefHat className="h-5 w-5 text-primary" />
                        Nguyên Liệu ({recipe.ingredients?.length || 0})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {recipe.ingredients?.map((ing, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
                          >
                            <span className="text-foreground">{ing.ten_nguyen_lieu}</span>
                            <span className="text-sm text-muted-foreground">
                              {ing.so_luong} {ing.don_vi}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Các Bước Thực Hiện</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {recipe.steps?.map((step: any, idx: number) => {
                        const stepNum = idx + 1
                        const isDone = completedSteps.includes(stepNum)
                        // Hỗ trợ cả 2 format: {buoc, mo_ta} và string
                        const stepText = typeof step === "string" ? step : step.mo_ta
                        if (!stepText || stepText.trim() === "") return null
                        return (
                          <div
                            key={stepNum}
                            className={`relative rounded-xl border p-4 transition-colors ${
                              isDone ? "border-primary bg-primary/5" : "border-border bg-card"
                            }`}
                          >
                            <div className="flex gap-4">
                              <button
                                onClick={() => toggleStep(stepNum)}
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                  isDone
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-muted-foreground text-muted-foreground hover:border-primary hover:text-primary"
                                }`}
                              >
                                {isDone ? <CheckCircle className="h-5 w-5" /> : stepNum}
                              </button>
                              <div>
                                <p className="text-muted-foreground">{stepText}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab: Video */}
                <TabsContent value="video">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Play className="h-5 w-5 text-primary" />
                        Video Hướng Dẫn: {recipe.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedVideo ? (
                        <>
                          <div className="aspect-video overflow-hidden rounded-xl bg-muted">
                            <iframe
                              width="100%"
                              height="100%"
                              src={selectedVideo}
                              title={`Video hướng dẫn nấu ${recipe.name}`}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                          {videos.length > 1 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">Video khác:</p>
                              {videos.map((v) => (
                                <button
                                  key={v.video_id}
                                  onClick={() => setSelectedVideo(v.embed_url)}
                                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 ${
                                    selectedVideo === v.embed_url ? "border-primary bg-primary/5" : "border-border"
                                  }`}
                                >
                                  <img src={v.thumbnail} alt={v.title} className="h-16 w-24 rounded object-cover" />
                                  <div className="flex-1 overflow-hidden">
                                    <p className="line-clamp-2 text-sm font-medium text-foreground">{v.title}</p>
                                    <p className="text-xs text-muted-foreground">{v.channel}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-4 py-8">
                          <Play className="h-12 w-12 text-muted-foreground" />
                          <p className="text-muted-foreground">Không tìm thấy video</p>
                          <a href={getYouTubeSearchUrl(recipe.name)} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" className="gap-2">
                              <Play className="h-4 w-4" />
                              Tìm trên YouTube
                            </Button>
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thông Tin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recipe.cook_time && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Thời gian</span>
                      <span className="font-medium text-foreground">{recipe.cook_time}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Độ khó</span>
                    <Badge variant="outline">{recipe.difficulty || "Dễ"}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Nguyên liệu</span>
                    <span className="font-medium text-foreground">{recipe.ingredients?.length || 0} loại</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Các bước</span>
                    <span className="font-medium text-foreground">{recipe.steps?.length || 0} bước</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tiến Độ Nấu</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Hoàn thành</span>
                      <span className="font-medium text-primary">
                        {Math.round(recipe.steps?.length
                          ? (completedSteps.length / recipe.steps.filter((s: any) => {
                              const t = typeof s === "string" ? s : s.mo_ta
                              return t && t.trim() !== ""
                            }).length) * 100
                          : 0)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{
                          width: `${(() => {
                            const validSteps = recipe.steps?.filter((s: any) => {
                              const t = typeof s === "string" ? s : s.mo_ta
                              return t && t.trim() !== ""
                            }) || []
                            return validSteps.length ? (completedSteps.length / validSteps.length) * 100 : 0
                          })()}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Danh sách bước checkbox */}
                  <div className="space-y-2">
                    {recipe.steps?.map((step: any, idx: number) => {
                      const stepNum = idx + 1
                      const stepText = typeof step === "string" ? step : step.mo_ta
                      if (!stepText || stepText.trim() === "") return null
                      const isDone = completedSteps.includes(stepNum)
                      return (
                        <button
                          key={stepNum}
                          onClick={() => toggleStep(stepNum)}
                          className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                            isDone
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border hover:bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                            isDone ? "border-primary bg-primary" : "border-muted-foreground"
                          }`}>
                            {isDone && (
                              <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={`text-sm ${isDone ? "line-through opacity-60" : ""}`}>
                            Bước {stepNum}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {completedSteps.length > 0 &&
                    completedSteps.length === recipe.steps?.filter((s: any) => {
                      const t = typeof s === "string" ? s : s.mo_ta
                      return t && t.trim() !== ""
                    }).length && (
                    <p className="mt-3 text-center text-sm font-medium text-primary">
                      🎉 Hoàn thành! Chúc ngon miệng!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
