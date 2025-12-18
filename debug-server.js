console.log('🌸 1. Начинаем запуск сервера...');

const express = require('express');
console.log('🌸 2. Express загружен');

const cors = require('cors');
console.log('🌸 3. CORS загружен');

require('dotenv').config();
console.log('🌸 4. dotenv загружен');

console.log('🌸 5. Пытаемся загрузить database.js...');
try {
  const { pool, testConnection } = require('./config/database');
  console.log('🌸 6. database.js загружен успешно');
} catch (error) {
  console.log('🌸 ❌ Ошибка при загрузке database.js:', error.message);
}

const app = express();
console.log('🌸 7. Express приложение создано');

// Middleware
app.use(cors());
app.use(express.json());
console.log('🌸 8. Middleware настроен');

// Простой маршрут
app.get('/', (req, res) => {
  console.log('🌸 Получен запрос на /');
  res.json({ 
    message: 'Сервер работает!',
    status: 'OK' 
  });
});

// Простой тест базы данных
app.get('/test-simple', async (req, res) => {
  console.log('🌸 Получен запрос на /test-simple');
  try {
    const { pool } = require('./config/database');
    const [result] = await pool.execute('SELECT 1 as test');
    res.json({ 
      success: true,
      db_test: result[0].test,
      message: 'База данных отвечает!' 
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      message: 'Ошибка при подключении к базе'
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log('🌸 ========================================');
  console.log(`🌸 Сервер запущен на порту ${PORT}!`);
  console.log(`🌸 http://localhost:${PORT}`);
  console.log('🌸 Проверь в браузере:');
  console.log(`🌸 1. http://localhost:${PORT}`);
  console.log(`🌸 2. http://localhost:${PORT}/test-simple`);
  console.log('🌸 ========================================');
});

console.log('🌸 9. Функция app.listen() вызвана');