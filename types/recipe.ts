export interface SpecialEffect {
  effect: string;
  type?: string;
  value: number | string;
  duration: number;
  unit?: string;
  description?: string;
}

export interface RecipeVariation {
  variation?: number;
  type?: string;
  ingredients: {
    [ingredientName: string]: number;
  };
  output?: number;
}

export interface IngredientData {
  name: string;
  description: string;
  image?: string;
  recipeId?: string;
  type?: string;
  gridSize?: string;
  sellingValue?: number;
  buyingValue?: number;
  sellers?: string[];
  usedIn?: string[];
}

export interface IngredientsMap {
  [key: string]: IngredientData;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: {
    [ingredientName: string]: number;
  };
  health: number | null;
  damage?: number | null;
  damageType?: 'health' | 'damage';
  duration: number;
  description: string;
  specialEffects: SpecialEffect[];
  sellingValue?: number;
  buyingValue?: number;
  gridSize?: string;
  type?: string;
  recipeVariations?: RecipeVariation[];
  cookingTime?: number;
  sellers?: string[];
  usedIn?: string[];
  imageUrl?: string;
  outputAmount?: number; // How many items this recipe creates
}