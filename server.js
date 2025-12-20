import express from "express";
import cors from "cors";
import { pool } from "./config/database.js"; 
import booksRouter from "./routes/books.js";
import authorsRouter from "./routes/authors.js";
import progressRouter from "./routes/progress.js";
import quotesRouter from "./routes/quotes.js";
import reviewsRouter from "./routes/reviews.js";
import ratingsRouter from "./routes/ratings.js";

const app = express();

// Middleware
app.use(cors({
  origin: "https://book-tracker-6puf.onrender.com" // фронт
}));

app.use(express.json());

// API
app.use("/api/books", booksRouter);
app.use("/api/authors", authorsRouter);
app.use("/api/progress", progressRouter);
app.use("/api/quotes", quotesRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/ratings", ratingsRouter);

// только API, **фронт на другом хосте**, отдавать статикой не нужно

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
