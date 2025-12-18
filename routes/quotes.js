const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Получить цитаты книги
router.get('/book/:bookId', async (req, res) => {
  const [quotes] = await pool.query(
    'SELECT quote_id, text FROM quotes WHERE book_id = ?',
    [req.params.bookId]
  );
  res.json({ success: true, data: quotes });
});

// Добавить цитату
router.post('/', async (req, res) => {
  const { book_id, text } = req.body;
  if (!book_id || !text) return res.status(400).json({ success: false, error: 'book_id и текст обязательны' });

  await pool.query('INSERT INTO quotes (book_id, text) VALUES (?, ?)', [book_id, text]);
  res.json({ success: true });
});

module.exports = router;