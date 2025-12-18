const mysql = require('mysql2/promise');
require('dotenv').config();

// Создаем пул соединений с базой данных
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'bookuser',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_NAME || 'book_tracker',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

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