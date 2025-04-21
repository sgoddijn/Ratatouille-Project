# Ratatouille Project

An AI-powered recipe management and meal planning application that helps you organize recipes, create balanced meal plans, and generate shopping lists.

## Features

- **Recipe Management**: Extract recipes from URLs or upload recipe files
- **Meal Planning**: Generate balanced weekly meal plans using AI
- **Shopping List**: Automatically consolidate ingredients from your meal plan
- **AI Integration**: Powered by Claude and OpenAI for intelligent recipe processing

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Material UI for components

### Backend
- Deno runtime
- Express for API routing
- MongoDB with Mongoose for data storage
- LangChain for AI integrations

## Getting Started

### Prerequisites

- Node.js (v16+)
- Deno (v1.40+)
- MongoDB
- API keys for Claude and OpenAI (for AI features)

### Installation

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on [http://localhost:5173](http://localhost:5173)

#### Backend Setup

```bash
cd backend
deno task dev
```

The backend API will run on [http://localhost:8000](http://localhost:8000)

## Project Structure

```
- frontend/            # React frontend application
  - src/components/    # React components
  - src/assets/        # Static assets

- backend/             # Deno backend server
  - src/services/      # Business logic services
  - src/models/        # Data models
  - src/config/        # Configuration files
  - src/helpers/       # Helper utilities

- shared/              # Shared TypeScript interfaces
  - Recipe.ts          # Recipe interface
  - Ingredient.ts      # Ingredient interface
```

## Core Flows

The application consists of three main flows:

1. **[Recipe Creation Flow](./docs/Recipe-Creation-Flow.md)**: How recipes are added and processed
2. **[Meal Plan Flow](./docs/Meal-Plan-Flow.md)**: How meal plans are generated and managed
3. **[Shopping List Flow](./docs/Shopping-List-Flow.md)**: How shopping lists are generated from meal plans

Detailed documentation for each flow can be found in the docs directory.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
