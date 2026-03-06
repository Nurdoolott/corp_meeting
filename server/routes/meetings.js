import express from "express";
import { pool } from "../db.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.post(
  "/",
  requireRole("organizer", "admin"),
  async (req, res) => {
    console.log("USER in POST /meetings:", req.user);
    const { title, description, meeting_date } = req.body ?? {};

    if (!title || !meeting_date) {
      return res.status(400).json({ message: "title and meeting_date required" });
    }

    const result = await pool.query(
      `INSERT INTO meetings (title, description, meeting_date, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, description, meeting_date, req.user.id]
    );

    res.json(result.rows[0]);
  }
);

router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM meetings ORDER BY meeting_date DESC");
  res.json(result.rows);
});

export default router;