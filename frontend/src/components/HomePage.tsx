import { Box, Container, Typography, Button, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import { useNavigate } from 'react-router-dom';

const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  padding: theme.spacing(15, 0),
  color: 'white',
  textAlign: 'center',
}));

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const HomePage = () => {
  const navigate = useNavigate();
  const handleRecipes = () => {
    navigate('/recipeManagement');
  };

  const handleMealPlan = () => {
    navigate('/mealPlan');
  };

  return (
    <Box>
      <HeroSection>
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to Ratatouille
          </Typography>
          <Typography variant="h5" paragraph>
            Your personal chef for meal planning and recipe management
          </Typography>
        </Container>
      </HeroSection>

      <Container maxWidth="lg" sx={{ my: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <FeatureCard 
              elevation={3}
              sx={{ 
                cursor: 'pointer',
                '&:hover': { transform: 'scale(1.02)', transition: 'transform 0.2s' }
              }}
              onClick={handleRecipes}
            >
              <RestaurantMenuIcon sx={{ fontSize: 40, color: '#FE6B8B' }} />
              <Typography variant="h5" component="h2">
                Recipe Management
              </Typography>
              <Typography color="text.secondary">
                Store and organize your favorite recipes in one place. Add, edit, and categorize with ease.
              </Typography>
            </FeatureCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <FeatureCard 
              elevation={3}
              sx={{ 
                cursor: 'pointer',
                '&:hover': { transform: 'scale(1.02)', transition: 'transform 0.2s' }
              }}
              onClick={handleMealPlan}
            >
              <CalendarMonthIcon sx={{ fontSize: 40, color: '#FF8E53' }} />
              <Typography variant="h5" component="h2">
                Meal Planning
              </Typography>
              <Typography color="text.secondary">
                Plan your meals for the week ahead. Drag and drop recipes to your calendar.
              </Typography>
            </FeatureCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <FeatureCard elevation={3}>
              <LocalGroceryStoreIcon sx={{ fontSize: 40, color: '#FE6B8B' }} />
              <Typography variant="h5" component="h2">
                Shopping Lists
              </Typography>
              <Typography color="text.secondary">
                Automatically generate shopping lists from your meal plan. Never forget an ingredient.
              </Typography>
            </FeatureCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;