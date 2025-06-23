"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Gift, Users, Target, Activity, Edit } from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"
import { LoadingChart } from "@/components/ui/loading-chart"
import { Button } from "@/components/ui/button"
import DashboardLayout from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MultiSelect } from "@/components/ui/multi-select"
import { Textarea } from "@/components/ui/textarea"

// Local LoadingTable component
function LoadingTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <Card className="bg-slate-900/90 border-slate-700/50">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-2/3 bg-slate-800" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-4">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1 bg-slate-800" />
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex space-x-4">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <Skeleton key={colIndex} className="h-4 flex-1 bg-slate-800" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to truncate text
function truncateText(text: string, maxLength = 30) {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

// Update the getKeywordBadgeColor function to assign unique colors to each keyword
function getKeywordBadgeColor(keyword: string, index: number) {
  const colors = [
    "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "bg-amber-500/20 text-amber-400 border-amber-500/30",
    "bg-pink-500/20 text-pink-400 border-pink-500/30",
    "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    "bg-orange-500/20 text-orange-400 border-orange-500/30",
    "bg-red-500/20 text-red-400 border-red-500/30",
    "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    "bg-teal-500/20 text-teal-400 border-teal-500/30",
    "bg-lime-500/20 text-lime-400 border-lime-500/30",
    "bg-rose-500/20 text-rose-400 border-rose-500/30",
  ]

  return colors[index % colors.length]
}

// Ensure array type for data fields
function ensureArray(value: any): any[] {
  if (Array.isArray(value)) return value
  if (value === undefined || value === null) return []
  return [value] // Convert single value to array
}

export default function Promotions() {
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<any[]>([])
  const [keywordFilter, setKeywordFilter] = useState<string>("all")
  const [filteredRecords, setFilteredRecords] = useState<any[]>([])
  const [availableKeywords, setAvailableKeywords] = useState<string[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    promotionName: "",
    description: "",
    selectedKeywords: [] as string[],
    tags: [] as string[],
  })

  const [showEditForm, setShowEditForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  // Predefined keywords for promotions
  const predefinedKeywords = [
    "VIP",
    "New Player",
    "High Roller",
    "Seasonal",
    "Limited Time",
    "Exclusive",
    "Bonus",
    "Free Spins",
    "Loyalty",
    "Jackpot",
  ]

  useEffect(() => {
    async function fetchData() {
      try {
        setError(null)
        // Fetch promotions
        const promotionsRes = await fetch("/api/promotions")
        if (promotionsRes.ok) {
          const promotionsData = await promotionsRes.json()
          console.log("Fetched data:", promotionsData)

          setRecords(promotionsData.records || [])
          setFilteredRecords(promotionsData.records || [])

          // Extract unique keywords from all records
          const allKeywords = new Set<string>()
          ;(promotionsData.records || []).forEach((record: any) => {
            const keywords = ensureArray(record.fields?.["Promo Keywords"])
            keywords.forEach((keyword: string) => {
              if (keyword && keyword.trim()) {
                allKeywords.add(keyword.trim())
              }
            })
          })
          setAvailableKeywords(Array.from(allKeywords).sort())

          // Extract unique tags from all records
          const allTags = new Set<string>()
          ;(promotionsData.records || []).forEach((record: any) => {
            const tags = ensureArray(record.fields?.["Tags"])
            tags.forEach((tag: string) => {
              if (tag && tag.trim()) {
                allTags.add(tag.trim())
              }
            })
          })
          setAvailableTags(Array.from(allTags).sort())
        } else {
          const errorData = await promotionsRes.json()
          console.error("API error:", errorData)
          setError(`Failed to fetch data: ${errorData.error || promotionsRes.statusText}`)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
        setError(`Failed to fetch data: ${error instanceof Error ? error.message : "Unknown error"}`)
        setRecords([])
        setFilteredRecords([])
        setAvailableKeywords([])
        setAvailableTags([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    let filtered = records

    if (keywordFilter !== "all") {
      filtered = filtered.filter((record) => {
        const keywords = ensureArray(record.fields?.["Promo Keywords"])
        // Check if the selected keyword exists in the keywords array (case-insensitive)
        return keywords.some((keyword: string) => keyword.toLowerCase().includes(keywordFilter.toLowerCase()))
      })
    }

    setFilteredRecords(filtered)
  }, [keywordFilter, records])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formData.promotionName.trim()) {
      setFormError("Please enter an incentive name.")
      return
    }

    try {
      const fields: any = {
        "Incentive Name": formData.promotionName,
      }

      // Add description if provided
      if (formData.description.trim()) {
        fields["Description"] = formData.description
      }

      // Add keywords if selected
      if (formData.selectedKeywords.length > 0) {
        fields["Promo Keywords"] = formData.selectedKeywords
      }

      // Add tags if selected
      if (formData.tags.length > 0) {
        fields["Tags"] = formData.tags
      }

      console.log("Submitting incentive with fields:", fields)

      const res = await fetch("/api/promotions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields,
        }),
      })

      if (res.ok) {
        setShowAddForm(false)
        setFormData({ promotionName: "", description: "", selectedKeywords: [], tags: [] })

        // Refresh the data
        const refreshRes = await fetch("/api/promotions")
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json()
          setRecords(refreshData.records || [])
          setFilteredRecords(refreshData.records || [])
        }
      } else {
        const errorData = await res.json()
        console.error("Error response:", errorData)
        setFormError(`Failed to create incentive: ${errorData.error || errorData.details || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Failed to create incentive:", error)
      setFormError(`Failed to create incentive: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleEdit = (record: any) => {
    setEditingRecord(record)

    setFormData({
      promotionName: record.fields?.["Incentive Name"] || "",
      description: record.fields?.["Description"] || "",
      selectedKeywords: ensureArray(record.fields?.["Promo Keywords"]),
      tags: ensureArray(record.fields?.["Tags"]),
    })
    setShowEditForm(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!editingRecord) return

    if (!formData.promotionName.trim()) {
      setFormError("Please enter an incentive name.")
      return
    }

    try {
      const fields: any = {
        "Incentive Name": formData.promotionName,
      }

      // Add description if provided
      if (formData.description.trim()) {
        fields["Description"] = formData.description
      }

      // Add keywords if selected
      if (formData.selectedKeywords.length > 0) {
        fields["Promo Keywords"] = formData.selectedKeywords
      }

      // Add tags if selected
      if (formData.tags.length > 0) {
        fields["Tags"] = formData.tags
      }

      const payload = {
        recordId: editingRecord.id,
        fields: fields,
      }

      const res = await fetch("/api/promotions", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setShowEditForm(false)
        setEditingRecord(null)
        setFormData({ promotionName: "", description: "", selectedKeywords: [], tags: [] })

        // Refresh the data
        const refreshRes = await fetch("/api/promotions")
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json()
          setRecords(refreshData.records || [])
          setFilteredRecords(refreshData.records || [])
        }
      } else {
        const errorData = await res.json()
        console.error("Error response:", errorData)
        setFormError(`Failed to update incentive: ${errorData.error || errorData.details || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Failed to update incentive:", error)
      setFormError(`Failed to update incentive: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return (
    <TooltipProvider>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Incentives Management</h1>
              <p className="text-slate-400">Design and track incentive offers</p>
            </div>
            <Dialog
              open={showAddForm}
              onOpenChange={(open) => {
                setShowAddForm(open)
                if (open) {
                  // Reset form data when opening add dialog
                  setFormData({ promotionName: "", description: "", selectedKeywords: [], tags: [] })
                  setFormError(null)
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  + Create Incentive
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                  <DialogTitle>Create New Incentive</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {formError && <div className="bg-red-500/20 text-red-400 p-3 rounded-md text-sm">{formError}</div>}
                  <div>
                    <Label htmlFor="promotionName">Incentive Name *</Label>
                    <Input
                      id="promotionName"
                      value={formData.promotionName}
                      onChange={(e) => setFormData({ ...formData, promotionName: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder="Enter incentive description and terms..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="keywords">Keywords</Label>
                    <MultiSelect
                      options={predefinedKeywords}
                      selected={formData.selectedKeywords}
                      onChange={(keywords) => setFormData({ ...formData, selectedKeywords: keywords })}
                      placeholder="Select keywords..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <MultiSelect
                      options={availableTags}
                      selected={formData.tags}
                      onChange={(tags) => setFormData({ ...formData, tags: tags })}
                      placeholder="Select or add tags..."
                      allowCustom={true}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600">
                      Create Incentive
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog
              open={showEditForm}
              onOpenChange={(open) => {
                setShowEditForm(open)
                if (!open) {
                  setEditingRecord(null)
                  setFormError(null)
                }
              }}
            >
              <DialogContent className="bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                  <DialogTitle>Edit Incentive</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  {formError && <div className="bg-red-500/20 text-red-400 p-3 rounded-md text-sm">{formError}</div>}
                  <div>
                    <Label htmlFor="editPromotionName">Incentive Name *</Label>
                    <Input
                      id="editPromotionName"
                      value={formData.promotionName}
                      onChange={(e) => setFormData({ ...formData, promotionName: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="editDescription">Description</Label>
                    <Textarea
                      id="editDescription"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder="Enter incentive description and terms..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editKeywords">Keywords</Label>
                    <MultiSelect
                      options={predefinedKeywords}
                      selected={formData.selectedKeywords}
                      onChange={(keywords) => setFormData({ ...formData, selectedKeywords: keywords })}
                      placeholder="Select keywords..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <MultiSelect
                      options={availableTags}
                      selected={formData.tags}
                      onChange={(tags) => setFormData({ ...formData, tags: tags })}
                      placeholder="Select or add tags..."
                      allowCustom={true}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowEditForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600">
                      Update Incentive
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/20 text-red-400 p-4 rounded-md mb-4">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Active Incentives"
              value={loading ? "" : records.length.toString()}
              description={"+3 this month"}
              icon={Gift}
              trend="up"
              loading={loading}
            />
            <StatCard
              title="Total Conversions"
              value={loading ? "" : "2,847"}
              description="+15% from last month"
              icon={Activity}
              trend="up"
              loading={loading}
            />
            <StatCard
              title="Participating Operators"
              value={loading ? "" : "18"}
              description="75% participation"
              icon={Users}
              trend="neutral"
              loading={loading}
            />
            <StatCard
              title="Avg. Conversion Rate"
              value={loading ? "" : "12.4%"}
              description="+2.1% improvement"
              icon={Target}
              trend="up"
              loading={loading}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {loading ? (
              <>
                <LoadingChart />
                <LoadingChart />
              </>
            ) : (
              <>
                <Card className="bg-slate-900/90 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Incentive Performance</CardTitle>
                    <p className="text-slate-400 text-sm">Conversion rates and engagement metrics</p>
                  </CardHeader>
                  <CardContent className="h-[250px]">
                    <div className="h-full w-full rounded-md bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
                      <div className="text-center p-4">
                        <p className="text-slate-400">Chart data will appear here</p>
                        <p className="text-slate-500 text-sm mt-1">Incentive performance visualization</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-900/90 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Operator Participation</CardTitle>
                    <p className="text-slate-400 text-sm">Incentive adoption by operators</p>
                  </CardHeader>
                  <CardContent className="h-[250px]">
                    <div className="h-full w-full rounded-md bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
                      <div className="text-center p-4">
                        <p className="text-slate-400">Chart data will appear here</p>
                        <p className="text-slate-500 text-sm mt-1">Operator participation visualization</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Full Width Table */}
          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              <LoadingTable rows={4} columns={5} />
            ) : (
              <Card className="bg-slate-900/90 border-slate-700/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-white">Incentive Overview</CardTitle>
                    <p className="text-slate-400">Available incentive offers for operators</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-400">Filter by keyword:</span>
                    <Select value={keywordFilter} onValueChange={setKeywordFilter}>
                      <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="All Keywords" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="all">All Keywords</SelectItem>
                        {availableKeywords.map((keyword) => (
                          <SelectItem key={keyword} value={keyword}>
                            {keyword}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700">
                          <TableHead className="text-slate-300 min-w-[200px]">Tags</TableHead>
                          <TableHead className="text-slate-300 min-w-[200px]">Name</TableHead>
                          <TableHead className="text-slate-300 min-w-[300px]">Description</TableHead>
                          <TableHead className="text-slate-300 min-w-[250px]">Keywords</TableHead>
                          <TableHead className="text-slate-300 min-w-[80px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRecords.length > 0 ? (
                          filteredRecords.map((r) => {
                            const promotionName = r.fields?.["Name"] || "—"
                            const description = r.fields?.["Description"] || ""
                            const keywords = ensureArray(r.fields?.["Promo Keywords"])
                            const tags = ensureArray(r.fields?.["Tags"])

                            return (
                              <TableRow key={r.id} className="border-slate-700 hover:bg-slate-800/50">
                                <TableCell className="text-slate-300">
                                  <div className="flex flex-wrap gap-1">
                                    {tags.length > 0 ? (
                                      tags.map((tag: string, index: number) => (
                                        <Badge
                                          key={index}
                                          variant="outline"
                                          className="bg-slate-500/20 text-slate-300 border-slate-500/30"
                                        >
                                          {tag}
                                        </Badge>
                                      ))
                                    ) : (
                                      <span>—</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-white font-medium">
                                  {promotionName.length > 30 ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="cursor-help">{truncateText(promotionName)}</span>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-slate-800 border-slate-700 text-white">
                                        <p>{promotionName}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    promotionName
                                  )}
                                </TableCell>
                                <TableCell className="text-slate-300">
                                  {description ? truncateText(description, 50) : "—"}
                                </TableCell>
                                <TableCell className="text-slate-300">
                                  <div className="flex flex-wrap gap-1">
                                    {keywords.length > 0 ? (
                                      keywords.map((keyword: string, index: number) => (
                                        <Badge
                                          key={index}
                                          variant="outline"
                                          className={getKeywordBadgeColor(keyword, index)}
                                        >
                                          {keyword}
                                        </Badge>
                                      ))
                                    ) : (
                                      <span>—</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEdit(r)}
                                    className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                              {keywordFilter === "all"
                                ? "No incentives found"
                                : `No incentives found with keyword "${keywordFilter}"`}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    </TooltipProvider>
  )
}
