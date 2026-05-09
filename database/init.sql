-- ============================================================
-- AI Food Recipe Suggestion - SQL Server Schema (Full System)
-- Covers: Auth, Ingredient, Recipe (RAG), Video, Scan History,
--         Admin Dashboard, Crawl Management
-- ============================================================

-- ─── Tạo database ────────────────────────────────────────────
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'food_recipe_db')
BEGIN
    CREATE DATABASE food_recipe_db;
END
GO

USE food_recipe_db;
GO

-- ============================================================
-- 1. USERS
--    Dùng bởi: auth-service, admin dashboard
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
BEGIN
    CREATE TABLE users (
        id              INT IDENTITY(1,1)   PRIMARY KEY,
        email           NVARCHAR(255)       NOT NULL UNIQUE,
        password        NVARCHAR(255)       NULL,           -- NULL nếu chỉ dùng OAuth
        display_name    NVARCHAR(255)       NOT NULL,
        role            NVARCHAR(20)        NOT NULL DEFAULT 'user'
                            CONSTRAINT chk_users_role CHECK (role IN ('user', 'admin')),
        is_active       BIT                 NOT NULL DEFAULT 1,
        avatar_url      NVARCHAR(500)       NULL,
        google_id       NVARCHAR(255)       NULL,           -- Google OAuth sub (không UNIQUE vì nhiều NULL)
        created_at      DATETIME2           NOT NULL DEFAULT GETDATE(),
        updated_at      DATETIME2           NOT NULL DEFAULT GETDATE(),
        image_url NVARCHAR(500) NULL
    );
END
GO

-- Trigger tự động cập nhật updated_at khi UPDATE
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_users_updated_at')
BEGIN
    EXEC('
    CREATE TRIGGER trg_users_updated_at
    ON users
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        UPDATE users
        SET updated_at = GETDATE()
        FROM users u
        INNER JOIN inserted i ON u.id = i.id;
    END
    ');
END
GO

-- ============================================================
-- 2. REFRESH TOKENS
--    Dùng bởi: auth-service
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='refresh_tokens' AND xtype='U')
BEGIN
    CREATE TABLE refresh_tokens (
        id          INT IDENTITY(1,1)   PRIMARY KEY,
        user_id     INT                 NOT NULL,
        token       NVARCHAR(500)       NOT NULL UNIQUE,
        expires_at  DATETIME2           NOT NULL,
        created_at  DATETIME2           NOT NULL DEFAULT GETDATE(),
        CONSTRAINT fk_refresh_tokens_user
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
END
GO

-- ============================================================
-- 3. RECIPES
--    Dùng bởi: recipe-service (RAG), admin dashboard, crawl script
--    Lưu công thức crawl từ Cookpad, Savoury Days (≥500 bản ghi)
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='recipes' AND xtype='U')
BEGIN
    CREATE TABLE recipes (
        id              INT IDENTITY(1,1)   PRIMARY KEY,
        name            NVARCHAR(500)       NOT NULL,
        -- JSON array: [{"ten_nguyen_lieu":"Cà chua","so_luong":2,"don_vi":"quả"}]
        ingredients     NVARCHAR(MAX)       NOT NULL,
        -- JSON array: [{"buoc":1,"mo_ta":"Rửa rau..."}]
        steps           NVARCHAR(MAX)       NOT NULL,
        cook_time       NVARCHAR(100)       NULL,   -- VD: "30 phút"
        difficulty      NVARCHAR(50)        NULL    -- "Dễ" | "Trung bình" | "Khó"
                            CONSTRAINT chk_recipes_difficulty
                            CHECK (difficulty IN ('Dễ', 'Trung bình', 'Khó') OR difficulty IS NULL),
        -- Trường tóm tắt nguyên liệu dạng text thuần để search
        -- Giới hạn 450 ký tự để index an toàn (NVARCHAR(450) = 900 bytes < 1700 bytes limit)
        ingredients_text NVARCHAR(450)      NULL,
        source_url      NVARCHAR(850)       NULL UNIQUE,  -- UNIQUE để tránh crawl trùng (≤850 để fit index)
        source_name     NVARCHAR(100)       NULL,   -- "Cookpad" | "Savoury Days"
        is_active       BIT                 NOT NULL DEFAULT 1,  -- Admin có thể ẩn công thức
        created_at      DATETIME2           NOT NULL DEFAULT GETDATE(),
        updated_at      DATETIME2           NOT NULL DEFAULT GETDATE(),
        image_url NVARCHAR(500) NULL;
    );
END
GO

-- Trigger tự động cập nhật updated_at cho recipes
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_recipes_updated_at')
BEGIN
    EXEC('
    CREATE TRIGGER trg_recipes_updated_at
    ON recipes
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        UPDATE recipes
        SET updated_at = GETDATE()
        FROM recipes r
        INNER JOIN inserted i ON r.id = i.id;
    END
    ');
END
GO

-- ============================================================
-- 4. SCAN SESSIONS
--    Dùng bởi: ingredient-service, recipe-service, video-service
--    Lưu toàn bộ luồng: ảnh → nguyên liệu → công thức → video
--    Giới hạn 50 session/user (xử lý bằng stored procedure)
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='scan_sessions' AND xtype='U')
BEGIN
    CREATE TABLE scan_sessions (
        id                  INT IDENTITY(1,1)   PRIMARY KEY,
        user_id             INT                 NOT NULL,
        -- Trạng thái luồng: ingredient_confirmed → recipe_suggested → completed
        status              NVARCHAR(30)        NOT NULL DEFAULT 'ingredient_confirmed'
                                CONSTRAINT chk_scan_status
                                CHECK (status IN ('ingredient_confirmed', 'recipe_suggested', 'completed')),
        -- JSON array nguyên liệu đã chốt
        ingredient_list     NVARCHAR(MAX)       NOT NULL,
        -- JSON: { "suggested": [...], "generated_guide": "..." }
        recipes_result      NVARCHAR(MAX)       NULL,
        -- JSON array: [{"video_id":"...","title":"...","thumbnail":"...","embed_url":"..."}]
        video_results       NVARCHAR(MAX)       NULL,
        -- Tên món ăn được gợi ý (để tìm video)
        dish_name           NVARCHAR(500)       NULL,
        created_at          DATETIME2           NOT NULL DEFAULT GETDATE(),
        updated_at          DATETIME2           NOT NULL DEFAULT GETDATE(),
        CONSTRAINT fk_scan_sessions_user
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
END
GO

-- Trigger tự động cập nhật updated_at cho scan_sessions
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_scan_sessions_updated_at')
BEGIN
    EXEC('
    CREATE TRIGGER trg_scan_sessions_updated_at
    ON scan_sessions
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        UPDATE scan_sessions
        SET updated_at = GETDATE()
        FROM scan_sessions s
        INNER JOIN inserted i ON s.id = i.id;
    END
    ');
END
GO

-- ============================================================
-- 5. VIDEO CACHE
--    Dùng bởi: video-service
--    Cache kết quả YouTube API để tiết kiệm quota (Req 4.5)
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='video_cache' AND xtype='U')
BEGIN
    CREATE TABLE video_cache (
        id          INT IDENTITY(1,1)   PRIMARY KEY,
        query_key   NVARCHAR(500)       NOT NULL UNIQUE,  -- tên món ăn đã normalize
        -- JSON array kết quả video
        results     NVARCHAR(MAX)       NOT NULL,
        hit_count   INT                 NOT NULL DEFAULT 0,
        created_at  DATETIME2           NOT NULL DEFAULT GETDATE(),
        expires_at  DATETIME2           NOT NULL  -- cache hết hạn sau 24h
    );
END
GO

-- ============================================================
-- 6. CRAWL LOGS
--    Dùng bởi: crawl script (Req 6.3 - ghi log lỗi)
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='crawl_logs' AND xtype='U')
BEGIN
    CREATE TABLE crawl_logs (
        id          INT IDENTITY(1,1)   PRIMARY KEY,
        source_name NVARCHAR(100)       NOT NULL,   -- "Cookpad" | "Savoury Days"
        source_url  NVARCHAR(1000)      NULL,
        status      NVARCHAR(20)        NOT NULL
                        CONSTRAINT chk_crawl_status
                        CHECK (status IN ('success', 'error', 'duplicate', 'skipped')),
        message     NVARCHAR(MAX)       NULL,        -- Chi tiết lỗi nếu có
        created_at  DATETIME2           NOT NULL DEFAULT GETDATE()
    );
END
GO

-- ============================================================
-- 7. ADMIN AUDIT LOGS
--    Dùng bởi: admin dashboard (Req 7 - theo dõi hành động admin)
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='admin_audit_logs' AND xtype='U')
BEGIN
    CREATE TABLE admin_audit_logs (
        id              INT IDENTITY(1,1)   PRIMARY KEY,
        admin_id        INT                 NOT NULL,
        action          NVARCHAR(100)       NOT NULL,   -- "delete_recipe" | "disable_user" | ...
        target_type     NVARCHAR(50)        NULL,       -- "recipe" | "user"
        target_id       INT                 NULL,       -- ID của đối tượng bị tác động
        detail          NVARCHAR(MAX)       NULL,       -- JSON chi tiết thêm
        created_at      DATETIME2           NOT NULL DEFAULT GETDATE(),
        CONSTRAINT fk_audit_admin
            FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE NO ACTION
    );
END
GO

-- ============================================================
-- INDEXES
-- ============================================================

-- users
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_users_email' AND object_id = OBJECT_ID('users'))
    CREATE INDEX idx_users_email ON users(email);
GO
SET QUOTED_IDENTIFIER ON;
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_users_google_id' AND object_id = OBJECT_ID('users'))
    CREATE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_users_role_active' AND object_id = OBJECT_ID('users'))
    CREATE INDEX idx_users_role_active ON users(role, is_active);
GO

-- refresh_tokens
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_refresh_tokens_token' AND object_id = OBJECT_ID('refresh_tokens'))
    CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_refresh_tokens_user_id' AND object_id = OBJECT_ID('refresh_tokens'))
    CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_refresh_tokens_expires' AND object_id = OBJECT_ID('refresh_tokens'))
    CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
GO

-- recipes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_recipes_name' AND object_id = OBJECT_ID('recipes'))
    CREATE INDEX idx_recipes_name ON recipes(name);
GO
SET QUOTED_IDENTIFIER ON;
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_recipes_source_url' AND object_id = OBJECT_ID('recipes'))
    CREATE INDEX idx_recipes_source_url ON recipes(source_url) WHERE source_url IS NOT NULL;
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_recipes_active' AND object_id = OBJECT_ID('recipes'))
    CREATE INDEX idx_recipes_active ON recipes(is_active);
GO

-- scan_sessions
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_scan_sessions_user_id' AND object_id = OBJECT_ID('scan_sessions'))
    CREATE INDEX idx_scan_sessions_user_id ON scan_sessions(user_id);
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_scan_sessions_user_created' AND object_id = OBJECT_ID('scan_sessions'))
    CREATE INDEX idx_scan_sessions_user_created ON scan_sessions(user_id, created_at DESC);
GO

-- video_cache
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_video_cache_query' AND object_id = OBJECT_ID('video_cache'))
    CREATE INDEX idx_video_cache_query ON video_cache(query_key);
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_video_cache_expires' AND object_id = OBJECT_ID('video_cache'))
    CREATE INDEX idx_video_cache_expires ON video_cache(expires_at);
GO

-- crawl_logs
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_crawl_logs_source' AND object_id = OBJECT_ID('crawl_logs'))
    CREATE INDEX idx_crawl_logs_source ON crawl_logs(source_name, created_at DESC);
GO

-- admin_audit_logs
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_audit_admin_id' AND object_id = OBJECT_ID('admin_audit_logs'))
    CREATE INDEX idx_audit_admin_id ON admin_audit_logs(admin_id, created_at DESC);
GO

-- ============================================================
-- FULL-TEXT SEARCH
-- NOTE: SQL Server Express không hỗ trợ Full-Text Search.
-- Dùng LIKE hoặc CONTAINS với regular index thay thế.
-- Nếu dùng SQL Server Standard/Enterprise, bỏ comment phần dưới.
-- ============================================================

-- IF NOT EXISTS (SELECT * FROM sys.fulltext_catalogs WHERE name = 'recipe_catalog')
-- BEGIN
--     CREATE FULLTEXT CATALOG recipe_catalog AS DEFAULT;
-- END
-- GO
-- ... (tạo fulltext index tương tự như cũ nếu cần)

-- Thay thế: index thường trên ingredients_text để hỗ trợ LIKE search
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_recipes_ingredients_text' AND object_id = OBJECT_ID('recipes'))
    CREATE INDEX idx_recipes_ingredients_text ON recipes(ingredients_text);
GO

-- ============================================================
-- STORED PROCEDURES
-- ============================================================

-- SP: Giới hạn 50 scan sessions/user (Req 5.4)
-- Gọi sau mỗi lần INSERT vào scan_sessions
IF NOT EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_cleanup_old_scan_sessions')
BEGIN
    EXEC('
    CREATE PROCEDURE sp_cleanup_old_scan_sessions
        @user_id INT
    AS
    BEGIN
        SET NOCOUNT ON;
        -- Xóa các session cũ nhất nếu vượt quá 50
        DELETE FROM scan_sessions
        WHERE id IN (
            SELECT id FROM (
                SELECT id,
                       ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
                FROM scan_sessions
                WHERE user_id = @user_id
            ) ranked
            WHERE rn > 50
        );
    END
    ');
END
GO

-- SP: Thống kê Admin Dashboard (Req 7.1)
IF NOT EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_admin_dashboard_stats')
BEGIN
    EXEC('
    CREATE PROCEDURE sp_admin_dashboard_stats
    AS
    BEGIN
        SET NOCOUNT ON;
        SELECT
            (SELECT COUNT(*) FROM users WHERE role = ''user'')           AS total_users,
            (SELECT COUNT(*) FROM users WHERE role = ''admin'')          AS total_admins,
            (SELECT COUNT(*) FROM recipes WHERE is_active = 1)           AS total_recipes,
            (SELECT COUNT(*) FROM scan_sessions
             WHERE CAST(created_at AS DATE) = CAST(GETDATE() AS DATE))   AS scans_today,
            (SELECT COUNT(*) FROM scan_sessions)                         AS total_scans,
            (SELECT COUNT(*) FROM users
             WHERE CAST(created_at AS DATE) = CAST(GETDATE() AS DATE))   AS new_users_today;
    END
    ');
END
GO

-- SP: Dọn dẹp video cache hết hạn (chạy định kỳ)
IF NOT EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_cleanup_expired_video_cache')
BEGIN
    EXEC('
    CREATE PROCEDURE sp_cleanup_expired_video_cache
    AS
    BEGIN
        SET NOCOUNT ON;
        DELETE FROM video_cache WHERE expires_at < GETDATE();
    END
    ');
END
GO

-- SP: Dọn dẹp refresh token hết hạn (chạy định kỳ)
IF NOT EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_cleanup_expired_refresh_tokens')
BEGIN
    EXEC('
    CREATE PROCEDURE sp_cleanup_expired_refresh_tokens
    AS
    BEGIN
        SET NOCOUNT ON;
        DELETE FROM refresh_tokens WHERE expires_at < GETDATE();
    END
    ');
END
GO

-- ============================================================
-- SEED DATA
-- ============================================================

-- Admin account mặc định
-- Password: Admin@123 (bcrypt hash, salt rounds=10)
IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@cooksmart.ai')
BEGIN
    INSERT INTO users (email, password, display_name, role)
    VALUES (
        'admin@cooksmart.ai',
        '$2b$10$lnJLi0Fe/8h6C9phjCl0PuwCzdDXBIsd4v.xxT8JInDCyoHg5puyy',
        'Admin CookSmart',
        'admin'
    );
END
GO

-- User thường mặc định để test
-- Password: User@123 (bcrypt hash, salt rounds=10)
IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'user@cooksmart.ai')
BEGIN
    INSERT INTO users (email, password, display_name, role)
    VALUES (
        'user@cooksmart.ai',
        '$2b$10$SnxGLPorVPFwp8zAI0YHDe5eSuQa8ZbPbu2VEzmpO.VWEQk0l51Mm',
        'Người Dùng Test',
        'user'
    );
END
GO

PRINT '============================================================';
PRINT 'Schema created successfully!';
PRINT 'Tables: users, refresh_tokens, recipes, scan_sessions,';
PRINT '        video_cache, crawl_logs, admin_audit_logs';
PRINT 'Stored Procedures: sp_cleanup_old_scan_sessions,';
PRINT '                   sp_admin_dashboard_stats,';
PRINT '                   sp_cleanup_expired_video_cache,';
PRINT '                   sp_cleanup_expired_refresh_tokens';
PRINT '============================================================';
GO
