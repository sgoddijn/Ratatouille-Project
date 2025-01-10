import Anthropic from '@anthropic-ai/sdk';
import process from 'node:process';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || ''
});
  
const model = "claude-3-5-sonnet-20241022";
const max_tokens = 1024;
const temperature = 0;
const systemPrompt = "You are a grocery shopper in charge of taking a list of ingredients and cleaning them up for a shopping list";
  
export async function cleanIngredients(ingredients: string[]): Promise<string[]> {
    const msg = await anthropic.messages.create({
        model: model,
        max_tokens: max_tokens,
        temperature: temperature,
        system: systemPrompt,
        messages: [
          {
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": `Clean and consolidate this list of ingredients for a shopping list. 
                Combine similar ingredients and standardize their descriptions.
                Remove duplicates and consolidate quantities.
                
                
                Ingredients list:
                ${ingredients}
                
                Return a JSON object where each key is the original description and the value contains the standardized type and amount.
                Example format:

                Input: 2 large onions, dice
                Output: { "onion": { "original string": "2 large onions, dice", "ingredientAmount": "2"} }

                Input: 200g of chicken breast, diced
                Output: { "chicken": { "original string": "200g of chicken breast, diced", "ingredientAmount": "200g"}
                
                If there are multiple entires of the same ingredient, then concatenate the results in an array as follows: 
                
                Example: You see two separate ingredients, one says 200g of chicken breast, diced and the other says 2 pounds of chicken
                Output: { "chicken": [
                { "original string": " 200g of chicken breast, diced", "ingredientAmount": "200g"}, 
                { "original string": "2 pounds of chicken", "ingredientAmount": "2 pounds"}
                ]}
                `
              }
            ]
          }
        ]
      });

    if (msg.content[0].type === 'text') {
      const parsedResponse = JSON.parse(msg.content[0].text);
      // Convert the parsed response into a consolidated list
      return Object.entries(parsedResponse).map(([_, value]: [string, any]) => 
        `${value.ingredientAmount} ${value.ingredientType}`
      );
    }
    return [];
}