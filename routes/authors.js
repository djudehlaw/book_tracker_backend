const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 🔍 ПОИСК АВТОРОВ (ВЫШЕ /:id)
router.get('/search/:query', async (req, res) => {
  try {
    const q = `%${req.params.query}%`;

    const [authors] = await pool.query(
      `
      SELECT 
        a.author_id as id,
        a.first_name,
        a.last_name,
        a.bio,
        COUNT(DISTINCT ba.book_id) as book_count
      FROM authors a
      LEFT JOIN book_authors ba ON a.author_id = ba.author_id
      WHERE 
        a.first_name LIKE ? OR 
        a.last_name LIKE ? OR
        CONCAT(a.first_name, ' ', a.last_name) LIKE ?
      GROUP BY a.author_id
      ORDER BY a.last_name
      LIMIT 20
      `,
      [q, q, q]
    );

    res.json({
      success: true,
      data: authors,
      count: authors.length
    });
  } catch {
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// 👨‍🎨 ВСЕ АВТОРЫ
router.get('/', async (req, res) => {
  try {
    const [authors] = await pool.query(
      `
      SELECT 
        a.author_id as id,
        a.first_name,
        a.last_name,
        a.birth_date,
        a.bio,
        COUNT(DISTINCT ba.book_id) as book_count
      FROM authors a
      LEFT JOIN book_authors ba ON a.author_id = ba.author_id
      GROUP BY a.author_id
      ORDER BY a.last_name
      `
    );

    res.json({ success: true, data: authors });
  } catch {
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// 👨‍🎨 ОДИН АВТОР
router.get('/:id', async (req, res) => {
  try {
    const [[author]] = await pool.query(
      `
      SELECT 
        author_id as id,
        first_name,
        last_name,
        birth_date,
        bio
      FROM authors
      WHERE author_id = ?
      `,
      [req.params.id]
    );

    if (!author) {
      return res.status(404).json({ success: false, error: 'Автор не найден' });
    }

    const [books] = await pool.query(
      `
      SELECT 
        b.book_id as id,
        b.title,
        b.publication_year,
        b.cover_url
      FROM books b
      JOIN book_authors ba ON b.book_id = ba.book_id
      WHERE ba.author_id = ?
      ORDER BY b.publication_year DESC
      `,
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        ...author,
        books,
        total_books: books.length
      }
    });
  } catch {
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

module.exports = router;
