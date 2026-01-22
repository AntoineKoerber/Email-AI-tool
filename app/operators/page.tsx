"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Building, Users, Target, TrendingUp, Edit } from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"
import { LoadingCard } from "@/components/ui/loading-card"
import { Button } from "@/components/ui/button"
import { OperatorHeatmap } from "@/components/operator-heatmap"
import DashboardLayout from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { MultiSelect } from "@/components/ui/multi-select"

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

// Helper function to capitalize first letter
function capitalizeFirstLetter(str: string) {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Helper function to abbreviate country names
function abbreviateCountry(country: string): string {
  const countryAbbreviations: { [key: string]: string } = {
    "United Kingdom": "UK",
    "United States": "US",
    "Czech Republic": "CZ",
    "Isle of Man": "IM",
    Malta: "MT",
    Gibraltar: "GI",
    Cyprus: "CY",
    Curacao: "CW",
    Estonia: "EE",
    Sweden: "SE",
    Denmark: "DK",
    Spain: "ES",
    Germany: "DE",
    Netherlands: "NL",
    Belgium: "BE",
    Italy: "IT",
    France: "FR",
    Portugal: "PT",
    Romania: "RO",
    Bulgaria: "BG",
    Poland: "PL",
    Lithuania: "LT",
    Latvia: "LV",
    Finland: "FI",
    Norway: "NO",
    Austria: "AT",
    Switzerland: "CH",
    Ireland: "IE",
    Luxembourg: "LU",
    Slovenia: "SI",
    Slovakia: "SK",
    Hungary: "HU",
    Croatia: "HR",
    Greece: "GR",
  }
  return countryAbbreviations[country] || country.substring(0, 3).toUpperCase()
}

// Helper function to abbreviate language names
function abbreviateLanguage(language: string): string {
  const languageAbbreviations: { [key: string]: string } = {
    English: "EN",
    Spanish: "ES",
    German: "DE",
    French: "FR",
    Italian: "IT",
    Portuguese: "PT",
    Dutch: "NL",
    Swedish: "SV",
    Danish: "DA",
    Norwegian: "NO",
    Finnish: "FI",
    Polish: "PL",
    Czech: "CS",
    Hungarian: "HU",
    Romanian: "RO",
    Bulgarian: "BG",
    Greek: "EL",
    Croatian: "HR",
    Slovenian: "SL",
    Slovak: "SK",
    Lithuanian: "LT",
    Latvian: "LV",
    Estonian: "ET",
  }
  return languageAbbreviations[language] || language.substring(0, 2).toUpperCase()
}

export default function Operators() {
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<any[]>([])
  const [countryFilter, setCountryFilter] = useState<string>("all")
  const [languageFilter, setLanguageFilter] = useState<string>("all")
  const [engagementFilter, setEngagementFilter] = useState<string>("all")
  const [filteredRecords, setFilteredRecords] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [formData, setFormData] = useState({
    operatorName: "",
    contactName: "",
    country: "",
    language: "",
    contactEmail: "",
    engagementStatus: "",
    tags: [] as string[],
    prefComm: "unknown",
  })
  const [formError, setFormError] = useState<string | null>(null)

  // Predefined options - ensure no empty strings
  const availableTags = [
    "Luxury Experience",
    "Budget-Friendly",
    "Rising Star",
    "Established Leader",
    "Innovative",
    "Traditional",
    "Expansive Game Selection",
    "Curated Game Selection",
    "Local Favorite",
    "International Appeal",
  ].filter((tag) => tag && tag.trim() !== "")

  const countries = [
    "Malta",
    "United Kingdom",
    "Gibraltar",
    "Cyprus",
    "Isle of Man",
    "Curacao",
    "Estonia",
    "Sweden",
    "Denmark",
    "Spain",
    "Germany",
    "Netherlands",
    "Belgium",
    "Italy",
    "France",
    "Portugal",
    "Romania",
    "Bulgaria",
    "Czech Republic",
    "Poland",
    "Lithuania",
    "Latvia",
    "Finland",
    "Norway",
    "Austria",
    "Switzerland",
    "Ireland",
    "Luxembourg",
    "Slovenia",
    "Slovakia",
    "Hungary",
    "Croatia",
    "Greece",
  ].filter((country) => country && country.trim() !== "")

  const languages = [
    "English",
    "Spanish",
    "German",
    "French",
    "Italian",
    "Portuguese",
    "Dutch",
    "Swedish",
    "Danish",
    "Norwegian",
    "Finnish",
    "Polish",
    "Czech",
    "Hungarian",
    "Romanian",
    "Bulgarian",
    "Greek",
    "Croatian",
    "Slovenian",
    "Slovak",
    "Lithuanian",
    "Latvian",
    "Estonian",
  ].filter((language) => language && language.trim() !== "")

  // Engagement statuses - ensure no empty strings
  const engagementStatuses = ["Hot", "Medium", "Cold"].filter((status) => status && status.trim() !== "")

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/operators")

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data = await res.json()
        console.log("Fetched operators data:", data)

        // Sort records by creation time (newest first)
        const sortedRecords = (data.records || []).sort((a: any, b: any) => {
          const dateA = new Date(a.createdTime || 0)
          const dateB = new Date(b.createdTime || 0)
          return dateB.getTime() - dateA.getTime()
        })

        setRecords(sortedRecords)
        setFilteredRecords(sortedRecords)
      } catch (error) {
        console.error("Failed to fetch operators:", error)
        setRecords([])
        setFilteredRecords([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    let filtered = records

    if (countryFilter !== "all") {
      filtered = filtered.filter((record) => record.fields?.Country === countryFilter)
    }

    if (languageFilter !== "all") {
      filtered = filtered.filter((record) => record.fields?.["Preferred Language"] === languageFilter)
    }

    if (engagementFilter !== "all") {
      filtered = filtered.filter((record) => record.fields?.["Engagement Status"] === engagementFilter)
    }

    setFilteredRecords(filtered)
  }, [countryFilter, languageFilter, engagementFilter, records])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    try {
      // Only include fields that have values
      const fields: any = {
        "Operator Name": formData.operatorName,
        "Contact Name": capitalizeFirstLetter(formData.contactName),
        Country: formData.country,
        "Preferred Language": formData.language,
        "Contact Email": formData.contactEmail,
      }

      // Add required engagement status
      fields["Engagement Status"] = formData.engagementStatus.toLowerCase() // Convert to lowercase for Supabase

      if (formData.tags.length > 0) {
        fields.Tags = formData.tags
      }

      // Add communication preference
      fields["Communication Preference"] = formData.prefComm

      const payload = {
        records: [{ fields }],
      }

      console.log("Submitting operator payload:", payload)

      const res = await fetch("/api/operators", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error("Error response:", errorData)
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      console.log("Success response:", data)

      setShowAddForm(false)
      setFormData({
        operatorName: "",
        contactName: "",
        country: "",
        language: "",
        contactEmail: "",
        engagementStatus: "",
        tags: [],
        prefComm: "unknown",
      })

      // Refresh the data
      const refreshRes = await fetch("/api/operators")
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json()
        const sortedRecords = (refreshData.records || []).sort((a: any, b: any) => {
          const dateA = new Date(a.createdTime || 0)
          const dateB = new Date(b.createdTime || 0)
          return dateB.getTime() - dateA.getTime()
        })
        setRecords(sortedRecords)
        setFilteredRecords(sortedRecords)
      }
    } catch (error) {
      console.error("Failed to create operator:", error)
      setFormError("Failed to create operator. Please try again.")
    }
  }

  const handleEdit = (record: any) => {
    setEditingRecord(record)
    setFormData({
      operatorName: record.fields?.["Operator Name"] || "",
      contactName: record.fields?.["Contact Name"] || "",
      country: record.fields?.Country || "",
      language: record.fields?.["Preferred Language"] || "",
      contactEmail: record.fields?.["Contact Email"] || "",
      engagementStatus: record.fields?.["Engagement Status"] || "",
      tags: Array.isArray(record.fields?.Tags) ? record.fields.Tags : [],
      prefComm: record.fields?.["Communication Preference"] || "unknown",
    })
    setShowEditForm(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!editingRecord) return

    try {
      // Only include fields that have values
      const fields: any = {
        "Operator Name": formData.operatorName,
        "Contact Name": capitalizeFirstLetter(formData.contactName),
        Country: formData.country,
        "Preferred Language": formData.language,
        "Contact Email": formData.contactEmail,
      }

      // Add required engagement status
      fields["Engagement Status"] = formData.engagementStatus.toLowerCase() // Convert to lowercase for Supabase

      if (formData.tags.length > 0) {
        fields.Tags = formData.tags
      }

      // Add communication preference
      fields["Communication Preference"] = formData.prefComm

      const payload = {
        recordId: editingRecord.id,
        fields,
      }

      const res = await fetch("/api/operators", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error("Error response:", errorData)
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      setShowEditForm(false)
      setEditingRecord(null)
      setFormData({
        operatorName: "",
        contactName: "",
        country: "",
        language: "",
        contactEmail: "",
        engagementStatus: "",
        tags: [],
        prefComm: "unknown",
      })

      // Refresh the data
      const refreshRes = await fetch("/api/operators")
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json()
        const sortedRecords = (refreshData.records || []).sort((a: any, b: any) => {
          const dateA = new Date(a.createdTime || 0)
          const dateB = new Date(b.createdTime || 0)
          return dateB.getTime() - dateA.getTime()
        })
        setRecords(sortedRecords)
        setFilteredRecords(sortedRecords)
      }
    } catch (error) {
      console.error("Failed to update operator:", error)
      setFormError("Failed to update operator. Please try again.")
    }
  }

  return (
    <TooltipProvider>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Operators Management</h1>
              <p className="text-slate-400">Manage gaming operator relationships</p>
            </div>
            <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  + Add Operator
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                  <DialogTitle>Add New Operator</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {formError && <div className="bg-red-500/20 text-red-400 p-3 rounded-md text-sm">{formError}</div>}
                  <div>
                    <Label htmlFor="operatorName">Operator Name *</Label>
                    <Input
                      id="operatorName"
                      value={formData.operatorName}
                      onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder="e.g. John"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Market *</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => setFormData({ ...formData, country: value })}
                      required
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-60">
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">Language *</Label>
                    <Select
                      value={formData.language}
                      onValueChange={(value) => setFormData({ ...formData, language: value })}
                      required
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-60">
                        {languages.map((language) => (
                          <SelectItem key={language} value={language}>
                            {language}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">Contact Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="engagementStatus">Engagement Status *</Label>
                    <Select
                      value={formData.engagementStatus}
                      onValueChange={(value) => setFormData({ ...formData, engagementStatus: value })}
                      required
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select engagement status" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        {engagementStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (Optional)</Label>
                    <MultiSelect
                      options={availableTags}
                      selected={formData.tags}
                      onChange={(tags) => setFormData({ ...formData, tags })}
                      placeholder="Select tags (optional)..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="prefComm">Contact Channel</Label>
                    <Select
                      value={formData.prefComm}
                      onValueChange={(value) => setFormData({ ...formData, prefComm: value })}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select contact channel" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="message">Message</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600">
                      Add Operator
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Edit Dialog */}
          <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
            <DialogContent className="bg-slate-900 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle>Edit Operator</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                {formError && <div className="bg-red-500/20 text-red-400 p-3 rounded-md text-sm">{formError}</div>}
                <div>
                  <Label htmlFor="editOperatorName">Operator Name *</Label>
                  <Input
                    id="editOperatorName"
                    value={formData.operatorName}
                    onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editContactName">Contact Name *</Label>
                  <Input
                    id="editContactName"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="e.g. John Smith"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editCountry">Country *</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => setFormData({ ...formData, country: value })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-60">
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editLanguage">Preferred Language *</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => setFormData({ ...formData, language: value })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-60">
                      {languages.map((language) => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editContactEmail">Contact Email *</Label>
                  <Input
                    id="editContactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editEngagementStatus">Engagement Status *</Label>
                  <Select
                    value={formData.engagementStatus}
                    onValueChange={(value) => setFormData({ ...formData, engagementStatus: value })}
                    required
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Select engagement status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {engagementStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editTags">Tags (Optional)</Label>
                  <MultiSelect
                    options={availableTags}
                    selected={formData.tags}
                    onChange={(tags) => setFormData({ ...formData, tags })}
                    placeholder="Select tags (optional)..."
                  />
                </div>
                <div>
                  <Label htmlFor="editPrefComm">Contact Channel</Label>
                  <Select
                    value={formData.prefComm}
                    onValueChange={(value) => setFormData({ ...formData, prefComm: value })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Select contact channel" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="message">Message</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowEditForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600">
                    Update Operator
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Operators"
              value={loading ? "" : records.length.toString()}
              description="+3 this quarter"
              icon={Building}
              trend="up"
              loading={loading}
            />
            <StatCard
              title="Active Operators"
              value={loading ? "" : "18"}
              description="75% active rate"
              icon={Users}
              trend="neutral"
              loading={loading}
            />
            <StatCard
              title="Total Campaigns"
              value={loading ? "" : "42"}
              description="1.75 per operator"
              icon={Target}
              trend="up"
              loading={loading}
            />
            <StatCard
              title="Avg Engagement"
              value={loading ? "" : "Medium"}
              description="Improving trend"
              icon={TrendingUp}
              trend="up"
              loading={loading}
            />
          </div>

          {/* Operator Heatmap */}
          <div className="grid grid-cols-1 gap-6">{loading ? <LoadingCard rows={8} /> : <OperatorHeatmap />}</div>

          {/* Operators Overview Table */}
          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              <LoadingTable rows={5} columns={7} />
            ) : (
              <Card className="bg-slate-900/90 border-slate-700/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-white">Operators Overview</CardTitle>
                    <p className="text-slate-400">Comprehensive operator information and relationship management</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-400">Country:</span>
                      <Select value={countryFilter} onValueChange={setCountryFilter}>
                        <SelectTrigger className="w-[120px] bg-slate-800 border-slate-700 text-white">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="Malta">Malta</SelectItem>
                          <SelectItem value="United Kingdom">UK</SelectItem>
                          <SelectItem value="Gibraltar">Gibraltar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-400">Language:</span>
                      <Select value={languageFilter} onValueChange={setLanguageFilter}>
                        <SelectTrigger className="w-[120px] bg-slate-800 border-slate-700 text-white">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-400">Engagement:</span>
                      <Select value={engagementFilter} onValueChange={setEngagementFilter}>
                        <SelectTrigger className="w-[120px] bg-slate-800 border-slate-700 text-white">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="Hot">Hot</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Cold">Cold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700">
                          <TableHead className="text-slate-300 w-[140px]">Operator</TableHead>
                          <TableHead className="text-slate-300 w-[100px]">Contact</TableHead>
                          <TableHead className="text-slate-300 w-[60px]">Country</TableHead>
                          <TableHead className="text-slate-300 w-[50px]">Lang</TableHead>
                          <TableHead className="text-slate-300 w-[160px]">Email</TableHead>
                          <TableHead className="text-slate-300 w-[100px]">Tags</TableHead>
                          <TableHead className="text-slate-300 w-[80px]">Status</TableHead>
                          <TableHead className="text-slate-300 w-[90px]">Contact Channel</TableHead>
                          <TableHead className="text-slate-300 w-[60px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRecords.length > 0 ? (
                          filteredRecords.map((record) => {
                            const operatorName = record.fields?.["Operator Name"] || "—"
                            const contactName = record.fields?.["Contact Name"] || "—"
                            const contactEmail = record.fields?.["Contact Email"] || "—"
                            const country = record.fields?.["Country"] || "—"
                            const language = record.fields?.["Preferred Language"] || "—"

                            return (
                              <TableRow key={record.id} className="border-slate-700 hover:bg-slate-800/50">
                                <TableCell className="text-white font-medium">
                                  {operatorName.length > 15 ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="cursor-help">{truncateText(operatorName, 15)}</span>
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
                                  {contactName.length > 12 ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="cursor-help">{truncateText(contactName, 12)}</span>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-slate-800 border-slate-700 text-white">
                                        <p>{contactName}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    contactName
                                  )}
                                </TableCell>
                                <TableCell className="text-slate-300">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="cursor-help">{abbreviateCountry(country)}</span>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-slate-800 border-slate-700 text-white">
                                      <p>{country}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TableCell>
                                <TableCell className="text-slate-300">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="cursor-help">{abbreviateLanguage(language)}</span>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-slate-800 border-slate-700 text-white">
                                      <p>{language}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TableCell>
                                <TableCell className="text-slate-300">
                                  {contactEmail.length > 20 ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="cursor-help">{truncateText(contactEmail, 20)}</span>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-slate-800 border-slate-700 text-white">
                                        <p>{contactEmail}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    contactEmail
                                  )}
                                </TableCell>
                                <TableCell className="text-slate-300">
                                  <div className="flex flex-wrap gap-1">
                                    {(() => {
                                      const tags = record.fields?.Tags
                                      if (Array.isArray(tags) && tags.length > 0) {
                                        return tags.slice(0, 2).map((tag: string, index: number) => (
                                          <Badge
                                            key={index}
                                            variant="outline"
                                            className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs"
                                          >
                                            {tag.length > 8 ? tag.substring(0, 8) + "..." : tag}
                                          </Badge>
                                        ))
                                      } else if (typeof tags === "string" && tags.length > 0) {
                                        return (
                                          <Badge
                                            variant="outline"
                                            className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs"
                                          >
                                            {tags.length > 8 ? tags.substring(0, 8) + "..." : tags}
                                          </Badge>
                                        )
                                      } else {
                                        return <span>—</span>
                                      }
                                    })()}
                                  </div>
                                </TableCell>
                                <TableCell className="text-slate-300">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      record.fields?.["Engagement Status"] === "Hot"
                                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                                        : record.fields?.["Engagement Status"] === "Medium"
                                          ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                          : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                    }`}
                                  >
                                    {record.fields?.["Engagement Status"] || "—"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-slate-300">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      record.fields?.["Communication Preference"] === "call"
                                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                                        : record.fields?.["Communication Preference"] === "message"
                                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                          : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                                    }`}
                                  >
                                    {record.fields?.["Communication Preference"] || "unknown"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEdit(record)}
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
                            <TableCell colSpan={9} className="text-center text-slate-400 py-8">
                              No operators found matching the selected filters
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
