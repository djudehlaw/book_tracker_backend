const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// получить прогресс
router.get('/book/:bookId', async (req, res) => {
  try {
    const [[row]] = await pool.query(
      'SELECT status, pages_read, total_pages FROM book_progress WHERE book_id = ?',
      [req.params.bookId]
    );

    res.json({ success: true, data: row || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// сохранить прогресс
router.post('/book/:bookId', async (req, res) => {
  try {
    const { status, pages_read, total_pages } = req.body;
    const bookId = req.params.bookId;

    const [[exists]] = await pool.query(
      'SELECT 1 FROM book_progress WHERE book_id = ?',
      [bookId]
    );

    if (exists) {
      await pool.query(
        `
        UPDATE book_progress
        SET status = ?, pages_read = ?, total_pages = ?
        WHERE book_id = ?
        `,
        [status, pages_read, total_pages, bookId]
      );
    } else {
      await pool.query(
        `
        INSERT INTO book_progress (book_id, status, pages_read, total_pages)
        VALUES (?, ?, ?, ?)
        `,
        [bookId, status, pages_read, total_pages]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
