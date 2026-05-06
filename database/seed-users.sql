USE food_recipe_db;
GO

SET QUOTED_IDENTIFIER ON;
GO

-- Admin: Admin@123
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

-- User: User@123
IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'user@cooksmart.ai')
BEGIN
    INSERT INTO users (email, password, display_name, role)
    VALUES (
        'user@cooksmart.ai',
        '$2b$10$SnxGLPorVPFwp8zAI0YHDe5eSuQa8ZbPbu2VEzmpO.VWEQk0l51Mm',
        'Nguoi Dung Test',
        'user'
    );
END
GO

SELECT id, email, display_name, role FROM users;
GO
