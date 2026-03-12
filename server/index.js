import express from "express";
import cors from "cors";
import "dotenv/config";
import { pool } from "./db.js";
import meetingsRouter from "./routes/meetings.js";
import tasksRouter from "./routes/tasks.js";
import { auth } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true
}));
app.use(express.json());

app.use("/api", auth);

app.get("/api/me", (req, res) => {
  res.json(req.user);
});

app.use("/api/meetings", meetingsRouter);

app.use("/api/tasks", tasksRouter);

app.get("/api/health", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json({ ok: true, db_time: result.rows[0].now });
});
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`API: http://localhost:${process.env.PORT}`);
});
console.log("PORT =", process.env.PORT);