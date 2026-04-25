const express =require('express');
const router = express.Router();
const { getRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe} = require('../controllers/recipes');
const {requireAuth} = require('../middleware/auth');

router.get('/', getRecipes);
router.get('/:id', getRecipeById);
router.post('/', requireAuth, createRecipe);
router.put('/:id', requireAuth, updateRecipe);
router.delete('/:id', requireAuth, deleteRecipe);

module.exports = router;