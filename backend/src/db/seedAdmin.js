import bcrypt from 'bcrypt';

export function seedAdminUser(db) {
  const existing = db.prepare("SELECT id FROM users WHERE role = ?").get('admin');
  if (existing) return;
  const hash = bcrypt.hashSync(process.env.INITIAL_ADMIN_PASSWORD, 10);
  db.prepare(
    "INSERT INTO users (prename, surname, email, username, password, role, created_at) VALUES ('admin', 'admin', 'placeholder', ?, ?, 'admin', CURRENT_TIMESTAMP)"
  ).run(process.env.INITIAL_ADMIN_USER, hash);
  console.log(`Admin user '${process.env.INITIAL_ADMIN_USER}' created.`);
}
