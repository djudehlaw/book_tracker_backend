const db = require('./config/database');

async function testConnection() {
  try {
    const connection = await db.getConnection();
    console.log('✅ Подключение к базе успешно!');
    
    // Проверим таблицы
    const [tables] = await connection.query('SHOW TABLES');
    console.log('📊 Таблицы в базе:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    connection.release();
  } catch (err) {
    console.error('❌ Ошибка подключения:', err.message);
  }
}

testConnection();