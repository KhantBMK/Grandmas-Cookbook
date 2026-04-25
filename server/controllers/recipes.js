const pool = require('../db/pool');

const getRecipes = async (req, res) => {
    try {
        const { search, cuisine, meal_type, tags } = req.query;

        const conditions = ['1=1'];
        const params = [];

        if (search) {
            conditions.push('r.name LIKE ?');
            params.push(`%${search}%`);
        }
        if (cuisine) {
            conditions.push('r.cuisine_type = ?');
            params.push(cuisine);
        }
        if (meal_type) {
            conditions.push('r.meal_type = ?');
            params.push(meal_type);
        }
        if (tags) {
            const tagIds = tags.split(',').map(Number);
            const placeholders = tagIds.map(() => '?').join(',');
            conditions.push(`r.id IN (SELECT recipe_id FROM tags_recipes WHERE tag_id IN (${placeholders}))`);
            params.push(...tagIds);
        }

        const whereClause = conditions.join(' AND ');

        const query = `
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
                u.username  AS author,
                EXISTS (
                    SELECT 1
                    FROM tags_recipes tr
                    JOIN tags t ON tr.tag_id = t.id
                    WHERE tr.recipe_id = r.id
                        AND t.name = 'recommended'
                        AND u.username IN ('bhone_khant', 'natalie_mendoza', 'Luke', 'alex')
                ) AS is_recommended
            FROM recipes r
            JOIN cuisines c   ON r.cuisine_type = c.id
            JOIN meal_types m ON r.meal_type    = m.id
            JOIN users u      ON r.user_id      = u.id
            WHERE ${whereClause}
            ORDER BY is_recommended DESC, r.created_at DESC
        `;

        const [rows] = await pool.query(query, params);
        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch recipes' });
    }
};

const getRecipeById = async (req, res) => {
    try {
        const { id } = req.params;
        const [recipes] = await pool.query(`
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
            FROM recipes r
            JOIN cuisines c   ON r.cuisine_type = c.id
            JOIN meal_types m ON r.meal_type    = m.id
            JOIN users u      ON r.user_id      = u.id
            WHERE r.id = ?
            `, [id]);

        if (recipes.length === 0) {
            return res.status(404).json({ error: 'Recipe not found' })
        }

        const [ingredients] = await pool.query('SELECT id, ingredient_desc FROM ingredients WHERE recipe_id = ?', [id]);

        const [instructions] = await pool.query('SELECT id, step_num, instruction_desc FROM instructions WHERE recipe_id = ? ORDER BY step_num', [id]);

        const [tags] = await pool.query(`SELECT t.id, t.name FROM tags t JOIN tags_recipes tr ON t.id = tr.tag_id WHERE tr.recipe_id = ?`, [id]);

        const recipe = {
            ...recipes[0],
            ingredients,
            instructions,
            tags
        };

        res.json(recipe);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch recipe' });
    }
};

const createRecipe = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const {
            name, prep_time, cook_time, servings, description, cuisine_id, meal_type_id, image_url, ingredients, instructions, tag_ids, new_tags
        } = req.body;

        await connection.beginTransaction();

        const [result] = await connection.query(`INSERT INTO recipes (user_id, name, prep_time, cook_time, servings, description, cuisine_type, meal_type, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [req.user.id, name, prep_time, cook_time, servings, description, cuisine_id, meal_type_id, image_url]);

        const recipeId = result.insertId;

        if (ingredients && ingredients.length > 0) {
            const ingredientRows = ingredients.map(desc => [recipeId, desc]);
            await connection.query('INSERT INTO ingredients (recipe_id, ingredient_desc) VALUES ?', [ingredientRows]);
        }

        if (instructions && instructions.length > 0) {
            const instructionRows = instructions.map((desc, index) => [recipeId, index + 1, desc]);
            await connection.query('INSERT INTO instructions (recipe_id, step_num, instruction_desc) VALUES ?', [instructionRows]);
        }

        if (tag_ids && tag_ids.length > 0) {
            const tagRows = tag_ids.map(tagId => [tagId, recipeId]);
            await connection.query('INSERT INTO tags_recipes (tag_id, recipe_id) VALUES ?', [tagRows]);
        }

        if (new_tags && new_tags.length > 0) {
            for (const tagName of new_tags) {
                await connection.query('INSERT IGNORE INTO tags (name) VALUES (?)', [tagName.trim()]);
                const [[tag]] = await connection.query('SELECT id FROM tags WHERE name = ?', [tagName.trim()]);
                await connection.query('INSERT IGNORE INTO tags_recipes (tag_id, recipe_id) VALUES (?, ?)', [tag.id, recipeId]);
            }
        }

        await connection.commit();

        res.status(201).json({ message: 'Recipe created', recipeId });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ error: 'Failed to create recipe' });
    } finally {
        connection.release();
    }
};

const updateRecipe = async (req, res) => {
    // Grab a connection from the pool so we can run multiple queries as one transaction
    const connection = await pool.getConnection();
    try {
        // Pull the recipe id from the URL (e.g. PUT /recipes/42 gives id = "42")
        const { id } = req.params;

        // Pull all the fields the client sent in the request body
        const { name, prep_time, cook_time, servings, description, cuisine_id, meal_type_id, image_url, ingredients, instructions, tag_ids, new_tags } = req.body;

        // Start a transaction — if anything below fails, all changes will be rolled back together
        await connection.beginTransaction();

        // Update the main recipe row. The WHERE clause includes user_id so a user can only edit their own recipes
        await connection.query(`UPDATE recipes SET name = ?, prep_time = ?, cook_time = ?, servings = ?, description = ?, cuisine_type = ?, meal_type = ?, image_url = ? WHERE id = ? AND user_id = ?`, [name, prep_time, cook_time, servings, description, cuisine_id, meal_type_id, image_url, id, req.user.id]);

        // Delete all existing ingredients, instructions, and tag links for this recipe.
        // It's easier to wipe and re-insert than to diff what changed
        await connection.query('DELETE FROM ingredients WHERE recipe_id = ?', [id]);
        await connection.query('DELETE FROM instructions WHERE recipe_id = ?', [id]);
        await connection.query('DELETE FROM tags_recipes WHERE recipe_id = ?', [id]);

        // Re-insert ingredients if any were provided
        if (ingredients && ingredients.length > 0) {
            // Map each description string into a row [recipe_id, description]
            const ingredientRows = ingredients.map(desc => [id, desc]);
            await connection.query('INSERT INTO ingredients (recipe_id, ingredient_desc) VALUES ?', [ingredientRows]);
        }

        // Re-insert instructions if any were provided
        if (instructions && instructions.length > 0) {
            // index + 1 gives each step a 1-based step number to preserve order
            const instructionRows = instructions.map((desc, index) => [id, index + 1, desc]);
            await connection.query('INSERT INTO instructions (recipe_id, step_num, instruction_desc) VALUES ?', [instructionRows]);
        }

        // Re-link existing tags to the recipe using their ids
        if (tag_ids && tag_ids.length > 0) {
            const tagRows = tag_ids.map(tagId => [tagId, id]);
            await connection.query('INSERT INTO tags_recipes (tag_id, recipe_id) VALUES ?', [tagRows]);
        }

        // Handle brand-new tags that don't exist in the tags table yet
        if (new_tags && new_tags.length > 0) {
            for (const tagName of new_tags) {
                // INSERT IGNORE skips the insert if a tag with that name already exists
                await connection.query('INSERT IGNORE INTO tags (name) VALUES (?)', [tagName.trim()]);
                // Fetch the id of the tag (whether it was just created or already existed)
                const [[tag]] = await connection.query('SELECT id FROM tags WHERE name = ?', [tagName.trim()]);
                // Link the tag to the recipe, ignoring duplicates
                await connection.query('INSERT IGNORE INTO tags_recipes (tag_id, recipe_id) VALUES (?, ?)', [tag.id, id]);
            }
        }

        // All queries succeeded — commit the transaction to make changes permanent
        await connection.commit();
        res.json({ message: 'Recipe updated' });
    } catch (err) {
        // Something went wrong — roll back every query in this transaction so the DB stays consistent
        await connection.rollback();
        console.error(err);
        res.status(500).json({ error: 'Failed to update recipe' });
    } finally {
        // Always release the connection back to the pool whether we succeeded or failed
        connection.release();
    }
};

const deleteRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM recipes WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        res.json({ message: 'Recipe deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete recipe' });
    }
}

module.exports = { getRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe };