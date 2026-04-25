const pool = require('../db/pool');

const saveRecipe = async (req, res) => {
    try {
        const {id} = req.params;
        const user_id = req.user.id;
        await pool.query('INSERT IGNORE INTO saved_recipes (user_id, recipe_id) VALUES (?, ?)', [user_id, id]);

        res.json({message: 'Recipe saved'});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Failed to save recipe'});
    }
};

const unsaveRecipe = async (req, res) => {
    try {
        const {id} = req.params;
        const user_id = req.user.id;

        await pool.query('DELETE FROM saved_recipes WHERE user_id = ? AND recipe_id = ?', [user_id, id]);

        res.json({message: 'Recipe unsaved'});
    } catch(err) {
        console.error(err);
        res.status(500).json({error: 'Failed to unsave recipe'});
    }
};

const getSavedRecipes = async (req, res) => {
    try {
        const {id} = req.params;

        const [rows] = await pool.query(`
            SELECT
                r.id,
                r.name,
                r.prep_time,
                r.cook_time,
                r.image_url,
                r.description,
                r.servings,
                c.name      AS cuisine,
                m.name      AS meal_type,
                u.username  AS author
            FROM saved_recipes sr
            JOIN recipes r    ON sr.recipe_id   = r.id
            JOIN cuisines c   ON r.cuisine_type = c.id
            JOIN meal_types m ON r.meal_type    = m.id
            JOIN users u      ON r.user_id      = u.id
            WHERE sr.user_id = ?
            ORDER BY sr.created_at DESC
            `, [id]);

            res.json(rows);
    } catch(err) {
        console.error(err);
        res.status(500).json({error: 'Failed to fetch saved recipes'});
    }
};

module.exports = {saveRecipe, unsaveRecipe, getSavedRecipes};