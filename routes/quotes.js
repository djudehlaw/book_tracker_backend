const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// получить цитаты
router.get('/book/:bookId', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT quote_id, text FROM quotes WHERE book_id = $1',
    [req.params.bookId]
  );

  res.json({ success: true, data: rows });
});

// добавить цитату
router.post('/', async (req, res) => {
  const { book_id, text } = req.body;

  if (!book_id || !text) {
    return res.status(400).json({ success: false });
  }

  await pool.query(
    'INSERT INTO quotes (book_id, text) VALUES ($1, $2)',
    [book_id, text]
  );

  res.json({ success: true });
});

module.exports = router;
