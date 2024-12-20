"""
Recipe module for the Ratatouille project.
Handles recipe creation, modification, and storage.
"""

from typing import List, Dict
from dataclasses import dataclass

@dataclass
class Recipe:
    """A class representing a cooking recipe."""
    
    name: str
    ingredients: List[Dict[str, str]]
    instructions: List[str]
    prep_time: int  # in minutes
    cook_time: int  # in minutes
    servings: int
    
    @property
    def total_time(self) -> int:
        """Calculate total recipe time in minutes."""
        return self.prep_time + self.cook_time
    
    def scale_recipe(self, desired_servings: int) -> None:
        """Scale the recipe to the desired number of servings."""
        if desired_servings <= 0:
            raise ValueError("Servings must be greater than 0")
            
        scale_factor = desired_servings / self.servings
        for ingredient in self.ingredients:
            if 'amount' in ingredient:
                try:
                    ingredient['amount'] = str(float(ingredient['amount']) * scale_factor)
                except ValueError:
                    # Skip scaling for non-numeric amounts
                    continue
        
        self.servings = desired_servings