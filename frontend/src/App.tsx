import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage.tsx';
import RecipeManagement from './components/RecipeManagement.tsx';
import MealPlan from './components/MealPlan.tsx';
import RecipeDetails from './components/RecipeDetails.tsx';
import Header from './components/Header.tsx';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FE6B8B',
    },
    secondary: {
      main: '#FF8E53',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h2: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 500,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/recipes" element={<RecipeManagement />} />
          <Route path="/meal-plan" element={<MealPlan />} />
          <Route path="/recipe/:id" element={<RecipeDetails />} />
          <Route path="/shopping-list" element={<div>Shopping List Coming Soon</div>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;