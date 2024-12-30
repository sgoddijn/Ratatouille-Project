import { 
  Container, 
  Typography, 
  Card, 
  CardMedia, 
  CardContent, 
  List, 
  ListItem, 
  ListItemText,
  Box,
  Chip,
  Divider
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import { Recipe } from '../../../shared/Recipe';

const RecipeDetails = () => {
  const location = useLocation();
  const recipe: Recipe = location.state?.recipe;

  if (!recipe) return <Typography>Recipe not found</Typography>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card>
        <CardMedia
          component="img"
          height="400"
          image={recipe.imageUrl || 'https://placehold.co/600x400'}
          alt={recipe.title}
        />
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {recipe.title}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            {recipe.description}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            {recipe.cookTime && (
              <Chip label={`Cook Time: ${recipe.cookTime}`} />
            )}
            <Chip label={`${recipe.macros.calories} calories`} />
            <Chip label={`${recipe.macros.protein}g protein`} />
            <Chip label={`${recipe.macros.carbs}g carbs`} />
            <Chip label={`${recipe.macros.fat}g fat`} />
          </Box>

          <Typography variant="h6" gutterBottom>
            Ingredients
          </Typography>
          <List>
            {recipe.ingredients[0].map((ingredient: string, index: number) => (
              <ListItem 
                key={index} 
                sx={{ 
                  py: 0.5,
                  display: 'list-item',
                  listStyleType: 'disc',
                  ml: 4,
                  pl: 1
                }}
              >
                <ListItemText primary={ingredient} />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Instructions
          </Typography>
          <List>
            {recipe.instructions[0].map((step: string, index: number) => (
              <ListItem key={index}>
                <ListItemText 
                  primary={`Step ${index + 1}`} 
                  secondary={step}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Container>
  );
};

export default RecipeDetails; 