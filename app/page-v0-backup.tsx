"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ChevronUpIcon,
  ChevronDownIcon,
  SearchIcon,
  InfoIcon,
  EditIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"

// Sample data
const sampleData = [
  {
    id: "001",
    name: "Project Alpha",
    status: "Active",
    category: "Development",
    date: "2024-01-15",
    priority: "High",
  },
  {
    id: "002",
    name: "Marketing Campaign",
    status: "Pending",
    category: "Marketing",
    date: "2024-01-12",
    priority: "Medium",
  },
  {
    id: "003",
    name: "Database Migration",
    status: "Active",
    category: "Infrastructure",
    date: "2024-01-10",
    priority: "High",
  },
  {
    id: "004",
    name: "User Research",
    status: "Archived",
    category: "Research",
    date: "2024-01-08",
    priority: "Low",
  },
  {
    id: "005",
    name: "API Integration",
    status: "Active",
    category: "Development",
    date: "2024-01-14",
    priority: "High",
  },
  {
    id: "006",
    name: "Content Strategy",
    status: "Pending",
    category: "Marketing",
    date: "2024-01-11",
    priority: "Medium",
  },
  {
    id: "007",
    name: "Security Audit",
    status: "Active",
    category: "Security",
    date: "2024-01-13",
    priority: "High",
  },
  {
    id: "008",
    name: "Mobile App Design",
    status: "Pending",
    category: "Design",
    date: "2024-01-09",
    priority: "Medium",
  },
]

type SortField = "id" | "name" | "status" | "category" | "date" | "priority"
type SortDirection = "asc" | "desc"

export default function DataTablePage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const filterButtons = ["Category", "Status", "Date Range", "Priority"]

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]))
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      Active: "default",
      Pending: "secondary",
      Archived: "outline",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "default"}>{status}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      High: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    } as const

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority as keyof typeof colors] || colors.Medium}`}
      >
        {priority}
      </span>
    )
  }

  // Filter data based on active tab and search
  const filteredData = sampleData.filter((item) => {
    const matchesTab = activeTab === "all" || item.status.toLowerCase() === activeTab.toLowerCase()

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesTab && matchesSearch
  })

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (sortDirection === "asc") {
      return aValue.localeCompare(bValue)
    } else {
      return bValue.localeCompare(aValue)
    }
  })

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <Card className="border-b">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Data Management</h1>
              <p className="text-muted-foreground mt-1">Manage and organize your data efficiently</p>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 bg-transparent">
                  <InfoIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium">Data Table Help</h4>
                  <p className="text-sm text-muted-foreground">
                    Use the tabs to filter by status, search to find specific items, and click column headers to sort.
                    Filter buttons help narrow down results.
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </CardHeader>
        </Card>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {/* Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Filter Buttons */}
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
                </div>
              </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort("id")}>
                          <div className="flex items-center space-x-1">
                            <span>ID</span>
                            {getSortIcon("id")}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort("name")}>
                          <div className="flex items-center space-x-1">
                            <span>Name</span>
                            {getSortIcon("name")}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort("status")}>
                          <div className="flex items-center space-x-1">
                            <span>Status</span>
                            {getSortIcon("status")}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort("category")}>
                          <div className="flex items-center space-x-1">
                            <span>Category</span>
                            {getSortIcon("category")}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort("date")}>
                          <div className="flex items-center space-x-1">
                            <span>Date</span>
                            {getSortIcon("date")}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort("priority")}>
                          <div className="flex items-center space-x-1">
                            <span>Priority</span>
                            {getSortIcon("priority")}
                          </div>
                        </TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((item, index) => (
                        <TableRow
                          key={item.id}
                          className={`hover:bg-muted/50 transition-colors ${
                            index % 2 === 0 ? "bg-background" : "bg-muted/20"
                          }`}
                        >
                          <TableCell className="font-mono text-sm">{item.id}</TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            <span className="text-muted-foreground">{item.category}</span>
                          </TableCell>
                          <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                          <TableCell>{getPriorityBadge(item.priority)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <EditIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
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
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      ))}
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
        </Tabs>
      </div>
    </div>
  )
}
