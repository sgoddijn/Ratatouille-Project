import React, { useEffect, useState } from 'react';
import { Container, Typography, List, ListItem, ListItemText } from '@mui/material';

interface IngredientMap {
  [key: string]: string;
}

const ShoppingList = () => {
  const [ingredients, setIngredients] = useState<IngredientMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/mealplan/current');
        if (!response.ok) throw new Error('Failed to fetch meal plan');
        const mealPlan = await response.json();
        const ingredientArray: string[] = [];

        // Extract ingredients from the meal plan
        for (const day in mealPlan) {
          for (const mealType in mealPlan[day]) {
            const recipe = mealPlan[day][mealType];
            if (recipe && recipe.ingredients) {
              recipe.ingredients.forEach((ingredient: string) => ingredientArray.push(ingredient));
            }
          }
        }

        // Clean ingredients through API
        const cleanResponse = await fetch('http://localhost:3000/api/ingredients/clean', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ingredients: ingredientArray})
        });
        
        if (!cleanResponse.ok) throw new Error('Failed to clean ingredients');
        setIngredients(await cleanResponse.json());

      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMealPlan();
  }, []);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Shopping List
      </Typography>
      {loading ? (
        <Typography>Loading ingredients...</Typography>
      ) : (
        <List>
          {Object.entries(ingredients).length > 0 ? (
            Object.entries(ingredients).map(([ingredient, amount], index) => (
              <ListItem key={index}>
                <ListItemText 
                  primary={ingredient}
                  secondary={amount}
                />
              </ListItem>
            ))
          ) : (
            <Typography>No ingredients found for the current meal plan.</Typography>
          )}
        </List>
      )}
    </Container>
  );
};

export default ShoppingList; 