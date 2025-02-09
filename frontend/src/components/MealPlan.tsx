import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Divider, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useNavigate } from 'react-router-dom';
import { NONAME } from 'dns';

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
  imageUrl?: string;
  description?: string;
  cookTime?: string;
}

interface DayPlan {
  breakfast?: Recipe;
  lunch?: Recipe;
  dinner?: Recipe;
}

interface WeekPlan {
  [key: string]: DayPlan;
}

const DayCard = styled(Box)(({ theme }) => ({
  height: '100%',
  border: 'none',
  display: 'flex',
  flexDirection: 'column',
  width: `49%`,
  gap: theme.spacing(1),
  marginBottom: theme.spacing(4),
}));

const DayHeader = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: `0px 0px 0px ${theme.spacing(2)}`,
  color: theme.palette.primary.main,
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  textAlign: `right`,
  borderTopLeftRadius: theme.shape.borderRadius,
  borderTopRightRadius: theme.shape.borderRadius,
}));

const MealSlotBox = styled(Box)(({ theme }) => ({
  flex: 1,
  backgroundColor: 'lightgray',
  borderRadius: theme.shape.borderRadius,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  cursor: 'pointer',
  transition: 'transform 0.2s, 0.2s',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const RecipeImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: '120px',
  objectFit: 'cover',
}));

const MacroItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

const MacroValue = styled(Typography)({
  fontWeight: 'bold',
  fontSize: '0.875rem',
});

const MacroLabel = styled(Typography)({
  color: 'text.secondary',
  fontSize: '0.7rem',
  marginTop: '-8px',
  marginBottom: '8px',
});

const MealsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
}));

const MealTypesContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

const MealSlot = ({ meal, mealType }) => {
  if (!meal) {
    return (
      <Typography color="text.secondary" sx={{ flex: 1 }}>
        No recipe chosen
      </Typography>
    );
  }

  return (
      <>
        <Box sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'primary.light', 
                   color: 'white', px: 2, py: 0.5, borderRadius: 1 }}>
          {mealType.toUpperCase()}
        </Box>
        {meal.imageUrl && (
          <RecipeImage 
            src={meal.imageUrl} 
            alt={meal.title}
          />
        )}
        <Typography variant="subtitle1" sx={{ mb: 1, padding: "8px 0px 0px 8px"}}>
          {meal.title}
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          px: 2,
          mt: 'auto' 
        }}>
          <MacroItem>
            <MacroValue>{meal.macros.calories}</MacroValue>
            <MacroLabel>Calories</MacroLabel>
          </MacroItem>
          <MacroItem>
            <MacroValue>{meal.macros.protein}g</MacroValue>
            <MacroLabel>Protein</MacroLabel>
          </MacroItem>
          <MacroItem>
            <MacroValue>{meal.macros.carbs}g</MacroValue>
            <MacroLabel>Carbs</MacroLabel>
          </MacroItem>
          <MacroItem>
            <MacroValue>{meal.macros.fat}g</MacroValue>
            <MacroLabel>Fat</MacroLabel>
          </MacroItem>
        </Box>
        </>
    );
};

const MealPlan = () => {
  const navigate = useNavigate();
  const [weekPlan, setWeekPlan] = useState<WeekPlan>({});
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const mealTypes: Array<'breakfast' | 'lunch' | 'dinner'> = ['breakfast', 'lunch', 'dinner'];

  useEffect(() => {
    const loadCurrentPlan = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/mealplan/current');
        if (!response.ok) throw new Error('Failed to fetch meal plan');
        const plan = await response.json();
        setWeekPlan(plan);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    loadCurrentPlan();
  }, []);

  const calculateDayMacros = (dayPlan: DayPlan): Macros => {
    const initial: Macros = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    return Object.values(dayPlan).reduce((acc, meal) => {
      if (!meal) return acc;
      return {
        calories: acc.calories + meal.macros.calories,
        protein: acc.protein + meal.macros.protein,
        carbs: acc.carbs + meal.macros.carbs,
        fat: acc.fat + meal.macros.fat,
      };
    }, initial);
  };

  const handleGeneratePlan = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/mealplan/generate', {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to generate meal plan');
      const plan = await response.json();
      setWeekPlan(plan);

      await fetch('http://localhost:3000/api/mealplan/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ weekPlan: plan }),
      });
    } catch (error) {
      console.error('Error:', error);
      // TODO: Show error to user
    }
  };

  const handleRecipeClick = (recipe: Recipe) => {
    navigate(`/recipe/${recipe.id}`, { state: { recipe } });
  };

  return (
    <Container maxWidth='100%' sx={{ py: '4'}}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Next Week's Meal Plan
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AutoFixHighIcon />}
          onClick={handleGeneratePlan}
        >
          Generate Plan
        </Button>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'revert', flexDirection: 'row', flexWrap: 'wrap'}}>
        {days.map((day) => (
          <DayCard key={day} elevation={2}>
          <Box sx={{ display: 'flex', alignItems: 'left', justifyContent: 'space-between', flexDirection: 'row', flexWrap: 'wrap' }}>
            <Typography variant="h6" component="h2" sx={{ textTransform: 'capitalize' }}>
              {day}
            </Typography>
            <DayHeader>
              <>
                <Typography>{weekPlan[day] ? calculateDayMacros(weekPlan[day]).calories : 0} cal</Typography>
                <Typography>{weekPlan[day] ? calculateDayMacros(weekPlan[day]).protein : 0}g protein</Typography>
                <Typography>{weekPlan[day] ? calculateDayMacros(weekPlan[day]).fat : 0}g fat</Typography>
                <Typography>{weekPlan[day] ? calculateDayMacros(weekPlan[day]).carbs : 0}g carbs</Typography>
              </>
            </DayHeader>
          </Box>
          
          <Divider />
          
          <MealsContainer>

              {mealTypes.map((mealType) => (
                <MealTypesContainer key={mealType}>
                  <MealSlotBox 
                    elevation={1}
                    onClick={() => weekPlan[day]?.[mealType] && handleRecipeClick(weekPlan[day][mealType])}
                  >
                    <MealSlot 
                      meal={weekPlan[day]?.[mealType]} 
                      mealType={mealType}
                    />
                  </MealSlotBox>
                </MealTypesContainer>
              ))}
            </MealsContainer>
          </DayCard>
        ))}
      </Box>
    </Container>
  );
};

export default MealPlan; 