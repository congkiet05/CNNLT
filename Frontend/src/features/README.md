# Features

Mỗi feature là một module độc lập theo tính năng.

## Cấu trúc một feature:
```
features/
└── recipes/
    ├── components/     # Components riêng của feature
    ├── hooks/          # Hooks riêng của feature
    ├── utils/          # Utils riêng của feature
    └── index.ts        # Public API của feature
```

## Các features hiện tại:
- `recipes/`   - Quản lý và hiển thị món ăn
- `scan/`      - AI nhận diện nguyên liệu
- `auth/`      - Đăng nhập, đăng ký, quên mật khẩu
- `admin/`     - Trang quản trị
- `profile/`   - Trang cá nhân người dùng
