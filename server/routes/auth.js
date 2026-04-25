const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const {register, login} = require('../controllers/auth');

router.post('/register', register);
router.post('/login', login);

router.get('/google', passport.authenticate('google', {scope: ['profile', 'email'], session: false}));

router.get('/google/callback', passport.authenticate('google', {session: false, failureRedirect: '/login'}), (req, res) => {const {token} = req.user; res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);});

module.exports = router;