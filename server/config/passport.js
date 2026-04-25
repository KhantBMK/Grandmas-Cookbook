const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('../db/pool');
const {generateToken} = require('../controllers/auth');

passport.use(new GoogleStrategy ({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL ?? 'http://localhost:3000'}/api/auth/google/callback`},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;
            const username = profile.displayName.replace(/\s+/g, '_').toLowerCase();
            const googleId = profile.id;

            const [existing] = await pool.query(`SELECT u.id, u.username, u.email FROM users u JOIN user_auth ua ON u.id = ua.user_id WHERE ua.provider_user_id = ? AND ua.auth_provider = 'google'`, [googleId]);

            if (existing.length > 0) {
                const token = generateToken(existing[0]);
                return done(null, {token});
            }

            const [byEmail] = await pool.query(
                'SELECT id, username, email FROM users WHERE email = ?', [email]
            );
            if (byEmail.length > 0) {
                await pool.query(
                    'INSERT IGNORE INTO user_auth (user_id, auth_provider, provider_user_id) VALUES (?, ?, ?)',
                    [byEmail[0].id, 'google', googleId]
                );
                const token = generateToken(byEmail[0]);
                return done(null, {token});
            }

            const connection = await pool.getConnection();
            try {
                await connection.beginTransaction();

                const [result] = await connection.query('INSERT INTO users (username, email, is_verified) VALUES (?, ?, true)', [username, email]);
                const userId = result.insertId;
                await connection.query('INSERT INTO user_auth (user_id, auth_provider, provider_user_id) VALUES (?, ?, ?)', [userId, 'google', googleId]);

                await connection.commit();
                const token = generateToken({id: userId, username});
                return done(null, {token});
            } catch (err) {
                await connection.rollback();
                throw err;
            } finally {
                connection.release();
            }
        } catch(err) {
            return done(err, null);
        }
    }
));

module.exports = passport;