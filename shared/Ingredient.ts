export interface Ingredient {
    ingredientName: string;
    quantity: string;
    conversions: string[];
    toString(): string;
}

export class IngredientImpl implements Ingredient {
    constructor(
        public ingredientName: string,
        public quantity: string,
        public conversions: string[]
    ) {}

    toString(): string {
        let result = "";
        if (this.conversions.length > 0) {
            result = this.conversions.reduce((acc, curr, idx) => {
                if (idx === this.conversions.length - 1) {
                    return acc + curr;
                }
                return acc + curr + " or ";
            }, "");
            return `${result} ${this.ingredientName}`;
        }
        return `${this.quantity} ${this.ingredientName}`;
    }
}