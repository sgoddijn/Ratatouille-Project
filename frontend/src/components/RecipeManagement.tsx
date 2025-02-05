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
import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import AddRecipeDialog from './AddRecipeDialog';
import { Recipe } from '../../../shared/Recipe';
import { useNavigate } from 'react-router-dom';
import { ObjectId } from 'https://deno.land/x/mongo@v0.30.0/mod.ts';

const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
}));

const RecipeManagement = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/recipes');
      if (!response.ok) throw new Error('Failed to fetch recipes');
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRecipe = () => {
    setIsAddDialogOpen(true);
  };

  const handleRecipeSubmit = async (recipeData: { url?: string, file?: File }) => {
    try {
      let response;
      
      if (recipeData.url) {
        console.log(recipeData.url);
        response = await fetch('http://localhost:3000/api/recipes/url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: recipeData.url }),
        });
      } else if (recipeData.file) {
        const formData = new FormData();
        formData.append('file', recipeData.file);
        
        response = await fetch('http://localhost:3000/api/recipes/pdf', {
          method: 'POST',
          body: formData,
        });
      }

      console.log(response);
      if (!response?.ok) {
        throw new Error('Failed to process recipe');
      }

      const recipe = await response.json();
      console.log('Processed recipe:', recipe);

      // Refresh the recipes list
      fetchRecipes();
      
      // Close the dialog
      setIsAddDialogOpen(false);
      
    } catch (error) {
      console.error('Error processing recipe:', error);
    }
  };

  const handleEditRecipe = (id: number) => {
    console.log('Edit recipe', id);
  };

  const handleDeleteRecipe = async (id: ObjectId, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const response = await fetch(`http://localhost:3000/api/recipes/${id}`, {
      method: 'DELETE',
    });

    console.log(response);
    if (!response?.ok) {
      throw new Error('Failed to delete recipe');
    }

    fetchRecipes();
  };

  const handleRecipeClick = (recipe: Recipe) => {
    console.log('Recipe clicked', recipe);
    navigate(`/recipe/${recipe.id}`, { state: { recipe } });
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Recipes
      </Typography>
      
      <Grid container spacing={4}>
        {isLoading ? (
          <Typography>Loading recipes...</Typography>
        ) : recipes.length === 0 ? (
          <Typography>No recipes yet. Add your first recipe!</Typography>
        ) : (
          recipes.map((recipe) => (
            <Grid item xs={12} sm={6} md={4} key={recipe.id}>
              <Card 
                sx={{ cursor: 'pointer' }}
                onClick={() => handleRecipeClick(recipe)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={recipe.imageUrl || 'https://placehold.co/600x400'}
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
                    Cook Time: {recipe.cookTime || 'Not specified'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleEditRecipe(recipe.id)}>
                    Edit
                  </Button>
                  <Button size="small" color="error" onClick={(event) => handleDeleteRecipe(recipe._id, event)}>
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
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