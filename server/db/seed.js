require('dotenv').config();
const pool = require('./pool');

const cuisines = [
    'American', 'Italian', 'Mexican', 'Chinese', 'Japanese',
    'Indian', 'French', 'Greek', 'Thai', 'Mediterranean',
    'Spanish', 'Middle Eastern', 'Korean', 'Vietnamese',
'Other'
];

const mealTypes = [
    'Breakfast', 'Lunch', 'Dinner', 'Dessert',
    'Snack', 'Appetizer', 'Side Dish', 'Drink'
];

const tags = [
    'Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free',
    'Nut-Free', 'Keto', 'Paleo', 'Low-Carb', 'High-Protein',
    'Quick', 'Easy', 'Spicy', 'Kid-Friendly', 'Healthy'
];

const seed = async () => {
    try {
        console.log('Seeding test user...');
        await pool.query(`DELETE FROM user_auth WHERE user_id = (SELECT id FROM users WHERE username = 'testuser')`);
        await pool.query(`DELETE FROM users WHERE username = 'testuser'`);
        await pool.query(`
            INSERT INTO users (id, username, email, is_active, is_verified)
            VALUES (1, 'testuser', 'test@test.com', true, true)
        `);
        await pool.query(`
            INSERT INTO user_auth (user_id, auth_provider, password_hash)
            VALUES (1, 'local', 'placeholder_hash')
        `);

        console.log('Seeding cuisines...');
        for (const name of cuisines) {
            await pool.query(
                'INSERT IGNORE INTO cuisines (name) values (?)', [name]
            );
        }

        console.log('Seeding meal types...');
        for (const name of mealTypes) {
            await pool.query(
                'INSERT IGNORE INTO meal_types (name) VALUES (?)', [name]
            );
        }

        console.log('Seeding tags...');
        for (const name of tags) {
            await pool.query('INSERT IGNORE INTO tags (name) VALUES (?)', [name]);
        }

        console.log('Done! All reference data seeded.');
        process.exit(0);
    } catch(err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();