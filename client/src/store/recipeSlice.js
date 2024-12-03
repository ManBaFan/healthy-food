import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { recipeService } from '../services/api';

// Async thunks
export const fetchRecipes = createAsyncThunk(
    'recipes/fetchRecipes',
    async (params, { rejectWithValue }) => {
        try {
            return await recipeService.getRecipes(params);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchRecipeById = createAsyncThunk(
    'recipes/fetchRecipeById',
    async (id, { rejectWithValue }) => {
        try {
            return await recipeService.getRecipeById(id);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const generateMealPlan = createAsyncThunk(
    'recipes/generateMealPlan',
    async (params, { rejectWithValue }) => {
        try {
            return await recipeService.getMealPlan(params);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Slice
const recipeSlice = createSlice({
    name: 'recipes',
    initialState: {
        recipes: [],
        totalRecipes: 0,
        currentPage: 1,
        totalPages: 1,
        selectedRecipe: null,
        mealPlan: null,
        loading: false,
        error: null,
        filters: {
            search: '',
            dietary: [],
            difficulty: '',
            maxTime: 120,
            minRating: 0,
            cuisine: '',
        }
    },
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = {
                search: '',
                dietary: [],
                difficulty: '',
                maxTime: 120,
                minRating: 0,
                cuisine: '',
            };
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch recipes
        builder
            .addCase(fetchRecipes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRecipes.fulfilled, (state, action) => {
                state.loading = false;
                state.recipes = action.payload.recipes;
                state.totalRecipes = action.payload.total;
                state.totalPages = action.payload.pages;
                state.currentPage = action.payload.currentPage;
            })
            .addCase(fetchRecipes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch recipe by ID
            .addCase(fetchRecipeById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRecipeById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedRecipe = action.payload;
            })
            .addCase(fetchRecipeById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Generate meal plan
            .addCase(generateMealPlan.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(generateMealPlan.fulfilled, (state, action) => {
                state.loading = false;
                state.mealPlan = action.payload;
            })
            .addCase(generateMealPlan.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { setFilters, clearFilters, setCurrentPage, clearError } = recipeSlice.actions;

// Selectors
export const selectRecipes = (state) => state.recipes.recipes;
export const selectTotalRecipes = (state) => state.recipes.totalRecipes;
export const selectCurrentPage = (state) => state.recipes.currentPage;
export const selectTotalPages = (state) => state.recipes.totalPages;
export const selectSelectedRecipe = (state) => state.recipes.selectedRecipe;
export const selectMealPlan = (state) => state.recipes.mealPlan;
export const selectLoading = (state) => state.recipes.loading;
export const selectError = (state) => state.recipes.error;
export const selectFilters = (state) => state.recipes.filters;

export default recipeSlice.reducer;
