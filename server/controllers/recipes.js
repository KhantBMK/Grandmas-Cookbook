const pool = require('../db/pool');

const getRecipes = async (req, res) => {
    try {
        const {search, cuisine, meal_type, tags} = req.query;

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
                u.username  AS author
            FROM recipes r
            JOIN cuisines c   ON r.cuisine_type = c.id
            JOIN meal_types m ON r.meal_type    = m.id
            JOIN users u      ON r.user_id      = u.id
            WHERE ${whereClause}
            ORDER BY r.created_at DESC
        `;

        const [rows] = await pool.query(query, params);
        res.json(rows);

    } catch(err) {
        console.error(err);
        res.status(500).json({error: 'Failed to fetch recipes'});
    }
};

const getRecipeById = async (req, res) => {
    try {
        const {id} = req.params;
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
                return res.status(404).json({error: 'Recipe not found'})
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
        res.status(500).json({error: 'Failed to fetch recipe'});
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

        res.status(201).json({message: 'Recipe created', recipeId});
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({error: 'Failed to create recipe'});
    } finally {
        connection.release();
    }
};

const updateRecipe = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const {id} = req.params;
        const {name, prep_time, cook_time, servings, description, cuisine_id, meal_type_id, image_url, ingredients, instructions, tag_ids, new_tags} = req.body;
        await connection.beginTransaction();
        await connection.query(`UPDATE recipes SET name = ?, prep_time = ?, cook_time = ?, servings = ?, description = ?, cuisine_type = ?, meal_type = ?, image_url = ? WHERE id = ? AND user_id = ?`, [name, prep_time, cook_time, servings, description, cuisine_id, meal_type_id, image_url, id, req.user.id]);
        await connection.query('DELETE FROM ingredients WHERE recipe_id = ?', [id]);
        await connection.query('DELETE FROM instructions WHERE recipe_id = ?', [id]);
        await connection.query('DELETE FROM tags_recipes WHERE recipe_id = ?', [id]);

        if (ingredients && ingredients.length > 0) {
            const ingredientRows = ingredients.map(desc => [id, desc]);
            await connection.query('INSERT INTO ingredients (recipe_id, ingredient_desc) VALUES ?', [ingredientRows]);
        }

        if (instructions && instructions.length > 0) {
            const instructionRows = instructions.map((desc, index) => [id, index + 1, desc]);
            await connection.query('INSERT INTO instructions (recipe_id, step_num, instruction_desc) VALUES ?', [instructionRows]);
        }

        if (tag_ids && tag_ids.length > 0) {
            const tagRows = tag_ids.map(tagId => [tagId, id]);
            await connection.query('INSERT INTO tags_recipes (tag_id, recipe_id) VALUES ?', [tagRows]);
        }

        if (new_tags && new_tags.length > 0) {
            for (const tagName of new_tags) {
                await connection.query('INSERT IGNORE INTO tags (name) VALUES (?)', [tagName.trim()]);
                const [[tag]] = await connection.query('SELECT id FROM tags WHERE name = ?', [tagName.trim()]);
                await connection.query('INSERT IGNORE INTO tags_recipes (tag_id, recipe_id) VALUES (?, ?)', [tag.id, id]);
            }
        }

        await connection.commit();
        res.json({message: 'Recipe updated'});
    } catch(err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({error: 'Failed to update recipe'});
    } finally {
        connection.release();
    }
};

const deleteRecipe = async (req, res) => {
    try {
        const {id} = req.params;
        const [result] = await pool.query('DELETE FROM recipes WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({error: 'Recipe not found'});
        }
        res.json({message: 'Recipe deleted'});
    } catch(err) {
        console.error(err);
        res.status(500).json({error: 'Failed to delete recipe'});
    }
}

module.exports = {getRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe};