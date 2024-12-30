import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import RecipeManagement from './components/RecipeManagement';
import MealPlan from './components/MealPlan';
import RecipeDetails from './components/RecipeDetails';

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
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/recipeManagement" element={<RecipeManagement />} />
          <Route path="/mealPlan" element={<MealPlan />} />
          <Route path="/recipe/:id" element={<RecipeDetails />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;