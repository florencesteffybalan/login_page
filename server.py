"""
Secure Login - Backend Server
=============================
A lightweight Python HTTP server with SQLite database for user management.
Handles: Registration, Login, Forgot Password requests.

Usage: python server.py
Server runs on http://localhost:3000
"""

import http.server
import json
import sqlite3
import hashlib
import os
import datetime
import uuid
from urllib.parse import urlparse

# =============================================
#  DATABASE SETUP
# =============================================
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'login_app.db')

def init_db():
    """Initialize the SQLite database and create tables if they don't exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Users table - stores registered accounts
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            last_login TEXT,
            is_active INTEGER NOT NULL DEFAULT 1
        )
    ''')

    # Login attempts - logs all sign-in attempts
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS login_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username_or_email TEXT NOT NULL,
            success INTEGER NOT NULL DEFAULT 0,
            ip_address TEXT,
            attempted_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    ''')

    # Password reset requests
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS password_resets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            reset_token TEXT NOT NULL,
            requested_at TEXT NOT NULL DEFAULT (datetime('now')),
            used INTEGER NOT NULL DEFAULT 0
        )
    ''')

    conn.commit()
    conn.close()
    print(f"[DB] Database initialized at: {DB_PATH}")


def get_db():
    """Get a database connection with row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# =============================================
#  REQUEST HANDLER
# =============================================
class LoginAppHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP handler that serves static files and handles API routes."""

    def do_POST(self):
        """Handle POST requests for API endpoints."""
        path = urlparse(self.path).path

        if path == '/api/register':
            self.handle_register()
        elif path == '/api/login':
            self.handle_login()
        elif path == '/api/forgot-password':
            self.handle_forgot_password()
        else:
            self.send_json(404, {'error': 'Endpoint not found'})

    def do_GET(self):
        """Handle GET requests - serve static files + API routes."""
        path = urlparse(self.path).path

        if path == '/api/users':
            self.handle_get_users()
        elif path == '/api/stats':
            self.handle_get_stats()
        else:
            # Serve static files (default behavior)
            super().do_GET()

    # ----- API: Register -----
    def handle_register(self):
        """Register a new user account."""
        try:
            data = self.read_json_body()
            name = data.get('name', '').strip()
            email = data.get('email', '').strip().lower()
            password_hash = data.get('passwordHash', '').strip()

            # Validation
            if not name or not email or not password_hash:
                self.send_json(400, {'error': 'All fields are required'})
                return

            conn = get_db()
            cursor = conn.cursor()

            # Check if email already exists
            cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
            if cursor.fetchone():
                conn.close()
                self.send_json(409, {'error': 'An account with this email already exists'})
                return

            # Insert new user
            cursor.execute(
                'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)',
                (name, email, password_hash)
            )
            conn.commit()
            user_id = cursor.lastrowid
            conn.close()

            print(f"[REGISTER] New user: {name} ({email}) - ID: {user_id}")
            self.send_json(201, {
                'message': 'Account created successfully',
                'userId': user_id
            })

        except Exception as e:
            print(f"[ERROR] Registration failed: {e}")
            self.send_json(500, {'error': 'Registration failed'})

    # ----- API: Login -----
    def handle_login(self):
        """Authenticate a user."""
        try:
            data = self.read_json_body()
            username = data.get('username', '').strip()
            password_hash = data.get('passwordHash', '').strip()

            if not username or not password_hash:
                self.send_json(400, {'error': 'Username and password are required'})
                return

            conn = get_db()
            cursor = conn.cursor()

            # Look up user by email (username field accepts email)
            cursor.execute(
                'SELECT id, full_name, email, password_hash FROM users WHERE email = ?',
                (username.lower(),)
            )
            user = cursor.fetchone()

            # Log the attempt
            success = user is not None and user['password_hash'] == password_hash
            client_ip = self.client_address[0] if self.client_address else 'unknown'
            cursor.execute(
                'INSERT INTO login_attempts (username_or_email, success, ip_address) VALUES (?, ?, ?)',
                (username, 1 if success else 0, client_ip)
            )

            if success:
                # Update last login timestamp
                cursor.execute(
                    'UPDATE users SET last_login = datetime("now") WHERE id = ?',
                    (user['id'],)
                )
                conn.commit()
                conn.close()

                print(f"[LOGIN] Success: {user['full_name']} ({user['email']})")
                self.send_json(200, {
                    'message': 'Login successful',
                    'user': {
                        'id': user['id'],
                        'name': user['full_name'],
                        'email': user['email']
                    }
                })
            else:
                conn.commit()
                conn.close()
                print(f"[LOGIN] Failed attempt for: {username}")
                self.send_json(401, {'error': 'Invalid username or password'})

        except Exception as e:
            print(f"[ERROR] Login failed: {e}")
            self.send_json(500, {'error': 'Login failed'})

    # ----- API: Forgot Password -----
    def handle_forgot_password(self):
        """Handle a password reset request."""
        try:
            data = self.read_json_body()
            email = data.get('email', '').strip().lower()

            if not email:
                self.send_json(400, {'error': 'Email is required'})
                return

            conn = get_db()
            cursor = conn.cursor()

            # Check if user exists
            cursor.execute('SELECT id, full_name FROM users WHERE email = ?', (email,))
            user = cursor.fetchone()

            # Generate a reset token regardless (don't reveal if email exists)
            reset_token = uuid.uuid4().hex

            if user:
                cursor.execute(
                    'INSERT INTO password_resets (email, reset_token) VALUES (?, ?)',
                    (email, reset_token)
                )
                conn.commit()
                print(f"[RESET] Password reset requested for: {email} (token: {reset_token[:8]}...)")
            else:
                print(f"[RESET] Reset requested for non-existent email: {email}")

            conn.close()

            # Always return success (security: don't reveal if email exists)
            self.send_json(200, {
                'message': 'If an account exists with this email, a reset link has been sent'
            })

        except Exception as e:
            print(f"[ERROR] Forgot password failed: {e}")
            self.send_json(500, {'error': 'Could not process reset request'})

    # ----- API: Get Users (Admin) -----
    def handle_get_users(self):
        """Get all registered users (for demonstration)."""
        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute(
                'SELECT id, full_name, email, created_at, last_login, is_active FROM users ORDER BY created_at DESC'
            )
            users = [dict(row) for row in cursor.fetchall()]
            conn.close()

            self.send_json(200, {'users': users, 'count': len(users)})

        except Exception as e:
            print(f"[ERROR] Get users failed: {e}")
            self.send_json(500, {'error': 'Could not fetch users'})

    # ----- API: Get Stats -----
    def handle_get_stats(self):
        """Get database statistics."""
        try:
            conn = get_db()
            cursor = conn.cursor()

            cursor.execute('SELECT COUNT(*) as count FROM users')
            total_users = cursor.fetchone()['count']

            cursor.execute('SELECT COUNT(*) as count FROM login_attempts')
            total_logins = cursor.fetchone()['count']

            cursor.execute('SELECT COUNT(*) as count FROM login_attempts WHERE success = 1')
            successful_logins = cursor.fetchone()['count']

            cursor.execute('SELECT COUNT(*) as count FROM password_resets')
            total_resets = cursor.fetchone()['count']

            conn.close()

            self.send_json(200, {
                'totalUsers': total_users,
                'totalLoginAttempts': total_logins,
                'successfulLogins': successful_logins,
                'failedLogins': total_logins - successful_logins,
                'passwordResetRequests': total_resets
            })

        except Exception as e:
            print(f"[ERROR] Get stats failed: {e}")
            self.send_json(500, {'error': 'Could not fetch stats'})

    # ----- Utility Methods -----
    def read_json_body(self):
        """Read and parse JSON from request body."""
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        return json.loads(body)

    def send_json(self, status_code, data):
        """Send a JSON response."""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode('utf-8'))

    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def log_message(self, format, *args):
        """Override to add timestamp to log messages."""
        timestamp = datetime.datetime.now().strftime('%H:%M:%S')
        print(f"[{timestamp}] {args[0]}")


# =============================================
#  START SERVER
# =============================================
def main():
    PORT = 3000
    init_db()

    handler = LoginAppHandler
    server = http.server.HTTPServer(('', PORT), handler)

    print(f"\n{'='*50}")
    print(f"  Secure Login Server Running")
    print(f"  URL: http://localhost:{PORT}")
    print(f"  Database: {DB_PATH}")
    print(f"{'='*50}")
    print(f"\n  API Endpoints:")
    print(f"    POST /api/register        - Create account")
    print(f"    POST /api/login            - Sign in")
    print(f"    POST /api/forgot-password  - Request reset")
    print(f"    GET  /api/users            - List all users")
    print(f"    GET  /api/stats            - Database stats")
    print(f"\n  Press Ctrl+C to stop\n")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[SERVER] Shutting down...")
        server.shutdown()


if __name__ == '__main__':
    main()
