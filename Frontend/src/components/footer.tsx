import Link from "next/link"
import { ChefHat, Facebook, Youtube, Instagram, Mail, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <ChefHat className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">CookSmart AI</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Hệ thống gợi ý món ăn thông minh dựa trên AI. Chỉ cần chụp ảnh nguyên liệu, 
              chúng tôi sẽ gợi ý những món ăn ngon nhất cho bạn.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Khám Phá</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/recipes" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Tất Cả Món Ăn
                </Link>
              </li>
              <li>
                <Link href="/scan" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Nhận Diện Nguyên Liệu
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Danh Mục Món Ăn
                </Link>
              </li>
              <li>
                <Link href="/popular" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Món Ăn Phổ Biến
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Hỗ Trợ</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Về Chúng Tôi
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Câu Hỏi Thường Gặp
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Liên Hệ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Chính Sách Bảo Mật
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Liên Hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                support@cooksmart.ai
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                +84 123 456 789
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 CookSmart AI. Đồ án tốt nghiệp - Công nghệ Thông tin.
          </p>
        </div>
      </div>
    </footer>
  )
}
