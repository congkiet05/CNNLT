/**
 * Script tạo bcrypt hash cho admin password.
 *
 * Chạy từ root workspace:
 *   node database/generate-admin-hash.js
 *   node database/generate-admin-hash.js MyPassword123
 *
 * Dùng bcrypt từ auth-service (không cần install riêng).
 */
const path = require('path');
const bcrypt = require(path.join(__dirname, '../services/auth-service/node_modules/bcrypt'));

const password = process.argv[2] || 'Admin@123';

bcrypt.hash(password, 10).then((hash) => {
  console.log('\n✅ Bcrypt hash cho password:', password);
  console.log('\n' + hash + '\n');
  console.log('👉 Hash này đã được cập nhật vào database/init.sql (SEED DATA)\n');
});
