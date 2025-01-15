from langchain_core.language_models import BaseChatModel
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from ratatouille.models import Meal, MealPlanDay


world_class_chef_prompt = ChatPromptTemplate([
    ("system", "A world class chef that is extremely precise with their measurements."),
    ("user", "{description}")
])


def generate_meal(
    description: str,
    llm: BaseChatModel | None = None,
) -> Meal:
    if not llm:
        llm = ChatOpenAI()
    chain = world_class_chef_prompt | llm.with_structured_output(Meal, method="function_calling")
    return chain.invoke({"description": description})
    

def generate_meal_plan_day(
    description: str,
    llm: BaseChatModel | None = None,
) -> MealPlanDay:
    if not llm:
        llm = ChatOpenAI()
    chain = world_class_chef_prompt | llm.with_structured_output(MealPlanDay, method="function_calling")
    return chain.invoke({"description": description})