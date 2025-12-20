import express from "express";
import { pool } from "../config/database.js";

const router = express.Router();

// получить прогресс
router.get("/book/:bookId", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT status, pages_read, total_pages
       FROM book_progress
       WHERE book_id = $1`,
      [req.params.bookId]
    );

    res.json({ success: true, data: rows[0] || null });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

// сохранить прогресс
router.post("/book/:bookId", async (req, res) => {
  try {
    const { status, pages_read, total_pages } = req.body;
    const bookId = req.params.bookId;

    const { rowCount } = await pool.query(
      "SELECT 1 FROM book_progress WHERE book_id = $1",
      [bookId]
    );

    if (rowCount) {
      await pool.query(
        `UPDATE book_progress
         SET status = $1, pages_read = $2, total_pages = $3
         WHERE book_id = $4`,
        [status, pages_read, total_pages, bookId]
      );
    } else {
      await pool.query(
        `INSERT INTO book_progress (book_id, status, pages_read, total_pages)
         VALUES ($1, $2, $3, $4)`,
        [bookId, status, pages_read, total_pages]
      );
    }

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

export default router;
