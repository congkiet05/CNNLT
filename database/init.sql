-- ============================================================
-- AI Food Recipe Suggestion - SQL Server Schema
-- ============================================================

-- Tạo database nếu chưa có
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'food_recipe_db')
BEGIN
    CREATE DATABASE food_recipe_db;
END
GO

USE food_recipe_db;
GO

-- ============================================================
-- USERS TABLE
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
BEGIN
    CREATE TABLE users (
        id          INT IDENTITY(1,1) PRIMARY KEY,
        email       NVARCHAR(255) NOT NULL UNIQUE,
        password    NVARCHAR(255) NULL,           -- NULL nếu đăng nhập qua OAuth
        display_name NVARCHAR(255) NOT NULL,
        role        NVARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        is_active   BIT NOT NULL DEFAULT 1,
        avatar_url  NVARCHAR(500) NULL,
        google_id   NVARCHAR(255) NULL UNIQUE,    -- Google OAuth ID
        created_at  DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at  DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END
GO

-- ============================================================
-- REFRESH TOKENS TABLE
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='refresh_tokens' AND xtype='U')
BEGIN
    CREATE TABLE refresh_tokens (
        id          INT IDENTITY(1,1) PRIMARY KEY,
        user_id     INT NOT NULL,
        token       NVARCHAR(500) NOT NULL UNIQUE,
        expires_at  DATETIME2 NOT NULL,
        created_at  DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
END
GO

-- ============================================================
-- SCAN SESSIONS TABLE
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='scan_sessions' AND xtype='U')
BEGIN
    CREATE TABLE scan_sessions (
        id              INT IDENTITY(1,1) PRIMARY KEY,
        user_id         INT NOT NULL,
        ingredient_list NVARCHAR(MAX) NOT NULL,   -- JSON array: [{"ten_nguyen_lieu":"...", "so_luong":2, "don_vi":"..."}]
        recipes_result  NVARCHAR(MAX) NULL,        -- JSON: kết quả gợi ý công thức
        created_at      DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT fk_scan_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
END
GO

-- ============================================================
-- RECIPES TABLE (dùng cho Recipe Service - RAG)
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='recipes' AND xtype='U')
BEGIN
    CREATE TABLE recipes (
        id              INT IDENTITY(1,1) PRIMARY KEY,
        name            NVARCHAR(500) NOT NULL,
        ingredients     NVARCHAR(MAX) NOT NULL,   -- JSON array nguyên liệu
        steps           NVARCHAR(MAX) NOT NULL,   -- JSON array các bước nấu
        cook_time       NVARCHAR(100) NULL,        -- VD: "30 phút"
        difficulty      NVARCHAR(50) NULL,         -- "Dễ" | "Trung bình" | "Khó"
        source_url      NVARCHAR(500) NULL,        -- URL nguồn crawl
        source_name     NVARCHAR(100) NULL,        -- "Cookpad" | "Savoury Days"
        search_text     AS (name + ' ' + ingredients) PERSISTED,  -- Computed column cho full-text search
        created_at      DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END
GO

-- ============================================================
-- INDEXES
-- ============================================================

-- Index cho tìm kiếm user theo email
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_users_email')
    CREATE INDEX idx_users_email ON users(email);
GO

-- Index cho refresh token lookup
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_refresh_tokens_token')
    CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
GO

-- Index cho scan session theo user
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_scan_sessions_user_id')
    CREATE INDEX idx_scan_sessions_user_id ON scan_sessions(user_id);
GO

-- Index cho recipe search
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_recipes_name')
    CREATE INDEX idx_recipes_name ON recipes(name);
GO

-- Full-Text Search catalog và index cho recipes
IF NOT EXISTS (SELECT * FROM sys.fulltext_catalogs WHERE name = 'recipe_catalog')
BEGIN
    CREATE FULLTEXT CATALOG recipe_catalog AS DEFAULT;
END
GO

IF NOT EXISTS (
    SELECT * FROM sys.fulltext_indexes fi
    JOIN sys.tables t ON fi.object_id = t.object_id
    WHERE t.name = 'recipes'
)
BEGIN
    CREATE FULLTEXT INDEX ON recipes(name, ingredients)
    KEY INDEX PK__recipes__3213E83F
    ON recipe_catalog;
END
GO

-- ============================================================
-- SEED DATA: Admin account mặc định
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@cooksmart.ai')
BEGIN
    -- Password: admin123 (đã hash bằng bcrypt, salt rounds=10)
    INSERT INTO users (email, password, display_name, role)
    VALUES (
        'admin@cooksmart.ai',
        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'Admin',
        'admin'
    );
END
GO

PRINT 'Schema created successfully!';
GO
