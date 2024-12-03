import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';
import authReducer from './slices/authSlice';
import menuReducer from './slices/menuSlice';
import orderReducer from './slices/orderSlice';
import cartReducer from './slices/cartSlice';
import recipeReducer from './recipeSlice';

// Custom middleware for logging actions in development
const loggerMiddleware = (store) => (next) => (action) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(action.type);
    console.info('dispatching', action);
    const result = next(action);
    console.log('next state', store.getState());
    console.groupEnd();
    return result;
  }
  return next(action);
};

// Custom middleware for error tracking
const errorMiddleware = () => (next) => (action) => {
  if (action.error) {
    console.error('Error in action:', action);
    // You can add error reporting service here
  }
  return next(action);
};

const store = configureStore({
  reducer: {
    auth: authReducer,
    menu: menuReducer,
    orders: orderReducer,
    cart: cartReducer,
    recipes: recipeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['recipes/fetchRecipes/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp', 'meta.arg'],
        // Ignore these paths in the state
        ignoredPaths: ['recipes.selectedRecipe.createdAt'],
      },
      immutableCheck: { warnAfter: 128 },
      thunk: {
        extraArgument: {
          // Add any extra arguments here
        },
      },
    }).concat(loggerMiddleware, errorMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
  preloadedState: {}, // You can add initial state here
  enhancers: (defaultEnhancers) => [...defaultEnhancers],
});

// Enable refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

// Hot reloading configuration
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./recipeSlice', () => {
    const newRecipeReducer = require('./recipeSlice').default;
    store.replaceReducer({
      ...store.getState(),
      recipes: newRecipeReducer,
    });
  });
}

export default store;
