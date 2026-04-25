const pool = require('../db/pool');

const getCuisines = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM cuisines ORDER BY name');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Failed to fetch cuisines'});
    }
}

const getMealTypes = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM meal_types ORDER BY name');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Failed to fetch meal types'});
    }
}

const getTags = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tags ORDER BY name');
        res.json(rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Failed to fetch tags"});
    }
}

module.exports = {getCuisines, getMealTypes, getTags}