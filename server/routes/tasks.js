import express from "express";
import { pool } from "../db.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

// create task
router.post("/:meetingId", 
    requireRole("organizer", "admin"),
    async (req, res) => {
  const { description, assigned_to, due_date } = req.body ?? {};
  const { meetingId } = req.params;

  if (!description) {
    return res.status(400).json({ message: "description required" });
  }

  const result = await pool.query(
    `INSERT INTO action_items (meeting_id, description, assigned_to, due_date)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [meetingId, description, assigned_to, due_date]
  );

  res.json(result.rows[0]);
});

// mark done
router.patch("/:taskId/done", async (req, res) => {
  const { taskId } = req.params;

  const result = await pool.query(
    "SELECT * FROM action_items WHERE id = $1",
    [taskId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Task not found" });
  }

  const task = result.rows[0];

  if (task.assigned_to !== req.user.id) {
    return res.status(403).json({ message: "Only assigned user can complete this task" });
  }

  const updated = await pool.query(
    `UPDATE action_items
     SET status = 'done'
     WHERE id = $1
     RETURNING *`,
    [taskId]
  );

  res.json(updated.rows[0]);
});

export default router;