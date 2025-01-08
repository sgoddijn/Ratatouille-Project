import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Grid, Box, Divider, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useNavigate } from 'react-router-dom';

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
}

interface DayPlan {
  breakfast?: Recipe;
  lunch?: Recipe;
  dinner?: Recipe;
}

interface WeekPlan {
  [key: string]: DayPlan;
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
  minHeight: '225px',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  cursor: 'pointer',
  transition: 'transform 0.2s, box-shadow 0.2s',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const RecipeImage = styled('img')({
  position: 'absolute',
  top: 8,
  right: 8,
  width: '60px',
  height: '60px',
  borderRadius: '4px',
  objectFit: 'cover',
});

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
    <Container sx={{ py: 4 }}>
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
      
      {days.map((day) => (
        <DayCard key={day} elevation={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="h2" sx={{ textTransform: 'capitalize' }}>
              {day}
            </Typography>
            <MacrosBox>
              <>
                <Typography>{weekPlan[day] ? calculateDayMacros(weekPlan[day]).calories : 0} cal</Typography>
                <Typography>{weekPlan[day] ? calculateDayMacros(weekPlan[day]).protein : 0}g protein</Typography>
                <Typography>{weekPlan[day] ? calculateDayMacros(weekPlan[day]).fat : 0}g fat</Typography>
                <Typography>{weekPlan[day] ? calculateDayMacros(weekPlan[day]).carbs : 0}g carbs</Typography>
              </>
            </MacrosBox>
          </Box>
          
          <Divider />
          
          <MealsContainer>
            {mealTypes.map((mealType) => (
              <MealSlotBox 
                key={mealType} 
                elevation={1}
                onClick={() => weekPlan[day]?.[mealType] && handleRecipeClick(weekPlan[day][mealType])}
              >
                <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                  {mealType}
                </Typography>
                {weekPlan[day]?.[mealType] ? (
                  <>
                    {weekPlan[day][mealType].imageUrl && (
                      <RecipeImage 
                        src={weekPlan[day][mealType].imageUrl} 
                        alt={weekPlan[day][mealType].title}
                      />
                    )}
                    <Typography variant="body1" sx={{ pr: 9 }}>
                      {weekPlan[day][mealType].title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        flex: 1
                      }}
                    >
                      {weekPlan[day][mealType].description}
                    </Typography>
                    <MacrosBox>
                      <Typography variant="caption">
                        {weekPlan[day][mealType].macros.calories} cal
                      </Typography>
                    </MacrosBox>
                  </>
                ) : (
                  <>
                    <Typography color="text.secondary" sx={{ flex: 1 }}>
                      No recipe chosen
                    </Typography>
                    <MacrosBox>
                      <Typography variant="caption">No macros yet</Typography>
                    </MacrosBox>
                  </>
                )}
              </MealSlotBox>
            ))}
          </MealsContainer>
        </DayCard>
      ))}
    </Container>
  );
};

export default MealPlan; 