import Anthropic from '@anthropic-ai/sdk';
import process from 'node:process';
import fs from 'node:fs';
import { getConversionString } from '../helpers/conversionTable.ts';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || ''
});

const model = "claude-3-5-sonnet-20241022";
const max_tokens = 5000;
const temperature = 0;

async function consolidateIngredients(ingredients: string[]): Promise<Record<string, string[]>> {
    const msg = await anthropic.messages.create({
        model, max_tokens, temperature,
        system: "You are a grocery shopper consolidating similar ingredients",
        messages: [{
            role: "user",
            content: [{
                type: "text",
                text: `Consolidate these ingredients into groups. Create a key for each base ingredient and map it to an array of amounts.
                Remove preparation instructions (diced, chopped, etc).
                Please consider chicken breast, thighs, and chopped or diced chicken to be different.
                Please consider different types of flour and sugar (e.g. almond, corn, brown, caster, etc.)
                Return only a valid JSON object where keys are ingredient names and values are arrays of amounts.

                Example Input: ['2 cups cooked chicken', '640g boneless and skinless thighs', '500g chicken breast', '2 skinless breast fillets', '2 boneless, skinless breasts']
                Expected Output: { "chicken": ["2 cups"], "chicken breast": ["500g", "2", "2"], "chicken thigh": "640g"] }
                
                Example Input: ["2 large onions, diced", "1 small onion"]
                Example Output: { "onion": ["2", "1"] }
                
                Ingredients: ${JSON.stringify(ingredients)}`
            }]
        }]
    });

    return msg.content[0].type === 'text' ? JSON.parse(msg.content[0].text) : {};
}

async function standardizeAmounts(consolidatedIngredients: Record<string, string[]>): Promise<string[]> {
    const msg = await anthropic.messages.create({
        model, max_tokens, temperature,
        system: "You are a grocery shopper standardizing ingredient amounts",
        messages: [{
            role: "user",
            content: [{
                type: "text",
                text: `Take these consolidated ingredients and standardize their amounts.
                For each key in the input JSON, consolidate the amounts and convert to consistent units.
                Return a JSON object where keys are ingredient names and values are amounts in consistent units.
                Validate that the number of keys returned is the same as the number of keys in the input JSON.
                Do not return any other text.

                Here are some useful conversions to know: ${getConversionString()}
                Input: ${JSON.stringify(consolidatedIngredients)}


                Example Input: { "chicken": ["2 cups"], "chicken breast": ["500g", "2", "2"], "chicken thigh": "640g"] }
                Expected Output: {"chicken": "280g", "chicken breast": "1404g", "chicken thigh": "640g"}`
            }]
        }]
    });

    return msg.content[0].type === 'text' ? JSON.parse(msg.content[0].text) : [];
}

export async function cleanIngredients(ingredients: string[]): Promise<string[]> {
    // await fs.promises.writeFile('ingredients.txt', JSON.stringify(ingredients, null, 2));

    const consolidated = await consolidateIngredients(ingredients);
    // await fs.promises.writeFile('consolidated.txt', JSON.stringify(consolidated, null, 2));
    
    const standardized =  await standardizeAmounts(consolidated);
    // await fs.promises.writeFile('standardized.txt', JSON.stringify(standardized, null, 2));
    
    return standardized;
}