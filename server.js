const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { pool, testConnection } = require('./config/database');

const booksRouter = require('./routes/books');
const authorsRouter = require('./routes/authors');
const progressRouter = require('./routes/progress');
const quotesRouter = require('./routes/quotes');
const reviewsRouter = require('./routes/reviews');
const ratingsRouter = require('./routes/ratings');

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

app.use('/books', booksRouter);
app.use('/authors', authorsRouter);
app.use('/progress', progressRouter);
app.use('/quotes', quotesRouter);
app.use('/reviews', reviewsRouter);
app.use('/ratings', ratingsRouter);

// fallback
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Маршрут не найден' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));