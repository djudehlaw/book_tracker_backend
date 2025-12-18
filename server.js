const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { pool, testConnection } = require('./config/database');

const booksRouter = require('./routes/books');
const authorsRouter = require('./routes/authors');
const reviewRoutes = require('./routes/reviews');
const progressRoutes = require('./routes/progress');
const quotesRoutes = require('./routes/quotes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: '📚 Book Tracker API работает',
    endpoints: {
      books: '/api/books',
      authors: '/api/authors'
    }
  });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const ok = await testConnection();
    if (!ok) throw new Error();

    const [[books]] = await pool.query('SELECT COUNT(*) as c FROM books');
    const [[authors]] = await pool.query('SELECT COUNT(*) as c FROM authors');

    res.json({
      success: true,
      stats: {
        books: books.c,
        authors: authors.c
      }
    });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.use('/api/books', booksRouter);
app.use('/api/authors', authorsRouter);
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/reviews', reviewRoutes);
app.use('/api/progress', require('./routes/progress'));
app.use('/api/quotes', quotesRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Маршрут не найден'
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));