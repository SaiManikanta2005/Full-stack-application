require('dotenv').config();
const mysql = require('mysql2/promise');

async function initializeDatabase() {
    try {
        // Connect to MySQL server without database selected
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        const dbName = process.env.DB_NAME || 'subscription_db';

        // Create database if it doesn't exist
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`Database '${dbName}' checked/created.`);

        // Use the database
        await connection.query(`USE \`${dbName}\``);

        // Create users table
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                age INT NOT NULL,
                subscription_plan VARCHAR(50) DEFAULT 'None',
                subscription_status VARCHAR(50) DEFAULT 'Inactive',
                start_date DATETIME,
                expiry_date DATETIME
            )
        `;
        await connection.query(createTableQuery);
        console.log('Table "users" checked/created.');

        await connection.end();
        console.log('Database initialization completed successfully.');

    } catch (error) {
        console.error('Error initializing database:', error.message);
        process.exit(1);
    }
}

initializeDatabase();
