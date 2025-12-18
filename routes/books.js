const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 🔍 ПОИСК КНИГ (ВАЖНО: ВЫШЕ /:id)
router.get('/search/:query', async (req, res) => {
  try {
    const searchQuery = `%${req.params.query}%`;

    const [books] = await pool.query(
      `
      SELECT 
        b.book_id as id,
        b.title,
        b.publication_year,
        b.description
      FROM books b
      WHERE b.title LIKE ? OR b.description LIKE ?
      LIMIT 10
      `,
      [searchQuery, searchQuery]
    );

    res.json({
      success: true,
      data: books,
      count: books.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// 📚 ПОЛУЧЕНИЕ ВСЕХ КНИГ
router.get('/', async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [books] = await pool.query(
      `
      SELECT 
        b.book_id as id,
        b.title,
        b.isbn,
        b.publication_year,
        b.description,
        b.cover_url,
        GROUP_CONCAT(CONCAT(a.first_name, ' ', a.last_name)) as authors
      FROM books b
      LEFT JOIN book_authors ba ON b.book_id = ba.book_id
      LEFT JOIN authors a ON ba.author_id = a.author_id
      GROUP BY b.book_id
      ORDER BY b.title
      LIMIT ? OFFSET ?
      `,
      [limit, offset]
    );

    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM books'
    );

    res.json({
      success: true,
      data: books.map(b => ({
        ...b,
        authors: b.authors ? b.authors.split(',') : []
      })),
      pagination: {
        total: countResult[0].total,
        page,
        limit,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// 📚 ПОЛУЧЕНИЕ ОДНОЙ КНИГИ
router.get('/:id', async (req, res) => {
  try {
    const [books] = await pool.query(
      `
      SELECT 
        b.book_id as id,
        b.title,
        b.isbn,
        b.publication_year,
        b.description,
        b.cover_url,
        GROUP_CONCAT(CONCAT(a.first_name, ' ', a.last_name)) as authors
      FROM books b
      LEFT JOIN book_authors ba ON b.book_id = ba.book_id
      LEFT JOIN authors a ON ba.author_id = a.author_id
      WHERE b.book_id = ?
      GROUP BY b.book_id
      `,
      [req.params.id]
    );

    if (!books.length) {
      return res.status(404).json({ success: false, error: 'Книга не найдена' });
    }

    res.json({
      success: true,
      data: {
        ...books[0],
        authors: books[0].authors ? books[0].authors.split(',') : []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// Обновление информации о книге (статус, прогресс)
router.patch('/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    const { status, pages_read, progress } = req.body;

    const updates = [];
    const values = [];

    if (status) {
      updates.push('status = ?');
      values.push(status);
    }
    if (pages_read !== undefined) {
      updates.push('pages_read = ?');
      values.push(pages_read);
    }
    if (progress !== undefined) {
      updates.push('progress = ?');
      values.push(progress);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'Нет данных для обновления' });
    }

    values.push(bookId);

    await pool.query(
      `UPDATE books SET ${updates.join(', ')} WHERE book_id = ?`,
      values
    );

    res.json({ success: true, message: 'Данные книги обновлены' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});


module.exports = router;
