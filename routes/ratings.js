const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// все рейтинги
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT rating_id AS id, book_id, score
       FROM ratings
       ORDER BY rating_id DESC`
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

// рейтинги конкретной книги
router.get('/book/:bookId', async (req, res) => {
  try {
    const { rows: ratings } = await pool.query(
      `SELECT rating_id AS id, book_id, score
       FROM ratings
       WHERE book_id = $1
       ORDER BY rating_id DESC`,
      [req.params.bookId]
    );

    const { rows: avgRows } = await pool.query(
      `SELECT ROUND(AVG(score)::numeric, 1) AS average
       FROM ratings
       WHERE book_id = $1`,
      [req.params.bookId]
    );

    res.json({
      success: true,
      average: avgRows[0].average,
      data: ratings
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

// добавить рейтинг
router.post('/', async (req, res) => {
  try {
    const { book_id, score } = req.body;
    if (!book_id || score === undefined) return res.status(400).json({ success: false });

    await pool.query(
      `INSERT INTO ratings (book_id, score)
       VALUES ($1, $2)`,
      [book_id, Number(score)]
    );

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
  