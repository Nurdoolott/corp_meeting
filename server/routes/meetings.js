import express from "express";
import { pool } from "../db.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateUuid } from "../middleware/validateUuid.js";

const router = express.Router();

// Create meeting
router.post(
  "/",
  requireRole("organizer", "admin"),
  async (req, res) => {
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

// Get all meetings
router.get("/", async (req, res) => {
  let result;

  if (req.user.role === "admin") {
    result = await pool.query(
      `SELECT m.*, u.full_name AS creator_name
       FROM meetings m
       LEFT JOIN users u ON u.id = m.created_by
       ORDER BY m.meeting_date DESC`
    );
  } else if (req.user.role === "organizer") {
    result = await pool.query(
      `SELECT m.*, u.full_name AS creator_name
       FROM meetings m
       LEFT JOIN users u ON u.id = m.created_by
       WHERE m.created_by = $1
       ORDER BY m.meeting_date DESC`,
      [req.user.id]
    );
  } else if (req.user.role === "participant") {
    result = await pool.query(
      `SELECT DISTINCT m.*, u.full_name AS creator_name
       FROM meetings m
       JOIN meeting_participants mp ON mp.meeting_id = m.id
       LEFT JOIN users u ON u.id = m.created_by
       WHERE mp.user_id = $1
       ORDER BY m.meeting_date DESC`,
      [req.user.id]
    );
  } else {
    return res.status(403).json({ message: "Forbidden: unknown role" });
  }

  res.json(result.rows);
});

router.get("/:id/summary",validateUuid("id"), async (req, res) => {
  const meetingId = req.params.id;

  const meetingResult = await pool.query(
    `SELECT m.*, u.full_name AS creator_name
     FROM meetings m
     LEFT JOIN users u ON u.id = m.created_by
     WHERE m.id = $1`,
    [meetingId]
  );

  if (meetingResult.rows.length === 0) {
    return res.status(404).json({ message: "Meeting not found" });
  }

  const participantsResult = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.role
     FROM meeting_participants mp
     JOIN users u ON u.id = mp.user_id
     WHERE mp.meeting_id = $1
     ORDER BY u.full_name`,
    [meetingId]
  );

  const notesResult = await pool.query(
    `SELECT n.id, n.content, n.created_at, u.full_name AS author_name
     FROM notes n
     JOIN users u ON u.id = n.author_id
     WHERE n.meeting_id = $1
     ORDER BY n.created_at DESC`,
    [meetingId]
  );

  const tasksResult = await pool.query(
    `SELECT a.id, a.description, a.status, a.due_date, a.created_at,
            u.full_name AS assigned_to_name
     FROM action_items a
     LEFT JOIN users u ON u.id = a.assigned_to
     WHERE a.meeting_id = $1
     ORDER BY a.created_at DESC`,
    [meetingId]
  );

  res.json({
    meeting: meetingResult.rows[0],
    participants: participantsResult.rows,
    notes: notesResult.rows,
    tasks: tasksResult.rows,
  });
});

// Get one meeting by id
router.get("/:id",validateUuid("id"), async (req, res) => {
  const meetingId = req.params.id;

  const result = await pool.query(
    `SELECT m.*, u.full_name AS creator_name
     FROM meetings m
     LEFT JOIN users u ON u.id = m.created_by
     WHERE m.id = $1`,
    [meetingId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Meeting not found" });
  }

  res.json(result.rows[0]);
});

// Add participant to meeting
router.post(
  "/:id/participants",
  validateUuid("id"),
  requireRole("organizer", "admin"),
  async (req, res) => {
    const meetingId = req.params.id;
    const { user_id } = req.body ?? {};

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    const meeting = await pool.query(
      "SELECT id FROM meetings WHERE id = $1",
      [meetingId]
    );
    if (meeting.rows.length === 0) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    const user = await pool.query(
      "SELECT id FROM users WHERE id = $1",
      [user_id]
    );
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    try {
      const result = await pool.query(
        `INSERT INTO meeting_participants (meeting_id, user_id)
         VALUES ($1, $2)
         RETURNING *`,
        [meetingId, user_id]
      );

      res.json(result.rows[0]);
    } catch (e) {
      if (e.code === "23505") {
        return res.status(409).json({
          message: "User already added to this meeting",
        });
      }
      throw e;
    }
  }
);

// Get meeting participants
router.get(
  "/:id/participants",
  validateUuid("id"),
  requireRole("organizer", "admin"),
  async (req, res) => {
    const meetingId = req.params.id;

    const result = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.role
       FROM meeting_participants mp
       JOIN users u ON u.id = mp.user_id
       WHERE mp.meeting_id = $1
       ORDER BY u.full_name`,
      [meetingId]
    );

    res.json(result.rows);
  }
);
// Add note to meeting
router.post(
  "/:id/notes",
  validateUuid("id"),
  requireRole("organizer", "admin"),
  async (req, res) => {
    const meetingId = req.params.id;
    const { content } = req.body ?? {};

    if (!content) {
      return res.status(400).json({ message: "content is required" });
    }

    const meeting = await pool.query(
      "SELECT id FROM meetings WHERE id = $1",
      [meetingId]
    );

    if (meeting.rows.length === 0) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    const result = await pool.query(
      `INSERT INTO notes (meeting_id, author_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [meetingId, req.user.id, content]
    );

    res.json(result.rows[0]);
  }
);

// Get notes of a meeting
router.get(
  "/:id/notes",
  validateUuid("id"),
  async (req, res) => {
    const meetingId = req.params.id;

    const result = await pool.query(
      `SELECT n.id, n.content, n.created_at, u.full_name AS author_name
       FROM notes n
       JOIN users u ON u.id = n.author_id
       WHERE n.meeting_id = $1
       ORDER BY n.created_at DESC`,
      [meetingId]
    );

    res.json(result.rows);
  }
);

router.delete(
  "/:id",
  validateUuid("id"),
  requireRole("admin", "organizer"),
  async (req, res) => {
    const meetingId = req.params.id;

    const result = await pool.query(
      "DELETE FROM meetings WHERE id = $1 RETURNING *",
      [meetingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    res.json({
      message: "Meeting deleted successfully",
      meeting: result.rows[0],
    });
  }
);

export default router;

