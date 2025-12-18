const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// отзывы книги
router.get('/book/:bookId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT review_id, book_id, text, created_at
      FROM reviews
      WHERE book_id = $1
      ORDER BY created_at DESC
      `,
      [req.params.bookId]
    );

    res.json({ success: true, data: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

// добавить отзыв
router.post('/', async (req, res) => {
  try {
    const { book_id, text } = req.body;

    if (!book_id || !text) {
      return res.status(400).json({ success: false });
    }

    await pool.query(
      'INSERT INTO reviews (book_id, text) VALUES ($1, $2)',
      [book_id, text]
    );

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

// все отзывы
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT review_id AS id, book_id, text, created_at
      FROM reviews
      ORDER BY created_at DESC
      `
    );

    res.json({ success: true, data: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
