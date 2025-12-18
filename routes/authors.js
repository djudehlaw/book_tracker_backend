const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// 🔍 ПОИСК АВТОРОВ
router.get('/search/:query', async (req, res) => {
  try {
    const q = `%${req.params.query}%`;

    const { rows } = await pool.query(
      `
      SELECT 
        a.author_id AS id,
        a.first_name,
        a.last_name,
        a.bio,
        COUNT(DISTINCT ba.book_id) AS book_count
      FROM authors a
      LEFT JOIN book_authors ba ON a.author_id = ba.author_id
      WHERE 
        a.first_name ILIKE $1 OR
        a.last_name ILIKE $1 OR
        (a.first_name || ' ' || a.last_name) ILIKE $1
      GROUP BY a.author_id
      ORDER BY a.last_name
      LIMIT 20
      `,
      [q]
    );

    res.json({ success: true, data: rows, count: rows.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

// 👨‍🎨 ВСЕ АВТОРЫ
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT 
        a.author_id AS id,
        a.first_name,
        a.last_name,
        a.birth_date,
        a.bio,
        COUNT(DISTINCT ba.book_id) AS book_count
      FROM authors a
      LEFT JOIN book_authors ba ON a.author_id = ba.author_id
      GROUP BY a.author_id
      ORDER BY a.last_name
      `
    );

    res.json({ success: true, data: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

// 👨‍🎨 ОДИН АВТОР
router.get('/:id', async (req, res) => {
  try {
    const { rows: authorRows } = await pool.query(
      `
      SELECT 
        author_id AS id,
        first_name,
        last_name,
        birth_date,
        bio
      FROM authors
      WHERE author_id = $1
      `,
      [req.params.id]
    );

    if (!authorRows.length) {
      return res.status(404).json({ success: false });
    }

    const { rows: books } = await pool.query(
      `
      SELECT 
        b.book_id AS id,
        b.title,
        b.publication_year,
        b.cover_url
      FROM books b
      JOIN book_authors ba ON b.book_id = ba.book_id
      WHERE ba.author_id = $1
      ORDER BY b.publication_year DESC
      `,
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        ...authorRows[0],
        books,
        total_books: books.length
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
