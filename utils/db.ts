// utils/db.ts
// ─── MongoDB/Mongoose has been replaced by NeonDB (PostgreSQL) ────────────────
// Auth and user data now live in NeonDB via the Express backend.
// This file is kept as a no-op so any remaining imports don't break,
// but nothing here connects to MongoDB anymore.

const connect = async () => {
  // No-op: DB connection is handled by the Express backend (gleam-backend)
  // which connects to NeonDB (PostgreSQL) via utils/db.js → pg Pool.
  return;
};

export default connect;
