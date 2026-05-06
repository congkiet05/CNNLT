"use client"

import { useState, useRef, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { 
  Camera, 
  Upload, 
  X, 
  Sparkles, 
  ImageIcon, 
  Loader2,
  Check,
  Edit3,
  ChefHat,
  ArrowRight,
  Plus,
  Trash2
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { ingredientApi, scanSessionApi, type Ingredient as ApiIngredient } from "@/apis"

type ScanStep = "upload" | "analyzing" | "results" | "suggestions"

interface Ingredient {
  id: string
  name: string
  confidence: number
  isEditing?: boolean
}

interface SuggestedRecipe {
  id: number
  name: string
  image: string
  matchPercentage: number
  missingIngredients: string[]
  time: string
  difficulty: string
}

export default function ScanPage() {
  const [step, setStep] = useState<ScanStep>("upload")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  // Lưu raw ingredients (dạng API) để gửi lên server khi chốt
  const [rawIngredients, setRawIngredients] = useState<ApiIngredient[]>([])
  const [suggestedRecipes, setSuggestedRecipes] = useState<SuggestedRecipe[]>([])
  const [newIngredient, setNewIngredient] = useState("")
  const [scanError, setScanError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const mockIngredients: Ingredient[] = [
    { id: "1", name: "Trứng gà", confidence: 98 },
    { id: "2", name: "Cà chua", confidence: 95 },
    { id: "3", name: "Hành lá", confidence: 92 },
    { id: "4", name: "Thịt bò", confidence: 88 },
    { id: "5", name: "Tỏi", confidence: 85 },
  ]

  const mockRecipes: SuggestedRecipe[] = [
    {
      id: 1,
      name: "Trứng Chiên Cà Chua",
      image: "https://images.unsplash.com/photo-1482049016gy-a0e5a0e8b63e?w=400&h=300&fit=crop",
      matchPercentage: 100,
      missingIngredients: [],
      time: "15 phút",
      difficulty: "Dễ"
    },
    {
      id: 2,
      name: "Bò Xào Hành Tỏi",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
      matchPercentage: 95,
      missingIngredients: ["Ớt"],
      time: "20 phút",
      difficulty: "Dễ"
    },
    {
      id: 3,
      name: "Canh Cà Chua Trứng",
      image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop",
      matchPercentage: 90,
      missingIngredients: ["Rau mùi"],
      time: "25 phút",
      difficulty: "Dễ"
    },
    {
      id: 4,
      name: "Phở Bò Tái",
      image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&h=300&fit=crop",
      matchPercentage: 70,
      missingIngredients: ["Bánh phở", "Nước dùng xương"],
      time: "45 phút",
      difficulty: "Trung bình"
    }
  ]

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFiles([file])
      const reader = new FileReader()
      reader.onload = async (event) => {
        setSelectedImage(event.target?.result as string)
        setStep("analyzing")
        setScanError(null)

        try {
          const result = await ingredientApi.recognize([file])
          if (!result.success || result.ingredients.length === 0) {
            setScanError(result.message ?? "Không nhận diện được nguyên liệu. Vui lòng thử ảnh khác.")
            setStep("upload")
            return
          }
          // Map API response sang local Ingredient type
          const apiIngredients = result.ingredients
          setRawIngredients(apiIngredients)
          setIngredients(
            apiIngredients.map((ing, idx) => ({
              id: String(idx + 1),
              name: `${ing.ten_nguyen_lieu} (${ing.so_luong} ${ing.don_vi})`,
              confidence: 100,
            }))
          )
          setStep("results")
        } catch (err: any) {
          setScanError(err.message ?? "Lỗi kết nối server")
          setStep("upload")
        }
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleGetSuggestions = async () => {
    setIsSaving(true)
    try {
      // Chốt danh sách: lưu session vào DB (Req 2.9)
      // Dùng rawIngredients nếu có, fallback sang parse từ tên hiển thị
      const listToSave: ApiIngredient[] = rawIngredients.length > 0
        ? rawIngredients
        : ingredients.map(ing => ({
            ten_nguyen_lieu: ing.name,
            so_luong: 1,
            don_vi: "phần",
          }))

      await scanSessionApi.save(listToSave)
    } catch (err) {
      // Lỗi lưu session không chặn luồng chính
      console.warn("Không thể lưu scan session:", err)
    } finally {
      setIsSaving(false)
    }

    setStep("suggestions")
    setSuggestedRecipes(mockRecipes)
  }

  const handleRemoveIngredient = (id: string) => {
    setIngredients(prev => prev.filter(ing => ing.id !== id))
  }

  const handleEditIngredient = (id: string, newName: string) => {
    setIngredients(prev => prev.map(ing => 
      ing.id === id ? { ...ing, name: newName, isEditing: false } : ing
    ))
  }

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setIngredients(prev => [...prev, {
        id: Date.now().toString(),
        name: newIngredient.trim(),
        confidence: 100
      }])
      setNewIngredient("")
    }
  }

  const resetScan = () => {
    setStep("upload")
    setSelectedImage(null)
    setSelectedFiles([])
    setIngredients([])
    setRawIngredients([])
    setSuggestedRecipes([])
    setScanError(null)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          {/* Progress Steps */}
          <div className="mb-8 flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step === "upload" ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step === "upload" ? "bg-primary text-primary-foreground" : step !== "upload" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {step !== "upload" ? <Check className="h-4 w-4" /> : "1"}
              </div>
              <span className="hidden text-sm font-medium sm:block">Tải Ảnh</span>
            </div>
            <div className="h-px w-8 bg-border md:w-16" />
            <div className={`flex items-center gap-2 ${step === "analyzing" || step === "results" ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step === "results" || step === "suggestions" ? "bg-primary text-primary-foreground" : step === "analyzing" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {step === "results" || step === "suggestions" ? <Check className="h-4 w-4" /> : "2"}
              </div>
              <span className="hidden text-sm font-medium sm:block">Nhận Diện</span>
            </div>
            <div className="h-px w-8 bg-border md:w-16" />
            <div className={`flex items-center gap-2 ${step === "suggestions" ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step === "suggestions" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                3
              </div>
              <span className="hidden text-sm font-medium sm:block">Gợi Ý</span>
            </div>
          </div>

          {/* Upload Step */}
          {step === "upload" && (
            <div className="mx-auto max-w-2xl">
              <Card className="border-2 border-dashed border-primary/20 bg-card">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Tải Ảnh Nguyên Liệu</CardTitle>
                  <CardDescription>
                    Chụp hoặc tải lên hình ảnh các nguyên liệu có sẵn trong bếp của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {scanError && (
                    <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      {scanError}
                    </div>
                  )}
                  <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-muted/50 p-12">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                      <ImageIcon className="h-10 w-10 text-primary" />
                    </div>
                    <p className="text-center text-sm text-muted-foreground">
                      Kéo thả hình ảnh vào đây hoặc
                    </p>
                    <div className="flex gap-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <Button 
                        variant="outline" 
                        className="gap-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4" />
                        Chọn Ảnh
                      </Button>
                      <Button 
                        className="gap-2"
                        onClick={() => cameraInputRef.current?.click()}
                      >
                        <Camera className="h-4 w-4" />
                        Chụp Ảnh
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg bg-accent/10 p-4">
                    <h4 className="mb-2 font-medium text-foreground">Mẹo để có kết quả tốt nhất:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Đặt nguyên liệu trên nền sáng, rõ ràng</li>
                      <li>• Đảm bảo ánh sáng đầy đủ</li>
                      <li>• Chụp từ góc nhìn trực tiếp từ trên xuống</li>
                      <li>• Tách riêng các nguyên liệu để AI dễ nhận diện</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analyzing Step */}
          {step === "analyzing" && (
            <div className="mx-auto max-w-2xl">
              <Card className="bg-card">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  {selectedImage && (
                    <div className="relative mb-8 overflow-hidden rounded-xl">
                      <img 
                        src={selectedImage} 
                        alt="Uploaded ingredients" 
                        className="h-64 w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-foreground/50">
                        <div className="flex flex-col items-center gap-4">
                          <div className="relative">
                            <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                            <Sparkles className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 animate-pulse text-primary-foreground" />
                          </div>
                          <p className="text-lg font-medium text-primary-foreground">AI đang phân tích...</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="text-center text-muted-foreground">
                    Gemini AI đang nhận diện các nguyên liệu trong ảnh của bạn
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results Step */}
          {step === "results" && (
            <div className="mx-auto max-w-4xl">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Image Preview */}
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Ảnh Đã Tải Lên</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedImage && (
                      <div className="relative overflow-hidden rounded-xl">
                        <img 
                          src={selectedImage} 
                          alt="Uploaded ingredients" 
                          className="h-64 w-full object-cover"
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute right-2 top-2 gap-1"
                          onClick={resetScan}
                        >
                          <X className="h-4 w-4" />
                          Đổi Ảnh
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Detected Ingredients */}
                <Card className="bg-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Nguyên Liệu Nhận Diện</CardTitle>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {ingredients.length} nguyên liệu
                      </Badge>
                    </div>
                    <CardDescription>
                      Chỉnh sửa nếu AI nhận diện sai
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {ingredients.map((ingredient) => (
                      <div 
                        key={ingredient.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
                      >
                        {ingredient.isEditing ? (
                          <Input
                            defaultValue={ingredient.name}
                            className="mr-2 h-8"
                            onBlur={(e) => handleEditIngredient(ingredient.id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleEditIngredient(ingredient.id, e.currentTarget.value)
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center gap-3">
                            <Check className="h-4 w-4 text-primary" />
                            <span className="font-medium text-foreground">{ingredient.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {ingredient.confidence}%
                            </Badge>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => setIngredients(prev => prev.map(ing => 
                              ing.id === ingredient.id ? { ...ing, isEditing: true } : ing
                            ))}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveIngredient(ingredient.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Add new ingredient */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Thêm nguyên liệu..."
                        value={newIngredient}
                        onChange={(e) => setNewIngredient(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddIngredient()
                        }}
                      />
                      <Button size="icon" onClick={handleAddIngredient}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button 
                      className="w-full gap-2" 
                      size="lg"
                      onClick={handleGetSuggestions}
                      disabled={ingredients.length === 0 || isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <ChefHat className="h-5 w-5" />
                          Gợi Ý Món Ăn
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Suggestions Step */}
          {step === "suggestions" && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Món Ăn Gợi Ý</h2>
                  <p className="text-muted-foreground">
                    Dựa trên {ingredients.length} nguyên liệu: {ingredients.map(i => i.name).join(", ")}
                  </p>
                </div>
                <Button variant="outline" onClick={resetScan}>
                  Quét Lại
                </Button>
              </div>

              {/* Recipe Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {suggestedRecipes.map((recipe) => (
                  <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                    <Card className="group h-full overflow-hidden bg-card transition-all hover:-translate-y-1 hover:shadow-xl">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={recipe.image}
                          alt={recipe.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute left-2 top-2">
                          <Badge 
                            className={`${recipe.matchPercentage >= 90 ? "bg-primary" : recipe.matchPercentage >= 70 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}
                          >
                            {recipe.matchPercentage}% phù hợp
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="mb-2 font-semibold text-foreground group-hover:text-primary">
                          {recipe.name}
                        </h3>
                        <div className="mb-3 flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{recipe.time}</span>
                          <span>•</span>
                          <span>{recipe.difficulty}</span>
                        </div>
                        {recipe.missingIngredients.length > 0 && (
                          <div className="rounded-md bg-accent/10 p-2">
                            <p className="text-xs text-muted-foreground">
                              Thiếu: {recipe.missingIngredients.join(", ")}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
