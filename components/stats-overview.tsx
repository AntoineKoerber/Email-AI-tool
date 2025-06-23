"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Target, Mail, Users, Activity, Zap, Filter, AlertCircle } from "lucide-react"
import { format, subDays, startOfDay, endOfDay } from "date-fns"
import { cn } from "@/lib/utils"

interface StatsData {
  liveCampaigns: number
  emailsSent: number
  emailsReplied: number
  activeOperators: number
  replyRate: number
  avgResponseTime: string
  totalConversions: number
  engagementScore: number
}

export function StatsOverview() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<StatsData>({
    liveCampaigns: 0,
    emailsSent: 0,
    emailsReplied: 0,
    activeOperators: 0,
    replyRate: 0,
    avgResponseTime: "0h",
    totalConversions: 0,
    engagementScore: 0,
  })

  // Filter states
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all-campaigns")
  const [selectedOperator, setSelectedOperator] = useState<string>("all-operators")
  const [selectedPromotion, setSelectedPromotion] = useState<string>("all-promotions")

  // Data for dropdowns
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [operators, setOperators] = useState<any[]>([])
  const [promotions, setPromotions] = useState<any[]>([])

  // Helper function to validate and filter data for Select components
  const getValidSelectData = (data: any[], labelField: string, fallbackLabel = "Unknown") => {
    return data
      .filter((item) => item && item.id) // Must have valid item and id
      .map((item) => ({
        id: item.id,
        label: item.fields?.[labelField] || item[labelField] || fallbackLabel,
      }))
      .filter((item) => item.label && item.label.trim() !== "" && item.label !== "Unknown") // Filter out empty or unknown labels
  }

  useEffect(() => {
    async function fetchDropdownData() {
      try {
        setError(null)
        console.log("Fetching dropdown data...")

        const [campaignsRes, operatorsRes, promotionsRes] = await Promise.allSettled([
          fetch("/api/campaigns"),
          fetch("/api/operators"),
          fetch("/api/promotions"),
        ])

        // Handle campaigns
        if (campaignsRes.status === "fulfilled" && campaignsRes.value.ok) {
          const campaignsData = await campaignsRes.value.json()
          setCampaigns(campaignsData.records || [])
        } else {
          console.warn(
            "Failed to fetch campaigns:",
            campaignsRes.status === "fulfilled" ? campaignsRes.value.status : campaignsRes.reason,
          )
          setCampaigns([])
        }

        // Handle operators
        if (operatorsRes.status === "fulfilled" && operatorsRes.value.ok) {
          const operatorsData = await operatorsRes.value.json()
          setOperators(operatorsData.records || [])
        } else {
          console.warn(
            "Failed to fetch operators:",
            operatorsRes.status === "fulfilled" ? operatorsRes.value.status : operatorsRes.reason,
          )
          setOperators([])
        }

        // Handle promotions
        if (promotionsRes.status === "fulfilled" && promotionsRes.value.ok) {
          const promotionsData = await promotionsRes.value.json()
          setPromotions(promotionsData.records || [])
        } else {
          const errorMsg =
            promotionsRes.status === "fulfilled"
              ? `HTTP ${promotionsRes.value.status}`
              : promotionsRes.reason?.message || "Unknown error"
          console.warn("Failed to fetch promotions:", errorMsg)
          setPromotions([])
        }
      } catch (error) {
        console.error("Failed to fetch dropdown data:", error)
        setError("Failed to load some data. Some filters may not be available.")
      }
    }

    fetchDropdownData()
  }, [])

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      setError(null)

      try {
        const [emailsRes, campaignsRes, operatorsRes] = await Promise.allSettled([
          fetch("/api/emails"),
          fetch("/api/campaigns"),
          fetch("/api/operators"),
        ])

        // Handle emails
        let emails = []
        if (emailsRes.status === "fulfilled" && emailsRes.value.ok) {
          const emailsData = await emailsRes.value.json()
          emails = emailsData.records || []
        } else {
          console.warn("Failed to fetch emails for stats")
        }

        // Handle campaigns
        let campaignsRecords = []
        if (campaignsRes.status === "fulfilled" && campaignsRes.value.ok) {
          const campaignsData = await campaignsRes.value.json()
          campaignsRecords = campaignsData.records || []
        } else {
          console.warn("Failed to fetch campaigns for stats")
        }

        // Handle operators
        let operatorsRecords = []
        if (operatorsRes.status === "fulfilled" && operatorsRes.value.ok) {
          const operatorsData = await operatorsRes.value.json()
          operatorsRecords = operatorsData.records || []
        } else {
          console.warn("Failed to fetch operators for stats")
        }

        // Apply filters
        if (selectedCampaign !== "all-campaigns") {
          const campaign = campaigns.find((c) => c.id === selectedCampaign)
          if (campaign) {
            emails = emails.filter(
              (email: any) => email.fields?.["Promotion (Lookup)"] === campaign.fields?.["Promotion (Lookup)"],
            )
          }
        }

        if (selectedOperator !== "all-operators") {
          const operator = operators.find((o) => o.id === selectedOperator)
          if (operator) {
            emails = emails.filter(
              (email: any) => email.fields?.["Operator (Lookup)"] === operator.fields?.["Operator Name"],
            )
            campaignsRecords = campaignsRecords.filter(
              (campaign: any) => campaign.fields?.["Operator (Lookup)"] === operator.fields?.["Operator Name"],
            )
          }
        }

        if (selectedPromotion !== "all-promotions") {
          const promotion = promotions.find((p) => p.id === selectedPromotion)
          if (promotion) {
            emails = emails.filter(
              (email: any) => email.fields?.["Promotion (Lookup)"] === promotion.fields?.["Incentive Name"],
            )
            campaignsRecords = campaignsRecords.filter(
              (campaign: any) => campaign.fields?.["Promotion (Lookup)"] === promotion.fields?.["Incentive Name"],
            )
          }
        }

        // Filter by date range
        emails = emails.filter((email: any) => {
          const createdTime = email.fields?.["Created Time"]
          if (!createdTime) return false
          const emailDate = new Date(createdTime)
          return emailDate >= startOfDay(dateRange.from) && emailDate <= endOfDay(dateRange.to)
        })

        campaignsRecords = campaignsRecords.filter((campaign: any) => {
          const startDate = campaign.fields?.["Start Date"]
          if (!startDate) return false
          const campaignDate = new Date(startDate)
          return campaignDate >= startOfDay(dateRange.from) && campaignDate <= endOfDay(dateRange.to)
        })

        // Calculate stats
        const emailsSent = emails.length
        const emailsReplied = emails.filter((email: any) => email.fields?.["Reply Status"] === "Replied").length
        const replyRate = emailsSent > 0 ? Math.round((emailsReplied / emailsSent) * 100) : 0

        const liveCampaigns = campaignsRecords.filter((campaign: any) => {
          const startDate = campaign.fields?.["Start Date"]
          const endDate = campaign.fields?.["End Date"]
          if (!startDate || !endDate) return false
          const now = new Date()
          return new Date(startDate) <= now && new Date(endDate) >= now
        }).length

        const activeOperators = new Set(emails.map((email: any) => email.fields?.["Operator (Lookup)"]).filter(Boolean))
          .size

        // Simulate additional metrics
        const totalConversions = Math.floor(emailsReplied * 1.5)
        const engagementScore = Math.min(100, Math.floor(replyRate * 1.2 + Math.random() * 10))
        const avgResponseTime = `${Math.floor(Math.random() * 24 + 1)}h`

        setStats({
          liveCampaigns,
          emailsSent,
          emailsReplied,
          activeOperators,
          replyRate,
          avgResponseTime,
          totalConversions,
          engagementScore,
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
        setError("Failed to load performance data")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [dateRange, selectedCampaign, selectedOperator, selectedPromotion, campaigns, operators, promotions])

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    color = "blue",
  }: {
    title: string
    value: string | number
    subtitle: string
    icon: any
    trend?: "up" | "down" | "neutral"
    color?: "blue" | "emerald" | "amber" | "purple"
  }) => {
    const colorClasses = {
      blue: "from-slate-950/95 to-slate-900/95 border-blue-500/10",
      emerald: "from-slate-950/95 to-slate-900/95 border-emerald-500/10",
      amber: "from-slate-950/95 to-slate-900/95 border-amber-500/10",
      purple: "from-slate-950/95 to-slate-900/95 border-purple-500/10",
    }

    const iconColors = {
      blue: "text-blue-400",
      emerald: "text-emerald-400",
      amber: "text-amber-400",
      purple: "text-purple-400",
    }

    return (
      <Card
        className={cn(
          "bg-gradient-to-br from-slate-950/95 to-slate-900/95 backdrop-blur-sm border-slate-800/60 shadow-xl",
          colorClasses[color],
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-white">{title}</CardTitle>
          <Icon className={cn("h-4 w-4", iconColors[color])} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{loading ? "..." : value}</div>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-xs text-slate-400">{subtitle}</p>
            {trend && (
              <Badge
                variant="outline"
                className={
                  trend === "up"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : trend === "down"
                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                      : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                }
              >
                {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get validated data for Select components
  const validCampaigns = getValidSelectData(campaigns, "Operator (Lookup)")
  const validOperators = getValidSelectData(operators, "Operator Name")
  const validPromotions = getValidSelectData(promotions, "Incentive Name")

  return (
    <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-lg font-semibold text-white">Performance Overview</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {error && (
              <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                <AlertCircle className="h-3 w-3 mr-1" />
                Warning
              </Badge>
            )}
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              <Filter className="h-3 w-3 mr-1" />
              Filtered
            </Badge>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-2">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700" align="start">
              <div className="p-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRange({ from: subDays(new Date(), 7), to: new Date() })}
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    Last 7 days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRange({ from: subDays(new Date(), 30), to: new Date() })}
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    Last 30 days
                  </Button>
                </div>
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to })
                    }
                  }}
                  className="bg-slate-800 text-white"
                />
              </div>
            </PopoverContent>
          </Popover>

          <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="All Campaigns" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="all-campaigns">All Campaigns</SelectItem>
              {validCampaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedOperator} onValueChange={setSelectedOperator}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="All Operators" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="all-operators">All Operators</SelectItem>
              {validOperators.map((operator) => (
                <SelectItem key={operator.id} value={operator.id}>
                  {operator.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPromotion} onValueChange={setSelectedPromotion}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="All Incentives" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="all-promotions">All Incentives</SelectItem>
              {validPromotions.map((promotion) => (
                <SelectItem key={promotion.id} value={promotion.id}>
                  {promotion.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSelectedCampaign("all-campaigns")
              setSelectedOperator("all-operators")
              setSelectedPromotion("all-promotions")
              setDateRange({ from: subDays(new Date(), 30), to: new Date() })
            }}
            className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
          >
            Reset Filters
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Live Campaigns"
            value={stats.liveCampaigns}
            subtitle="Currently active"
            icon={Target}
            trend="up"
            color="emerald"
          />

          <StatCard
            title="Email Performance"
            value={`${stats.emailsReplied}/${stats.emailsSent}`}
            subtitle={`${stats.replyRate}% reply rate`}
            icon={Mail}
            trend={stats.replyRate > 50 ? "up" : stats.replyRate > 25 ? "neutral" : "down"}
            color="blue"
          />

          <StatCard
            title="Active Operators"
            value={stats.activeOperators}
            subtitle={`Avg response: ${stats.avgResponseTime}`}
            icon={Users}
            trend="neutral"
            color="purple"
          />

          <StatCard
            title="Engagement Score"
            value={`${stats.engagementScore}%`}
            subtitle={`${stats.totalConversions} conversions`}
            icon={Zap}
            trend={stats.engagementScore > 70 ? "up" : "neutral"}
            color="amber"
          />
        </div>
      </CardContent>
    </Card>
  )
}
