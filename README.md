# Enterprise Healthy Food Management System

A comprehensive recipe and meal planning application built with React and Node.js.

## Features

- 🍳 Recipe browsing with advanced filters
- 📊 Detailed nutritional information
- 🗓️ Smart meal planning
- 🥗 Dietary restriction support
- 💡 Ingredient substitution suggestions
- 📱 Responsive design

## Tech Stack

### Frontend
- React 18
- Redux Toolkit for state management
- Mantine UI for components
- React Router for navigation
- Axios for API communication

### Backend
- Node.js with Express
- MongoDB for database
- Redis for caching
- JWT for authentication
- Winston for logging

## Getting Started

### Prerequisites
- Node.js >= 14
- MongoDB >= 4.4
- Redis >= 6.0

### Environment Setup

1. Client (.env in client root):
```env
REACT_APP_API_URL=http://localhost:3001/api
```

2. Server (.env in server root):
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/healthy-food
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/healthy-food.git
cd healthy-food
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install client dependencies:
```bash
cd ../client
npm install
```

### Running the Application

1. Start MongoDB and Redis:
```bash
# Start MongoDB (if not running as a service)
mongod

# Start Redis (if not running as a service)
redis-server
```

2. Start the server (in server directory):
```bash
npm run dev
```

3. Start the client (in client directory):
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api

## API Endpoints

### Recipes
- GET /api/recipes - List recipes with filters
- GET /api/recipes/:id - Get recipe details
- POST /api/recipes - Create new recipe
- PUT /api/recipes/:id - Update recipe
- DELETE /api/recipes/:id - Delete recipe

### Meal Plans
- POST /api/meal-plans - Generate meal plan
- GET /api/meal-plans/:id - Get meal plan details
- PUT /api/meal-plans/:id - Update meal plan

### Users
- POST /api/auth/register - Register new user
- POST /api/auth/login - User login
- GET /api/users/me - Get current user
- PUT /api/users/me - Update user profile

## Project Structure
```
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── store/
│       └── utils/
│
└── server/
    ├── src/
    │   ├── controllers/
    │   ├── models/
    │   ├── routes/
    │   ├── services/
    │   └── utils/
    └── tests/
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
