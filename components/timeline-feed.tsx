"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Mail,
  Calendar,
  MessageSquare,
  Clock,
  User,
  Target,
  ArrowRight,
  Activity,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface TimelineItem {
  id: string
  type: "email" | "campaign" | "meeting" | "promotion"
  title: string
  description: string
  timestamp: Date
  status: "completed" | "pending" | "scheduled"
  operator?: string
  promotion?: string
  icon: any
  color: string
}

export function TimelineFeed() {
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "today" | "week">("all")

  useEffect(() => {
    async function fetchTimelineData() {
      try {
        const [emailsRes, campaignsRes, promotionsRes] = await Promise.all([
          fetch("/api/emails"),
          fetch("/api/campaigns"),
          fetch("/api/promotions"),
        ])

        const [emailsData, campaignsData, promotionsData] = await Promise.all([
          emailsRes.ok ? emailsRes.json() : { records: [] },
          campaignsRes.ok ? campaignsRes.json() : { records: [] },
          promotionsRes.ok ? promotionsRes.json() : { records: [] },
        ])

        const emails = emailsData.records || []
        const campaigns = campaignsData.records || []
        const promotions = promotionsData.records || []

        const timelineItems: TimelineItem[] = []

        // Add email activities with proper date handling
        emails.forEach((email: any) => {
          const createdTime = email.fields?.created_time || email.createdTime
          if (createdTime) {
            const emailDate = new Date(createdTime)
            // Only add if date is valid
            if (!isNaN(emailDate.getTime())) {
              timelineItems.push({
                id: `email-${email.id}`,
                type: "email",
                title: "Email Sent",
                description: `Sent to ${email.fields?.operator || "Unknown Operator"}`,
                timestamp: emailDate,
                status: email.fields?.reply_status === "Replied" ? "completed" : "pending",
                operator: email.fields?.operator,
                promotion: email.fields?.incentive,
                icon: Mail,
                color: email.fields?.reply_status === "Replied" ? "emerald" : "blue",
              })

              // Add reply activity if replied
              if (email.fields?.reply_status === "Replied") {
                timelineItems.push({
                  id: `reply-${email.id}`,
                  type: "email",
                  title: "Reply Received",
                  description: `Response from ${email.fields?.operator || "Unknown Operator"}`,
                  timestamp: new Date(emailDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
                  status: "completed",
                  operator: email.fields?.operator,
                  promotion: email.fields?.incentive,
                  icon: MessageSquare,
                  color: "emerald",
                })
              }
            }
          }
        })

        // Add campaign activities with proper date handling
        campaigns.forEach((campaign: any) => {
          const startDate = campaign.fields?.start_date || campaign.fields?.["Start Date"]
          const endDate = campaign.fields?.end_date || campaign.fields?.["End Date"]

          if (startDate) {
            const start = new Date(startDate)
            const now = new Date()

            // Only add if date is valid
            if (!isNaN(start.getTime())) {
              timelineItems.push({
                id: `campaign-start-${campaign.id}`,
                type: "campaign",
                title: start <= now ? "Campaign Started" : "Campaign Scheduled",
                description: `${campaign.fields?.operator || campaign.fields?.["Operator (Lookup)"] || "Unknown"} - ${campaign.fields?.incentive || campaign.fields?.["Promotion (Lookup)"] || "Unknown"}`,
                timestamp: start,
                status: start <= now ? "completed" : "scheduled",
                operator: campaign.fields?.operator || campaign.fields?.["Operator (Lookup)"],
                promotion: campaign.fields?.incentive || campaign.fields?.["Promotion (Lookup)"],
                icon: Target,
                color: start <= now ? "emerald" : "amber",
              })
            }
          }

          if (endDate) {
            const end = new Date(endDate)
            const now = new Date()

            // Only add if date is valid
            if (!isNaN(end.getTime()) && end < now) {
              timelineItems.push({
                id: `campaign-end-${campaign.id}`,
                type: "campaign",
                title: "Campaign Ended",
                description: `${campaign.fields?.operator || campaign.fields?.["Operator (Lookup)"] || "Unknown"} - ${campaign.fields?.incentive || campaign.fields?.["Promotion (Lookup)"] || "Unknown"}`,
                timestamp: end,
                status: "completed",
                operator: campaign.fields?.operator || campaign.fields?.["Operator (Lookup)"],
                promotion: campaign.fields?.incentive || campaign.fields?.["Promotion (Lookup)"],
                icon: CheckCircle2,
                color: "slate",
              })
            }
          }
        })

        // Add some simulated calendar events
        const now = new Date()
        for (let i = 0; i < 5; i++) {
          const randomDate = new Date(now.getTime() - Math.random() * 14 * 24 * 60 * 60 * 1000)
          const operators = ["BetMax Casino", "Lucky Spin Gaming", "Royal Games Ltd"]
          const randomOperator = operators[Math.floor(Math.random() * operators.length)]

          timelineItems.push({
            id: `meeting-${i}`,
            type: "meeting",
            title: "Strategy Meeting",
            description: `Quarterly review with ${randomOperator}`,
            timestamp: randomDate,
            status: randomDate < now ? "completed" : "scheduled",
            operator: randomOperator,
            icon: Calendar,
            color: randomDate < now ? "emerald" : "purple",
          })
        }

        // Sort by timestamp (newest first) - only include valid dates
        const validTimelineItems = timelineItems.filter((item) => !isNaN(item.timestamp.getTime()))
        validTimelineItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

        setTimeline(validTimelineItems)
      } catch (error) {
        console.error("Failed to fetch timeline data:", error)
        setTimeline([])
      } finally {
        setLoading(false)
      }
    }

    fetchTimelineData()
  }, [])

  const filteredTimeline = timeline.filter((item) => {
    const now = new Date()
    const itemDate = item.timestamp

    switch (filter) {
      case "today":
        return itemDate.toDateString() === now.toDateString()
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return itemDate >= weekAgo
      default:
        return true
    }
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-3 w-3" />
      case "pending":
        return <Clock className="h-3 w-3" />
      case "scheduled":
        return <Calendar className="h-3 w-3" />
      default:
        return <AlertCircle className="h-3 w-3" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      case "pending":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30"
      case "scheduled":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const getItemColor = (color: string) => {
    const colors = {
      emerald: "border-l-emerald-500 bg-emerald-500/5",
      blue: "border-l-blue-500 bg-blue-500/5",
      amber: "border-l-amber-500 bg-amber-500/5",
      purple: "border-l-purple-500 bg-purple-500/5",
      slate: "border-l-slate-500 bg-slate-500/5",
    }
    return colors[color as keyof typeof colors] || colors.slate
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-emerald-400 animate-pulse" />
              <CardTitle className="text-lg font-semibold text-white">Activity Timeline</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex space-x-3">
                <div className="h-8 w-8 bg-slate-800 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-800 rounded animate-pulse"></div>
                  <div className="h-3 bg-slate-800 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            <CardTitle className="text-lg font-semibold text-white">Activity Timeline</CardTitle>
          </div>
          <div className="flex space-x-2">
            {["all", "today", "week"].map((filterOption) => (
              <Button
                key={filterOption}
                variant={filter === filterOption ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(filterOption as any)}
                className={cn(
                  "h-7 px-3 text-xs",
                  filter === filterOption
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "text-slate-400 hover:text-white hover:bg-slate-800",
                )}
              >
                {filterOption === "all" ? "All" : filterOption === "today" ? "Today" : "This Week"}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredTimeline.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No activity found for the selected period</p>
            </div>
          ) : (
            filteredTimeline.map((item, index) => {
              const Icon = item.icon
              return (
                <div
                  key={item.id}
                  className={cn(
                    "relative flex space-x-3 p-3 rounded-lg border-l-4 transition-all duration-200 hover:bg-slate-800/30",
                    getItemColor(item.color),
                  )}
                >
                  {/* Timeline line */}
                  {index < filteredTimeline.length - 1 && (
                    <div className="absolute left-6 top-12 w-px h-8 bg-slate-700"></div>
                  )}

                  <div
                    className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                      item.color === "emerald"
                        ? "bg-emerald-500/20"
                        : item.color === "blue"
                          ? "bg-blue-500/20"
                          : item.color === "amber"
                            ? "bg-amber-500/20"
                            : item.color === "purple"
                              ? "bg-purple-500/20"
                              : "bg-slate-500/20",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        item.color === "emerald"
                          ? "text-emerald-400"
                          : item.color === "blue"
                            ? "text-blue-400"
                            : item.color === "amber"
                              ? "text-amber-400"
                              : item.color === "purple"
                                ? "text-purple-400"
                                : "text-slate-400",
                      )}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-white">{item.title}</p>
                        <Badge variant="outline" className={getStatusColor(item.status)}>
                          {getStatusIcon(item.status)}
                          <span className="ml-1 capitalize">{item.status}</span>
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">
                        {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                    <p className="text-sm text-slate-300 mt-1">{item.description}</p>
                    {(item.operator || item.promotion) && (
                      <div className="flex items-center space-x-2 mt-2">
                        {item.operator && (
                          <Badge
                            variant="outline"
                            className="bg-slate-500/20 text-slate-400 border-slate-500/30 text-xs"
                          >
                            <User className="h-3 w-3 mr-1" />
                            {item.operator}
                          </Badge>
                        )}
                        {item.promotion && (
                          <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                            <Target className="h-3 w-3 mr-1" />
                            {item.promotion}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {filteredTimeline.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <Button variant="ghost" size="sm" className="w-full text-slate-400 hover:text-white">
              View Full Activity Log
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
