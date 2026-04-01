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
    database: 'order_management'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database');
});

app.get('/orders', (req, res) => {
    const query = `
        SELECT c.name AS customer, p.name AS product, o.quantity,
        p.price, (o.quantity * p.price) AS total_amount, o.order_date
        FROM orders o
        JOIN customers c ON o.customer_id = c.id
        JOIN products p ON o.product_id = p.id
        ORDER BY o.order_date DESC
    `;
    db.query(query, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

app.get('/highest-order', (req, res) => {
    const query = `
        SELECT c.name, p.name AS product, o.quantity,
        (o.quantity * p.price) AS total_amount
        FROM orders o
        JOIN customers c ON o.customer_id = c.id
        JOIN products p ON o.product_id = p.id
        WHERE (o.quantity * p.price) = (
            SELECT MAX(quantity * price)
            FROM orders o2
            JOIN products p2 ON o2.product_id = p2.id
        )
    `;
    db.query(query, (err, result) => {
        if (err) {return res.status(500).json(err);}
        res.json(result);
    });
});

app.get('/most-active', (req, res) => {
    const query = `
        SELECT name
        FROM customers
        WHERE id = (
            SELECT customer_id
            FROM orders
            GROUP BY customer_id
            ORDER BY COUNT(*) DESC
            LIMIT 1
        )
    `;
    db.query(query, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

app.listen(3000,()=>{
    console.log('Server running on port 3000');
});