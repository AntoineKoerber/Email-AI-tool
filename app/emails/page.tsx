"use client"

import { Button } from "@/components/ui/button"

import type React from "react"

import { useState, useEffect } from "react"
import { Mail, Send, Eye, MousePointerClick, Search, Edit } from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"
import DashboardLayout from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

// Add error boundary wrapper
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  try {
    return <>{children}</>
  } catch (error) {
    console.error("Error in emails page:", error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-slate-400">Please refresh the page to try again.</p>
        </div>
      </div>
    )
  }
}

// Move this function to the top, after imports
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

// Helper function to format date in DD/MM/YYYY format for Supabase ISO dates
function formatDate(dateString: string) {
  if (!dateString) return "—"
  try {
    // Supabase returns ISO date strings like "2024-01-15T10:30:00.000Z"
    const date = new Date(dateString)
    // Ensure we're working with a valid date
    if (isNaN(date.getTime())) return "—"

    // Format as DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  } catch (error) {
    console.error("Error formatting date:", error, "Input:", dateString)
    return "—"
  }
}

export default function Emails() {
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<any[]>([])
  const [emailStats, setEmailStats] = useState({
    activeCampaigns: 0,
    totalSent: 0,
    totalReplied: 0,
    totalClicked: 0,
    openRate: 0,
    clickRate: 0,
    pendingReview: 0,
  })
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [replyStatusFilter, setReplyStatusFilter] = useState<string>("all")
  const [filteredRecords, setFilteredRecords] = useState<any[]>([])
  const [pendingReviewRecords, setPendingReviewRecords] = useState<any[]>([])
  const [emailFields, setEmailFields] = useState<string[]>([])

  const [showGenerateForm, setShowGenerateForm] = useState(false)
  const [generateFormData, setGenerateFormData] = useState({
    selectedOperators: [] as string[],
    selectedIncentive: "",
    countryFilter: "",
    engagementFilter: "",
    searchTerm: "",
  })
  const [operators, setOperators] = useState<any[]>([])
  const [incentives, setIncentives] = useState<any[]>([])
  const [generateFormError, setGenerateFormError] = useState<string | null>(null)
  const [filteredOperators, setFilteredOperators] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Add state for operator communication preferences
  const [operatorPreferences, setOperatorPreferences] = useState<Record<string, string>>({})

  // Email edit modal state (updated from review to edit)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingEmail, setEditingEmail] = useState<any>(null)
  const [editFormData, setEditFormData] = useState({
    status: "",
    replyStatus: "",
    operator: "",
    incentive: "",
    followUp1: false,
    followUp2: false,
    prefComm: "",
  })
  const [isEditing, setIsEditing] = useState(false)

  // Add after the existing edit modal state
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewingEmail, setReviewingEmail] = useState<any>(null)
  const [reviewFormData, setReviewFormData] = useState({
    finalSubject: "",
    finalBody: "",
  })
  const [isReviewing, setIsReviewing] = useState(false)

  const [showAllRecords, setShowAllRecords] = useState(false)
  const RECORDS_PER_PAGE = 12

  // Add safety check for incentives data
  const safeIncentives = Array.isArray(incentives) ? incentives : []

  // Function to sort records chronologically (newest first) - FIXED for Supabase dates
  const sortRecordsChronologically = (recordsToSort: any[]) => {
    console.log("=== SORTING DEBUG ===")
    console.log("Input records count:", recordsToSort.length)

    // Log first 5 records before sorting
    console.log("BEFORE SORTING - First 5 records:")
    recordsToSort.slice(0, 5).forEach((r, index) => {
      // Supabase returns ISO date strings, so we need to handle them properly
      const dateTime = r.createdTime || r.fields?.["Created Time"] || r.fields?.created_time
      const parsedDate = dateTime ? new Date(dateTime) : new Date(0)
      console.log(
        `${index + 1}. ID: ${r.id}, DateTime: ${dateTime}, Parsed: ${parsedDate.toISOString()}, Timestamp: ${parsedDate.getTime()}`,
      )
    })

    const sortedRecords = [...recordsToSort].sort((a, b) => {
      // Get created time - prioritize the direct createdTime field from Supabase
      const dateTimeA = a.createdTime || a.fields?.["Created Time"] || a.fields?.created_time
      const dateTimeB = b.createdTime || b.fields?.["Created Time"] || b.fields?.created_time

      // Convert to timestamps for comparison (Supabase uses ISO strings)
      const timestampA = dateTimeA ? new Date(dateTimeA).getTime() : 0
      const timestampB = dateTimeB ? new Date(dateTimeB).getTime() : 0

      // Sort by timestamp (newest first = higher timestamp first)
      if (timestampB !== timestampA) {
        return timestampB - timestampA // Newer dates/times first
      }

      // If timestamps are identical, use ID as fallback (higher ID = newer)
      const idA = Number.parseInt(String(a.id || 0))
      const idB = Number.parseInt(String(b.id || 0))
      return idB - idA
    })

    // Log first 5 records after sorting
    console.log("AFTER SORTING - First 5 records:")
    sortedRecords.slice(0, 5).forEach((r, index) => {
      const dateTime = r.createdTime || r.fields?.["Created Time"] || r.fields?.created_time
      const parsedDate = dateTime ? new Date(dateTime) : new Date(0)
      console.log(
        `${index + 1}. ID: ${r.id}, DateTime: ${dateTime}, Parsed: ${parsedDate.toISOString()}, Timestamp: ${parsedDate.getTime()}`,
      )
    })

    console.log("=== END SORTING DEBUG ===")
    return sortedRecords
  }

  // Function to update records and maintain chronological order
  const updateRecords = (newRecords: any[]) => {
    try {
      console.log("updateRecords called with", newRecords.length, "records")

      // FORCE sorting regardless of input order
      const sortedRecords = sortRecordsChronologically(newRecords)

      console.log("Setting records state with", sortedRecords.length, "sorted records")
      setRecords(sortedRecords)

      // Filter pending review records (maintain sort order)
      const pendingRecords = sortedRecords.filter((record) => record.fields?.Status === "pending_review")
      // Also sort pending review records chronologically
      const sortedPendingRecords = sortRecordsChronologically(pendingRecords)
      setPendingReviewRecords(sortedPendingRecords)

      // Apply filters and maintain chronological order
      let filtered = sortedRecords
      if (statusFilter !== "all") {
        filtered = filtered.filter((record) => record.fields?.Status === statusFilter)
      }
      if (replyStatusFilter !== "all") {
        filtered = filtered.filter((record) => record.fields?.["Reply Status"] === replyStatusFilter)
      }

      // Ensure filtered results are also chronologically sorted
      const sortedFiltered = sortRecordsChronologically(filtered)
      console.log("Setting filtered records with", sortedFiltered.length, "records")
      setFilteredRecords(sortedFiltered)
    } catch (error) {
      console.error("Error updating records:", error)
      // Set default values on error
      setRecords([])
      setFilteredRecords([])
      setPendingReviewRecords([])
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        // Add a small delay to ensure proper loading
        await new Promise((resolve) => setTimeout(resolve, 100))

        const res = await fetch("/api/emails", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data = await res.json()
        updateRecords(data.records || [])

        // Extract field names from the first record if available
        if (data.records && data.records.length > 0) {
          const fieldNames = Object.keys(data.records[0].fields || {})
          setEmailFields(fieldNames)
          console.log("Available email fields:", fieldNames)
        }

        // Stats
        const totalSent = (data.records || []).filter((r) =>
          ["sent", "pending_review", "approved"].includes(r.fields?.Status),
        ).length
        const totalReplied = (data.records || []).filter((r) => r.fields?.["Reply Status"] === "Replied").length
        const totalClicked = 0 // Not tracked, so set to 0 or replace with another field if added later
        const openRate = totalSent ? Math.round((totalReplied / totalSent) * 100) : 0
        const clickRate = 0 // Set to 0 or ignore completely if irrelevant
        const activeCampaigns = new Set((data.records || []).map((r) => r.fields?.["Incentive (Lookup)"])).size
        const pendingReview = (data.records || []).filter((r) => r.fields?.Status === "pending_review").length

        setEmailStats({
          activeCampaigns,
          totalSent,
          totalReplied,
          totalClicked,
          openRate,
          clickRate,
          pendingReview,
        })
      } catch (error) {
        console.error("Failed to fetch emails:", error)
        // Set default values on error
        setRecords([])
        setFilteredRecords([])
        setPendingReviewRecords([])
        setEmailFields([])
        setEmailStats({
          activeCampaigns: 0,
          totalSent: 0,
          totalReplied: 0,
          totalClicked: 0,
          openRate: 0,
          clickRate: 0,
          pendingReview: 0,
        })
      }

      try {
        const [operatorsRes, incentivesRes] = await Promise.all([fetch("/api/operators"), fetch("/api/promotions")])

        const [operatorsData, incentivesData] = await Promise.all([
          operatorsRes.ok ? operatorsRes.json() : { records: [] },
          incentivesRes.ok ? incentivesRes.json() : { records: [] },
        ])

        // Add logging to see what fields are available in incentives
        console.log("Incentives data:", incentivesData.records?.[0]?.fields)
        if (incentivesData.records && incentivesData.records.length > 0) {
          console.log("Available incentive fields:", Object.keys(incentivesData.records[0].fields || {}))
        }

        // Log operators data to understand structure
        console.log("Operators data:", operatorsData.records?.[0])
        if (operatorsData.records && operatorsData.records.length > 0) {
          console.log("Available operator fields:", Object.keys(operatorsData.records[0].fields || {}))
        }

        setOperators(operatorsData.records || [])
        setIncentives(incentivesData.records || [])
        setFilteredOperators(operatorsData.records || [])
      } catch (error) {
        console.error("Failed to fetch operators/incentives:", error)
        setOperators([])
        setIncentives([])
        setFilteredOperators([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Fetch operator preferences when selected operators change
  useEffect(() => {
    const fetchOperatorPreferences = () => {
      const preferences: Record<string, string> = {}

      generateFormData.selectedOperators.forEach((operatorId) => {
        const operator = operators.find((op) => getOperatorId(op) === operatorId)
        if (operator) {
          // Get pref_comm from operator, default to "unknown" if not set
          preferences[operatorId] = operator.fields?.["Communication Preference"] || operator.pref_comm || "unknown"
        }
      })

      setOperatorPreferences(preferences)
    }

    if (generateFormData.selectedOperators.length > 0) {
      fetchOperatorPreferences()
    } else {
      setOperatorPreferences({})
    }
  }, [generateFormData.selectedOperators, operators])

  useEffect(() => {
    // Apply filters while maintaining chronological order
    try {
      let filtered = records

      if (statusFilter !== "all") {
        filtered = filtered.filter((record) => record.fields?.Status === statusFilter)
      }

      if (replyStatusFilter !== "all") {
        filtered = filtered.filter((record) => record.fields?.["Reply Status"] === replyStatusFilter)
      }

      // ALWAYS ensure chronological order is maintained after filtering
      const sortedFiltered = sortRecordsChronologically(filtered)
      console.log("Filtered and sorted records for display:", sortedFiltered.length)
      setFilteredRecords(sortedFiltered)
    } catch (error) {
      console.error("Error applying filters:", error)
      setFilteredRecords(records)
    }
  }, [statusFilter, replyStatusFilter, records])

  // Filter operators based on country, engagement, and search term
  useEffect(() => {
    try {
      let filtered = operators

      // Filter by country
      if (generateFormData.countryFilter && generateFormData.countryFilter !== "all_countries") {
        filtered = filtered.filter((op) => op.fields?.Country === generateFormData.countryFilter)
      }

      // Filter by engagement level
      if (generateFormData.engagementFilter && generateFormData.engagementFilter !== "all_levels") {
        filtered = filtered.filter((op) => op.fields?.["Engagement Level"] === generateFormData.engagementFilter)
      }

      // Filter by search term
      if (generateFormData.searchTerm) {
        const searchLower = generateFormData.searchTerm.toLowerCase()
        filtered = filtered.filter((op) => (op.fields?.["Operator Name"] || "").toLowerCase().includes(searchLower))
      }

      setFilteredOperators(filtered)
    } catch (error) {
      console.error("Error filtering operators:", error)
      setFilteredOperators(operators)
    }
  }, [operators, generateFormData.countryFilter, generateFormData.engagementFilter, generateFormData.searchTerm])

  const handleGenerateEmails = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerateFormError(null)
    setIsSubmitting(true)

    console.log("Form data on submit:", generateFormData)
    console.log("Selected operators:", generateFormData.selectedOperators)
    console.log("Selected incentive:", generateFormData.selectedIncentive)

    if (generateFormData.selectedOperators.length === 0) {
      setGenerateFormError("Please select at least one operator.")
      setIsSubmitting(false)
      return
    }

    if (!generateFormData.selectedIncentive) {
      setGenerateFormError("Please select an incentive.")
      setIsSubmitting(false)
      return
    }

    try {
      console.log("Available email fields:", emailFields)
      console.log("Selected operators:", generateFormData.selectedOperators)
      console.log("Selected incentive:", generateFormData.selectedIncentive)

      // Create email records for each selected operator
      const records = generateFormData.selectedOperators.map((operatorId) => {
        const record = {
          fields: {
            Status: "pending_review", // Changed to pending_review by default
            "Reply Status": "No Reply",
            // Use the exact field name "Casino Operator" for the operator
            "Casino Operator": [operatorId],
            // Use the exact field name for the incentive
            Incentive: [generateFormData.selectedIncentive],
            // Add generated email content (placeholder for now)
            generated_email_subject: "",
            generated_email_body: "",
            // Add communication preference
            pref_comm: operatorPreferences[operatorId] || "unknown",
          },
        }

        return record
      })

      const payload = { records }

      console.log("Final payload being sent:", JSON.stringify(payload, null, 2))

      const res = await fetch("/api/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error("Error response:", errorData)
        setGenerateFormError(`Failed to generate emails: ${errorData.error || res.statusText}`)
        setIsSubmitting(false)
        return
      }

      const data = await res.json()
      console.log("Success response:", data)

      setShowGenerateForm(false)
      setGenerateFormData({
        selectedOperators: [],
        selectedIncentive: "",
        countryFilter: "",
        engagementFilter: "",
        searchTerm: "",
      })

      // Refresh the data and maintain chronological order
      const refreshRes = await fetch("/api/emails")
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json()
        updateRecords(refreshData.records || [])

        // Update stats with new data
        const totalSent = (refreshData.records || []).filter((r) =>
          ["sent", "pending_review", "approved"].includes(r.fields?.Status),
        ).length
        const totalReplied = (refreshData.records || []).filter((r) => r.fields?.["Reply Status"] === "Replied").length
        const openRate = totalSent ? Math.round((totalReplied / totalSent) * 100) : 0
        const pendingReview = (refreshData.records || []).filter((r) => r.fields?.Status === "pending_review").length

        setEmailStats((prev) => ({
          ...prev,
          totalSent,
          totalReplied,
          openRate,
          pendingReview,
        }))
      }
    } catch (error) {
      console.error("Failed to generate emails:", error)
      setGenerateFormError(`Failed to generate emails: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to open edit modal
  const openEditModal = (email: any) => {
    console.log("=== OPENING EDIT MODAL ===")
    console.log("Email being edited:", email)
    console.log("Email ID:", email.id)
    console.log("Email fields:", email.fields)

    setEditingEmail(email)
    setEditFormData({
      status: email.fields?.Status || "",
      replyStatus: email.fields?.["Reply Status"] || "",
      operator: email.fields?.["Operator (Lookup)"] || "",
      incentive: email.fields?.["Incentive (Lookup)"] || "",
      followUp1: email.fields?.follow_up_1 || false,
      followUp2: email.fields?.follow_up_2 || false,
      prefComm: email.fields?.pref_comm || "",
    })
    setShowEditModal(true)
  }

  // Function to handle email edit confirmation
  const handleEditConfirm = async () => {
    if (!editingEmail) return

    console.log("=== EDIT CONFIRM DEBUG ===")
    console.log("Editing email ID:", editingEmail.id)
    console.log("Current form data:", editFormData)

    setIsEditing(true)
    try {
      // Send the correct structure that matches what the backend expects
      const payload = {
        records: [
          {
            email_id: editingEmail.id,
            status: editFormData.status,
            reply_status: editFormData.replyStatus,
            operator: editFormData.operator,
            incentive: editFormData.incentive,
            follow_up_1: editFormData.followUp1,
            follow_up_2: editFormData.followUp2,
            pref_comm: editFormData.prefComm,
          },
        ],
      }

      console.log("PATCH payload being sent:", payload)

      const res = await fetch("/api/emails", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      console.log("PATCH response status:", res.status)

      if (!res.ok) {
        const errorData = await res.json()
        console.error("Error updating email:", errorData)
        alert(`Failed to update email: ${errorData.error || "Unknown error"}`)
        return
      }

      const responseData = await res.json()
      console.log("PATCH response data:", responseData)

      // Close modal and refresh data
      setShowEditModal(false)
      setEditingEmail(null)
      setEditFormData({
        status: "",
        replyStatus: "",
        operator: "",
        incentive: "",
        followUp1: false,
        followUp2: false,
        prefComm: "",
      })

      // Refresh the data
      console.log("Refreshing email data...")
      const refreshRes = await fetch("/api/emails", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json()
        console.log("Refreshed data - first record:", refreshData.records?.[0])
        updateRecords(refreshData.records || [])

        // Update stats
        const pendingReview = (refreshData.records || []).filter((r) => r.fields?.Status === "pending_review").length
        console.log("New pending review count:", pendingReview)
        setEmailStats((prev) => ({
          ...prev,
          pendingReview,
        }))
      }

      console.log("=== END EDIT CONFIRM DEBUG ===")
    } catch (error) {
      console.error("Failed to update email:", error)
      alert(`Failed to update email: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsEditing(false)
    }
  }

  // Function to open review modal
  const openReviewModal = (email: any) => {
    console.log("=== OPENING REVIEW MODAL ===")
    console.log("Email being reviewed:", email)

    setReviewingEmail(email)
    setReviewFormData({
      finalSubject: email.fields?.final_email_subject || email.fields?.generated_email_subject || "",
      finalBody: email.fields?.final_email_body || email.fields?.generated_email_body || "",
    })
    setShowReviewModal(true)
  }

  // Function to handle email review confirmation
  const handleReviewConfirm = async () => {
    if (!reviewingEmail) return

    console.log("=== REVIEW CONFIRM DEBUG ===")
    console.log("Reviewing email ID:", reviewingEmail.id)
    console.log("Review form data:", reviewFormData)

    setIsReviewing(true)
    try {
      const payload = {
        records: [
          {
            email_id: reviewingEmail.id,
            final_email_subject: reviewFormData.finalSubject,
            final_email_body: reviewFormData.finalBody,
            status: "approved", // Automatically approve after review
          },
        ],
      }

      console.log("REVIEW PATCH payload:", payload)

      const res = await fetch("/api/emails", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error("Error reviewing email:", errorData)
        alert(`Failed to review email: ${errorData.error || "Unknown error"}`)
        return
      }

      // Close modal and refresh data
      setShowReviewModal(false)
      setReviewingEmail(null)
      setReviewFormData({
        finalSubject: "",
        finalBody: "",
      })

      // Refresh the data
      const refreshRes = await fetch("/api/emails", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json()
        updateRecords(refreshData.records || [])

        // Update stats
        const pendingReview = (refreshData.records || []).filter((r) => r.fields?.Status === "pending_review").length
        setEmailStats((prev) => ({
          ...prev,
          pendingReview,
        }))
      }
    } catch (error) {
      console.error("Failed to review email:", error)
      alert(`Failed to review email: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsReviewing(false)
    }
  }

  // Helper function to get operator ID consistently
  const getOperatorId = (operator: any) => {
    return operator.id || `op-${operator.fields?.["Operator Name"] || operator.operator || "unknown"}`
  }

  // Function to handle communication preference changes
  const handlePreferenceChange = (operatorId: string, newPreference: string) => {
    setOperatorPreferences((prev) => ({
      ...prev,
      [operatorId]: newPreference,
    }))
  }

  // Get unique countries and engagement levels for filter options
  const uniqueCountries = [...new Set(operators.map((op) => op.fields?.Country).filter(Boolean))].sort()
  const uniqueEngagementLevels = [
    ...new Set(operators.map((op) => op.fields?.["Engagement Level"]).filter(Boolean)),
  ].sort()

  const handleSelectAll = () => {
    setGenerateFormData({
      ...generateFormData,
      selectedOperators: filteredOperators.map((op) => getOperatorId(op)),
    })
  }

  const handleDeselectAll = () => {
    setGenerateFormData({
      ...generateFormData,
      selectedOperators: [],
    })
  }

  // Get records to display (limited or all)
  const recordsToDisplay = showAllRecords ? filteredRecords : filteredRecords.slice(0, RECORDS_PER_PAGE)
  const hasMoreRecords = filteredRecords.length > RECORDS_PER_PAGE

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <DashboardLayout>
          <div className="space-y-6">
            {/* Header + Stats */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">Email Campaigns</h1>
                <p className="text-slate-400">Manage and track email performance</p>
              </div>
            </div>

            {/* Generate Emails Section */}
            <div className="flex justify-center">
              <Dialog open={showGenerateForm} onOpenChange={setShowGenerateForm}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Mail className="h-5 w-5 mr-2" />
                    Generate Emails
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Generate Email Campaign</DialogTitle>
                    <p className="text-slate-400">Send promotional emails to selected operators</p>
                  </DialogHeader>
                  <form onSubmit={handleGenerateEmails} className="space-y-4">
                    {generateFormError && (
                      <div className="bg-red-500/20 text-red-400 p-3 rounded-md text-sm">{generateFormError}</div>
                    )}
                    {/* Filters Section */}
                    <div className="border border-slate-700 rounded-lg p-4 space-y-4">
                      <h3 className="text-lg font-medium text-white">Filter Operators</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="country">Market</Label>
                          <Select
                            value={generateFormData.countryFilter}
                            onValueChange={(value) =>
                              setGenerateFormData({ ...generateFormData, countryFilter: value })
                            }
                          >
                            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                              <SelectValue placeholder="All markets" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white">
                              <SelectItem value="all_countries">All markets</SelectItem>
                              {uniqueCountries.map((country) => (
                                <SelectItem key={country} value={country}>
                                  {country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="engagement">Engagement Level</Label>
                          <Select
                            value={generateFormData.engagementFilter}
                            onValueChange={(value) =>
                              setGenerateFormData({ ...generateFormData, engagementFilter: value })
                            }
                          >
                            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                              <SelectValue placeholder="All levels" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white">
                              <SelectItem value="all_levels">All levels</SelectItem>
                              {uniqueEngagementLevels.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="search">Search Operators</Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                              id="search"
                              placeholder="Search by name..."
                              value={generateFormData.searchTerm}
                              onChange={(e) => setGenerateFormData({ ...generateFormData, searchTerm: e.target.value })}
                              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Operators Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="operators">
                          Select Operators * ({generateFormData.selectedOperators.length} selected)
                        </Label>
                        <div className="space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleSelectAll}
                            className="border-slate-600 text-slate-300 hover:bg-slate-800"
                          >
                            Select All ({filteredOperators.length})
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleDeselectAll}
                            className="border-slate-600 text-slate-300 hover:bg-slate-800"
                          >
                            Deselect All
                          </Button>
                        </div>
                      </div>
                      <div className="border border-slate-700 rounded-md bg-slate-800 p-3 max-h-60 overflow-y-auto">
                        {filteredOperators.length > 0 ? (
                          filteredOperators.map((op, index) => {
                            const operatorId = getOperatorId(op)
                            const isChecked = generateFormData.selectedOperators.includes(operatorId)
                            return (
                              <div
                                key={operatorId}
                                className="flex items-center space-x-2 py-2 border-b border-slate-700 last:border-b-0"
                              >
                                <input
                                  type="checkbox"
                                  id={`operator-${index}`}
                                  checked={isChecked}
                                  onChange={(e) => {
                                    e.stopPropagation()
                                    const isCurrentlyChecked = generateFormData.selectedOperators.includes(operatorId)

                                    let updatedOperators
                                    if (isCurrentlyChecked) {
                                      // Remove from selection
                                      updatedOperators = generateFormData.selectedOperators.filter(
                                        (id) => id !== operatorId,
                                      )
                                    } else {
                                      // Add to selection
                                      updatedOperators = [...generateFormData.selectedOperators, operatorId]
                                    }

                                    console.log(
                                      "Operator clicked:",
                                      operatorId,
                                      "Operator data:",
                                      op,
                                      "Currently checked:",
                                      isCurrentlyChecked,
                                      "New selection:",
                                      updatedOperators,
                                    )

                                    setGenerateFormData({
                                      ...generateFormData,
                                      selectedOperators: updatedOperators,
                                    })
                                  }}
                                  className="rounded border-slate-600 bg-slate-700 text-emerald-600 focus:ring-emerald-500"
                                />
                                <label
                                  htmlFor={`operator-${index}`}
                                  className="text-sm text-white cursor-pointer flex-1"
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium">
                                      {op.fields?.["Operator Name"] || "Unnamed Operator"}
                                    </span>
                                    <div className="flex space-x-2 text-xs text-slate-400">
                                      {op.fields?.Country && (
                                        <span className="bg-slate-700 px-2 py-1 rounded">{op.fields.Country}</span>
                                      )}
                                      {op.fields?.["Engagement Level"] && (
                                        <span className="bg-slate-700 px-2 py-1 rounded">
                                          {op.fields["Engagement Level"]}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </label>
                              </div>
                            )
                          })
                        ) : (
                          <p className="text-slate-400 text-sm text-center py-4">
                            No operators found matching the current filters
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Incentive Selection */}
                    <div>
                      <Label htmlFor="incentive">Select Incentive *</Label>
                      <Select
                        value={generateFormData.selectedIncentive || ""}
                        onValueChange={(value) => {
                          if (value && value !== "no-incentives") {
                            setGenerateFormData((prev) => ({
                              ...prev,
                              selectedIncentive: value,
                            }))
                          }
                        }}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                          <SelectValue placeholder="Choose incentive" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          {safeIncentives.length > 0 ? (
                            safeIncentives.map((incentive, index) => {
                              // Use index as fallback if no ID exists
                              const incentiveId = incentive?.id ? String(incentive.id) : `incentive-${index}`

                              console.log("Rendering incentive:", incentive, "ID:", incentiveId)

                              return (
                                <SelectItem key={incentiveId} value={incentiveId}>
                                  {incentive?.fields?.["Incentive Name"] ||
                                    incentive?.fields?.["Name"] ||
                                    `Incentive ${index + 1}`}
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
                    {/* Communication Preferences Section */}
                    {generateFormData.selectedOperators.length > 0 && (
                      <div>
                        <Label>Communication Preferences</Label>
                        <p className="text-sm text-slate-400 mb-3">
                          Customize communication method for each selected operator
                        </p>
                        <div className="border border-slate-700 rounded-md bg-slate-800 p-3 max-h-48 overflow-y-auto space-y-3">
                          {generateFormData.selectedOperators.map((operatorId) => {
                            const operator = operators.find((op) => getOperatorId(op) === operatorId)
                            const operatorName = operator?.fields?.["Operator Name"] || "Unknown Operator"
                            const currentPreference = operatorPreferences[operatorId] || "unknown"

                            return (
                              <div
                                key={operatorId}
                                className="flex items-center justify-between py-2 border-b border-slate-700 last:border-b-0"
                              >
                                <div className="flex-1">
                                  <span className="text-white font-medium">{operatorName}</span>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-xs text-slate-400">Default:</span>
                                    <Badge
                                      variant="outline"
                                      className={
                                        operator?.fields?.["Communication Preference"] === "call" ||
                                        operator?.pref_comm === "call"
                                          ? "border-green-500 text-green-400"
                                          : operator?.fields?.["Communication Preference"] === "message" ||
                                              operator?.pref_comm === "message"
                                            ? "border-blue-500 text-blue-400"
                                            : "border-slate-500 text-slate-400"
                                      }
                                    >
                                      {operator?.fields?.["Communication Preference"] ||
                                        operator?.pref_comm ||
                                        "unknown"}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <Select
                                    value={currentPreference}
                                    onValueChange={(value) => handlePreferenceChange(operatorId, value)}
                                  >
                                    <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                      <SelectItem value="call">Call</SelectItem>
                                      <SelectItem value="message">Message</SelectItem>
                                      <SelectItem value="unknown">Unknown</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowGenerateForm(false)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-800"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span> Generating...
                          </>
                        ) : (
                          `Generate Emails (${generateFormData.selectedOperators.length})`
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Email Edit Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
              <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl">Edit Email Record</DialogTitle>
                  <p className="text-slate-400">Update email status, operator details, and follow-up information</p>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status" className="text-white">
                        Status
                      </Label>
                      <Select
                        value={editFormData.status}
                        onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                      >
                        <SelectTrigger className="mt-2 bg-slate-800 border-slate-700 text-white">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          <SelectItem value="pending_review">Pending Review</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="replyStatus" className="text-white">
                        Reply Status
                      </Label>
                      <Select
                        value={editFormData.replyStatus}
                        onValueChange={(value) => setEditFormData({ ...editFormData, replyStatus: value })}
                      >
                        <SelectTrigger className="mt-2 bg-slate-800 border-slate-700 text-white">
                          <SelectValue placeholder="Select reply status" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          <SelectItem value="No Reply">No Reply</SelectItem>
                          <SelectItem value="Replied">Replied</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="operator" className="text-white">
                        Operator
                      </Label>
                      <Select
                        value={editFormData.operator}
                        onValueChange={(value) => setEditFormData({ ...editFormData, operator: value })}
                      >
                        <SelectTrigger className="mt-2 bg-slate-800 border-slate-700 text-white">
                          <SelectValue placeholder="Select operator" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          {operators.map((op) => (
                            <SelectItem key={getOperatorId(op)} value={op.fields?.["Operator Name"] || "Unknown"}>
                              {op.fields?.["Operator Name"] || "Unknown Operator"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="incentive" className="text-white">
                        Incentive
                      </Label>
                      <Select
                        value={editFormData.incentive}
                        onValueChange={(value) => setEditFormData({ ...editFormData, incentive: value })}
                      >
                        <SelectTrigger className="mt-2 bg-slate-800 border-slate-700 text-white">
                          <SelectValue placeholder="Select incentive" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          {safeIncentives.map((incentive, index) => {
                            const incentiveName =
                              incentive?.fields?.["Incentive Name"] ||
                              incentive?.fields?.["Name"] ||
                              `Incentive ${index + 1}`
                            return (
                              <SelectItem key={index} value={incentiveName}>
                                {incentiveName}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="prefComm" className="text-white">
                      Communication Preference
                    </Label>
                    <Select
                      value={editFormData.prefComm}
                      onValueChange={(value) => setEditFormData({ ...editFormData, prefComm: value })}
                    >
                      <SelectTrigger className="mt-2 bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="message">Message</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-white">Follow-up Status</Label>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="followUp1"
                          checked={editFormData.followUp1}
                          onCheckedChange={(checked) =>
                            setEditFormData({ ...editFormData, followUp1: checked as boolean })
                          }
                          className="border-slate-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                        <Label htmlFor="followUp1" className="text-white">
                          Follow Up 1 Completed
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="followUp2"
                          checked={editFormData.followUp2}
                          onCheckedChange={(checked) =>
                            setEditFormData({ ...editFormData, followUp2: checked as boolean })
                          }
                          className="border-slate-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                        <Label htmlFor="followUp2" className="text-white">
                          Follow Up 2 Completed
                        </Label>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowEditModal(false)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-800"
                      disabled={isEditing}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleEditConfirm}
                      className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
                      disabled={isEditing}
                    >
                      {isEditing ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span> Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Email Review Modal */}
            <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
              <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl">Review AI-Generated Email</DialogTitle>
                  <p className="text-slate-400">Review and edit the AI-generated email content before approval</p>
                </DialogHeader>
                <div className="space-y-6">
                  {reviewingEmail && (
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-white mb-2">Email Details</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Operator:</span>
                          <span className="text-white ml-2">{reviewingEmail.fields?.["Operator (Lookup)"] || "—"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Incentive:</span>
                          <span className="text-white ml-2">
                            {reviewingEmail.fields?.["Incentive (Lookup)"] || "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="finalSubject" className="text-white">
                        Email Subject
                      </Label>
                      <Input
                        id="finalSubject"
                        value={reviewFormData.finalSubject}
                        onChange={(e) => setReviewFormData({ ...reviewFormData, finalSubject: e.target.value })}
                        className="mt-2 bg-slate-800 border-slate-700 text-white"
                        placeholder="Enter email subject..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="finalBody" className="text-white">
                        Email Body
                      </Label>
                      <textarea
                        id="finalBody"
                        value={reviewFormData.finalBody}
                        onChange={(e) => setReviewFormData({ ...reviewFormData, finalBody: e.target.value })}
                        className="mt-2 w-full h-64 p-3 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-400 resize-none"
                        placeholder="Enter email body content..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowReviewModal(false)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-800"
                      disabled={isReviewing}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleReviewConfirm}
                      className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
                      disabled={isReviewing}
                    >
                      {isReviewing ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span> Approving...
                        </>
                      ) : (
                        "Approve & Save"
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Active Campaigns"
                value={loading ? "" : emailStats.activeCampaigns.toString()}
                description="+1 from last week"
                icon={Mail}
                trend="up"
                loading={loading}
              />
              <StatCard
                title="Total Sent"
                value={loading ? "" : emailStats.totalSent.toString()}
                description="+324 this month"
                icon={Send}
                trend="up"
                loading={loading}
              />
              <StatCard
                title="Total Replied"
                value={loading ? "" : emailStats.totalReplied.toString()}
                description={`${emailStats.openRate}% open rate`}
                icon={Eye}
                trend="up"
                loading={loading}
              />
              <StatCard
                title="Pending Review"
                value={loading ? "" : emailStats.pendingReview.toString()}
                description="Awaiting approval"
                icon={MousePointerClick}
                trend="neutral"
                loading={loading}
              />
            </div>

            {/* Pending Review Table */}
            <div className="grid grid-cols-1 gap-6">
              {loading ? (
                <LoadingTable rows={3} columns={4} />
              ) : (
                <Card className="bg-slate-900/90 border-slate-700/50">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-white">Pending Review</CardTitle>
                      <p className="text-slate-400">Emails awaiting approval before sending</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-slate-700">
                            <TableHead className="text-slate-300 min-w-[150px]">Operator</TableHead>
                            <TableHead className="text-slate-300 min-w-[200px]">Incentive</TableHead>
                            <TableHead className="text-slate-300 min-w-[120px]">Created</TableHead>
                            <TableHead className="text-slate-300 min-w-[120px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingReviewRecords.length > 0 ? (
                            pendingReviewRecords.map((r) => {
                              const operatorName = r.fields?.["Operator (Lookup)"] || "—"
                              const promotionName = r.fields?.["Incentive (Lookup)"] || "—"

                              return (
                                <TableRow key={r.id} className="border-slate-700 hover:bg-slate-800/50">
                                  <TableCell className="text-white">
                                    {operatorName.length > 20 ? (
                                      <UITooltip>
                                        <TooltipTrigger asChild>
                                          <span className="cursor-help">{truncateText(operatorName, 20)}</span>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-slate-800 border-slate-700 text-white">
                                          <p>{operatorName}</p>
                                        </TooltipContent>
                                      </UITooltip>
                                    ) : (
                                      operatorName
                                    )}
                                  </TableCell>
                                  <TableCell className="text-slate-300">
                                    {promotionName.length > 25 ? (
                                      <UITooltip>
                                        <TooltipTrigger asChild>
                                          <span className="cursor-help">{truncateText(promotionName, 25)}</span>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-slate-800 border-slate-700 text-white">
                                          <p>{promotionName}</p>
                                        </TooltipContent>
                                      </UITooltip>
                                    ) : (
                                      promotionName
                                    )}
                                  </TableCell>
                                  <TableCell className="text-slate-300">
                                    {formatDate(r.createdTime || r.fields?.created_time)}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-emerald-600 text-emerald-500 hover:bg-emerald-900/20 hover:text-emerald-400 mr-2"
                                      onClick={() => openReviewModal(r)}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      Review
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )
                            })
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-slate-400 py-8">
                                No emails pending review
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

            {/* Table */}
            <div className="grid grid-cols-1 gap-6">
              {loading ? (
                <LoadingTable rows={5} columns={7} />
              ) : (
                <Card className="bg-slate-900/90 border-slate-700/50">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-white">Email Overview</CardTitle>
                      <p className="text-slate-400">Detailed email interactions and engagement data (newest first)</p>
                    </div>
                    <div className="flex space-x-2">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700 text-white">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending_review">Pending Review</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={replyStatusFilter} onValueChange={setReplyStatusFilter}>
                        <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700 text-white">
                          <SelectValue placeholder="Reply Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          <SelectItem value="all">All Replies</SelectItem>
                          <SelectItem value="Replied">Replied</SelectItem>
                          <SelectItem value="No Reply">No Reply</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-slate-700">
                            <TableHead className="text-slate-300 min-w-[120px]">Status</TableHead>
                            <TableHead className="text-slate-300 min-w-[120px]">Reply Status</TableHead>
                            <TableHead className="text-slate-300 min-w-[150px]">Operator</TableHead>
                            <TableHead className="text-slate-300 min-w-[200px]">Incentive</TableHead>
                            <TableHead className="text-slate-300 min-w-[120px]">Created</TableHead>
                            <TableHead className="text-slate-300 min-w-[100px]">Follow Up 1</TableHead>
                            <TableHead className="text-slate-300 min-w-[100px]">Follow Up 2</TableHead>
                            <TableHead className="text-slate-300 min-w-[120px]">Communication</TableHead>
                            <TableHead className="text-slate-300 min-w-[120px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recordsToDisplay.length > 0 ? (
                            recordsToDisplay.map((r) => {
                              const operatorName = r.fields?.["Operator (Lookup)"] || "—"
                              const promotionName = r.fields?.["Incentive (Lookup)"] || "—"

                              return (
                                <TableRow key={r.id} className="border-slate-700 hover:bg-slate-800/50">
                                  <TableCell>
                                    <Badge
                                      variant={
                                        r.fields?.Status === "sent"
                                          ? "default"
                                          : r.fields?.Status === "approved"
                                            ? "secondary"
                                            : "outline"
                                      }
                                      className={
                                        r.fields?.Status === "sent"
                                          ? "bg-green-600 text-white"
                                          : r.fields?.Status === "approved"
                                            ? "bg-blue-600 text-white"
                                            : "bg-yellow-600 text-white"
                                      }
                                    >
                                      {r.fields?.Status || "Unknown"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={r.fields?.["Reply Status"] === "Replied" ? "default" : "outline"}
                                      className={
                                        r.fields?.["Reply Status"] === "Replied"
                                          ? "bg-emerald-600 text-white"
                                          : "bg-slate-600 text-slate-300"
                                      }
                                    >
                                      {r.fields?.["Reply Status"] || "No Reply"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-white">
                                    {operatorName.length > 20 ? (
                                      <UITooltip>
                                        <TooltipTrigger asChild>
                                          <span className="cursor-help">{truncateText(operatorName, 20)}</span>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-slate-800 border-slate-700 text-white">
                                          <p>{operatorName}</p>
                                        </TooltipContent>
                                      </UITooltip>
                                    ) : (
                                      operatorName
                                    )}
                                  </TableCell>
                                  <TableCell className="text-slate-300">
                                    {promotionName.length > 25 ? (
                                      <UITooltip>
                                        <TooltipTrigger asChild>
                                          <span className="cursor-help">{truncateText(promotionName, 25)}</span>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-slate-800 border-slate-700 text-white">
                                          <p>{promotionName}</p>
                                        </TooltipContent>
                                      </UITooltip>
                                    ) : (
                                      promotionName
                                    )}
                                  </TableCell>
                                  <TableCell className="text-slate-300">
                                    {formatDate(r.createdTime || r.fields?.created_time)}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <div className="flex justify-center">
                                      {r.fields?.follow_up_1 ? (
                                        <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                              fillRule="evenodd"
                                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        </div>
                                      ) : (
                                        <div className="w-5 h-5 bg-slate-600 rounded-full border border-slate-500"></div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <div className="flex justify-center">
                                      {r.fields?.follow_up_2 ? (
                                        <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                              fillRule="evenodd"
                                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        </div>
                                      ) : (
                                        <div className="w-5 h-5 bg-slate-600 rounded-full border border-slate-500"></div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge
                                      variant="outline"
                                      className={
                                        r.fields?.pref_comm === "call"
                                          ? "border-green-500 text-green-400"
                                          : r.fields?.pref_comm === "message"
                                            ? "border-blue-500 text-blue-400"
                                            : "border-slate-500 text-slate-400"
                                      }
                                    >
                                      {r.fields?.pref_comm || "unknown"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-blue-600 text-blue-500 hover:bg-blue-900/20 hover:text-blue-400"
                                        onClick={() => openEditModal(r)}
                                      >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            })
                          ) : (
                            <TableRow>
                              <TableCell colSpan={9} className="text-center text-slate-400 py-8">
                                No emails found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    {hasMoreRecords && (
                      <div className="flex justify-center mt-4">
                        <Button
                          variant="outline"
                          onClick={() => setShowAllRecords(!showAllRecords)}
                          className="border-slate-600 text-slate-300 hover:bg-slate-800"
                        >
                          {showAllRecords ? "Show Less" : `Show All (${filteredRecords.length} total)`}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </DashboardLayout>
      </TooltipProvider>
    </ErrorBoundary>
  )
}
