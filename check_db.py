import sqlite3
import json

conn = sqlite3.connect('login_app.db')
conn.row_factory = sqlite3.Row
c = conn.cursor()

print("=== USERS IN DB ===")
c.execute('SELECT id, full_name, email, password_hash FROM users')
users = [dict(r) for r in c.fetchall()]
for u in users:
    print(f"  ID:{u['id']} | {u['full_name']} | {u['email']}")
    print(f"    hash: {u['password_hash']}")

if not users:
    print("  (no users found)")

print("\n=== RECENT LOGIN ATTEMPTS ===")
c.execute('SELECT * FROM login_attempts ORDER BY id DESC LIMIT 10')
attempts = [dict(r) for r in c.fetchall()]
for a in attempts:
    print(f"  {a['username_or_email']} | success={a['success']} | {a['attempted_at']}")

if not attempts:
    print("  (no login attempts)")

conn.close()
