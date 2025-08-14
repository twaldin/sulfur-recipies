"use client"

import React, { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ThemeToggle } from "@/components/theme-toggle"
import { transformScrapedRecipes, transformScrapedIngredients, anyItemCategories, getIngredientImageUrl } from "@/lib/data-adapter"
import { Recipe } from "@/types/recipe"
import scrapedRecipesData from "@/data/recipes.json"
import scrapedIngredientsData from "@/data/ingredients.json"
import {
  ChevronUpIcon,
  ChevronDownIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon as ExpandIcon,
  ChevronUpIcon as CollapseIcon,
} from "lucide-react"

type SortField = "name" | "type" | "health" | "duration" | "difficulty" | "hps"
type SortDirection = "asc" | "desc"
type HealthSortMode = "hp_asc" | "hp_desc" | "dmg_asc" | "dmg_desc"

export default function Home() {
  // Transform scraped data to component format
  const recipes = transformScrapedRecipes(scrapedRecipesData)
  const ingredients = transformScrapedIngredients(scrapedIngredientsData)

  // Group recipes by name (for recipes with multiple variations)
  const groupedRecipes = useMemo(() => {
    const groups: { [key: string]: Recipe[] } = {}
    
    recipes.forEach(recipe => {
      if (!groups[recipe.name]) {
        groups[recipe.name] = []
      }
      groups[recipe.name].push(recipe)
    })
    
    return Object.entries(groups).map(([name, recipeList]) => ({
      name,
      recipes: recipeList,
      primaryRecipe: recipeList[0], // Use first recipe as representative
      totalVariations: recipeList.length
    }))
  }, [recipes])

  const [activeTab, setActiveTab] = useState("recipes")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [activeIngredientFilters, setActiveIngredientFilters] = useState<string[]>([])
  const [activeEffectFilters, setActiveEffectFilters] = useState<string[]>([])
  const [showAllIngredients, setShowAllIngredients] = useState(false)
  const [showAllEffects, setShowAllEffects] = useState(false)
  const [ingredientSearchQuery, setIngredientSearchQuery] = useState("")
  const [effectSearchQuery, setEffectSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [healthSortMode, setHealthSortMode] = useState<HealthSortMode>("hp_desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const itemsPerPage = 10

  const filterButtons = ["Consumables", "Throwables", "Equipment"]
  
  // Get most common ingredients for quick filters (count unique items, not variations)
  const ingredientFrequency = useMemo(() => {
    const frequency: { [key: string]: number } = {}
    const seenItemIngredients = new Set<string>()
    
    groupedRecipes.forEach(group => {
      // For each unique item, check all its variations for ingredients
      const itemIngredients = new Set<string>()
      group.recipes.forEach(recipe => {
        Object.keys(recipe.ingredients).forEach(ing => {
          itemIngredients.add(ing)
        })
      })
      
      // Count each ingredient once per item (not per variation)
      itemIngredients.forEach(ing => {
        const key = `${group.name}-${ing}`
        if (!seenItemIngredients.has(key)) {
          frequency[ing] = (frequency[ing] || 0) + 1
          seenItemIngredients.add(key)
        }
      })
    })
    
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)
  }, [groupedRecipes])
  
  // Get valid ingredient combinations based on currently selected ingredients
  const validIngredientCombinations = useMemo(() => {
    if (activeIngredientFilters.length === 0) {
      // If no ingredients selected, all ingredients are valid
      return new Set(ingredientFrequency)
    }
    
    // Find recipes that contain ALL selected ingredients
    const recipesWithSelectedIngredients = recipes.filter(recipe => 
      activeIngredientFilters.every(ing => 
        Object.keys(recipe.ingredients).includes(ing)
      )
    )
    
    // Collect all ingredients from these valid recipes
    const validIngredients = new Set<string>()
    recipesWithSelectedIngredients.forEach(recipe => {
      Object.keys(recipe.ingredients).forEach(ing => {
        validIngredients.add(ing)
      })
    })
    
    return validIngredients
  }, [activeIngredientFilters, recipes, ingredientFrequency])
  
  // Filter ingredients by search query and valid combinations
  const filteredIngredientList = useMemo(() => {
    let filtered = ingredientFrequency
    
    // First filter by valid combinations
    filtered = filtered.filter(ing => validIngredientCombinations.has(ing))
    
    // Then filter by search query
    if (ingredientSearchQuery) {
      filtered = filtered.filter(ing => 
        ing.toLowerCase().includes(ingredientSearchQuery.toLowerCase())
      )
    }
    
    return filtered
  }, [ingredientFrequency, validIngredientCombinations, ingredientSearchQuery])
    
  const popularIngredients = showAllIngredients 
    ? filteredIngredientList 
    : filteredIngredientList.slice(0, 12)

  // Get most common effects for quick filters (count unique items, not variations)
  const effectFrequency = useMemo(() => {
    const frequency: { [key: string]: number } = {}
    
    groupedRecipes.forEach(group => {
      // For each unique item, collect all its effects from all variations
      const itemEffects = new Set<string>()
      group.recipes.forEach(recipe => {
        recipe.specialEffects?.forEach(effect => {
          if (effect.effect) {
            itemEffects.add(effect.effect)
          }
        })
      })
      
      // Count each effect once per item (not per variation)
      itemEffects.forEach(effect => {
        frequency[effect] = (frequency[effect] || 0) + 1
      })
    })
    
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)
  }, [groupedRecipes])

  // Filter effects by search query
  const filteredEffectList = useMemo(() => {
    let filtered = effectFrequency
    
    if (effectSearchQuery) {
      filtered = filtered.filter(effect => 
        effect.toLowerCase().includes(effectSearchQuery.toLowerCase())
      )
    }
    
    return filtered
  }, [effectFrequency, effectSearchQuery])
    
  const popularEffects = showAllEffects 
    ? filteredEffectList 
    : filteredEffectList.slice(0, 12)

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) => 
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    )
  }

  const toggleIngredientFilter = (ingredient: string) => {
    setActiveIngredientFilters((prev) => 
      prev.includes(ingredient) ? prev.filter((i) => i !== ingredient) : [...prev, ingredient]
    )
    // Reset page when filtering changes
    setCurrentPage(1)
  }

  const clearIngredientFilters = () => {
    setActiveIngredientFilters([])
    setCurrentPage(1)
  }

  const toggleEffectFilter = (effect: string) => {
    setActiveEffectFilters((prev) => 
      prev.includes(effect) ? prev.filter((e) => e !== effect) : [...prev, effect]
    )
    setCurrentPage(1)
  }

  const clearEffectFilters = () => {
    setActiveEffectFilters([])
    setCurrentPage(1)
  }

  // Clickable filter functions
  const handleTypeClick = (type: string) => {
    const filterMap: { [key: string]: string } = {
      'cooked_consumables': 'Consumables',
      'cooked_throwables': 'Throwables', 
      'cooked_equipment': 'Equipment'
    }
    const filterName = filterMap[type]
    if (filterName && !activeFilters.includes(filterName)) {
      setActiveFilters([...activeFilters, filterName])
      setCurrentPage(1)
    }
  }

  const toggleRowExpansion = (recipeName: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(recipeName)) {
        newSet.delete(recipeName)
      } else {
        newSet.add(recipeName)
      }
      return newSet
    })
  }

  const handleSort = (field: SortField) => {
    if (field === "health") {
      // Cycle through HP/DMG sorting modes
      const modes: HealthSortMode[] = ["hp_desc", "hp_asc", "dmg_desc", "dmg_asc"]
      const currentIndex = modes.indexOf(healthSortMode)
      const nextMode = modes[(currentIndex + 1) % modes.length]
      setHealthSortMode(nextMode)
      setSortField("health")
    } else {
      if (sortField === field) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc")
      } else {
        setSortField(field)
        setSortDirection("asc")
      }
    }
  }

  const getSortIcon = (field: SortField) => {
    if (field === "health" && sortField === "health") {
      return healthSortMode.includes("asc") ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
    }
    if (sortField !== field) return null
    return sortDirection === "asc" ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
  }

  const getHealthSortLabel = () => {
    switch (healthSortMode) {
      case "hp_desc": return "HP"
      case "hp_asc": return "HP" 
      case "dmg_desc": return "DMG"
      case "dmg_asc": return "DMG"
    }
  }

  const getTypeBadge = (type: string) => {
    const variants: { [key: string]: "default" | "secondary" | "outline" } = {
      "cooked_consumables": "default",
      "cooked_throwables": "destructive" as "default",
      "cooked_equipment": "secondary",
    }
    
    const displayNames: { [key: string]: string } = {
      "cooked_consumables": "Consumable",
      "cooked_throwables": "Throwable", 
      "cooked_equipment": "Equipment"
    }

    const filterMap: { [key: string]: string } = {
      'cooked_consumables': 'Consumables',
      'cooked_throwables': 'Throwables', 
      'cooked_equipment': 'Equipment'
    }

    return (
      <Badge 
        variant={variants[type] || "outline"}
        className="cursor-pointer hover:opacity-80"
        onClick={(e) => {
          e.stopPropagation()
          handleTypeClick(type)
        }}
      >
        {displayNames[type] || type}
      </Badge>
    )
  }


  const formatIngredients = (ingredients: { [key: string]: number }) => {
    const entries = Object.entries(ingredients)
    if (entries.length === 0) return <span>None</span>
    
    return (
      <span>
        {entries.slice(0, 3).map(([name, qty], idx) => (
          <span key={name}>
            <span 
              className="cursor-pointer hover:underline text-primary/80 hover:text-primary"
              onClick={(e) => {
                e.stopPropagation()
                toggleIngredientFilter(name)
              }}
            >
              {`${name} (${qty})`}
            </span>
            {idx < Math.min(entries.length, 3) - 1 && ", "}
          </span>
        ))}
        {entries.length > 3 && "..."}
      </span>
    )
  }

  const renderIngredientImages = (recipeIngredients: { [key: string]: number }) => {
    return (
      <div className="flex flex-wrap gap-2 items-center">
        {Object.entries(recipeIngredients).map(([name, qty]) => {
          const ingredientData = ingredients[name]
          
          // Create array of images based on quantity (max 8 to avoid UI overflow)
          const imageCount = Math.min(qty, 8)
          const images = Array.from({ length: imageCount }, (_, i) => (
            <div key={`${name}-${i}`} className="relative">
              <img
                src={getIngredientImageUrl(name, ingredientData?.image)}
                alt={name}
                className="w-6 h-6 object-contain rounded border-0"
                onError={(e) => {
                  // Fallback to a generic ingredient icon
                  const canvas = document.createElement('canvas')
                  canvas.width = 24
                  canvas.height = 24
                  const ctx = canvas.getContext('2d')
                  if (ctx) {
                    ctx.fillStyle = '#f3f4f6'
                    ctx.fillRect(0, 0, 24, 24)
                    ctx.fillStyle = '#9ca3af'
                    ctx.font = '12px sans-serif'
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.fillText(name.charAt(0).toUpperCase(), 12, 12)
                    e.currentTarget.src = canvas.toDataURL()
                  }
                }}
                title={`${name} (${qty})`}
              />
              {qty > 8 && i === 7 && (
                <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">+{qty - 8}</span>
                </div>
              )}
            </div>
          ))
          
          return (
            <div key={name} className="flex items-center gap-1 bg-background/50 rounded px-2 py-1">
              <div className="flex flex-wrap gap-0.5">
                {images}
              </div>
              <span 
                className="text-xs text-foreground font-medium cursor-pointer hover:underline hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleIngredientFilter(name)
                }}
                title={anyItemCategories[name] ? `Can use: ${anyItemCategories[name].join(', ')}` : undefined}
              >
                {name}
                {anyItemCategories[name] && <span className="text-xs opacity-60 ml-1">*</span>}
              </span>
              {qty > 1 && <span className="text-xs font-bold text-primary">×{qty}</span>}
            </div>
          )
        })}
      </div>
    )
  }

  const renderRecipeOutput = (recipe: Recipe, outputAmount: number = 1) => {
    return (
      <div className="flex items-center gap-2">
        <div className="relative">
          {recipe.imageUrl ? (
            <img
              src={recipe.imageUrl}
              alt={recipe.name}
              className="w-8 h-8 object-contain rounded border-0"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjE2IiB5PSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzljYTNhZiI+Pz88L3RleHQ+Cjwvc3ZnPg=='
              }}
            />
          ) : (
            <div className="w-8 h-8 bg-muted rounded border-0 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">?</span>
            </div>
          )}
          {outputAmount > 1 && (
            <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {outputAmount}
            </div>
          )}
        </div>
        <span className="font-medium">{recipe.name}</span>
      </div>
    )
  }

  const getHealthDisplay = (recipe: Recipe) => {
    if (recipe.damageType === 'damage' && recipe.damage !== null && recipe.damage !== undefined && recipe.damage > 0) {
      return `${recipe.damage} DMG`
    }
    if (recipe.health === null || recipe.health === 0) return "0 HP"
    return `${recipe.health} HP`
  }

  const getDurationDisplay = (duration: number) => {
    if (duration === 0) return "Instant"
    return `${duration}s`
  }

  const getHealthPerSecond = (recipe: Recipe) => {
    const value = recipe.health
    if (!value || value === 0) return "0"
    
    // Only show HP/s for healing items, not damage items
    if (recipe.damageType === 'damage') return "-"
    
    // Treat instant (0 duration) as 1 second for HP/s calculation
    const effectiveDuration = recipe.duration === 0 ? 1 : recipe.duration
    return (value / effectiveDuration).toFixed(1)
  }

  // Filter data based on active filters and search
  const filteredData = groupedRecipes.filter((group) => {
    const recipe = group.primaryRecipe
    
    // Search filter - search in recipe name, ingredients, and description
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      group.name.toLowerCase().includes(searchLower) ||
      recipe.description.toLowerCase().includes(searchLower) ||
      Object.keys(recipe.ingredients).some(ingredient => 
        ingredient.toLowerCase().includes(searchLower)
      ) ||
      recipe.specialEffects.some(effect => 
        effect.effect.toLowerCase().includes(searchLower)
      ) ||
      // Also search in all recipe variations
      group.recipes.some(r => 
        Object.keys(r.ingredients).some(ingredient => 
          ingredient.toLowerCase().includes(searchLower)
        )
      )

    // Category filters
    let matchesFilters = true
    if (activeFilters.length > 0) {
      matchesFilters = false
      if (activeFilters.includes("Consumables") && recipe.type === "cooked_consumables") {
        matchesFilters = true
      }
      if (activeFilters.includes("Throwables") && recipe.type === "cooked_throwables") {
        matchesFilters = true
      }
      if (activeFilters.includes("Equipment") && recipe.type === "cooked_equipment") {
        matchesFilters = true
      }
    }

    // Ingredient filters - recipe must contain ALL selected ingredients
    let matchesIngredients = true
    if (activeIngredientFilters.length > 0) {
      matchesIngredients = activeIngredientFilters.every(ingredientFilter =>
        group.recipes.some(r => 
          Object.keys(r.ingredients).some(ingredient => 
            ingredient === ingredientFilter
          )
        )
      )
    }

    // Effect filters - recipe must contain ALL selected effects
    let matchesEffects = true
    if (activeEffectFilters.length > 0) {
      matchesEffects = activeEffectFilters.every(effectFilter =>
        recipe.specialEffects?.some(effect => 
          effect.effect === effectFilter
        )
      )
    }

    return matchesSearch && matchesFilters && matchesIngredients && matchesEffects
  })

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    let aValue: string | number = ""
    let bValue: string | number = ""

    switch (sortField) {
      case "name":
        aValue = a.name
        bValue = b.name
        break
      case "type":
        aValue = a.primaryRecipe.type || ""
        bValue = b.primaryRecipe.type || ""
        break
      case "health":
        // Custom sorting logic for HP/DMG based on healthSortMode
        const aRecipeHealth = a.primaryRecipe
        const bRecipeHealth = b.primaryRecipe
        
        if (healthSortMode.startsWith("hp")) {
          // HP sorting - healing items first, then damage items at bottom
          const aIsHealing = aRecipeHealth.damageType !== 'damage'
          const bIsHealing = bRecipeHealth.damageType !== 'damage'
          
          if (aIsHealing && !bIsHealing) return -1 // A (healing) comes before B (damage)
          if (!aIsHealing && bIsHealing) return 1  // B (healing) comes before A (damage)
          
          // Both same type, sort by value
          if (aIsHealing && bIsHealing) {
            aValue = aRecipeHealth.health || 0
            bValue = bRecipeHealth.health || 0
          } else {
            // Both damage items, sort by damage value but they stay at bottom
            aValue = aRecipeHealth.damage || 0
            bValue = bRecipeHealth.damage || 0
          }
        } else {
          // DMG sorting - damage items first, then healing items at bottom
          const aIsDamage = aRecipeHealth.damageType === 'damage'
          const bIsDamage = bRecipeHealth.damageType === 'damage'
          
          if (aIsDamage && !bIsDamage) return -1 // A (damage) comes before B (healing)
          if (!aIsDamage && bIsDamage) return 1  // B (damage) comes before A (healing)
          
          // Both same type, sort by value
          if (aIsDamage && bIsDamage) {
            aValue = aRecipeHealth.damage || 0
            bValue = bRecipeHealth.damage || 0
          } else {
            // Both healing items, sort by health value but they stay at bottom
            aValue = aRecipeHealth.health || 0
            bValue = bRecipeHealth.health || 0
          }
        }
        
        // Apply sort direction
        if (typeof aValue === "number" && typeof bValue === "number") {
          const ascending = healthSortMode.includes("asc")
          return ascending ? aValue - bValue : bValue - aValue
        }
        break
      case "duration":
        aValue = a.primaryRecipe.duration || 0
        bValue = b.primaryRecipe.duration || 0
        break
      case "difficulty":
        aValue = Object.keys(a.primaryRecipe.ingredients).length
        bValue = Object.keys(b.primaryRecipe.ingredients).length
        break
      case "hps":
        // Calculate HP/s for sorting - damage items always go to bottom
        const aRecipeHPS = a.primaryRecipe
        const bRecipeHPS = b.primaryRecipe
        const aIsHealingHPS = aRecipeHPS.damageType !== 'damage'
        const bIsHealingHPS = bRecipeHPS.damageType !== 'damage'
        
        // Force damage items to bottom
        if (aIsHealingHPS && !bIsHealingHPS) return -1
        if (!aIsHealingHPS && bIsHealingHPS) return 1
        
        // Both healing items - calculate HP/s
        if (aIsHealingHPS && bIsHealingHPS) {
          const aHealth = aRecipeHPS.health || 0
          const bHealth = bRecipeHPS.health || 0
          const aDuration = aRecipeHPS.duration === 0 ? 1 : aRecipeHPS.duration
          const bDuration = bRecipeHPS.duration === 0 ? 1 : bRecipeHPS.duration
          aValue = aHealth > 0 ? aHealth / aDuration : 0
          bValue = bHealth > 0 ? bHealth / bDuration : 0
        } else {
          // Both damage items - sort by damage but they stay at bottom
          aValue = aRecipeHPS.damage || 0
          bValue = bRecipeHPS.damage || 0
        }
        break
      default:
        aValue = a.name
        bValue = b.name
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }

    const aStr = String(aValue)
    const bStr = String(bValue)
    
    if (sortDirection === "asc") {
      return aStr.localeCompare(bStr)
    } else {
      return bStr.localeCompare(aStr)
    }
  })

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <Card className="border-b">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Sulphur Recipes</h1>
              <p className="text-muted-foreground mt-1">Complete database of cooking recipes from automated scraping</p>
            </div>
            <ThemeToggle />
          </CardHeader>
        </Card>


        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full justify-start h-auto p-1">
            <TabsTrigger value="recipes" className="px-4 py-2 flex-shrink-0">
              Recipes ({groupedRecipes.length})
            </TabsTrigger>
            <TabsTrigger value="analyze" className="px-4 py-2 flex-shrink-0">
              Analyze
            </TabsTrigger>
            <TabsTrigger value="about" className="px-4 py-2 flex-shrink-0">
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recipes" className="space-y-4">
            {/* Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search recipes, ingredients, effects, or descriptions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Category Filter Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {filterButtons.map((filter) => (
                      <Button
                        key={filter}
                        variant={activeFilters.includes(filter) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFilter(filter)}
                        className="transition-all duration-200"
                      >
                        {filter}
                      </Button>
                    ))}
                  </div>

                  {/* Ingredient Filter Buttons */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Filter by Ingredients:</span>
                      {activeIngredientFilters.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearIngredientFilters}
                          className="h-6 px-2 text-xs"
                        >
                          Clear all
                        </Button>
                      )}
                    </div>
                    
                    {/* Ingredient Search */}
                    <div className="space-y-2">
                      <div className="relative">
                        <Input
                          placeholder="Search ingredients..."
                          value={ingredientSearchQuery}
                          onChange={(e) => setIngredientSearchQuery(e.target.value)}
                          className="h-8 text-sm pr-8"
                        />
                        {ingredientSearchQuery && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIngredientSearchQuery("")}
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                      {activeIngredientFilters.length > 0 && (
                        <div className="text-[11px] text-muted-foreground bg-muted/50 rounded px-2 py-1">
                          💡 Only showing ingredients that can be combined with: <span className="font-medium">{activeIngredientFilters.join(", ")}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {popularIngredients.length === 0 && ingredientSearchQuery && (
                        <div className="text-sm text-muted-foreground">
                          No ingredients found matching &quot;{ingredientSearchQuery}&quot;
                        </div>
                      )}
                      {popularIngredients.length === 0 && !ingredientSearchQuery && activeIngredientFilters.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          No additional ingredients can be combined with the selected filters.
                          Try removing some filters to see more options.
                        </div>
                      )}
                      {popularIngredients.map((ingredient) => {
                        const ingredientData = ingredients[ingredient]
                        const isActive = activeIngredientFilters.includes(ingredient)
                        
                        // Calculate how many items would be valid if this ingredient is added
                        const potentialFilters = isActive 
                          ? activeIngredientFilters.filter(i => i !== ingredient)
                          : [...activeIngredientFilters, ingredient]
                        
                        const validItemCount = groupedRecipes.filter(group => {
                          // Check if this item contains the ingredient
                          const hasIngredient = group.recipes.some(recipe => 
                            Object.keys(recipe.ingredients).includes(ingredient)
                          )
                          if (!hasIngredient) return false
                          
                          // Check if this item satisfies all potential filters
                          if (potentialFilters.length === 0) return true
                          return potentialFilters.every(ing => 
                            group.recipes.some(recipe =>
                              Object.keys(recipe.ingredients).includes(ing)
                            )
                          )
                        }).length
                        
                        return (
                          <Button
                            key={ingredient}
                            variant={isActive ? "default" : validItemCount > 0 ? "outline" : "ghost"}
                            size="sm"
                            onClick={() => toggleIngredientFilter(ingredient)}
                            disabled={!isActive && validItemCount === 0}
                            className={`transition-all duration-200 flex items-center gap-1 ${
                              isActive ? "" : validItemCount > 0 ? "hover:bg-muted" : "opacity-50"
                            }`}
                          >
                            {ingredientData?.image && (
                              <img
                                src={ingredientData.image}
                                alt={ingredient}
                                className="w-4 h-4 object-contain rounded border-0"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            )}
                            <span className="text-xs">{ingredient}</span>
                            <Badge 
                              variant={validItemCount > 0 ? "secondary" : "outline"} 
                              className={`ml-1 px-1 py-0 text-[10px] h-4 ${
                                validItemCount === 0 ? "opacity-50" : ""
                              }`}
                            >
                              {validItemCount}
                            </Badge>
                          </Button>
                        )
                      })}
                      {filteredIngredientList.length > 12 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAllIngredients(!showAllIngredients)}
                          className="text-xs"
                        >
                          {showAllIngredients ? "Show less" : `Show ${filteredIngredientList.length - 12} more`}
                        </Button>
                      )}
                    </div>
                    {activeIngredientFilters.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">
                          Showing recipes with: <span className="font-medium">{activeIngredientFilters.join(" + ")}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {filteredData.length} recipes found • {filteredIngredientList.length} compatible ingredients
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Effect Filter Buttons */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Filter by Effects:</span>
                      {activeEffectFilters.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearEffectFilters}
                          className="h-6 px-2 text-xs"
                        >
                          Clear all
                        </Button>
                      )}
                    </div>
                    
                    {/* Effect Search */}
                    <div className="space-y-2">
                      <div className="relative">
                        <Input
                          placeholder="Search effects..."
                          value={effectSearchQuery}
                          onChange={(e) => setEffectSearchQuery(e.target.value)}
                          className="h-8 text-sm pr-8"
                        />
                        {effectSearchQuery && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEffectSearchQuery("")}
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                      {activeEffectFilters.length > 0 && (
                        <div className="text-[11px] text-muted-foreground bg-muted/50 rounded px-2 py-1">
                          💡 Only showing effects from filtered recipes
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {popularEffects.length === 0 && effectSearchQuery && (
                        <div className="text-sm text-muted-foreground">
                          No effects found matching &quot;{effectSearchQuery}&quot;
                        </div>
                      )}
                      {popularEffects.map((effect) => {
                        const isActive = activeEffectFilters.includes(effect)
                        
                        const effectItemCount = groupedRecipes.filter(group => 
                          group.recipes.some(r => 
                            r.specialEffects?.some(e => e.effect === effect)
                          )
                        ).length
                        
                        return (
                          <Button
                            key={effect}
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleEffectFilter(effect)}
                            className={`transition-all duration-200 flex items-center gap-1 ${
                              isActive ? "" : "hover:bg-muted"
                            }`}
                          >
                            <span className="text-xs">{effect}</span>
                            <Badge variant="secondary" className="ml-1 px-1 py-0 text-[10px] h-4">
                              {effectItemCount}
                            </Badge>
                          </Button>
                        )
                      })}
                      {filteredEffectList.length > 12 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAllEffects(!showAllEffects)}
                          className="text-xs"
                        >
                          {showAllEffects ? "Show less" : `Show ${filteredEffectList.length - 12} more`}
                        </Button>
                      )}
                    </div>
                    {activeEffectFilters.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">
                          Showing recipes with effects: <span className="font-medium">{activeEffectFilters.join(" + ")}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recipes Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table className="table-fixed w-full">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-8 flex-shrink-0"></TableHead>
                        <TableHead className="cursor-pointer select-none w-[30%] min-w-[200px]" onClick={() => handleSort("name")}>
                          <div className="flex items-center space-x-1">
                            <span>Item</span>
                            {getSortIcon("name")}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer select-none w-[12%] min-w-[80px]" onClick={() => handleSort("health")}>
                          <div className="flex items-center space-x-1">
                            <span>{sortField === "health" ? getHealthSortLabel() : "HP/DMG"}</span>
                            {getSortIcon("health")}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer select-none w-[12%] min-w-[80px]" onClick={() => handleSort("duration")}>
                          <div className="flex items-center space-x-1">
                            <span>Duration</span>
                            {getSortIcon("duration")}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50 w-[10%] min-w-[70px]"
                          onClick={() => {
                            if (sortField === "hps") {
                              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                            } else {
                              setSortField("hps")
                              setSortDirection("desc")
                            }
                          }}
                        >
                          HP/s
                          {sortField === "hps" && (
                            sortDirection === "asc" ? <CollapseIcon className="inline ml-1 h-4 w-4" /> : <ExpandIcon className="inline ml-1 h-4 w-4" />
                          )}
                        </TableHead>
                        <TableHead className="cursor-pointer select-none w-[25%] min-w-[150px]" onClick={() => handleSort("difficulty")}>
                          <div className="flex items-center space-x-1">
                            <span>Ingredients</span>
                            {getSortIcon("difficulty")}
                          </div>
                        </TableHead>
                        <TableHead className="w-[11%] min-w-[100px]">Variations</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((group, index) => {
                        const recipe = group.primaryRecipe
                        const isExpanded = expandedRows.has(group.name)
                        
                        return (
                          <React.Fragment key={group.name}>
                            <TableRow
                              className={`hover:bg-muted/50 transition-colors cursor-pointer ${
                                index % 2 === 0 ? "bg-background" : "bg-muted/20"
                              }`}
                              onClick={() => toggleRowExpansion(group.name)}
                            >
                              <TableCell>
                                {isExpanded ? <CollapseIcon className="h-4 w-4" /> : <ExpandIcon className="h-4 w-4" />}
                              </TableCell>
                              <TableCell className="font-medium">
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    {recipe.imageUrl && (
                                      <img 
                                        src={recipe.imageUrl} 
                                        alt={recipe.name}
                                        className="w-8 h-8 object-contain rounded border-0"
                                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                                      />
                                    )}
                                    <span>{group.name}</span>
                                  </div>
                                  {recipe.specialEffects && recipe.specialEffects.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {recipe.specialEffects.slice(0, 3).map((effect, effectIdx) => (
                                        <Badge 
                                          key={effectIdx} 
                                          variant={activeEffectFilters.includes(effect.effect) ? "default" : "outline"} 
                                          className="text-[10px] px-1 py-0 h-4 cursor-pointer hover:bg-primary/20"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            toggleEffectFilter(effect.effect)
                                          }}
                                        >
                                          {effect.effect}
                                        </Badge>
                                      ))}
                                      {recipe.specialEffects.length > 3 && (
                                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                          +{recipe.specialEffects.length - 3}
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-sm">{getHealthDisplay(recipe)}</TableCell>
                              <TableCell className="font-mono text-sm">{getDurationDisplay(recipe.duration)}</TableCell>
                              <TableCell className="font-mono text-sm text-muted-foreground">
                                {getHealthPerSecond(recipe)}
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-muted-foreground">
                                  {formatIngredients(recipe.ingredients)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-xs">
                                  {group.totalVariations} {group.totalVariations === 1 ? 'recipe' : 'recipes'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                            
                            {/* Expanded Recipe Variations */}
                            {isExpanded && (
                              <TableRow>
                                <TableCell colSpan={7} className="p-0 bg-muted/10">
                                  <div className="p-4">
                                    <div className="mb-3">
                                      <h4 className="font-semibold text-base text-foreground mb-1">
                                        {group.name}
                                      </h4>
                                      {recipe.description && (
                                        <p className="text-sm text-muted-foreground">
                                          {recipe.description}
                                        </p>
                                      )}
                                    </div>
                                    <div className="space-y-2">
                                      {group.recipes.map((variation, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-3 bg-background rounded border">
                                          <span className="text-sm font-medium text-muted-foreground min-w-[80px]">
                                            Recipe {idx + 1}:
                                          </span>
                                          <div className="flex items-center flex-1">
                                            {renderIngredientImages(variation.ingredients)}
                                          </div>
                                          <div className="flex items-center">
                                            <svg className="w-6 h-6 text-muted-foreground mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                          </div>
                                          <div className="flex-shrink-0">
                                            {renderRecipeOutput(variation, variation.outputAmount || 1)}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of{" "}
                    {sortedData.length} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let page
                        if (totalPages <= 5) {
                          page = i + 1
                        } else if (currentPage <= 3) {
                          page = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i
                        } else {
                          page = currentPage - 2 + i
                        }
                        
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="analyze" className="mt-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Analyze Inventory</h2>
              <p className="text-muted-foreground">
                Input your available ingredients to see what you can cook.
              </p>
              <div className="flex items-center justify-center min-h-[400px] border rounded-lg bg-muted/10">
                <p className="text-muted-foreground">Coming soon - Inventory analysis feature</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-semibold">About Sulphur Recipes</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  A comprehensive database of all cooking recipes from the game Sulphur. 
                  This tool helps players explore recipes, ingredients, and their effects.
                </p>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">Features</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Complete database of {recipes.length} recipe variations</li>
                    <li>All {Object.keys(ingredients).length} ingredients with detailed information</li>
                    <li>Visual recipe browser with ingredient quantities</li>
                    <li>Sortable and searchable recipe table</li>
                    <li>Dark/light theme support</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Data Source</h3>
                  <p className="text-muted-foreground">
                    All recipe and ingredient data was automatically scraped from the official 
                    Sulphur Wiki at <a href="https://sulfur.wiki.gg" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">sulfur.wiki.gg</a>.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">How to Use</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Browse recipes in the Recipes tab</li>
                    <li>Click on any recipe row to see all variations</li>
                    <li>Use the search bar to find specific recipes or ingredients</li>
                    <li>Sort columns by clicking on headers</li>
                    <li>Filter by recipe type using the category buttons</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}