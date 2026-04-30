require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Health check
app.get('/', (req, res) => {
    res.json({message: "Grandmas Cookbook API is running"});
});

// Routes
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reference', require('./routes/reference'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/ai', require('./routes/ai'));

// Server listening
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});