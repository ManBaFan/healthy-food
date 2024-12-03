const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbohydrates: { type: Number, required: true },
    fat: { type: Number, required: true },
    fiber: { type: Number, required: true },
    sugar: { type: Number, required: true },
    sodium: { type: Number, required: true },
});

const ingredientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    unit: { type: String, required: true },
    substitutes: [{ 
        name: String,
        amount: Number,
        unit: String,
        dietaryCategories: [String] // e.g., "vegan", "gluten-free"
    }]
});

const recipeSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        index: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    ingredients: [ingredientSchema],
    instructions: [{
        step: Number,
        text: String,
        estimatedTime: Number // in minutes
    }],
    nutrition: nutritionSchema,
    preparationTime: { type: Number, required: true }, // in minutes
    cookingTime: { type: Number, required: true }, // in minutes
    servings: { type: Number, required: true },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    dietaryCategories: [{
        type: String,
        enum: [
            'vegetarian', 'vegan', 'gluten-free', 'dairy-free',
            'keto', 'paleo', 'low-carb', 'low-fat', 'high-protein'
        ]
    }],
    cuisine: { type: String, required: true },
    imageUrl: String,
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Index for efficient search
recipeSchema.index({ 
    title: 'text',
    'ingredients.name': 'text',
    cuisine: 'text',
    dietaryCategories: 1
});

// Method to calculate nutrition per serving
recipeSchema.methods.getNutritionPerServing = function() {
    const nutrition = this.nutrition;
    const servings = this.servings;
    return {
        calories: nutrition.calories / servings,
        protein: nutrition.protein / servings,
        carbohydrates: nutrition.carbohydrates / servings,
        fat: nutrition.fat / servings,
        fiber: nutrition.fiber / servings,
        sugar: nutrition.sugar / servings,
        sodium: nutrition.sodium / servings
    };
};

const Recipe = mongoose.model('Recipe', recipeSchema);
module.exports = Recipe;
