import Anthropic from '@anthropic-ai/sdk';
import process from 'node:process';
import fs from 'node:fs';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || ''
});
  
const model = "claude-3-5-sonnet-20241022";
const max_tokens = 5000;
const temperature = 0;
const systemPrompt = "You are a grocery shopper in charge of taking a list of ingredients and cleaning them up for a shopping list";

const writeToFileForTesting = async (ingredients: string[], parsedResponse: JSON) => {
    const format1 = Object.entries(parsedResponse)
                            .map(([key, values]) => `${key}: ${values.join(', ')}`)
                            .join('\n');

    await fs.promises.writeFile('ingredientList.txt', ingredients.join('\n'));
    await fs.promises.writeFile('anthropicResponse.txt', format1);
}
  
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
                "text": `Restructure this list of ingredients to understand which ingredients show up multiple times.
                For each entry we will create a key that is representative of the ingredient which maps to an array of the amounts.
                Every single item that is sent in the ingredients list should have a corresponding entry in the output.
                If you see adjectives like diced, shredded, or chopped, then you should not include them in the output.
                Be sure to return a valid JSON object and nothing else.
                
                Ingredients list:
                ${ingredients}
                
                Return a JSON object where each key is the original description and the value contains the standardized type and amount.
                Example format:

                Input: 2 large onions, dice
                Output: { "onion": ['2 large'] }

                Input: 200g of chicken breast, diced
                Output: { "chicken": ['200g'] }
                
                If there are multiple entires of the same ingredient, then concatenate the results in an array as follows: 
                
                Example: 200g of diced chicken breast. 2 pounds of chicken.
                Output: { "chicken": ['200g', '2 pounds'] }
                `
              }
            ]
          }
        ]
      });

    
    
   
    if (msg.content[0].type === 'text') {
        const parsedResponse = JSON.parse(msg.content[0].text);
        // await writeToFileForTesting(ingredients, parsedResponse);

        // Convert the parsed response into a consolidated list
        return Object.entries(parsedResponse).map(([_, value]: [string, any]) => 
            `${value.ingredientAmount} ${value.ingredientType}`
      );
    }
    return [];
}