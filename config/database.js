require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,       // например dpg-d527opre5dus73eeubl0-a.oregon-postgres.render.com
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,       // book_tracker_t5co_user
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,   // book_tracker_t5co
});

module.exports = pool;


// Тестируем подключение
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('🌸 Подключение к базе данных успешно!');

    await connection.query("SET NAMES 'utf8mb4'");
    await connection.query("SET CHARACTER SET utf8mb4");
    await connection.query("SET character_set_connection = utf8mb4");

    // Проверим таблицы
    const [tables] = await connection.query('SHOW TABLES');
    console.log('🌸 Найдено таблиц:', tables.length);
    
    connection.release();
    return true;
  } catch (error) {
    console.error('🌸 Ошибка подключения к базе:', error.message);
    console.log('🌸 Проверь:');
    console.log('🌸 1. Запущен ли MySQL?');
    console.log('🌸 2. Правильные ли логин/пароль в .env файле?');
    console.log('🌸 3. Существует ли база book_tracker?');
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};