// Types for the scraped data structure
export interface ScrapedEffect {
  type: string
  value: string
  duration: string
}

export interface ScrapedIngredient {
  item?: string
  name?: string
  quantity: number | string
}

export interface ScrapedRecipeVariation {
  ingredients: ScrapedIngredient[]
  output?: {
    item: string
    quantity: number
  }
}

export interface ScrapedEconomic {
  sellingValue?: number
  buyingValue?: number
  vendors?: string[]
}

export interface ScrapedHealing {
  amount?: number
  duration?: number
  unit?: string
}

export interface ScrapedRecipe {
  name: string
  type: string
  gridSize: string
  imageUrl?: string
  description: string
  effects?: ScrapedEffect[]
  economic?: ScrapedEconomic
  economicData?: ScrapedEconomic
  healing?: ScrapedHealing
  recipes?: ScrapedRecipeVariation[]
}

export interface ScrapedRecipesData {
  metadata: {
    name: string
    description: string
    scrapedAt: string
    totalRecipes: number
    source: string
    baseUrl: string
    scrapingMethod: string
    completionStatus: string
    categories: {
      cooked_consumables: number
      cooked_throwables: number
      cooked_equipment: number
    }
  }
  recipes: {
    cooked_consumables: ScrapedRecipe[]
    cooked_throwables: ScrapedRecipe[]
    cooked_equipment: ScrapedRecipe[]
  }
}

export interface ScrapedIngredientData {
  name: string
  description: string
  type: string | string[]
  gridSize: string
  sellingValue?: number
  buyingValue?: number
  sellers?: string[]
  usedIn?: string[]
  imageUrl?: string
}

export interface ScrapedIngredientsData {
  metadata: {
    name: string
    description: string
    scrapedAt: string
    totalIngredients: number
    source: string
    baseUrl: string
    scrapingMethod: string
    completionStatus: string
  }
  ingredients: {
    [key: string]: ScrapedIngredientData
  }
}