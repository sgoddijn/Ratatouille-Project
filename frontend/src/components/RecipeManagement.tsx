import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions,
  Fab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material/styles';
import { useState } from 'react';
import AddRecipeDialog from './AddRecipeDialog';

const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
}));

// Temporary mock data - replace with actual data later
const mockRecipes = [
  {
    id: 1,
    title: 'Spaghetti Carbonara',
    description: 'Classic Italian pasta dish with eggs, cheese, pancetta, and pepper',
    imageUrl: 'https://placehold.co/400x200',
    cookTime: '30 mins',
  },
  {
    id: 2,
    title: 'Chicken Stir Fry',
    description: 'Quick and healthy chicken with mixed vegetables',
    imageUrl: 'https://placehold.co/400x200',
    cookTime: '20 mins',
  },
  // Add more mock recipes as needed
];

const RecipeManagement = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddRecipe = () => {
    setIsAddDialogOpen(true);
  };

  const handleRecipeSubmit = async (recipeData: { url?: string, file?: File }) => {
    try {
      if (recipeData.url) {
        // Handle URL submission
        console.log('Processing URL:', recipeData.url);
        // TODO: Send URL to backend for processing
      }
      
      if (recipeData.file) {
        // Handle PDF submission
        console.log('Processing file:', recipeData.file.name);
        const formData = new FormData();
        formData.append('file', recipeData.file);
        // TODO: Send file to backend for processing
      }
    } catch (error) {
      console.error('Error processing recipe:', error);
      // TODO: Add error handling
    }
  };

  const handleEditRecipe = (id: number) => {
    console.log('Edit recipe', id);
  };

  const handleDeleteRecipe = (id: number) => {
    console.log('Delete recipe', id);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Recipes
      </Typography>
      
      <Grid container spacing={4}>
        {mockRecipes.map((recipe) => (
          <Grid item xs={12} sm={6} md={4} key={recipe.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={recipe.imageUrl}
                alt={recipe.title}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {recipe.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {recipe.description}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Cook Time: {recipe.cookTime}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => handleEditRecipe(recipe.id)}>
                  Edit
                </Button>
                <Button size="small" color="error" onClick={() => handleDeleteRecipe(recipe.id)}>
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <StyledFab 
        color="primary" 
        aria-label="add recipe"
        onClick={handleAddRecipe}
      >
        <AddIcon />
      </StyledFab>

      <AddRecipeDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleRecipeSubmit}
      />
    </Container>
  );
};

export default RecipeManagement; 