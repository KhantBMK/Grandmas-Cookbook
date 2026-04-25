// Usage: node db/seed-recipes.js <your-username>
// Inserts test recipes attributed to the given user so you can test edit/delete.
require('dotenv').config();
const pool = require('./pool');

const username = process.argv[2];
if (!username) {
    console.error('Usage: node db/seed-recipes.js <username>');
    process.exit(1);
}

const recipes = [
    {
        name: 'Classic Avocado Toast',
        description: 'Simple, healthy avocado toast topped with a poached egg and chili flakes.',
        cook_time: 5,
        prep_time: 5,
        servings: 1,
        cuisine: 'American',
        meal_type: 'Breakfast',
        tags: ['Vegetarian', 'Healthy', 'Quick'],
        ingredients: [
            '2 slices of sourdough bread',
            '1 ripe avocado',
            '1 egg',
            '1 tsp chili flakes',
            'Salt and pepper to taste',
        ],
        instructions: [
            'Toast the sourdough bread until golden.',
            'Mash the avocado in a bowl with salt and pepper.',
            'Poach the egg in simmering water for 3 minutes.',
            'Spread avocado on toast, top with the egg and chili flakes.',
        ],
    },
    {
        name: 'Garlic Butter Shrimp Pasta',
        description: 'Quick weeknight pasta with juicy shrimp in a garlic butter white wine sauce.',
        cook_time: 20,
        prep_time: 10,
        servings: 4,
        cuisine: 'Italian',
        meal_type: 'Dinner',
        tags: ['Quick'],
        ingredients: [
            '400g spaghetti',
            '500g raw shrimp, peeled and deveined',
            '4 cloves garlic, minced',
            '3 tbsp butter',
            '1/2 cup white wine',
            '2 tbsp olive oil',
            'Handful of fresh parsley',
            'Salt and pepper to taste',
        ],
        instructions: [
            'Cook spaghetti in salted boiling water until al dente. Reserve 1 cup pasta water.',
            'Heat olive oil in a large pan over medium-high heat. Sauté garlic for 1 minute.',
            'Add shrimp, season with salt and pepper, cook 2 minutes per side.',
            'Pour in white wine, simmer 2 minutes.',
            'Add butter and toss in drained pasta with a splash of pasta water.',
            'Garnish with fresh parsley and serve immediately.',
        ],
    },
    {
        name: 'Mango Mochi Ice Cream',
        description: 'Chewy Japanese mochi filled with creamy mango ice cream — a fun frozen treat.',
        cook_time: 15,
        prep_time: 20,
        servings: 8,
        cuisine: 'Japanese',
        meal_type: 'Dessert',
        tags: ['Dairy-Free', 'Gluten-Free'],
        ingredients: [
            '1 cup glutinous rice flour',
            '1/4 cup sugar',
            '1 cup water',
            'Cornstarch for dusting',
            '1 pint mango ice cream',
        ],
        instructions: [
            'Scoop ice cream into 8 balls and freeze solid on a lined tray (at least 1 hour).',
            'Mix rice flour, sugar, and water in a microwave-safe bowl until smooth.',
            'Microwave on high for 2 minutes, stir, then microwave 1 more minute.',
            'Dust a surface with cornstarch and spread mochi dough to 1/4 inch thick. Cut into 8 circles.',
            'Working quickly, place one ice cream ball in the center of each mochi circle and wrap, pinching edges closed.',
            'Keep frozen until ready to serve.',
        ],
    },
];

const run = async () => {
    try {
        const [users] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            console.error(`User "${username}" not found.`);
            process.exit(1);
        }
        const userId = users[0].id;
        console.log(`Found user id=${userId} for username="${username}"`);

        for (const recipe of recipes) {
            const [[cuisine]] = await pool.query('SELECT id FROM cuisines WHERE name = ?', [recipe.cuisine]);
            const [[mealType]] = await pool.query('SELECT id FROM meal_types WHERE name = ?', [recipe.meal_type]);

            if (!cuisine || !mealType) {
                console.warn(`Skipping "${recipe.name}" — missing cuisine or meal type. Run seed.js first.`);
                continue;
            }

            const connection = await pool.getConnection();
            try {
                await connection.beginTransaction();

                const [result] = await connection.query(
                    'INSERT INTO recipes (user_id, name, description, image_url, cook_time, prep_time, servings, cuisine_type, meal_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [userId, recipe.name, recipe.description, '', recipe.cook_time, recipe.prep_time, recipe.servings, cuisine.id, mealType.id]
                );
                const recipeId = result.insertId;

                for (const ing of recipe.ingredients) {
                    await connection.query(
                        'INSERT INTO ingredients (recipe_id, ingredient_desc) VALUES (?, ?)',
                        [recipeId, ing]
                    );
                }

                for (let i = 0; i < recipe.instructions.length; i++) {
                    await connection.query(
                        'INSERT INTO instructions (recipe_id, step_num, instruction_desc) VALUES (?, ?, ?)',
                        [recipeId, i + 1, recipe.instructions[i]]
                    );
                }

                for (const tagName of recipe.tags) {
                    const [[tag]] = await connection.query('SELECT id FROM tags WHERE name = ?', [tagName]);
                    if (tag) {
                        await connection.query(
                            'INSERT IGNORE INTO tags_recipes (tag_id, recipe_id) VALUES (?, ?)',
                            [tag.id, recipeId]
                        );
                    }
                }

                await connection.commit();
                console.log(`Created recipe: "${recipe.name}" (id=${recipeId})`);
            } catch (err) {
                await connection.rollback();
                console.error(`Failed to insert "${recipe.name}":`, err.message);
            } finally {
                connection.release();
            }
        }

        console.log('Done!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
