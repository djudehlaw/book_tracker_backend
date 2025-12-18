const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// ⭐ Получить все рейтинги
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        rating_id,
        book_id,
        score
      FROM ratings
      ORDER BY rating_id DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// ⭐ Получить рейтинги конкретной книги
router.get('/book/:bookId', async (req, res) => {
  try {
    const ratingsResult = await pool.query(
      `
      SELECT 
        rating_id,
        book_id,
        score
      FROM ratings
      WHERE book_id = $1
      ORDER BY rating_id DESC
      `,
      [req.params.bookId]
    );

    const avgResult = await pool.query(
      'SELECT ROUND(AVG(score), 1) AS average FROM ratings WHERE book_id = $1',
      [req.params.bookId]
    );

    res.json({
      success: true,
      average: avgResult.rows[0].average,
      data: ratingsResult.rows
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

    await pool.query(
      'INSERT INTO ratings (book_id, score) VALUES ($1, $2)',
      [book_id, Number(score)]
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

module.exports = router;
