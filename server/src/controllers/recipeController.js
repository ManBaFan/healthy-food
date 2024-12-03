const Recipe = require('../models/Recipe');
const { cacheMiddleware, clearCache } = require('../utils/cache');
const logger = require('../utils/logger');

// Error handler utility
const handleError = (res, error) => {
    logger.error('Controller Error:', error);
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ error: message });
};

const recipeController = {
    // Create a new recipe
    async create(req, res) {
        try {
            const recipe = new Recipe(req.body);
            await recipe.save();
            await clearCache('recipes:*'); // Clear recipes cache
            res.status(201).json(recipe);
        } catch (error) {
            handleError(res, error);
        }
    },

    // Get all recipes with filtering and search
    async getRecipes(req, res) {
        try {
            const {
                search,
                dietary,
                difficulty,
                maxTime,
                minRating,
                cuisine,
                page = 1,
                limit = 10,
                sortBy = 'rating'
            } = req.query;

            // Build query with index optimization
            const query = {};
            const projection = {
                title: 1,
                description: 1,
                preparationTime: 1,
                cookingTime: 1,
                difficulty: 1,
                dietaryCategories: 1,
                cuisine: 1,
                'rating.average': 1,
                'nutrition.calories': 1,
                imageUrl: 1
            };
            
            if (search) {
                query.$text = { $search: search };
            }

            if (dietary) {
                const dietaryArray = dietary.split(',');
                query.dietaryCategories = { $all: dietaryArray };
            }

            if (difficulty) {
                query.difficulty = difficulty;
            }

            if (maxTime) {
                query.$expr = {
                    $lte: [{ $add: ['$preparationTime', '$cookingTime'] }, parseInt(maxTime)]
                };
            }

            if (minRating) {
                query['rating.average'] = { $gte: parseFloat(minRating) };
            }

            if (cuisine) {
                query.cuisine = cuisine;
            }

            // Optimize sort
            const sort = {};
            if (sortBy === 'rating') {
                sort['rating.average'] = -1;
            } else if (sortBy === 'time') {
                sort.preparationTime = 1;
                sort.cookingTime = 1;
            }

            // Execute query with pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);
            
            // Run queries in parallel
            const [recipes, total] = await Promise.all([
                Recipe.find(query)
                    .select(projection)
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                Recipe.countDocuments(query)
            ]);

            res.json({
                recipes,
                total,
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page)
            });
        } catch (error) {
            handleError(res, error);
        }
    },

    // Get recipe by ID with caching
    async getRecipeById(req, res) {
        try {
            const recipe = await Recipe.findById(req.params.id).lean();
            if (!recipe) {
                return res.status(404).json({ error: 'Recipe not found' });
            }
            res.json(recipe);
        } catch (error) {
            handleError(res, error);
        }
    },

    // Get recipe suggestions with optimized query
    async getSuggestions(req, res) {
        try {
            const { 
                dietaryPreferences,
                calorieTarget,
                proteinTarget,
                mealCount = 3
            } = req.query;

            const query = {};
            const projection = {
                title: 1,
                nutrition: 1,
                dietaryCategories: 1,
                preparationTime: 1,
                cookingTime: 1,
                'rating.average': 1
            };
            
            if (dietaryPreferences) {
                const preferences = dietaryPreferences.split(',');
                query.dietaryCategories = { $in: preferences };
            }

            if (calorieTarget) {
                const targetPerMeal = parseInt(calorieTarget) / mealCount;
                query['nutrition.calories'] = { 
                    $gte: targetPerMeal * 0.8,
                    $lte: targetPerMeal * 1.2
                };
            }

            if (proteinTarget) {
                const targetPerMeal = parseInt(proteinTarget) / mealCount;
                query['nutrition.protein'] = {
                    $gte: targetPerMeal * 0.8,
                    $lte: targetPerMeal * 1.2
                };
            }

            const recipes = await Recipe.find(query)
                .select(projection)
                .sort({ 'rating.average': -1 })
                .limit(10)
                .lean();

            res.json(recipes);
        } catch (error) {
            handleError(res, error);
        }
    },

    // Generate meal plan with optimized aggregation
    async generateMealPlan(req, res) {
        try {
            const {
                days = 7,
                mealsPerDay = 3,
                calorieTarget,
                dietaryPreferences,
                excludeIngredients
            } = req.query;

            const pipeline = [];
            
            // Match stage
            const matchStage = {};
            
            if (dietaryPreferences) {
                const preferences = dietaryPreferences.split(',');
                matchStage.dietaryCategories = { $in: preferences };
            }

            if (excludeIngredients) {
                const excluded = excludeIngredients.split(',');
                matchStage['ingredients.name'] = { $nin: excluded };
            }

            if (calorieTarget) {
                const caloriesPerMeal = parseInt(calorieTarget) / mealsPerDay;
                matchStage['nutrition.calories'] = {
                    $gte: caloriesPerMeal * 0.8,
                    $lte: caloriesPerMeal * 1.2
                };
            }

            pipeline.push({ $match: matchStage });

            // Sort by rating
            pipeline.push({ $sort: { 'rating.average': -1 } });

            // Limit results
            pipeline.push({ $limit: parseInt(days) * parseInt(mealsPerDay) });

            const recipes = await Recipe.aggregate(pipeline);

            // Organize into daily meal plans
            const mealPlan = Array.from({ length: parseInt(days) }, (_, i) => {
                const dailyMeals = recipes.slice(i * mealsPerDay, (i + 1) * mealsPerDay);
                return {
                    day: i + 1,
                    meals: dailyMeals.map((recipe, index) => ({
                        mealNumber: index + 1,
                        recipe
                    })),
                    dailyNutrition: dailyMeals.reduce((acc, recipe) => ({
                        calories: acc.calories + recipe.nutrition.calories,
                        protein: acc.protein + recipe.nutrition.protein,
                        carbohydrates: acc.carbohydrates + recipe.nutrition.carbohydrates,
                        fat: acc.fat + recipe.nutrition.fat
                    }), { calories: 0, protein: 0, carbohydrates: 0, fat: 0 })
                };
            });

            res.json(mealPlan);
        } catch (error) {
            handleError(res, error);
        }
    },

    // Get ingredient substitutes
    async getSubstitutes(req, res) {
        try {
            const { ingredient, dietary } = req.query;
            
            const recipes = await Recipe.find({
                'ingredients.name': ingredient,
                'ingredients.substitutes': { $exists: true, $ne: [] }
            });

            let substitutes = [];
            recipes.forEach(recipe => {
                recipe.ingredients
                    .filter(ing => ing.name === ingredient)
                    .forEach(ing => {
                        if (dietary) {
                            substitutes.push(...ing.substitutes.filter(
                                sub => sub.dietaryCategories.includes(dietary)
                            ));
                        } else {
                            substitutes.push(...ing.substitutes);
                        }
                    });
            });

            // Remove duplicates and sort by frequency
            substitutes = Array.from(new Set(substitutes.map(s => s.name)))
                .map(name => {
                    return substitutes.find(s => s.name === name);
                });

            res.json(substitutes);
        } catch (error) {
            handleError(res, error);
        }
    }
};

module.exports = recipeController;
