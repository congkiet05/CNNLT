"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { 
  Heart, 
  Clock, 
  Star,
  Users,
  ChefHat,
  Flame,
  Share2,
  Bookmark,
  Play,
  CheckCircle,
  MessageCircle,
  ThumbsUp,
  ArrowLeft
} from "lucide-react"

const recipe = {
  id: 1,
  name: "Phở Bò Hà Nội",
  description: "Phở bò Hà Nội là món ăn truyền thống nổi tiếng với nước dùng thơm ngon, bánh phở mềm mịn và thịt bò tươi ngon. Đây là món ăn không thể bỏ qua khi đến Việt Nam.",
  image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&h=500&fit=crop",
  category: "Món chính",
  time: "60 phút",
  prepTime: "20 phút",
  cookTime: "40 phút",
  difficulty: "Trung bình",
  servings: 4,
  rating: 4.8,
  reviews: 234,
  calories: 450,
  author: {
    name: "Chef Minh",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
  },
  videoId: "dQw4w9WgXcQ",
  ingredients: [
    { name: "Xương bò", amount: "1 kg" },
    { name: "Thịt bò tái", amount: "500g" },
    { name: "Bánh phở", amount: "800g" },
    { name: "Hành tây", amount: "2 củ" },
    { name: "Gừng", amount: "1 củ lớn" },
    { name: "Quế", amount: "2 thanh" },
    { name: "Hoa hồi", amount: "3 cái" },
    { name: "Thảo quả", amount: "2 quả" },
    { name: "Hành lá", amount: "1 bó" },
    { name: "Rau mùi", amount: "1 bó" },
    { name: "Giá đỗ", amount: "200g" },
    { name: "Chanh", amount: "2 quả" },
    { name: "Ớt", amount: "5 quả" },
    { name: "Nước mắm", amount: "3 muỗng canh" },
    { name: "Muối", amount: "2 muỗng cà phê" }
  ],
  steps: [
    {
      step: 1,
      title: "Sơ chế nguyên liệu",
      description: "Rửa sạch xương bò, chần qua nước sôi để loại bỏ bọt bẩn. Nướng hành tây và gừng trên bếp gas cho đến khi cháy xém. Cạo bỏ phần cháy và rửa sạch."
    },
    {
      step: 2,
      title: "Nấu nước dùng",
      description: "Cho xương bò vào nồi lớn với 4 lít nước, đun sôi rồi hạ lửa nhỏ. Vớt bọt thường xuyên. Thêm hành tây, gừng đã nướng, quế, hoa hồi, thảo quả. Nấu liu riu trong 4-5 tiếng."
    },
    {
      step: 3,
      title: "Chuẩn bị thịt bò",
      description: "Thịt bò thái lát mỏng theo thớ. Nếu muốn ăn tái, để nguyên. Nếu muốn chín, nhúng nhanh vào nước dùng sôi."
    },
    {
      step: 4,
      title: "Chuẩn bị rau và bánh phở",
      description: "Rửa sạch hành lá, rau mùi, giá đỗ. Thái nhỏ hành lá và rau mùi. Chần bánh phở qua nước sôi cho mềm."
    },
    {
      step: 5,
      title: "Nêm nước dùng",
      description: "Nêm nước dùng với nước mắm, muối, đường. Nếm thử và điều chỉnh cho vừa ăn. Nước dùng phải ngọt thanh từ xương."
    },
    {
      step: 6,
      title: "Trình bày",
      description: "Cho bánh phở vào tô, xếp thịt bò lên trên. Chan nước dùng nóng, rắc hành lá, rau mùi. Dùng kèm giá đỗ, chanh, ớt, tương đen, tương ớt."
    }
  ],
  tips: [
    "Nước dùng ngon nhờ nấu lâu và vớt bọt kỹ",
    "Thịt bò tái phải thái mỏng, chan nước sôi sẽ chín tái vừa",
    "Có thể thêm một chút đường phèn để nước dùng ngọt tự nhiên hơn"
  ],
  nutrition: {
    calories: 450,
    protein: 35,
    carbs: 45,
    fat: 12
  }
}

const comments = [
  {
    id: 1,
    user: { name: "Nguyễn Văn A", avatar: "" },
    content: "Món phở rất ngon, nước dùng đậm đà. Cảm ơn công thức!",
    rating: 5,
    likes: 24,
    createdAt: "2 ngày trước"
  },
  {
    id: 2,
    user: { name: "Trần Thị B", avatar: "" },
    content: "Lần đầu nấu phở theo công thức này, gia đình ai cũng khen ngon. Sẽ làm lại nhiều lần nữa.",
    rating: 5,
    likes: 18,
    createdAt: "5 ngày trước"
  },
  {
    id: 3,
    user: { name: "Lê Văn C", avatar: "" },
    content: "Hướng dẫn chi tiết, dễ làm theo. Tuy nhiên mình nghĩ nên thêm một chút hành khô phi thơm.",
    rating: 4,
    likes: 12,
    createdAt: "1 tuần trước"
  }
]

export default function RecipeDetailPage() {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [newComment, setNewComment] = useState("")
  const [userRating, setUserRating] = useState(0)

  const toggleStep = (stepNum: number) => {
    setCompletedSteps(prev => 
      prev.includes(stepNum)
        ? prev.filter(s => s !== stepNum)
        : [...prev, stepNum]
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 bg-muted/30">
        {/* Hero */}
        <div className="relative h-[400px] overflow-hidden md:h-[500px]">
          <img
            src={recipe.image}
            alt={recipe.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent" />
          <div className="absolute inset-0 flex items-end">
            <div className="container mx-auto px-4 pb-8">
              <Link href="/recipes" className="mb-4 inline-flex items-center gap-2 text-sm text-white/80 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Quay lại danh sách
              </Link>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Badge className="mb-3 bg-primary">{recipe.category}</Badge>
                  <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">{recipe.name}</h1>
                  <p className="max-w-2xl text-white/80">{recipe.description}</p>
                  
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-white/80">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-accent text-accent" />
                      <span className="font-medium text-white">{recipe.rating}</span>
                      <span>({recipe.reviews} đánh giá)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-5 w-5" />
                      <span>{recipe.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-5 w-5" />
                      <span>{recipe.servings} người</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="h-5 w-5" />
                      <span>{recipe.calories} kcal</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setIsBookmarked(!isBookmarked)}
                  >
                    <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-primary text-primary" : ""}`} />
                  </Button>
                  <Button variant="secondary" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
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
                <TabsList className="mb-6 grid w-full grid-cols-3">
                  <TabsTrigger value="recipe">Công Thức</TabsTrigger>
                  <TabsTrigger value="video">Video</TabsTrigger>
                  <TabsTrigger value="comments">Bình Luận</TabsTrigger>
                </TabsList>

                <TabsContent value="recipe" className="space-y-6">
                  {/* Ingredients */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ChefHat className="h-5 w-5 text-primary" />
                        Nguyên Liệu ({recipe.ingredients.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {recipe.ingredients.map((ing, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
                          >
                            <span className="text-foreground">{ing.name}</span>
                            <span className="text-sm text-muted-foreground">{ing.amount}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Steps */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Các Bước Thực Hiện</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {recipe.steps.map((step) => (
                        <div 
                          key={step.step}
                          className={`relative rounded-xl border p-4 transition-colors ${
                            completedSteps.includes(step.step)
                              ? "border-primary bg-primary/5"
                              : "border-border bg-card"
                          }`}
                        >
                          <div className="flex gap-4">
                            <button
                              onClick={() => toggleStep(step.step)}
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                completedSteps.includes(step.step)
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-muted-foreground text-muted-foreground hover:border-primary hover:text-primary"
                              }`}
                            >
                              {completedSteps.includes(step.step) ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                step.step
                              )}
                            </button>
                            <div>
                              <h4 className="mb-1 font-semibold text-foreground">{step.title}</h4>
                              <p className="text-muted-foreground">{step.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Tips */}
                  <Card className="border-accent bg-accent/5">
                    <CardHeader>
                      <CardTitle className="text-accent">Mẹo Nấu Ăn</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {recipe.tips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                            <Star className="mt-1 h-4 w-4 shrink-0 text-accent" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="video">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Play className="h-5 w-5 text-primary" />
                        Video Hướng Dẫn
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video overflow-hidden rounded-xl bg-muted">
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${recipe.videoId}`}
                          title="Video hướng dẫn nấu ăn"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <p className="mt-4 text-sm text-muted-foreground">
                        Video hướng dẫn chi tiết từ YouTube. Xem thêm nhiều video nấu ăn khác trên kênh của chúng tôi.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="comments" className="space-y-6">
                  {/* Add Comment */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Viết Đánh Giá</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Đánh giá của bạn:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setUserRating(star)}
                              className="transition-transform hover:scale-110"
                            >
                              <Star 
                                className={`h-6 w-6 ${
                                  star <= userRating 
                                    ? "fill-accent text-accent" 
                                    : "text-muted-foreground"
                                }`} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <Textarea
                        placeholder="Chia sẻ trải nghiệm của bạn với món ăn này..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                      />
                      <Button className="gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Gửi Đánh Giá
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <Card key={comment.id}>
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <Avatar>
                              <AvatarImage src={comment.user.avatar} />
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {comment.user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="mb-2 flex items-center justify-between">
                                <div>
                                  <span className="font-medium text-foreground">{comment.user.name}</span>
                                  <span className="ml-2 text-sm text-muted-foreground">{comment.createdAt}</span>
                                </div>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= comment.rating 
                                          ? "fill-accent text-accent" 
                                          : "text-muted-foreground"
                                      }`} 
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="mb-3 text-muted-foreground">{comment.content}</p>
                              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                                <ThumbsUp className="h-4 w-4" />
                                {comment.likes}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Author */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={recipe.author.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {recipe.author.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{recipe.author.name}</p>
                      <p className="text-sm text-muted-foreground">Tác giả công thức</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Nutrition */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thông Tin Dinh Dưỡng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Calories</span>
                    <span className="font-medium text-foreground">{recipe.nutrition.calories} kcal</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Protein</span>
                    <span className="font-medium text-foreground">{recipe.nutrition.protein}g</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Carbs</span>
                    <span className="font-medium text-foreground">{recipe.nutrition.carbs}g</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Fat</span>
                    <span className="font-medium text-foreground">{recipe.nutrition.fat}g</span>
                  </div>
                </CardContent>
              </Card>

              {/* Time Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thời Gian</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Chuẩn bị</span>
                    <span className="font-medium text-foreground">{recipe.prepTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Nấu</span>
                    <span className="font-medium text-foreground">{recipe.cookTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tổng</span>
                    <span className="font-medium text-foreground">{recipe.time}</span>
                  </div>
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
