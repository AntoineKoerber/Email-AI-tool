"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, AlertTriangle, XCircle, TrendingUp, Calendar, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusMetric {
  title: string
  count: number
  status: "completed" | "pending" | "negative" | "no-answer"
  icon: any
  description: string
  filterUrl: string
}

export function StatusOverview() {
  const [metrics, setMetrics] = useState<StatusMetric[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStatusMetrics() {
      try {
        const [emailsRes, campaignsRes, operatorsRes] = await Promise.all([
          fetch("/api/emails"),
          fetch("/api/campaigns"),
          fetch("/api/operators"),
        ])

        const [emailsData, campaignsData, operatorsData] = await Promise.all([
          emailsRes.ok ? emailsRes.json() : { records: [] },
          campaignsRes.ok ? campaignsRes.json() : { records: [] },
          operatorsRes.ok ? operatorsRes.json() : { records: [] },
        ])

        const emails = emailsData.records || []
        const campaigns = campaignsData.records || []
        const operators = operatorsData.records || []

        // Calculate status metrics
        const completedBookings = emails.filter((email: any) => email.fields?.["booking_done"] === true).length

        const pendingBookings = emails.filter(
          (email: any) => email.fields?.["ai_answered"] === true && email.fields?.["booking_done"] === false,
        ).length

        const negativeReplies = emails.filter(
          (email: any) =>
            email.fields?.["Reply Status"] === "Negative" || email.fields?.["slack_message_sent"] === true,
        ).length

        const noAnswers = emails.filter((email: any) => email.fields?.["Reply Status"] === "No Reply").length

        const activeCampaigns = campaigns.filter((campaign: any) => {
          const startDate = campaign.fields?.["Start Date"] ? new Date(campaign.fields["Start Date"]) : null
          const endDate = campaign.fields?.["End Date"] ? new Date(campaign.fields["End Date"]) : null
          const today = new Date()

          return startDate && endDate && startDate <= today && endDate >= today
        }).length

        const activeOperators = operators.filter(
          (operator: any) =>
            operator.fields?.["Engagement Status"] === "Hot" || operator.fields?.["Engagement Status"] === "Medium",
        ).length

        const statusMetrics: StatusMetric[] = [
          {
            title: "Completed Bookings",
            count: completedBookings,
            status: "completed",
            icon: CheckCircle2,
            description: "Meetings successfully booked",
            filterUrl: "/emails?filter=booked",
          },
          {
            title: "Pending Bookings",
            count: pendingBookings,
            status: "pending",
            icon: Calendar,
            description: "AI answered, awaiting booking",
            filterUrl: "/emails?filter=waiting-booking",
          },
          {
            title: "Negative Responses",
            count: negativeReplies,
            status: "negative",
            icon: XCircle,
            description: "Declined or negative replies",
            filterUrl: "/emails?filter=negative",
          },
          {
            title: "No Response",
            count: noAnswers,
            status: "no-answer",
            icon: Clock,
            description: "Emails awaiting response",
            filterUrl: "/emails?filter=no-reply",
          },
          {
            title: "Active Campaigns",
            count: activeCampaigns,
            status: "completed",
            icon: TrendingUp,
            description: "Currently running campaigns",
            filterUrl: "/campaigns?filter=active",
          },
          {
            title: "Engaged Operators",
            count: activeOperators,
            status: "completed",
            icon: Users,
            description: "Hot and medium engagement",
            filterUrl: "/operators?filter=engaged",
          },
          {
            title: "Follow-up 1 Sent",
            count: emails.filter((email: any) => email.fields?.["follow_up_1"] === true).length,
            status: "completed",
            icon: CheckCircle2,
            description: "First follow-up emails sent",
            filterUrl: "/emails?filter=followup1",
          },
          {
            title: "Follow-up 2 Sent",
            count: emails.filter((email: any) => email.fields?.["follow_up_2"] === true).length,
            status: "completed",
            icon: CheckCircle2,
            description: "Second follow-up emails sent",
            filterUrl: "/emails?filter=followup2",
          },
          {
            title: "AI Answered",
            count: emails.filter((email: any) => email.fields?.["ai_answered"] === true).length,
            status: "pending",
            icon: AlertTriangle,
            description: "AI has responded to emails",
            filterUrl: "/emails?filter=ai-answered",
          },
          {
            title: "Hot Operators",
            count: operators.filter((op: any) => op.fields?.["Engagement Status"] === "Hot").length,
            status: "completed",
            icon: TrendingUp,
            description: "High engagement operators",
            filterUrl: "/operators?filter=hot",
          },
          {
            title: "Cold Operators",
            count: operators.filter((op: any) => op.fields?.["Engagement Status"] === "Cold").length,
            status: "no-answer",
            icon: Clock,
            description: "Low engagement operators",
            filterUrl: "/operators?filter=cold",
          },
          {
            title: "Ending This Week",
            count: campaigns.filter((campaign: any) => {
              const endDate = campaign.fields?.["End Date"]
              if (!endDate) return false
              const end = new Date(endDate)
              const now = new Date()
              const daysUntilEnd = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
              return daysUntilEnd <= 7 && daysUntilEnd > 0
            }).length,
            status: "pending",
            icon: Calendar,
            description: "Campaigns ending within 7 days",
            filterUrl: "/campaigns?filter=ending-soon",
          },
        ]

        setMetrics(statusMetrics)
      } catch (error) {
        console.error("Failed to fetch status metrics:", error)
        setMetrics([])
      } finally {
        setLoading(false)
      }
    }

    fetchStatusMetrics()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      case "pending":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30"
      case "negative":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "no-answer":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-3 w-3" />
      case "pending":
        return <Clock className="h-3 w-3" />
      case "negative":
        return <XCircle className="h-3 w-3" />
      case "no-answer":
        return <AlertTriangle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-white">Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-20 bg-slate-800/30 rounded-md animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-white">Status Overview</CardTitle>
        <p className="text-slate-400 text-sm">Click any metric to view details</p>
      </CardHeader>
      <CardContent>
        {metrics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <TrendingUp className="h-10 w-10 text-slate-400 mb-2 opacity-50" />
            <p className="text-white font-medium text-sm">No data available</p>
            <p className="text-slate-400 text-xs">Status metrics will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-2">
              {metrics.slice(0, 12).map((metric, index) => {
                const Icon = metric.icon
                return (
                  <div
                    key={index}
                    onClick={() => (window.location.href = metric.filterUrl)}
                    className={cn(
                      "group p-2 rounded-md border transition-all duration-200 hover:scale-[1.02] cursor-pointer",
                      metric.status === "completed"
                        ? "bg-emerald-900/20 border-emerald-500/30 hover:bg-emerald-900/30"
                        : metric.status === "pending"
                          ? "bg-amber-900/20 border-amber-500/30 hover:bg-amber-900/30"
                          : metric.status === "negative"
                            ? "bg-red-900/20 border-red-500/30 hover:bg-red-900/30"
                            : "bg-yellow-900/20 border-yellow-500/30 hover:bg-yellow-900/30",
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Icon
                        className={cn(
                          "h-4 w-4 flex-shrink-0",
                          metric.status === "completed"
                            ? "text-emerald-400"
                            : metric.status === "pending"
                              ? "text-amber-400"
                              : metric.status === "negative"
                                ? "text-red-400"
                                : "text-yellow-400",
                        )}
                      />
                      <Badge variant="outline" className={cn("text-xs px-1 py-0", getStatusColor(metric.status))}>
                        {metric.count}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white mb-0.5 truncate">{metric.title}</p>
                      <p className="text-xs text-slate-400 truncate leading-tight">{metric.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            {metrics.length > 12 && (
              <div className="pt-2 border-t border-slate-700/50">
                <button className="w-full text-xs text-slate-400 hover:text-white transition-colors py-2 rounded-md hover:bg-slate-800/30">
                  See {metrics.length - 12} more metrics
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
