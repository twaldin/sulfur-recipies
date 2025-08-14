"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Recipe } from "@/types/recipe"

interface RecipesTableProps {
  recipes: Recipe[]
}

type SortKey = keyof Recipe | "healthPerSecond"
type SortOrder = "asc" | "desc"

export function RecipesTable({ recipes }: RecipesTableProps) {
  const [sortKey, setSortKey] = React.useState<SortKey | null>(null)
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("asc")

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortOrder("asc")
    }
  }

  const sortedRecipes = React.useMemo(() => {
    if (!sortKey) return recipes

    return [...recipes].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      if (sortKey === "healthPerSecond") {
        aValue = (a.health || 0) / a.duration
        bValue = (b.health || 0) / b.duration
      } else if (sortKey === "ingredients") {
        aValue = Object.keys(a.ingredients).join(", ")
        bValue = Object.keys(b.ingredients).join(", ")
      } else if (sortKey === "specialEffects") {
        aValue = a.specialEffects.join(", ")
        bValue = b.specialEffects.join(", ")
      } else {
        aValue = a[sortKey] as string | number
        bValue = b[sortKey] as string | number
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })
  }, [recipes, sortKey, sortOrder])

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">
              <Button
                variant="ghost"
                onClick={() => handleSort("name")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Name
                <SortIcon column="name" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("ingredients")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Ingredients
                <SortIcon column="ingredients" />
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button
                variant="ghost"
                onClick={() => handleSort("health")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Health
                <SortIcon column="health" />
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button
                variant="ghost"
                onClick={() => handleSort("duration")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Time
                <SortIcon column="duration" />
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button
                variant="ghost"
                onClick={() => handleSort("healthPerSecond")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Health/s
                <SortIcon column="healthPerSecond" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("description")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Description
                <SortIcon column="description" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("specialEffects")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Special Effects
                <SortIcon column="specialEffects" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRecipes.map((recipe) => (
            <TableRow key={recipe.id}>
              <TableCell className="font-medium">{recipe.name}</TableCell>
              <TableCell>
                {Object.entries(recipe.ingredients).map(([name, quantity], idx) => (
                  <span key={name}>
                    {name} ({quantity})
                    {idx < Object.keys(recipe.ingredients).length - 1 ? ", " : ""}
                  </span>
                ))}
              </TableCell>
              <TableCell className="text-center">{recipe.health || 0}</TableCell>
              <TableCell className="text-center">{recipe.duration}s</TableCell>
              <TableCell className="text-center">
                {((recipe.health || 0) / recipe.duration).toFixed(2)}
              </TableCell>
              <TableCell className="max-w-xs truncate" title={recipe.description}>
                {recipe.description}
              </TableCell>
              <TableCell>
                {recipe.specialEffects.length > 0
                  ? recipe.specialEffects.join(", ")
                  : "None"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}