const express = require('express');
const router = express.Router();
const { suggestTags } = require('../services/gemini');
const pool = require('../db/pool');

router.post('/suggest-tags', async (req, res) => {
    try {
        // Fetch ingredients and tags already selected from request body
        const { ingredients, selected_tag_ids } = req.body;

        // Fetching all tags available in the database
        const [allTags] = await pool.query('SELECT id, name FROM tags');

        // Filtering tags the user already selected to prevent duplicates
        const availableTags = allTags.filter(t => !selected_tag_ids.includes(t.id));

        // Sending available tags and ingredients
        const suggestedNames = await suggestTags(ingredients, availableTags);


        // Filter out undefined in case Gemini suggests a name not in the database
        const matchedTags = suggestedNames
            .map(name => allTags.find(t => t.name.toLowerCase() === name.toLowerCase()))
            .filter(Boolean);

        // Any names Gemini suggested that didn't match an existing tag are new tags
        const matchedNames = matchedTags.map(t => t.name.toLowerCase());
        const newTags = suggestedNames.filter(name => !matchedNames.includes(name.toLowerCase()));

        // Return matched existing tags and new tag names
        res.json({ tags: matchedTags, new_tags: newTags });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to suggest tags' });
    }
})

module.exports = router;