const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// ⭐ Получить отзывы книги
router.get('/book/:bookId', async (req, res) => {
  try {
    const [reviews] = await pool.query(
      `SELECT review_id, book_id, text, created_at
       FROM reviews
       WHERE book_id = ?
       ORDER BY created_at DESC`,
      [req.params.bookId]
    );

    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// ⭐ Добавить отзыв
router.post('/', async (req, res) => {
  try {
    const { book_id, text } = req.body;

    if (!book_id || !text) {
      return res.status(400).json({
        success: false,
        error: 'book_id и text обязательны'
      });
    }

    await pool.query(
      `INSERT INTO reviews (book_id, text) VALUES (?, ?)`,
      [book_id, text]
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// Получить все отзывы
router.get('/', async (req, res) => {
  try {
    const [reviews] = await pool.query(
      'SELECT review_id as id, book_id, text, created_at FROM reviews ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});


module.exports = router;
