const express = require('express');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

// PostgreSQL database configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '211201',
    port: 5432, // default PostgreSQL port
});

app.use(express.json());

// Endpoint for user login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Query the database to fetch the user with the provided username
        const queryResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = queryResult.rows[0];

        // If no user found or password doesn't match, return error
        if (!user || !bcrypt.compareSync(password, user.password_hash)) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Authentication successful
        res.json({ message: 'Login successful', userType: user.user_type });
    } catch (error) {
        console.error('Error while querying database:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Endpoint for user registration
app.post('/register', async (req, res) => {
    const { username, password, userType } = req.body;

    try {
        // Check if the username already exists in the database
        const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash the password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Insert the new user into the database
        await pool.query('INSERT INTO users (username, password_hash, user_type) VALUES ($1, $2, $3)', [username, hashedPassword, userType]);

        // Registration successful
        res.json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Error while registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


const cors = require('cors');
app.use(cors());

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
