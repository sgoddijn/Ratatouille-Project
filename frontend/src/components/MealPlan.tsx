import { Container, Typography, Paper, Grid, Box, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';

interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Recipe {
  id: number;
  title: string;
  macros: Macros;
}

interface MealSlot {
  recipe?: Recipe;
  type: 'breakfast' | 'lunch' | 'dinner';
}

const DayCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const MealSlotBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  flex: 1,
  minHeight: '120px',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  cursor: 'pointer',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const MacrosBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
}));

const MealsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

const MealPlan = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes: Array<'breakfast' | 'lunch' | 'dinner'> = ['breakfast', 'lunch', 'dinner'];

  const calculateDayMacros = (meals: MealSlot[]): Macros => {
    const initial: Macros = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    return meals.reduce((acc, meal) => {
      if (!meal.recipe) return acc;
      return {
        calories: acc.calories + meal.recipe.macros.calories,
        protein: acc.protein + meal.recipe.macros.protein,
        carbs: acc.carbs + meal.recipe.macros.carbs,
        fat: acc.fat + meal.recipe.macros.fat,
      };
    }, initial);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Next Week's Meal Plan
      </Typography>
      
      {days.map((day) => (
        <DayCard key={day} elevation={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="h2">
              {day}
            </Typography>
            <MacrosBox>
              <Typography>0 cal</Typography>
              <Typography>0g protein</Typography>
              <Typography>0g carbs</Typography>
              <Typography>0g fat</Typography>
            </MacrosBox>
          </Box>
          
          <Divider />
          
          <MealsContainer>
            {mealTypes.map((mealType) => (
              <MealSlotBox key={mealType} elevation={1}>
                <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                  {mealType}
                </Typography>
                <Typography color="text.secondary" sx={{ flex: 1 }}>
                  Drop a recipe here
                </Typography>
                <MacrosBox>
                  <Typography variant="caption">No macros yet</Typography>
                </MacrosBox>
              </MealSlotBox>
            ))}
          </MealsContainer>
        </DayCard>
      ))}
    </Container>
  );
};

export default MealPlan; 