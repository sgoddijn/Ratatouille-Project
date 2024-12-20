"""
Test module for the Recipe class.
"""

import pytest
from ratatouille.recipe import Recipe

def test_recipe_creation():
    """Test basic recipe creation."""
    recipe = Recipe(
        name="Ratatouille",
        ingredients=[
            {"item": "eggplant", "amount": "1", "unit": "large"},
            {"item": "zucchini", "amount": "2", "unit": "medium"}
        ],
        instructions=[
            "Slice the vegetables",
            "Layer in baking dish",
            "Bake at 375°F for 45 minutes"
        ],
        prep_time=30,
        cook_time=45,
        servings=4
    )
    
    assert recipe.name == "Ratatouille"
    assert len(recipe.ingredients) == 2
    assert len(recipe.instructions) == 3
    assert recipe.total_time == 75

def test_recipe_scaling():
    """Test recipe scaling functionality."""
    recipe = Recipe(
        name="Simple Sauce",
        ingredients=[
            {"item": "tomatoes", "amount": "2", "unit": "cups"}
        ],
        instructions=["Mix everything"],
        prep_time=10,
        cook_time=20,
        servings=2
    )
    
    recipe.scale_recipe(4)
    assert recipe.servings == 4
    assert recipe.ingredients[0]["amount"] == "4.0"