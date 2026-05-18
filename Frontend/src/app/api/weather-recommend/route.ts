import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { lat, lon } = await req.json();
  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

  // 1. Gọi API thời tiết
  const weatherRes = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=vi`
  );
  const weatherData = await weatherRes.json();
  const temp = weatherData.main.temp;

  // 2. Logic "AI Service" đơn giản để phân loại món ăn
  let recommendationType = "";
  let message = "";

  if (temp > 28) {
    recommendationType = "thanh_nhiet";
    message = `Trời đang nóng (${temp}°C), bạn nên dùng các món thanh mát.`;
  } else if (temp < 22) {
    recommendationType = "am_nong";
    message = `Trời khá lạnh (${temp}°C), các món súp hoặc lẩu sẽ rất tuyệt!`;
  } else {
    recommendationType = "can_bang";
    message = `Thời tiết lý tưởng (${temp}°C), hãy thử những món đặc trưng hôm nay.`;
  }

  // 3. Giả lập truy vấn Database (thay bằng query Prisma/Firebase của bạn)
  const allRecipes = [
    { id: 1, name: "Canh Khổ Qua", type: "thanh_nhiet" },
    { id: 2, name: "Lẩu Thái Hải Sản", type: "am_nong" },
    { id: 3, name: "Salad Ức Gà", type: "thanh_nhiet" },
    { id: 4, name: "Thịt Kho Tàu", type: "can_bang" },
  ];

  const suggestedRecipes = allRecipes.filter(r => r.type === recommendationType);

  return NextResponse.json({ 
    city: weatherData.name, 
    temp, 
    message, 
    suggestedRecipes 
  });
}