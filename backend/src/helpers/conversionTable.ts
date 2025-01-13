export const conversionTable = {
    dryMeasurementRatios: {
        oz: 1, 
        tbsp: 2, 
        cup: 1/8, 
        grams: 28, 
        pounds: 0.0617,
    },
    liquidMeasurementRatios: {
        oz: 1, 
        tsp: 6,
        tbsp: 2,
        ml: 30, 
        cup: 1/8,
    },
    chicken: {
        thigh: "113g", // g
        breast: "226g", // g
        cup: "140g", // g
    }
};

export const getConversionString = (): string => {
    let conversionString = "";
    for (const [category, measurements] of Object.entries(conversionTable)) {
        conversionString += `${category}: `;
        for (const [unit, ratio] of Object.entries(measurements)) {
            if (category === "chicken") {
                conversionString += `${unit} = ${ratio}, `;
            } else {
                conversionString += `${ratio} ${unit} = `;
            }
        }
        conversionString += `\n`;
    }
    console.log(conversionString);
    return conversionString;
}; 