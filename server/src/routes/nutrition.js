const express = require('express');
const router = express.Router();

// Mock nutrition data store (replace with database in production)
let nutritionData = [];

// Get nutrition info for a recipe
router.get('/recipe/:recipeId', async (req, res) => {
    try {
        const nutritionInfo = nutritionData.find(n => n.recipeId === parseInt(req.params.recipeId));
        if (!nutritionInfo) {
            return res.status(404).json({ message: 'Nutrition information not found' });
        }
        res.json(nutritionInfo);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching nutrition information' });
    }
});

// Add nutrition info for a recipe
router.post('/recipe', async (req, res) => {
    try {
        const { recipeId, calories, protein, carbs, fat, fiber, vitamins, minerals } = req.body;

        const newNutritionInfo = {
            id: nutritionData.length + 1,
            recipeId,
            calories,
            macronutrients: {
                protein,
                carbs,
                fat
            },
            fiber,
            micronutrients: {
                vitamins,
                minerals
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        nutritionData.push(newNutritionInfo);
        res.status(201).json(newNutritionInfo);
    } catch (error) {
        res.status(500).json({ message: 'Error creating nutrition information' });
    }
});

// Update nutrition info for a recipe
router.put('/recipe/:recipeId', async (req, res) => {
    try {
        const { calories, protein, carbs, fat, fiber, vitamins, minerals } = req.body;
        const nutritionIndex = nutritionData.findIndex(n => n.recipeId === parseInt(req.params.recipeId));
        
        if (nutritionIndex === -1) {
            return res.status(404).json({ message: 'Nutrition information not found' });
        }

        nutritionData[nutritionIndex] = {
            ...nutritionData[nutritionIndex],
            calories: calories || nutritionData[nutritionIndex].calories,
            macronutrients: {
                protein: protein || nutritionData[nutritionIndex].macronutrients.protein,
                carbs: carbs || nutritionData[nutritionIndex].macronutrients.carbs,
                fat: fat || nutritionData[nutritionIndex].macronutrients.fat
            },
            fiber: fiber || nutritionData[nutritionIndex].fiber,
            micronutrients: {
                vitamins: vitamins || nutritionData[nutritionIndex].micronutrients.vitamins,
                minerals: minerals || nutritionData[nutritionIndex].micronutrients.minerals
            },
            updatedAt: new Date()
        };

        res.json(nutritionData[nutritionIndex]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating nutrition information' });
    }
});

// Calculate nutrition totals for a meal plan
router.post('/meal-plan/calculate', async (req, res) => {
    try {
        const { recipeIds } = req.body;
        
        let totals = {
            calories: 0,
            macronutrients: {
                protein: 0,
                carbs: 0,
                fat: 0
            },
            fiber: 0
        };

        for (const recipeId of recipeIds) {
            const nutritionInfo = nutritionData.find(n => n.recipeId === recipeId);
            if (nutritionInfo) {
                totals.calories += nutritionInfo.calories;
                totals.macronutrients.protein += nutritionInfo.macronutrients.protein;
                totals.macronutrients.carbs += nutritionInfo.macronutrients.carbs;
                totals.macronutrients.fat += nutritionInfo.macronutrients.fat;
                totals.fiber += nutritionInfo.fiber;
            }
        }

        res.json(totals);
    } catch (error) {
        res.status(500).json({ message: 'Error calculating meal plan nutrition' });
    }
});

// Get nutrition recommendations based on user profile
router.get('/recommendations/:userId', async (req, res) => {
    try {
        // Mock recommendations (replace with actual calculation logic)
        const recommendations = {
            dailyCalories: 2000,
            macronutrients: {
                protein: 50,  // grams
                carbs: 250,   // grams
                fat: 70      // grams
            },
            fiber: 25,       // grams
            notes: [
                "Increase protein intake for muscle maintenance",
                "Maintain moderate carb intake for energy",
                "Include healthy fats for hormone balance"
            ]
        };
        
        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ message: 'Error generating nutrition recommendations' });
    }
});

module.exports = router;
