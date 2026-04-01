const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'VTU25500',
    database: 'student_data'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database');
});


app.get('/students', (req, res) => {
    const query = 'SELECT username, email, dept, DOB FROM student';

    db.query(query, (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, data: result });
    });
});


app.get('/students/sort/name', (req, res) => {
    const query = 'SELECT username, email, dept, DOB FROM student ORDER BY username ASC';

    db.query(query, (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, data: result });
    });
});


app.get('/students/sort/dob', (req, res) => {
    const query = 'SELECT username, email, dept, DOB FROM student ORDER BY DOB ASC';

    db.query(query, (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, data: result });
    });
});


app.get('/students/filter/:dept', (req, res) => {
    const { dept } = req.params;

    const query = 'SELECT username, email, dept, DOB FROM student WHERE dept = ?';

    db.query(query, [dept], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, data: result });
    });
});


app.get('/students/count', (req, res) => {
    const query = 'SELECT dept, COUNT(*) as total FROM student GROUP BY dept';

    db.query(query, (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, data: result });
    });
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});