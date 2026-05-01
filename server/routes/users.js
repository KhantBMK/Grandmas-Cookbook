const express = require('express');
const router = express.Router();
const { saveRecipe, unsaveRecipe, getSavedRecipes, getCreatedRecipes } = require('../controllers/users');
const { requireAuth } = require('../middleware/auth');

router.post('/:id/save', requireAuth, saveRecipe);
router.delete('/:id/save', requireAuth, unsaveRecipe);
router.get('/:id/saved-recipes', requireAuth, getSavedRecipes);
router.get('/:id/created-recipes', requireAuth, getCreatedRecipes);

module.exports = router;