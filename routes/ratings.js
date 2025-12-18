const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// ⭐ Получить все рейтинги
router.get('/', async (req, res) => {
  try {
    const [ratings] = await pool.query(
      `SELECT 
        rating_id,
        book_id,
        score
      FROM ratings
      ORDER BY rating_id DESC`
    );

    res.json({
      success: true,
      data: ratings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// ⭐ Получить рейтинги конкретной книги
router.get('/book/:bookId', async (req, res) => {
  try {
    const [ratings] = await pool.query(
      `SELECT 
        rating_id,
        book_id,
        score
      FROM ratings
      WHERE book_id = ?
      ORDER BY rating_id DESC`,
      [req.params.bookId]
    );

    const [[avg]] = await pool.query(
      'SELECT ROUND(AVG(score), 1) as average FROM ratings WHERE book_id = ?',
      [req.params.bookId]
    );

    res.json({
      success: true,
      average: avg.average,
      data: ratings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// ⭐ Добавить рейтинг
router.post('/', async (req, res) => {
  try {
    const { book_id, score } = req.body;

    if (!book_id || score === undefined) {
      return res.status(400).json({ success: false, error: 'book_id и score обязательны' });
    }

    const numericScore = Number(score);

    await pool.query(
      'INSERT INTO ratings (book_id, score) VALUES (?, ?)',
      [book_id, numericScore]
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});


module.exports = router;
