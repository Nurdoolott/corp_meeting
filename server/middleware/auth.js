import { pool } from "../db.js";


export async function auth(req, res, next) {
  const userId = req.header("x-user-id");

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: x-user-id header required" });
  }

  let result;
  try {
   result = await pool.query(
    "SELECT id, full_name, email, role FROM users WHERE id = $1",
    [userId]
  )
  } catch (error) {
  return res.status(500).json({ message: "Database error" });
  };

  if (result.rows.length === 0) {
    return res.status(401).json({ message: "User not found" });
  }

  req.user = result.rows[0];
  next();
}