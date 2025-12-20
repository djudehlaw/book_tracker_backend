import express from "express";
import { pool } from "../config/database.js";

const router = express.Router();

// 🔍 ПОИСК КНИГ
router.get("/search/:query", async (req, res) => {
  try {
    const q = `%${req.params.query}%`;

    const { rows } = await pool.query(
      `SELECT book_id AS id, title, publication_year, description
       FROM books
       WHERE title ILIKE $1 OR description ILIKE $1
       LIMIT 10`,
      [q]
    );

    res.json({ success: true, data: rows, count: rows.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

// 📚 ВСЕ КНИГИ
router.get("/", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { rows } = await pool.query(
      `SELECT 
         b.book_id AS id,
         b.title,
         b.isbn,
         b.publication_year,
         b.description,
         b.cover_url,
         COALESCE(
           STRING_AGG(a.first_name || ' ' || a.last_name, ','), ''
         ) AS authors
       FROM books b
       LEFT JOIN book_authors ba ON b.book_id = ba.book_id
       LEFT JOIN authors a ON ba.author_id = a.author_id
       GROUP BY b.book_id
       ORDER BY b.title
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const { rows: countRows } = await pool.query(
      "SELECT COUNT(*)::int AS total FROM books"
    );

    res.json({
      success: true,
      data: rows.map(b => ({
        ...b,
        authors: b.authors ? b.authors.split(",") : []
      })),
      pagination: {
        total: countRows[0].total,
        page,
        limit,
        totalPages: Math.ceil(countRows[0].total / limit)
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

// 📚 ОДНА КНИГА
router.get("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
         b.book_id AS id,
         b.title,
         b.isbn,
         b.publication_year,
         b.description,
         b.cover_url,
         STRING_AGG(a.first_name || ' ' || a.last_name, ',') AS authors
       FROM books b
       LEFT JOIN book_authors ba ON b.book_id = ba.book_id
       LEFT JOIN authors a ON ba.author_id = a.author_id
       WHERE b.book_id = $1
       GROUP BY b.book_id`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false });
    }

    res.json({
      success: true,
      data: {
        ...rows[0],
        authors: rows[0].authors ? rows[0].authors.split(",") : []
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

export default router;
