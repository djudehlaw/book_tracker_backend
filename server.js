import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";

import { pool, testConnection } from "./config/database.js";

import booksRouter from "./routes/books.js";
import authorsRouter from "./routes/authors.js";
import progressRouter from "./routes/progress.js";
import quotesRouter from "./routes/quotes.js";
import reviewsRouter from "./routes/reviews.js";
import ratingsRouter from "./routes/ratings.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// фикс __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// если это фронт
app.use(express.static(path.join(__dirname, "dev")));

app.get("/", (req, res) => {
  res.json({
    message: "📚 Book Tracker API работает",
    endpoints: {
      books: "/books",
      authors: "/authors",
    },
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    await testConnection();

    const [[books]] = await pool.query("SELECT COUNT(*) as c FROM books");
    const [[authors]] = await pool.query("SELECT COUNT(*) as c FROM authors");

    res.json({
      success: true,
      stats: {
        books: books.c,
        authors: authors.c,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

// роуты
app.use("/books", booksRouter);
app.use("/authors", authorsRouter);
app.use("/progress", progressRouter);
app.use("/quotes", quotesRouter);
app.use("/reviews", reviewsRouter);
app.use("/ratings", ratingsRouter);

// SPA fallback — В САМОМ КОНЦЕ
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dev", "index.html"));
});

app.listen(PORT, () =>
  console.log(`Server started on port ${PORT}`)
);
