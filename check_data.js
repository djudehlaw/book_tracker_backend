const mysql = require('mysql2');

console.log('🧪 Простая проверка данных...\n');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'bookuser',
  password: 'password123',
  database: 'book_tracker',
  charset: 'utf8mb4'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Ошибка подключения:', err.message);
    return;
  }
  
  console.log('✅ Подключено к базе данных\n');
  
  // Самый простой запрос 1: Количество книг
  connection.query('SELECT COUNT(*) as count FROM books', (err, results) => {
    if (err) {
      console.error('❌ Ошибка запроса 1:', err.message);
      connection.end();
      return;
    }
    
    console.log(`📚 Всего книг в базе: ${results[0].count}`);
    
    // Простой запрос 2: Первые 5 книг
    connection.query('SELECT book_id, title FROM books LIMIT 5', (err, books) => {
      if (err) {
        console.error('❌ Ошибка запроса 2:', err.message);
        connection.end();
        return;
      }
      
      console.log('\n📖 Первые 5 книг:');
      console.log('='.repeat(50));
      books.forEach(book => {
        console.log(`ID: ${book.book_id}`);
        console.log(`Название: "${book.title}"`);
        
        // Проверяем, есть ли русские буквы
        const hasRussian = /[А-Яа-яЁё]/.test(book.title);
        console.log(`Русские буквы: ${hasRussian ? '✅ Есть' : '❌ Нет'}`);
        
        // Показываем HEX для диагностики
        console.log(`Первый символ (HEX): ${book.title.charCodeAt(0).toString(16)}`);
        console.log('-'.repeat(40));
      });
      
      // Простой запрос 3: Первые 5 авторов
      connection.query('SELECT author_id, first_name, last_name FROM authors LIMIT 5', (err, authors) => {
        if (err) {
          console.error('❌ Ошибка запроса 3:', err.message);
          connection.end();
          return;
        }
        
        console.log('\n👨‍🎨 Первые 5 авторов:');
        console.log('='.repeat(50));
        authors.forEach(author => {
          console.log(`ID: ${author.author_id}`);
          console.log(`Автор: ${author.first_name} ${author.last_name}`);
          console.log('-'.repeat(30));
        });
        
        // Тест: попробуем найти книгу с русским названием другим способом
        console.log('\n🔍 Ищем русские книги:');
        connection.query(`SELECT title FROM books WHERE title LIKE '%е%' LIMIT 3`, (err, russianBooks) => {
          if (err) {
            console.log('❌ Не удалось найти русские книги');
          } else if (russianBooks.length > 0) {
            console.log('✅ Найдены книги с буквой "е":');
            russianBooks.forEach(book => {
              console.log(`  - "${book.title}"`);
            });
          } else {
            console.log('❌ Книг с русской буквой "е" не найдено');
          }
          
          connection.end();
          console.log('\n🎉 Проверка завершена!');
        });
      });
    });
  });
});