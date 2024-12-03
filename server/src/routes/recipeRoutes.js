const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

// Recipe CRUD routes
router.post('/recipes', recipeController.create);
router.get('/recipes', recipeController.getRecipes);
router.get('/recipes/:id', recipeController.getRecipeById);

// Recipe features routes
router.get('/recipes/suggestions', recipeController.getSuggestions);
router.get('/meal-plan', recipeController.generateMealPlan);
router.get('/substitutes', recipeController.getSubstitutes);

module.exports = router;
