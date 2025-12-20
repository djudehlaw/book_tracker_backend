import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

// --- helpers для __dirname ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { pool } from "./config/database.js"; // твои API функции

// --- маршруты API ---
import booksRouter from "./routes/books.js";
import authorsRouter from "./routes/authors.js";
import progressRouter from "./routes/progress.js";
import quotesRouter from "./routes/quotes.js";
import reviewsRouter from "./routes/reviews.js";
import ratingsRouter from "./routes/ratings.js";

const app = express();
app.use(cors());
app.use(express.json());

// API
app.use("/api/books", booksRouter);
app.use("/api/authors", authorsRouter);
app.use("/api/progress", progressRouter);
app.use("/api/quotes", quotesRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/ratings", ratingsRouter);

// --- отдаём фронт ---
app.use(express.static(path.join(__dirname, "frontend/dist")));

// fallback для React Router
app.get("/api/authors", (req, res) => {
  // возвращаем JSON с авторами
});

app.get("/api/authors/:id", (req, res) => {
  // возвращаем JSON одного автора
});

// catch-all для фронта — только после API
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));