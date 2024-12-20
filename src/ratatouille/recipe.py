"""
Recipe module for the Ratatouille project.
Handles recipe creation, modification, and storage.
"""

from typing import List, Dict
from dataclasses import dataclass
from dataclasses import field

@dataclass
class Recipe:
    """A class representing a cooking recipe.
    
    Attributes:
        name (str): Name of the recipe
        ingredients (List[Dict[str, str]]): List of ingredients with amount and unit
        instructions (List[str]): Step-by-step cooking instructions
        prep_time (int): Preparation time in minutes
        cook_time (int): Cooking time in minutes
        servings (int): Number of servings the recipe yields
    """
    
    name: str
    ingredients: List[Dict[str, str]]
    instructions: List[str]
    prep_time: int  # in minutes
    cook_time: int  # in minutes
    servings: int
    
    def __post_init__(self):
        """Validate recipe attributes after initialization."""
        if not self.name:
            raise ValueError("Recipe name cannot be empty")
            
        if not self.ingredients:
            raise ValueError("Recipe must have at least one ingredient")
            
        if not self.instructions:
            raise ValueError("Recipe must have at least one instruction")
            
        if self.prep_time < 0:
            raise ValueError("Preparation time cannot be negative")
            
        if self.cook_time < 0:
            raise ValueError("Cooking time cannot be negative")
            
        if self.servings <= 0:
            raise ValueError("Number of servings must be greater than 0")
            
        # Validate ingredient structure
        for ingredient in self.ingredients:
            required_keys = {"item", "amount", "unit"}
            if not all(key in ingredient for key in required_keys):
                raise ValueError(
                    f"Each ingredient must have {', '.join(required_keys)}"
                )
    
    @property
    def total_time(self) -> int:
        """Calculate total recipe time in minutes.
        
        Returns:
            int: Total time in minutes (prep_time + cook_time)
        """
        return self.prep_time + self.cook_time
    
    def scale_recipe(self, desired_servings: int) -> None:
        """Scale the recipe to the desired number of servings.
        
        Args:
            desired_servings (int): The target number of servings
            
        Raises:
            ValueError: If desired_servings is less than or equal to 0
        """
        if desired_servings <= 0:
            raise ValueError("Servings must be greater than 0")
            
        scale_factor = desired_servings / self.servings
        for ingredient in self.ingredients:
            if 'amount' in ingredient:
                try:
                    # Try to convert to float and scale
                    current_amount = float(ingredient['amount'])
                    scaled_amount = current_amount * scale_factor
                    # Format to remove trailing zeros
                    ingredient['amount'] = f"{scaled_amount:.10f}".rstrip('0').rstrip('.')
                except ValueError:
                    # Skip scaling for non-numeric amounts (e.g., "to taste", "a pinch")
                    continue
        
        self.servings = desired_servings
    
    def get_scaled_copy(self, desired_servings: int) -> 'Recipe':
        """Create a new scaled copy of the recipe.
        
        Args:
            desired_servings (int): The target number of servings
            
        Returns:
            Recipe: A new Recipe instance with scaled quantities
            
        Raises:
            ValueError: If desired_servings is less than or equal to 0
        """
        new_recipe = Recipe(
            name=self.name,
            ingredients=[ingredient.copy() for ingredient in self.ingredients],
            instructions=self.instructions.copy(),
            prep_time=self.prep_time,
            cook_time=self.cook_time,
            servings=self.servings
        )
        new_recipe.scale_recipe(desired_servings)
        return new_recipe