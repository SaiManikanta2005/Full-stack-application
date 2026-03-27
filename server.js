require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize MySQL Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'subscription_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Register new user
app.post('/register', async (req, res) => {
    const { name, email, password, age } = req.body;
    
    if (!name || !email || !password || !age) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        // Check if user already exists
        const [existing] = await pool.query('SELECT email FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'User with this email already exists.' });
        }

        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password, // In a real app, hash this password with bcrypt
            age: parseInt(age),
            subscription_plan: 'None',
            subscription_status: 'Inactive',
            start_date: null,
            expiry_date: null
        };

        await pool.query(
            'INSERT INTO users (id, name, email, password, age, subscription_plan, subscription_status, start_date, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [newUser.id, newUser.name, newUser.email, newUser.password, newUser.age, newUser.subscription_plan, newUser.subscription_status, newUser.start_date, newUser.expiry_date]
        );

        res.status(201).json({ message: 'User registered successfully!', user: newUser });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Internal server error during registration.' });
    }
});

// Authenticate user
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Hardcoded admin logic from previous implementation
    if (email === 'admin@prostar.com' && password === 'admin123') {
        return res.status(200).json({ message: 'Admin login successful!', user: { id: 'admin', name: 'Admin', email: 'admin@prostar.com', role: 'admin' } });
    }

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        res.status(200).json({ message: 'Login successful!', user: users[0] });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal server error during login.' });
    }
});

// Save user subscription plan
app.post('/subscribe', async (req, res) => {
    const { id, plan } = req.body;
    const validPlans = ['FREE', 'PRO', 'PREMIUM'];

    if (!validPlans.includes(plan?.toUpperCase())) {
        return res.status(400).json({ error: 'Invalid plan selected.' });
    }

    try {
        // Check if user exists
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const startDate = new Date();
        const expiryDate = new Date();
        // Set expiry to 1 month from now
        expiryDate.setMonth(expiryDate.getMonth() + 1);

        const updatedPlan = plan.toUpperCase();
        const status = 'Active';

        await pool.query(
            'UPDATE users SET subscription_plan = ?, subscription_status = ?, start_date = ?, expiry_date = ? WHERE id = ?',
            [updatedPlan, status, startDate, expiryDate, id]
        );

        // Fetch the updated user
        const [updatedUsers] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);

        res.status(200).json({ message: 'Subscription updated successfully!', user: updatedUsers[0] });
    } catch (error) {
        console.error('Subscribe Error:', error);
        res.status(500).json({ error: 'Internal server error during subscription.' });
    }
});

// Update user profile
app.put('/user/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, age } = req.body;

    if (!name || !email || !age) {
        return res.status(400).json({ error: 'Name, email, and age are required.' });
    }

    try {
        // Check if email is already taken by another user
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email is already in use by another account.' });
        }

        await pool.query(
            'UPDATE users SET name = ?, email = ?, age = ? WHERE id = ?',
            [name, email, parseInt(age), id]
        );

        const [updatedUsers] = await pool.query('SELECT id, name, email, age, subscription_plan, subscription_status, start_date, expiry_date FROM users WHERE id = ?', [id]);
        
        if (updatedUsers.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({ message: 'Profile updated successfully!', user: updatedUsers[0] });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ error: 'Internal server error updating profile.' });
    }
});

// Return user subscription details
app.get('/user/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [users] = await pool.query('SELECT id, name, email, age, subscription_plan, subscription_status, start_date, expiry_date FROM users WHERE id = ?', [id]);

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({ user: users[0] });
    } catch (error) {
        console.error('Fetch User Error:', error);
        res.status(500).json({ error: 'Internal server error fetching user.' });
    }
});

// Admin get users
app.get('/admin/users', async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, name, email, age, subscription_plan, subscription_status, start_date, expiry_date FROM users');
        res.status(200).json({ users });
    } catch (error) {
        console.error('Fetch Admin Users Error:', error);
        res.status(500).json({ error: 'Internal server error fetching users list.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Database configuration: Host: ${process.env.DB_HOST}, User: ${process.env.DB_USER}, Database: ${process.env.DB_NAME}`);
});
