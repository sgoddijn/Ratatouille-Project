"""
Test module for the Recipe class.
Comprehensive testing of recipe creation, modification, and edge cases.
"""

import pytest
from ratatouille.recipe import Recipe

def test_recipe_creation():
    """Test basic recipe creation with all fields."""
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
    assert recipe.prep_time == 30
    assert recipe.cook_time == 45
    assert recipe.servings == 4

def test_recipe_scaling():
    """Test recipe scaling with different scenarios."""
    recipe = Recipe(
        name="Simple Sauce",
        ingredients=[
            {"item": "tomatoes", "amount": "2", "unit": "cups"},
            {"item": "salt", "amount": "1", "unit": "pinch"},  # Non-numeric amount
            {"item": "herbs", "amount": "to taste", "unit": ""}  # Non-scalable amount
        ],
        instructions=["Mix everything"],
        prep_time=10,
        cook_time=20,
        servings=2
    )
    
    # Test doubling the recipe
    recipe.scale_recipe(4)
    assert recipe.servings == 4
    assert recipe.ingredients[0]["amount"] == "4.0"
    assert recipe.ingredients[1]["amount"] == "1"  # Pinch shouldn't scale
    assert recipe.ingredients[2]["amount"] == "to taste"  # Should remain unchanged

    # Test halving the recipe
    recipe.scale_recipe(2)
    assert recipe.servings == 2
    assert recipe.ingredients[0]["amount"] == "2.0"

def test_invalid_recipe_parameters():
    """Test error handling for invalid recipe parameters."""
    with pytest.raises(ValueError):
        Recipe(
            name="Invalid Recipe",
            ingredients=[],  # Empty ingredients
            instructions=["Step 1"],
            prep_time=-5,  # Negative time
            cook_time=20,
            servings=2
        )

    with pytest.raises(ValueError):
        Recipe(
            name="",  # Empty name
            ingredients=[{"item": "test", "amount": "1", "unit": "cup"}],
            instructions=["Step 1"],
            prep_time=5,
            cook_time=20,
            servings=0  # Invalid servings
        )

def test_recipe_scaling_edge_cases():
    """Test recipe scaling with edge cases."""
    recipe = Recipe(
        name="Edge Case Recipe",
        ingredients=[
            {"item": "flour", "amount": "1.5", "unit": "cups"},
            {"item": "water", "amount": "0.25", "unit": "cup"}
        ],
        instructions=["Mix"],
        prep_time=5,
        cook_time=10,
        servings=1
    )

    # Test scaling to very large number
    recipe.scale_recipe(100)
    assert recipe.servings == 100
    assert float(recipe.ingredients[0]["amount"]) == 150.0
    assert float(recipe.ingredients[1]["amount"]) == 25.0

    # Test scaling back to original
    recipe.scale_recipe(1)
    assert recipe.servings == 1
    assert float(recipe.ingredients[0]["amount"]) == 1.5
    assert float(recipe.ingredients[1]["amount"]) == 0.25

    # Test invalid scaling
    with pytest.raises(ValueError):
        recipe.scale_recipe(0)
    with pytest.raises(ValueError):
        recipe.scale_recipe(-1)

def test_recipe_time_calculations():
    """Test various time calculations and scenarios."""
    recipe = Recipe(
        name="Time Test Recipe",
        ingredients=[{"item": "test", "amount": "1", "unit": "unit"}],
        instructions=["Step 1"],
        prep_time=45,
        cook_time=90,
        servings=1
    )

    assert recipe.total_time == 135  # 45 + 90
    assert recipe.prep_time < recipe.cook_time
    assert recipe.total_time > recipe.prep_time
    assert recipe.total_time > recipe.cook_time