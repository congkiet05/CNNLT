"use client"

import { useEffect, useState } from "react"
import { weatherApi, WeatherSuggestionResponse } from "@/apis"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Loader2, MapPin } from "lucide-react"
import Link from "next/link"

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop"

export function WeatherSuggestions() {
  const [data, setData] = useState<WeatherSuggestionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Trình duyệt không hỗ trợ định vị")
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        weatherApi.suggestByLocation(position.coords.latitude, position.coords.longitude)
          .then((res) => {
            if (res.success) {
              setData(res)
            } else {
              setError("Không thể tải gợi ý thời tiết")
            }
          })
          .catch(() => setError("Lỗi kết nối máy chủ thời tiết"))
          .finally(() => setLoading(false))
      },
      (err) => {
        console.warn("Geolocation error:", err)
        setError("Vui lòng cho phép truy cập vị trí để nhận gợi ý theo thời tiết")
        setLoading(false)
      }
    )
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !data) {
    return null; // Không hiện gì nếu không có quyền location để tránh làm phiền
  }

  const { weather, recipes } = data

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary font-medium mb-4">
            <MapPin className="h-4 w-4" />
            Gợi ý dành riêng cho khu vực của bạn
          </div>
          <h2 className="mb-2 font-heading text-4xl font-bold flex items-center gap-3">
            <span className="text-5xl">{weather.condition.icon}</span>
            {weather.condition.label} ({weather.temp}°C)
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl">
            {weather.condition.message}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {recipes.map((recipe) => (
            <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
              <Card className="group overflow-hidden border-0 bg-card shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={recipe.image_url || PLACEHOLDER_IMG}
                    alt={recipe.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <CardContent className="p-4">
                  <h3 className="mb-2 font-heading line-clamp-1 text-xl font-bold group-hover:text-primary transition-colors">
                    {recipe.name}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    {recipe.cook_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {recipe.cook_time}
                      </div>
                    )}
                    {recipe.difficulty && (
                      <span className="rounded-full bg-secondary/50 px-2 py-0.5 text-xs font-medium">
                        {recipe.difficulty}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
