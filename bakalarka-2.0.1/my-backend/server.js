// server.js
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 30306;

// Connect to SQLite database
const db = new sqlite3.Database(':memory:'); // Use an actual file path for a persistent database

app.use(bodyParser.json());

// Example endpoint for login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Your authentication logic here, interact with the database
  db.serialize(() => {
    // Create a users table if not exists
    db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)');

    // Check the credentials against the database
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.get(query, [username, password], (err, row) => {
      if (row) {
        res.json({ success: true, message: 'Login successful' });
      } else {
        res.json({ success: false, message: 'Invalid credentials' });
      }
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
