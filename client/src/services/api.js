import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Request interceptor for API calls
api.interceptors.request.use(
    (config) => {
        // You can add auth headers here if needed
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for API calls
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.error || 'An unexpected error occurred';
        console.error('API Error:', message);
        return Promise.reject(new Error(message));
    }
);

// Create a simple cache for GET requests
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (url, params) => {
    return `${url}?${new URLSearchParams(params).toString()}`;
};

const isCacheValid = (cacheEntry) => {
    return cacheEntry && Date.now() - cacheEntry.timestamp < CACHE_DURATION;
};

export const recipeService = {
    // Recipe CRUD operations
    getRecipes: async (params) => {
        const cacheKey = getCacheKey('/recipes', params);
        const cachedData = cache.get(cacheKey);

        if (isCacheValid(cachedData)) {
            return cachedData.data;
        }

        const data = await api.get('/recipes', { params });
        cache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
    },

    getRecipeById: async (id) => {
        const cacheKey = `/recipes/${id}`;
        const cachedData = cache.get(cacheKey);

        if (isCacheValid(cachedData)) {
            return cachedData.data;
        }

        const data = await api.get(`/recipes/${id}`);
        cache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
    },

    // Recipe features with debounced search
    getRecipeSuggestions: async (params) => {
        const cacheKey = getCacheKey('/recipes/suggestions', params);
        const cachedData = cache.get(cacheKey);

        if (isCacheValid(cachedData)) {
            return cachedData.data;
        }

        const data = await api.get('/recipes/suggestions', { params });
        cache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
    },

    getMealPlan: async (params) => {
        const data = await api.get('/meal-plan', { params });
        return data;
    },

    getSubstitutes: async (params) => {
        const cacheKey = getCacheKey('/substitutes', params);
        const cachedData = cache.get(cacheKey);

        if (isCacheValid(cachedData)) {
            return cachedData.data;
        }

        const data = await api.get('/substitutes', { params });
        cache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
    },

    // Cache management
    clearCache: () => {
        cache.clear();
    },

    invalidateCache: (pattern) => {
        for (const key of cache.keys()) {
            if (key.includes(pattern)) {
                cache.delete(key);
            }
        }
    }
};

export default api;
