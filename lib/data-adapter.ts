import { Recipe, SpecialEffect, IngredientsMap, IngredientData } from '@/types/recipe'

// Known working image URLs for fallbacks
const knownImageUrls: { [key: string]: string } = {
  // Fixed URLs from wiki research (with version parameters)
  'Dynamite': 'https://sulfur.wiki.gg/images/f/fc/Dynamite.png?f05a78',
  'Flour': 'https://sulfur.wiki.gg/images/e/e8/Flour.png?2047f8',
  'Butter': 'https://sulfur.wiki.gg/images/f/f1/Butter.png?2d78e6',
  'Whole Milk': 'https://sulfur.wiki.gg/images/0/0f/Whole_Milk.png?4df06b',
  'Used Rubber': 'https://sulfur.wiki.gg/images/7/73/Used_Rubber.png?ae1964',
  'Low Fat Milk': 'https://sulfur.wiki.gg/images/e/ef/Low_Fat_Milk.png?be88f5',
  'Skimmed Milk': 'https://sulfur.wiki.gg/images/d/d2/Skimmed_Milk.png?ca4cfe',
  'Hot Sauce': 'https://sulfur.wiki.gg/images/0/02/Hot_Sauce.png?a776ff',
  'False Sulfcap': 'https://sulfur.wiki.gg/images/4/41/False_Sulfcap.png?ef15fc',
  'Velvet Bell': 'https://sulfur.wiki.gg/images/5/50/Velvet_Bell.png?3617b4',
  'Potato Salad': 'https://sulfur.wiki.gg/images/2/24/Potato_Salad.png?f78e45',
  'Stick Grenade': 'https://sulfur.wiki.gg/images/c/c7/Stick_Grenade.png?227fad',
  'Sashimi': 'https://sulfur.wiki.gg/images/4/41/Sashimi.png?cb4a45',
  'Shoe': 'https://sulfur.wiki.gg/images/6/66/Shoe.png?7bbfb0',
  'Ramen': 'https://sulfur.wiki.gg/images/f/f8/Ramen.png?c50742',
  
  // "Any" category fallbacks (with version parameters)
  'Any Flesh': 'https://sulfur.wiki.gg/images/4/49/Craw_Flesh.png?f76748',
  'Flesh': 'https://sulfur.wiki.gg/images/4/49/Craw_Flesh.png?f76748',
  'Various Flesh': 'https://sulfur.wiki.gg/images/4/49/Craw_Flesh.png?f76748',
  'Any Milk': 'https://sulfur.wiki.gg/images/0/0f/Whole_Milk.png?4df06b',
  'Milk': 'https://sulfur.wiki.gg/images/0/0f/Whole_Milk.png?4df06b',
  'Any Milk (except buttermilk)': 'https://sulfur.wiki.gg/images/0/0f/Whole_Milk.png?4df06b',
  'Milk (any except buttermilk & whole milk)': 'https://sulfur.wiki.gg/images/e/ef/Low_Fat_Milk.png?be88f5',
  'Any Milk (except Whole Milk)': 'https://sulfur.wiki.gg/images/e/ef/Low_Fat_Milk.png?be88f5',
  'Any mulk (except buttermilk)': 'https://sulfur.wiki.gg/images/0/0f/Whole_Milk.png?4df06b', // typo version
  'Any 1x1 mushroom': 'https://sulfur.wiki.gg/images/4/41/False_Sulfcap.png?ef15fc',
  'Mushroom': 'https://sulfur.wiki.gg/images/4/41/False_Sulfcap.png?ef15fc',
  'any mushroom': 'https://sulfur.wiki.gg/images/4/41/False_Sulfcap.png?ef15fc',
  'any other 1x1 mushroom': 'https://sulfur.wiki.gg/images/4/41/False_Sulfcap.png?ef15fc',
  'different mushrooms': 'https://sulfur.wiki.gg/images/4/41/False_Sulfcap.png?ef15fc',
  'mushrooms': 'https://sulfur.wiki.gg/images/4/41/False_Sulfcap.png?ef15fc',
  'Any Skin': 'https://sulfur.wiki.gg/images/b/bd/Shav%27Wa_Skin.png?8cf32d',
  'any skin': 'https://sulfur.wiki.gg/images/b/bd/Shav%27Wa_Skin.png?8cf32d',
  'Broth': 'https://sulfur.wiki.gg/images/9/9c/Broth.png?37f671',
  
  // Normalized case versions (with version parameters)  
  'bladder': 'https://sulfur.wiki.gg/images/4/49/Craw_Flesh.png?f76748', // Using flesh as organ fallback
  'Bladder': 'https://sulfur.wiki.gg/images/4/49/Craw_Flesh.png?f76748',
  'shav\'wa bladder': 'https://sulfur.wiki.gg/images/4/49/Craw_Flesh.png?f76748',
  'Shav\'Wa Bladder': 'https://sulfur.wiki.gg/images/4/49/Craw_Flesh.png?f76748',
  'water': 'https://sulfur.wiki.gg/images/4/41/Scroll_of_Water.png?164167',
  'any water': 'https://sulfur.wiki.gg/images/4/41/Scroll_of_Water.png?164167',
  'shoe': 'https://sulfur.wiki.gg/images/6/66/Shoe.png?7bbfb0',
  'velvet bell': 'https://sulfur.wiki.gg/images/5/50/Velvet_Bell.png?3617b4',
  'potato salad': 'https://sulfur.wiki.gg/images/2/24/Potato_Salad.png?f78e45',
  'stick grenade': 'https://sulfur.wiki.gg/images/c/c7/Stick_Grenade.png?227fad',
  'sashimi': 'https://sulfur.wiki.gg/images/4/41/Sashimi.png?cb4a45',
  'hot sauce': 'https://sulfur.wiki.gg/images/0/02/Hot_Sauce.png?a776ff',
}

// Helper function to get ingredient image with fallbacks
export function getIngredientImageUrl(name: string, originalUrl?: string): string {
  // If we have a valid original URL, use it
  if (originalUrl && originalUrl.trim() && originalUrl !== 'undefined') {
    return originalUrl
  }
  
  // Use fallback system
  return getIngredientFallbackImage(name)
}

// Information about what "Any" categories include
export const anyItemCategories: { [key: string]: string[] } = {
  'Any Milk': ['Whole Milk', 'Low Fat Milk', 'Skimmed Milk'],
  'Any Milk (except buttermilk)': ['Whole Milk', 'Low Fat Milk', 'Skimmed Milk'],
  'Milk (any except buttermilk & whole milk)': ['Low Fat Milk', 'Skimmed Milk'],
  'Any Milk (except Whole Milk)': ['Low Fat Milk', 'Skimmed Milk'],
  'Milk': ['Whole Milk', 'Low Fat Milk', 'Skimmed Milk'],
  'Any Flesh': ['Craw Flesh', 'Dog Flesh', 'Goblin Flesh', 'Human Flesh', 'Shav\'Wa Flesh'],
  'Flesh': ['Craw Flesh', 'Dog Flesh', 'Goblin Flesh', 'Human Flesh', 'Shav\'Wa Flesh'],
  'Various Flesh': ['Craw Flesh', 'Dog Flesh', 'Goblin Flesh', 'Human Flesh', 'Shav\'Wa Flesh'],
  'Any 1x1 mushroom': ['False Sulfcap', 'Rödsopp'],
  'Mushroom': ['False Sulfcap', 'Rödsopp'],
  'any mushroom': ['False Sulfcap', 'Rödsopp'],
  'any other 1x1 mushroom': ['False Sulfcap', 'Rödsopp'],
  'different mushrooms': ['False Sulfcap', 'Rödsopp'],
  'mushrooms': ['False Sulfcap', 'Rödsopp'],
  'Any Skin': ['Craw Skin', 'Dog Skin', 'Goblin Skin', 'Human Skin', 'Shav\'Wa Skin'],
  'any skin': ['Craw Skin', 'Dog Skin', 'Goblin Skin', 'Human Skin', 'Shav\'Wa Skin'],
  'any water': ['Water', 'Purified Water', 'Bottle of Water'],
  'water': ['Water', 'Purified Water', 'Bottle of Water']
}

function getIngredientFallbackImage(name: string): string {
  // Check if we have a known working URL for this item (exact match first)
  if (knownImageUrls[name]) {
    return knownImageUrls[name]
  }
  
  // Try lowercase version
  const lowerName = name.toLowerCase()
  if (knownImageUrls[lowerName]) {
    return knownImageUrls[lowerName]
  }
  
  // Handle "Any" prefixed items
  if (name.startsWith('Any ')) {
    const baseItem = name.replace('Any ', '')
    if (knownImageUrls[baseItem]) {
      return knownImageUrls[baseItem]
    }
    // Try the base item name
    return `https://sulfur.wiki.gg/images/${baseItem.replace(/\s+/g, '_')}.png`
  }
  
  // Default fallback
  return `https://sulfur.wiki.gg/images/${name.replace(/\s+/g, '_')}.png`
}

function getRecipeFallbackImage(name: string): string {
  // Check if we have a known working URL for this item
  if (knownImageUrls[name]) {
    return knownImageUrls[name]
  }
  
  // Default fallback
  return `https://sulfur.wiki.gg/images/${name.replace(/\s+/g, '_')}.png`
}

// Transform scraped recipe data to component format
export function transformScrapedRecipes(scrapedData: unknown): Recipe[] {
  const recipes: Recipe[] = []
  const data = scrapedData as { recipes: Record<string, unknown[]> }

  // Process all recipe categories
  Object.entries(data.recipes).forEach(([category, categoryRecipes]) => {
    categoryRecipes.forEach((recipeData) => {
      const recipe = recipeData as Record<string, unknown>
      
      // Create a recipe for EACH variation
      if (Array.isArray(recipe.recipes) && recipe.recipes.length > 0) {
        recipe.recipes.forEach((variation, variationIndex) => {
          const variationData = variation as Record<string, unknown>
          
          // Transform effects to SpecialEffect format
          const specialEffects: SpecialEffect[] = []
          
          if (Array.isArray(recipe.effects)) {
            recipe.effects.forEach((effectData) => {
              // Handle both string effects and object effects
              if (typeof effectData === 'string') {
                // For string effects (like throwables), use the string as the effect name
                specialEffects.push({
                  effect: effectData,
                  value: '',
                  duration: 0,
                  unit: 'seconds'
                })
              } else {
                // For object effects, use the existing logic
                const effect = effectData as Record<string, unknown>
                specialEffects.push({
                  effect: String(effect.type || ''),
                  value: String(effect.value || ''),
                  duration: parseFloat(String(effect.duration || '').replace(/[^\d.]/g, '') || '0'),
                  unit: 'seconds'
                })
              }
            })
          }

          // Transform ingredients for this specific variation
          const ingredients: { [key: string]: number } = {}
          if (Array.isArray(variationData.ingredients)) {
            variationData.ingredients.forEach((ingData) => {
              const ing = ingData as Record<string, unknown>
              const quantity = typeof ing.quantity === 'string' 
                ? parseInt(ing.quantity) || 1 
                : Number(ing.quantity) || 1
              const name = String(ing.item || ing.name || '')
              if (name) ingredients[name] = quantity
            })
          }

          // Extract healing value or damage if available - check multiple possible locations
          let health: number | null = null
          let damage: number | null = null
          let damageType: 'health' | 'damage' = 'health'

          const healingObj = (recipe.healing || recipe.healingEffects) as Record<string, unknown> | undefined
          if (healingObj && typeof healingObj === 'object') {
            // Try different health field names
            health = Number(healingObj.health) || Number(healingObj.amount) || null
            if (health) damageType = 'health'
          }

          // Check for damage value (for throwables and weapons)
          if (recipe.damage !== undefined && recipe.damage !== null) {
            const damageValue = recipe.damage
            if (typeof damageValue === 'number') {
              damage = damageValue
              damageType = 'damage'
            } else if (typeof damageValue === 'string' && damageValue !== 'Unknown') {
              // Handle damage strings like "≥600", "40", etc.
              const numericDamage = parseFloat(damageValue.replace(/[^\d.]/g, ''))
              if (!isNaN(numericDamage) && numericDamage > 0) {
                damage = numericDamage
                damageType = 'damage'
              }
            }
          }

          // Use damage if available, otherwise use health
          const effectiveValue = damage !== null ? damage : health

          // Extract duration from multiple possible locations
          let duration = 0
          
          // First check healing.duration or healingEffects.duration
          if (healingObj && healingObj.duration) {
            const durationValue = healingObj.duration
            if (typeof durationValue === 'number') {
              duration = durationValue
            } else if (typeof durationValue === 'string') {
              duration = parseFloat(durationValue.replace(/[^\d.]/g, '') || '0')
            }
          }
          
          // Then check effects array for duration (for items like Egg Toddy)
          if (duration === 0 && Array.isArray(recipe.effects) && recipe.effects.length > 0) {
            const durations = recipe.effects.map((effect) => {
              const effectObj = effect as Record<string, unknown>
              const durationValue = effectObj.duration
              
              if (typeof durationValue === 'number') {
                return durationValue
              }
              if (typeof durationValue === 'string') {
                const parsedDuration = parseFloat(durationValue.replace(/[^\d.]/g, '') || '0')
                return parsedDuration
              }
              return 0
            })
            duration = Math.max(...durations.filter(d => d > 0), 0)
          }

          const economic = (recipe.economic || recipe.economicData) as Record<string, unknown> | undefined
          
          // Extract output amount from this variation
          let outputAmount = 1 // default
          if (variationData.output && typeof variationData.output === 'object') {
            const output = variationData.output as Record<string, unknown>
            outputAmount = Number(output.quantity) || 1
          }
          
          const transformedRecipe: Recipe = {
            id: `${String(recipe.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-v${variationIndex}`,
            name: String(recipe.name || ''),
            ingredients,
            health: effectiveValue,
            damage,
            damageType,
            duration,
            description: String(recipe.description || ''),
            specialEffects,
            sellingValue: economic ? Number(economic.sellingValue) || undefined : undefined,
            buyingValue: economic ? Number(economic.buyingValue) || undefined : undefined,
            gridSize: String(recipe.gridSize || ''),
            type: category,
            imageUrl: (() => {
              const originalUrl = recipe.imageUrl || recipe.image_url
              if (originalUrl && typeof originalUrl === 'string' && originalUrl.trim() && originalUrl !== 'undefined') {
                return String(originalUrl)
              }
              return getRecipeFallbackImage(String(recipe.name || ''))
            })(),
            outputAmount
          }

          recipes.push(transformedRecipe)
        })
      } else {
        // Fallback for recipes without variations
        const specialEffects: SpecialEffect[] = []
        
        if (Array.isArray(recipe.effects)) {
          recipe.effects.forEach((effectData) => {
            // Handle both string effects and object effects
            if (typeof effectData === 'string') {
              // For string effects (like throwables), use the string as the effect name
              specialEffects.push({
                effect: effectData,
                value: '',
                duration: 0,
                unit: 'seconds'
              })
            } else {
              // For object effects, use the existing logic
              const effect = effectData as Record<string, unknown>
              specialEffects.push({
                effect: String(effect.type || ''),
                value: String(effect.value || ''),
                duration: parseFloat(String(effect.duration || '').replace(/[^\d.]/g, '') || '0'),
                unit: 'seconds'
              })
            }
          })
        }

        // Extract healing value or damage if available - check multiple possible locations
        let health: number | null = null
        let damage: number | null = null
        let damageType: 'health' | 'damage' = 'health'

        const healingObj = (recipe.healing || recipe.healingEffects) as Record<string, unknown> | undefined
        if (healingObj && typeof healingObj === 'object') {
          // Try different health field names
          health = Number(healingObj.health) || Number(healingObj.amount) || null
          if (health) damageType = 'health'
        }

        // Check for damage value (for throwables and weapons)
        if (recipe.damage !== undefined && recipe.damage !== null) {
          const damageValue = recipe.damage
          if (typeof damageValue === 'number') {
            damage = damageValue
            damageType = 'damage'
          } else if (typeof damageValue === 'string' && damageValue !== 'Unknown') {
            // Handle damage strings like "≥600", "40", etc.
            const numericDamage = parseFloat(damageValue.replace(/[^\d.]/g, ''))
            if (!isNaN(numericDamage) && numericDamage > 0) {
              damage = numericDamage
              damageType = 'damage'
            }
          }
        }

        // Use damage if available, otherwise use health
        const effectiveValue = damage !== null ? damage : health

        // Extract duration from multiple possible locations
        let duration = 0
        
        // First check healing.duration or healingEffects.duration
        if (healingObj && healingObj.duration) {
          const durationValue = healingObj.duration
          if (typeof durationValue === 'number') {
            duration = durationValue
          } else if (typeof durationValue === 'string') {
            duration = parseFloat(durationValue.replace(/[^\d.]/g, '') || '0')
          }
        }
        
        // Then check effects array for duration (for items like Egg Toddy)
        if (duration === 0 && Array.isArray(recipe.effects) && recipe.effects.length > 0) {
          const durations = recipe.effects.map((effect) => {
            const effectObj = effect as Record<string, unknown>
            const durationValue = effectObj.duration
            
            if (typeof durationValue === 'number') {
              return durationValue
            }
            if (typeof durationValue === 'string') {
              const parsedDuration = parseFloat(durationValue.replace(/[^\d.]/g, '') || '0')
              return parsedDuration
            }
            return 0
          })
          duration = Math.max(...durations.filter(d => d > 0), 0)
        }

        const economic = (recipe.economic || recipe.economicData) as Record<string, unknown> | undefined

        const transformedRecipe: Recipe = {
          id: String(recipe.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          name: String(recipe.name || ''),
          ingredients: {},
          health: effectiveValue,
          damage,
          damageType,
          duration,
          description: String(recipe.description || ''),
          specialEffects,
          sellingValue: economic ? Number(economic.sellingValue) || undefined : undefined,
          buyingValue: economic ? Number(economic.buyingValue) || undefined : undefined,
          gridSize: String(recipe.gridSize || ''),
          type: category,
          imageUrl: (() => {
            const originalUrl = recipe.imageUrl || recipe.image_url
            if (originalUrl && typeof originalUrl === 'string' && originalUrl.trim() && originalUrl !== 'undefined') {
              return String(originalUrl)
            }
            return getRecipeFallbackImage(String(recipe.name || ''))
          })(),
          outputAmount: 1
        }

        recipes.push(transformedRecipe)
      }
    })
  })

  return recipes
}

// Transform scraped ingredient data to component format
export function transformScrapedIngredients(scrapedData: unknown): IngredientsMap {
  const ingredients: IngredientsMap = {}
  const data = scrapedData as { ingredients: Record<string, unknown> }

  Object.entries(data.ingredients).forEach(([name, ingredientData]) => {
    const ingredient = ingredientData as Record<string, unknown>
    const transformedIngredient: IngredientData = {
      name: String(ingredient.name || name),
      description: String(ingredient.description || ''),
      type: Array.isArray(ingredient.type) 
        ? ingredient.type.join(', ') 
        : String(ingredient.type || ''),
      gridSize: String(ingredient.gridSize || ''),
      sellingValue: ingredient.sellingValue ? Number(ingredient.sellingValue) : undefined,
      buyingValue: ingredient.buyingValue ? Number(ingredient.buyingValue) : undefined,
      sellers: Array.isArray(ingredient.sellers) ? ingredient.sellers as string[] : undefined,
      usedIn: Array.isArray(ingredient.usedIn) ? ingredient.usedIn as string[] : undefined,
      image: (() => {
        // Get the original image URL
        const originalUrl = ingredient.imageUrl || ingredient.image_url || ingredient.image
        // If we have a valid-looking URL, use it, otherwise use fallback
        if (originalUrl && typeof originalUrl === 'string' && originalUrl.trim() && originalUrl !== 'undefined') {
          return String(originalUrl)
        }
        // Use fallback for empty, null, undefined, or 'undefined' string values
        return getIngredientFallbackImage(name)
      })()
    }

    ingredients[name] = transformedIngredient
  })

  return ingredients
}