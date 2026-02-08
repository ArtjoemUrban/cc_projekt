import db from "./db.js";

db.exec(`INSERT INTO role (name) VALUES
  ('admin'),
  ('user'),
  ('guest')
;

INSERT INTO user (name, email, password_hash, role_id) VALUES
  ('Alice', 'alice@example.com', 'hashed_password_1', 1);`
);

