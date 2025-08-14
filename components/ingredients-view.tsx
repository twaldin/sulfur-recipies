"use client"

import * as React from "react"
import Image from "next/image"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SearchIcon } from "lucide-react"
import { Recipe, IngredientsMap, IngredientData } from "@/types/recipe"

interface IngredientsViewProps {
  recipes: Recipe[]
  ingredients: IngredientsMap
  onIngredientClick?: (ingredientName: string) => void
}

export function IngredientsView({ recipes, ingredients, onIngredientClick }: IngredientsViewProps) {
  const [selectedIngredient, setSelectedIngredient] = React.useState<string | null>(null)

  const getRecipesForIngredient = (ingredientName: string) => {
    return recipes.filter(recipe => 
      Object.keys(recipe.ingredients).includes(ingredientName)
    )
  }

  const getRecipeToMakeIngredient = (ingredient: IngredientData) => {
    if (!ingredient.recipeId) return null
    return recipes.find(recipe => recipe.id === ingredient.recipeId)
  }

  const ingredientsList = Object.keys(ingredients).sort()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {ingredientsList.map((ingredientName) => {
        const ingredient = ingredients[ingredientName]
        const relatedRecipes = getRecipesForIngredient(ingredientName)
        const craftingRecipe = getRecipeToMakeIngredient(ingredient)
        const isExpanded = selectedIngredient === ingredientName
        
        return (
          <div key={ingredientName} className="relative">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedIngredient(
                selectedIngredient === ingredientName ? null : ingredientName
              )}
            >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                {ingredient.image ? (
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src={ingredient.image}
                      alt={ingredient.name}
                      fill
                      className="object-contain rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 flex-shrink-0 bg-muted rounded flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">?</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">
                    {ingredient.name}
                    {craftingRecipe && (
                      <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        Craftable
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Used in {relatedRecipes.length} recipe{relatedRecipes.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            </Card>
            
            {isExpanded && (
              <Card className="absolute top-full left-0 right-0 z-10 mt-1 border-2 border-primary/20 bg-background shadow-xl">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {onIngredientClick && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          onIngredientClick(ingredientName)
                        }}
                        className="w-full"
                        variant="default"
                        size="sm"
                      >
                        <SearchIcon className="w-4 h-4 mr-2" />
                        Search recipes with {ingredientName}
                      </Button>
                    )}
                    {craftingRecipe && (
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">How to craft:</p>
                        <div className="text-sm p-2 bg-primary/5 border border-primary/20 rounded">
                          <div className="font-medium text-primary">{craftingRecipe.name}</div>
                          <div className="text-muted-foreground">
                            Ingredients: {Object.entries(craftingRecipe.ingredients).map(([name, qty]) => 
                              `${name} (${qty})`
                            ).join(", ")}
                          </div>
                          <div className="text-muted-foreground">
                            Health: {craftingRecipe.health} | Time: {craftingRecipe.duration}s
                          </div>
                          {craftingRecipe.specialEffects.length > 0 && (
                            <div className="text-muted-foreground">
                              Effects: {craftingRecipe.specialEffects.join(", ")}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {relatedRecipes.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">Used in recipes:</p>
                        {relatedRecipes.map((recipe) => (
                          <div key={recipe.id} className="text-sm p-2 bg-muted rounded mb-1">
                            <div className="font-medium">{recipe.name}</div>
                            <div className="text-muted-foreground">
                              Requires: {recipe.ingredients[ingredientName]} {ingredientName}
                            </div>
                            <div className="text-muted-foreground">
                              Health: {recipe.health} | Time: {recipe.duration}s
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )
      })}
    </div>
  )
}