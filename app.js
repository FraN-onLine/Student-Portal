const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

function requireRole(role) {
    return (req, res, next) => {
        if (req.user && req.user.role === role) {
            next();
        } else {
            res.status(403).json({ message: 'Access denied' });
        }
    };
}

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'portal_database'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database');
});

// Routes

// Register a new user (student or professor)
app.post('/register', (req, res) => {
    const { name, email, password, role, course } = req.body;
    const query = 'INSERT INTO users (name, email, password, role, course) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [name, email, password, role, course || null], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error registering user' });
        } else {
            res.status(201).json({ message: 'Registration successful' });
        }
    });
});

// Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error logging in' });
        } else if (results.length === 0) {
            res.status(401).json({ message: 'Invalid credentials' });
        } else {
            res.status(200).json({ message: 'Login successful', user: results[0] });
        }
    });
});

// Fetch personal info
app.get('/user/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT id, name, email, course, role, profile_picture FROM users WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching user info' });
        } else if (results.length === 0) {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.status(200).json(results[0]);
        }
    });
});

// Update user profile picture
app.put('/user/:id/picture', (req, res) => {
    const { id } = req.params;
    const { profile_picture } = req.body;
    const query = 'UPDATE users SET profile_picture = ? WHERE id = ?';
    db.query(query, [profile_picture, id], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error updating profile picture' });
        } else {
            res.status(200).json({ message: 'Profile picture updated successfully' });
        }
    });
});

// Fetch subjects by course
app.get('/subjects/:course', (req, res) => {
    const { course } = req.params;
    const query = 'SELECT * FROM subjects WHERE course = ?';
    db.query(query, [course], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching subjects' });
        } else {
            res.status(200).json(results);
        }
    });
});

// Search for subjects
app.get('/search/subjects', (req, res) => {
    const { query } = req.query;
    const searchQuery = 'SELECT * FROM subjects WHERE name LIKE ?';
    db.query(searchQuery, [`%${query}%`], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error searching for subjects' });
        } else {
            res.status(200).json(results);
        }
    });
});

// Enroll in a subject
app.post('/enroll', (req, res) => {
    const { student_id, subject_id } = req.body;
    const checkQuery = 'SELECT * FROM student_subjects WHERE student_id = ? AND subject_id = ?';
    db.query(checkQuery, [student_id, subject_id], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error checking enrollment' });
        } else if (results.length > 0) {
            res.status(400).json({ message: 'Already enrolled in this subject' });
        } else {
            const query = 'INSERT INTO student_subjects (student_id, subject_id) VALUES (?, ?)';
            db.query(query, [student_id, subject_id], (err, result) => {
                if (err) {
                    res.status(500).json({ error: 'Error enrolling in subject' });
                } else {
                    res.status(201).json({ message: 'Subject enrolled successfully' });
                }
            });
        }
    });
});

// Drop a subject
app.delete('/drop', (req, res) => {
    const { student_id, subject_id } = req.body;
    const query = 'DELETE FROM student_subjects WHERE student_id = ? AND subject_id = ?';
    db.query(query, [student_id, subject_id], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error dropping subject' });
        } else {
            res.status(200).json({ message: 'Subject dropped successfully' });
        }
    });
});

// Fetch grades
app.get('/grades/:student_id', (req, res) => {
    const { student_id } = req.params;
    const query = `
        SELECT s.name AS subject_name, ss.grade
        FROM student_subjects ss
        JOIN subjects s ON ss.subject_id = s.id
        WHERE ss.student_id = ?`;
    db.query(query, [student_id], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching grades' });
        } else {
            res.status(200).json(results);
        }
    });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
