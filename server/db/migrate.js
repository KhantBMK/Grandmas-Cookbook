require('dotenv').config();
const pool = require('./pool');

const migrate = async () => {
    try {
        console.log('Fixing ingredients foreign key...');
        await pool.query('ALTER TABLE ingredients DROP FOREIGN KEY ingredients_ibfk_1');
        await pool.query(`
            ALTER TABLE ingredients
            ADD CONSTRAINT ingredients_ibfk_1
            FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
        `);
        console.log('Done!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();