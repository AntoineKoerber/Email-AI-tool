"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Target, BarChart3, TrendingUp, Clock, Edit } from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"
import { Button } from "@/components/ui/button"
import DashboardLayout from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CampaignCalendar } from "@/components/campaign-calendar"
import { UpcomingCampaigns } from "@/components/upcoming-campaigns"

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

// Helper function to format dates in DD/MM/YYYY format (Day/Month/Year)
function formatDateDDMMYYYY(dateString: string): string {
  try {
    // Parse the date string directly without timezone conversion
    const parts = dateString.split("-")
    if (parts.length === 3) {
      const year = parts[0]
      const month = parts[1].padStart(2, "0")
      const day = parts[2].padStart(2, "0")

      // Return in DD/MM/YYYY format (Day/Month/Year)
      return `${day}/${month}/${year}`
    }

    // Fallback to Date parsing if format is different
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "—"

    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()

    return `${day}/${month}/${year}`
  } catch {
    return "—"
  }
}

// Helper function to sort campaigns chronologically
function sortCampaignsChronologically(campaigns: any[]) {
  // Ensure campaigns is an array before sorting
  if (!Array.isArray(campaigns)) {
    console.warn("sortCampaignsChronologically received non-array:", campaigns)
    return []
  }

  return campaigns.sort((a, b) => {
    const aStartDate = a.fields?.["Start Date"] ? new Date(a.fields["Start Date"]) : null
    const bStartDate = b.fields?.["Start Date"] ? new Date(b.fields["Start Date"]) : null

    // If both have start dates, sort by start date (future first)
    if (aStartDate && bStartDate) {
      return bStartDate.getTime() - aStartDate.getTime()
    }

    // If only one has a start date, prioritize the one with a date
    if (aStartDate && !bStartDate) return -1
    if (!aStartDate && bStartDate) return 1

    // If neither has start dates, sort by creation order (keep original order)
    return 0
  })
}

export default function Campaigns() {
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<any[]>([])
  const [filteredRecords, setFilteredRecords] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const [stats, setStats] = useState({
    active: 0,
    total: 0,
    avgPerformance: "—",
    pendingSetup: 0,
  })

  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    operatorId: "",
    incentiveId: "",
    startDate: "",
    endDate: "",
    tagsIncentive: "", // Add this field
  })

  const [operators, setOperators] = useState<any[]>([])
  const [incentives, setIncentives] = useState<any[]>([])

  // Add safety check for incentives data
  const safeIncentives = Array.isArray(incentives) ? incentives : []

  const [showEditForm, setShowEditForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch campaigns
        const campaignsRes = await fetch("/api/campaigns")
        if (campaignsRes.ok) {
          const campaignsData = await campaignsRes.json()
          const campaignRecords = campaignsData.records || []
          console.log("Fetched campaigns data:", campaignRecords)
          setRecords(campaignRecords)
          setFilteredRecords(campaignRecords)

          const today = new Date()
          const active = campaignRecords.filter((r: any) => {
            const start = r.fields?.["Start Date"] ? new Date(r.fields["Start Date"]) : null
            const end = r.fields?.["End Date"] ? new Date(r.fields["End Date"]) : null
            return start && end && start <= today && end >= today
          }).length

          setStats({
            active,
            total: campaignRecords.length,
            avgPerformance: "High",
            pendingSetup: campaignRecords.filter((r: any) => !r.fields?.["Start Date"]).length,
          })
        } else {
          console.error("Failed to fetch campaigns:", campaignsRes.status)
          setRecords([])
          setFilteredRecords([])
        }

        // Fetch operators
        const operatorsRes = await fetch("/api/operators")
        if (operatorsRes.ok) {
          const operatorsData = await operatorsRes.json()
          setOperators(operatorsData.records || [])
        } else {
          console.error("Failed to fetch operators:", operatorsRes.status)
          setOperators([])
        }

        // Fetch incentives
        const incentivesRes = await fetch("/api/incentives")
        if (incentivesRes.ok) {
          const incentivesData = await incentivesRes.json()
          console.log("Incentives data:", incentivesData.records)
          if (incentivesData.records && incentivesData.records.length > 0) {
            console.log("First incentive record fields:", incentivesData.records[0].fields)
            console.log("Available field names:", Object.keys(incentivesData.records[0].fields || {}))
          }
          setIncentives(incentivesData.records || [])
        } else {
          console.error("Failed to fetch incentives:", incentivesRes.status)
          setIncentives([])
        }
      } catch (err) {
        console.error("Failed to fetch data", err)
        setRecords([])
        setFilteredRecords([])
        setOperators([])
        setIncentives([])
        setStats({
          active: 0,
          total: 0,
          avgPerformance: "—",
          pendingSetup: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter and sort records based on status
  useEffect(() => {
    let filtered = records || []

    if (statusFilter !== "all") {
      filtered = filtered.filter((record) => record.fields?.Status === statusFilter)
    }

    // Sort chronologically (future dates first)
    const sorted = sortCampaignsChronologically([...filtered])
    setFilteredRecords(sorted)
  }, [statusFilter, records])

  const handleEdit = (record: any) => {
    console.log("Editing record:", record) // Add this for debugging
    setEditingRecord(record)

    // Get the linked record IDs for editing - fix the data loading
    const linkedOperatorId = record.fields?.["Linked Operator"]?.[0] || ""
    const linkedPromoId = record.fields?.["Linked Promo"]?.[0] || ""

    // If the linked IDs are operator/incentive names, we need to find their actual IDs
    let operatorId = linkedOperatorId
    let incentiveId = linkedPromoId

    // Find operator ID by name if needed
    if (linkedOperatorId && typeof linkedOperatorId === "string") {
      const foundOperator = operators.find(
        (op) => op.fields?.["operator"] === linkedOperatorId || op.fields?.["Operator Name"] === linkedOperatorId,
      )
      if (foundOperator) {
        operatorId = foundOperator.id
      }
    }

    // Find incentive ID by name if needed
    if (linkedPromoId && typeof linkedPromoId === "string") {
      const foundIncentive = safeIncentives.find(
        (inc) => inc.fields?.["name"] === linkedPromoId || inc.fields?.["Name"] === linkedPromoId,
      )
      if (foundIncentive) {
        incentiveId = foundIncentive.id
      }
    }

    setFormData({
      operatorId: operatorId,
      incentiveId: incentiveId,
      startDate: record.fields?.["Start Date"] || "",
      endDate: record.fields?.["End Date"] || "",
      tagsIncentive: record.fields?.["Tags Incentive"] || "", // Add tags field
    })
    setShowEditForm(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!editingRecord) return

    try {
      const fields: any = {}

      // Only add fields that have values
      if (formData.operatorId) {
        fields["Linked Operator"] = [formData.operatorId]
      }
      if (formData.incentiveId) {
        fields["Linked Promo"] = [formData.incentiveId]
      }
      if (formData.startDate) {
        fields["Start Date"] = formData.startDate
      }
      if (formData.endDate) {
        fields["End Date"] = formData.endDate
      }
      if (formData.tagsIncentive) {
        fields["Tags Incentive"] = formData.tagsIncentive
      }

      const payload = {
        recordId: editingRecord.fields?.Ref || editingRecord.id, // Use Ref field as the ID
        fields: fields,
      }

      const res = await fetch("/api/campaigns", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setShowEditForm(false)
        setEditingRecord(null)
        setFormData({ operatorId: "", incentiveId: "", startDate: "", endDate: "", tagsIncentive: "" })

        // Refresh the data
        const refreshRes = await fetch("/api/campaigns")
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json()
          const refreshedRecords = refreshData.records || []
          setRecords(refreshedRecords)
          setFilteredRecords(refreshedRecords)
        }
      } else {
        const errorData = await res.json()
        console.error("Error response:", errorData)
        setFormError("Failed to update campaign. Please try again.")
      }
    } catch (error) {
      console.error("Failed to update campaign:", error)
      setFormError("Failed to update campaign. Please try again.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formData.operatorId || !formData.incentiveId) {
      setFormError("Please select both an operator and an incentive.")
      return
    }

    try {
      const fields: any = {}

      // Use the actual linked record fields with record IDs
      fields["Linked Operator"] = [formData.operatorId]
      fields["Linked Promo"] = [formData.incentiveId]

      // Only add dates if they are provided
      if (formData.startDate) {
        fields["Start Date"] = formData.startDate
      }
      if (formData.endDate) {
        fields["End Date"] = formData.endDate
      }

      console.log("Submitting campaign with fields:", fields)

      const res = await fetch("/api/campaigns", {
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
        setFormData({ operatorId: "", incentiveId: "", startDate: "", endDate: "", tagsIncentive: "" })

        // Refresh the data
        const refreshRes = await fetch("/api/campaigns")
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json()
          const refreshedRecords = refreshData.records || []
          setRecords(refreshedRecords)
          setFilteredRecords(refreshedRecords)
        }
      } else {
        const errorData = await res.json()
        console.error("Error response:", errorData)
        setFormError("Failed to create campaign. Please check your selections and try again.")
      }
    } catch (error) {
      console.error("Failed to create campaign:", error)
      setFormError("Failed to create campaign. Please try again.")
    }
  }

  return (
    <TooltipProvider>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Campaign Management</h1>
              <p className="text-slate-400">Track operator promotional campaigns and performance</p>
            </div>
            <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  + Add Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                  <DialogTitle>Add New Campaign</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {formError && <div className="bg-red-500/20 text-red-400 p-3 rounded-md text-sm">{formError}</div>}
                  <div>
                    <Label htmlFor="operator">Operator *</Label>
                    <Select
                      value={formData.operatorId}
                      onValueChange={(value) => setFormData({ ...formData, operatorId: value })}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        {operators.map((operator) => (
                          <SelectItem key={operator.id} value={operator.id}>
                            {operator.fields?.["operator"] ||
                              operator.fields?.["Operator Name"] ||
                              `Operator ${operator.id.toString().slice(-4)}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="incentive">Incentive *</Label>
                    <Select
                      value={formData.incentiveId || ""}
                      onValueChange={(value) => {
                        if (value && value !== "no-incentives") {
                          setFormData((prev) => ({
                            ...prev,
                            incentiveId: value,
                          }))
                        }
                      }}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select incentive" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        {safeIncentives.length > 0 ? (
                          safeIncentives.map((incentive, index) => {
                            // Use index as fallback if no ID exists
                            const incentiveId = incentive?.id ? String(incentive.id) : `incentive-${index}`

                            return (
                              <SelectItem key={incentiveId} value={incentiveId}>
                                {incentive?.fields?.["name"] || incentive?.fields?.["Name"] || `Incentive ${index + 1}`}
                              </SelectItem>
                            )
                          })
                        ) : (
                          <SelectItem value="no-incentives" disabled>
                            No incentives available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="startDate">Start Date (Optional)</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date (Optional)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600">
                      Create Campaign
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
              <DialogContent className="bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                  <DialogTitle>Edit Campaign</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  {formError && <div className="bg-red-500/20 text-red-400 p-3 rounded-md text-sm">{formError}</div>}
                  <div>
                    <Label htmlFor="editOperator">Operator</Label>
                    <Select
                      value={formData.operatorId}
                      onValueChange={(value) => setFormData({ ...formData, operatorId: value })}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        {operators.map((operator) => (
                          <SelectItem key={operator.id} value={operator.id}>
                            {operator.fields?.["operator"] ||
                              operator.fields?.["Operator Name"] ||
                              `Operator ${operator.id.toString().slice(-4)}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editPromotion">Incentive</Label>
                    <Select
                      value={formData.incentiveId || ""}
                      onValueChange={(value) => {
                        if (value && value !== "no-incentives") {
                          setFormData((prev) => ({
                            ...prev,
                            incentiveId: value,
                          }))
                        }
                      }}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select promotion" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        {safeIncentives.length > 0 ? (
                          safeIncentives.map((incentive, index) => {
                            // Use index as fallback if no ID exists
                            const incentiveId = incentive?.id ? String(incentive.id) : `incentive-${index}`

                            return (
                              <SelectItem key={incentiveId} value={incentiveId}>
                                {incentive?.fields?.["name"] || incentive?.fields?.["Name"] || `Incentive ${index + 1}`}
                              </SelectItem>
                            )
                          })
                        ) : (
                          <SelectItem value="no-incentives" disabled>
                            No incentives available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editStartDate">Start Date (Optional)</Label>
                    <Input
                      id="editStartDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editEndDate">End Date (Optional)</Label>
                    <Input
                      id="editEndDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editTagsIncentive">Tags Incentive</Label>
                    <Input
                      id="editTagsIncentive"
                      type="text"
                      value={formData.tagsIncentive}
                      onChange={(e) => setFormData({ ...formData, tagsIncentive: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder="Enter tags for this incentive"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowEditForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600">
                      Update Campaign
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Active Campaigns"
              value={loading ? "" : stats.active.toString()}
              description="+1 from last week"
              icon={Target}
              trend="up"
              loading={loading}
            />
            <StatCard
              title="Total Conversions"
              value={loading ? "" : stats.total.toString()}
              description="+15% from last month"
              icon={BarChart3}
              trend="up"
              loading={loading}
            />
            <StatCard
              title="Avg Performance"
              value={loading ? "" : stats.avgPerformance}
              description="Improved since last quarter"
              icon={TrendingUp}
              trend="up"
              loading={loading}
            />
            <StatCard
              title="Pending Setup"
              value={loading ? "" : stats.pendingSetup.toString()}
              description="Due this week"
              icon={Clock}
              trend="neutral"
              loading={loading}
            />
          </div>

          {/* Calendar and Upcoming Campaigns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {loading ? (
              <>
                <div className="lg:col-span-2">
                  <LoadingTable rows={8} columns={7} />
                </div>
                <div className="lg:col-span-1">
                  <LoadingTable rows={5} columns={2} />
                </div>
              </>
            ) : (
              <>
                <div className="lg:col-span-2 h-[400px] overflow-y-auto">
                  <CampaignCalendar campaigns={records} operators={operators} loading={loading} />
                </div>
                <div className="lg:col-span-1 h-[400px] overflow-y-auto">
                  <UpcomingCampaigns campaigns={records} loading={loading} />
                </div>
              </>
            )}
          </div>

          {/* Table */}
          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              <LoadingTable rows={5} columns={5} />
            ) : (
              <Card className="bg-slate-900/90 border-slate-700/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-white">Campaign Overview</CardTitle>
                    <p className="text-slate-400">
                      Operator-specific promotional campaigns with dates and performance (newest first)
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-400">Filter by status:</span>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Planned">Planned</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700">
                          <TableHead className="text-slate-300 min-w-[150px]">Operator</TableHead>
                          <TableHead className="text-slate-300 min-w-[200px]">Incentive</TableHead>
                          <TableHead className="text-slate-300 min-w-[120px]">Start Date ↓</TableHead>
                          <TableHead className="text-slate-300 min-w-[120px]">End Date</TableHead>
                          <TableHead className="text-slate-300 min-w-[150px]">Tags</TableHead>
                          <TableHead className="text-slate-300 min-w-[80px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRecords.length > 0 ? (
                          filteredRecords.map((r) => {
                            const operatorName = r.fields?.["Operator (Lookup)"] || "—"
                            const incentiveName = r.fields?.["Incentive (Lookup)"] || "—"

                            return (
                              <TableRow key={r.id} className="border-slate-700 hover:bg-slate-800/50">
                                <TableCell className="text-white font-medium">
                                  {operatorName.length > 20 ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="cursor-help">{truncateText(operatorName, 20)}</span>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-slate-800 border-slate-700 text-white">
                                        <p>{operatorName}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    operatorName
                                  )}
                                </TableCell>
                                <TableCell className="text-slate-300">
                                  {incentiveName.length > 25 ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="cursor-help">{truncateText(incentiveName, 25)}</span>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-slate-800 border-slate-700 text-white">
                                        <p>{incentiveName}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    incentiveName
                                  )}
                                </TableCell>
                                <TableCell className="text-slate-300">
                                  {r.fields?.["Start Date"] ? formatDateDDMMYYYY(r.fields["Start Date"]) : "—"}
                                </TableCell>
                                <TableCell className="text-slate-300">
                                  {r.fields?.["End Date"] ? formatDateDDMMYYYY(r.fields["End Date"]) : "—"}
                                </TableCell>
                                <TableCell className="text-slate-300">
                                  {r.fields?.["Tags Incentive"] ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
                                      {truncateText(r.fields["Tags Incentive"], 15)}
                                    </span>
                                  ) : (
                                    "—"
                                  )}
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
                            <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                              {statusFilter === "all"
                                ? "No campaigns found"
                                : `No campaigns with status "${statusFilter}" found`}
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
