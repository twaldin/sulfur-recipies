"use client"

import * as React from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Recipe, SpecialEffect } from "@/types/recipe"

interface GroupedRecipesViewProps {
  recipes: Recipe[]
}


export function GroupedRecipesView({ recipes }: GroupedRecipesViewProps) {
  const groupedRecipes = React.useMemo(() => {
    const groups: { [key: string]: Recipe[] } = {}
    
    recipes.forEach(recipe => {
      const outputItem = recipe.name
      if (!groups[outputItem]) {
        groups[outputItem] = []
      }
      groups[outputItem].push(recipe)
    })
    
    return Object.entries(groups)
      .map(([outputItem, recipeList]) => ({
        outputItem,
        recipes: recipeList,
        totalVariations: recipeList.reduce((sum, r) => 
          sum + (r.recipeVariations?.length || 1), 0
        )
      }))
      .sort((a, b) => a.outputItem.localeCompare(b.outputItem))
  }, [recipes])

  const formatSpecialEffects = (effects: SpecialEffect[]) => {
    if (!effects || effects.length === 0) return "None"
    return effects.map(effect => 
      `${effect.effect}: ${effect.value}${effect.unit ? ` ${effect.unit}` : ''}`
    ).join(", ")
  }

  const formatIngredients = (ingredients: { [key: string]: number }) => {
    return Object.entries(ingredients)
      .map(([name, qty]) => `${name} (${qty})`)
      .join(", ")
  }

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full">
        {groupedRecipes.map((group) => (
          <AccordionItem key={group.outputItem} value={group.outputItem}>
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{group.outputItem}</span>
                <Badge variant="secondary" className="text-xs">
                  {group.totalVariations} variation{group.totalVariations !== 1 ? 's' : ''}
                </Badge>
                {group.recipes[0].type && (
                  <Badge variant="outline" className="text-xs">
                    {group.recipes[0].type}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                {group.recipes.map((recipe, recipeIndex) => (
                  <div key={`${recipe.id}-${recipeIndex}`} className="space-y-3">
                    {/* Main Recipe */}
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Ingredients</h4>
                          <p className="text-sm">{formatIngredients(recipe.ingredients)}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Health & Time</h4>
                          <p className="text-sm">
                            {recipe.health !== null ? `${recipe.health} HP` : 'No healing'} 
                            {recipe.duration ? ` | ${recipe.duration}s` : ''}
                            {recipe.health && recipe.duration ? 
                              ` | ${(recipe.health / recipe.duration).toFixed(2)} HP/s` : ''
                            }
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Special Effects</h4>
                          <p className="text-sm">{formatSpecialEffects(recipe.specialEffects)}</p>
                        </div>
                      </div>
                      
                      {(recipe.sellingValue || recipe.buyingValue || recipe.gridSize) && (
                        <div className="mt-3 pt-3 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
                          {recipe.sellingValue && (
                            <div>
                              <h4 className="font-medium text-sm text-muted-foreground mb-1">Sell Price</h4>
                              <p className="text-sm">{recipe.sellingValue} SulfCoins</p>
                            </div>
                          )}
                          {recipe.buyingValue && (
                            <div>
                              <h4 className="font-medium text-sm text-muted-foreground mb-1">Buy Price</h4>
                              <p className="text-sm">{recipe.buyingValue} SulfCoins</p>
                            </div>
                          )}
                          {recipe.gridSize && (
                            <div>
                              <h4 className="font-medium text-sm text-muted-foreground mb-1">Grid Size</h4>
                              <p className="text-sm">{recipe.gridSize}</p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t">
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Description</h4>
                        <p className="text-sm italic">{recipe.description}</p>
                      </div>
                    </div>

                    {/* Recipe Variations */}
                    {recipe.recipeVariations && recipe.recipeVariations.length > 0 && (
                      <div className="ml-4">
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Alternative Recipes:</h4>
                        <div className="space-y-2">
                          {recipe.recipeVariations.map((variation, varIndex) => (
                            <div key={varIndex} className="bg-secondary/30 p-3 rounded border-l-4 border-primary">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-sm font-medium">
                                    {variation.type && `${variation.type} - `}
                                    {formatIngredients(variation.ingredients)}
                                  </span>
                                  {variation.output && variation.output > 1 && (
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      Yields {variation.output}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}