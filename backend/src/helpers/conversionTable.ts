export const conversionTable = {
    "milk": {
        "cup": "240 ml",
        "tablespoon": "15 ml",
        "teaspoon": "5 ml"
    },
    "water": {
        "cup": "240 ml",
        "tablespoon": "15 ml",
        "teaspoon": "5 ml"
    },
    "oil": {
        "cup": "240 ml",
        "tablespoon": "15 ml",
        "teaspoon": "5 ml"
    },
    "honey": {
        "cup": "240 ml",
        "tablespoon": "15 ml",
        "teaspoon": "5 ml"
    },
    "vinegar": {
        "cup": "240 ml",
        "tablespoon": "15 ml",
        "teaspoon": "5 ml"
    },
    "flour": {
        "cup": "120 g",
        "tablespoon": "8 g",
        "teaspoon": "2.7 g"
    },
    "sugar": {
        "cup": "200 g",
        "tablespoon": "12.5 g",
        "teaspoon": "4.2 g"
    },
    "brown_sugar": {
        "cup": "220 g",
        "tablespoon": "13.75 g",
        "teaspoon": "4.6 g"
    },
    "rice": {
        "cup": "200 g",
        "tablespoon": "12.5 g",
        "teaspoon": "4.2 g"
    },
    "baking_powder": {
        "cup": "192 g",
        "tablespoon": "12 g",
        "teaspoon": "4 g"
    },
    "salt": {
        "cup": "288 g",
        "tablespoon": "18 g",
        "teaspoon": "6 g"
    },
    "chicken": {
        "breast": "200 g",
        "thigh": "150 g"
    },
    "strawberries": {
        "cup": "150 g",
        "tablespoon": "9.4 g"
    },
    "blueberries": {
        "cup": "190 g",
        "tablespoon": "12 g"
    },
};
  

export const getConversionString = (): string => {
    let conversionString = "";
    for (const [category, measurements] of Object.entries(conversionTable)) {
        conversionString += `${category}: `;
        const entries = Object.entries(measurements);
        
        entries.forEach(([ unit, ratio ], index) => {
            conversionString += `${unit} = ${ratio}`;
            conversionString += index === entries.length - 1 ? '. ' : ', ';
        });
        
        conversionString += '\n';
    }
    return conversionString;
}; 