import React, { useEffect, useState } from 'react';
import { Container, Typography, List, ListItem, ListItemText } from '@mui/material';

const ShoppingList = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
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
        const cleanedIngredients = await cleanResponse.json();
        setIngredients(cleanedIngredients);

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
          {ingredients.length > 0 ? (
            ingredients.map((ingredient, index) => (
              <ListItem key={index}>
                <ListItemText primary={ingredient} />
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