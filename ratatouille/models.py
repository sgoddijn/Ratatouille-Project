from datetime import datetime
from functools import reduce
from typing import List, Self
from pydantic import BaseModel, Field, computed_field


class Macros(BaseModel):
    calories: float = 0
    protein: float = 0
    carbs: float = 0
    fat: float = 0

    def __add__(self, other: Self) -> Self:
        return Macros(
            calories=self.calories + other.calories,
            protein=self.protein + other.protein,
            carbs=self.carbs + other.carbs,
            fat=self.fat + other.fat,
        )


class Ingridient(BaseModel):
    ingridient: str
    metric: str
    quantity: float
    # macros: Macros = Field(default_factory=Macros)
    def __str__(self):
        return f"{self.quantity} {self.metric} {self.ingridient}"


class Recipe(BaseModel):
    title: str
    description: str
    ingridients: list[Ingridient]
    instructions: list[str]

    # def get_macros(self) -> Macros:
    #     ingridient_macros = map(lambda ing: ing.macros, self.ingridients)
    #     total_macros = reduce(lambda ing1, ing2: ing1 + ing2, ingridient_macros)
    #     return total_macros

    def __str__(self):
        string = f"{self.title}\n{self.description}\n\n"
        ingridients = "\n".join(map(str,self.ingridients))
        instructions = "\n".join(self.instructions)
        string += f"Ingridients:\n{ingridients}\n\n"
        string += f"Instructions:\n{instructions}\n\n"
        return string

class Meal(BaseModel):
    recipe: Recipe
    meal_time: str = Field(description="Time of the day recommended for meal")
    
    def __str__(self):
        return str(self.recipe)
    

class MealPlanDay(BaseModel):
    day: int
    meals: list[Meal]

class MealPlanWeek(BaseModel):
    monday: MealPlanDay
    tuesday: MealPlanDay
    wednesday: MealPlanDay
    thursday: MealPlanDay
    friday: MealPlanDay
    saturday: MealPlanDay
    sunday: MealPlanDay