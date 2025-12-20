import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import { pool, testConnection } from "./config/database.js";

import booksRouter from "./routes/books.js";
import authorsRouter from "./routes/authors.js";
import progressRouter from "./routes/progress.js";
import quotesRouter from "./routes/quotes.js";
import reviewsRouter from "./routes/reviews.js";
import ratingsRouter from "./routes/ratings.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend/dist")));


// Тестовый маршрут
app.get("/", (req, res) => {
  res.json({
    message: "📚 Book Tracker API работает",
    endpoints: {
      books: "/books",
      authors: "/authors",
    },
  });
});

// Тест подключения к базе
app.get("/api/test-db", async (req, res) => {
  try {
    const ok = await testConnection();
    if (!ok) throw new Error();

    const [[books]] = await pool.query("SELECT COUNT(*) as c FROM books");
    const [[authors]] = await pool.query("SELECT COUNT(*) as c FROM authors");

    res.json({
      success: true,
      stats: {
        books: books.c,
        authors: authors.c,
      },
    });
  } catch {
    res.status(500).json({ success: false });
  }
});

// Роуты
app.use("/books", booksRouter);
app.use("/authors", authorsRouter);
app.use("/progress", progressRouter);
app.use("/quotes", quotesRouter);
app.use("/reviews", reviewsRouter);
app.use("/ratings", ratingsRouter);

// fallback на 404 для всех остальных
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));