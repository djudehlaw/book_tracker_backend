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

router.post("/", async (req, res) => {
  const { title, isbn, publication_year, description, cover_url, author_first_name, author_last_name, author_birth_date } = req.body;
  const client = await pool.connect();
  try {
  await client.query('BEGIN');

  // Проверка автора и добавление книги
  let authorRes = await client.query(
    `SELECT author_id FROM authors WHERE first_name=$1 AND last_name=$2`,
    [author_first_name, author_last_name]
  );

  let author_id;
  if (authorRes.rows.length > 0) {
    author_id = authorRes.rows[0].id;
  } else {
    const newAuthor = await client.query(
      `INSERT INTO authors (first_name, last_name, birth_date) VALUES ($1,$2,$3) RETURNING id`,
      [author_first_name, author_last_name, author_birth_date || null]
    );
    author_id = newAuthor.rows[0].id;
  }

  const newBook = await client.query(
    `INSERT INTO books (title, isbn, publication_year, description, cover_url)
     VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [title, isbn, publication_year || null, description, cover_url || null]
  );
  const book_id = newBook.rows[0].id;

  await client.query(
    `INSERT INTO book_authors (book_id, author_id) VALUES ($1,$2)`,
    [book_id, author_id]
  );

  await client.query('COMMIT');

  // ✅ Отправляем JSON ответ
  res.status(201).json({ book_id });

} catch (err) {
  await client.query('ROLLBACK');
  console.error(err);
  res.status(500).json({ error: 'Ошибка при добавлении книги' });
} finally {
  client.release(); // release только после res.json
}
});

export default router;
