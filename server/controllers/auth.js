const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const generateToken = (user) => {
    return jwt.sign(
        {
        id: user.id,
        username: user.username
        },
        process.env.JWT_SECRET,
        {expiresIn: '7d'}
    );
};

const register = async (req, res) => {
    try {
        const {username, email, password} = req.body;
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);

        if (existing.length > 0) {
            return res.status(409).json({error: 'Username or email already taken'});
        }

        const password_hash = await bcrypt.hash(password, 12);

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [result] = await connection.query('INSERT INTO users (username, email) VALUES (?, ?)', [username, email]);
            const userId = result.insertId;
            await connection.query(
                'INSERT INTO user_auth (user_id, auth_provider, password_hash) VALUES (?, ?, ?)', [userId, 'local', password_hash]
            );

            await connection.commit();
            const token = generateToken({id: userId, username});
            res.status(201).json({token, user: {id: userId, username, email}});
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch(err) {
        console.error(err);
        res.status(500).json({error: 'Registration failed'});
    }
};

const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const [users] = await pool.query(`SELECT u.id, u.username, u.email, ua.password_hash FROM users u JOIN user_auth ua ON u.id = ua.user_id WHERE u.email = ? AND ua.auth_provider = 'local'`, [email]);

        if (users.length === 0) {
            return res.status(401).json({error: 'Invalid email or password'});
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({error: 'Invalid email or password'});
        }

        const token = generateToken(user);
        res.json({token, user: {id: user.id, username: user.username, email: user.email}});
    } catch(err) {
        console.error(err);
        res.status(500).json({error: 'Login failed'});
    }
};

module.exports = {register, login, generateToken};