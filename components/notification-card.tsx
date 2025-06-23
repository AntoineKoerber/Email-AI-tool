"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  Clock,
  MessageSquareX,
  Calendar,
  TrendingDown,
  CheckCircle2,
  ArrowRight,
  Bell,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NotificationItem {
  type: string
  count: number
  urgency: "high" | "medium" | "low"
  icon: any
  description: string
  action?: string
}

export function NotificationCard() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPending, setTotalPending] = useState(0)

  useEffect(() => {
    async function fetchNotifications() {
      try {
        // Fetch data from multiple sources
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

        // Calculate notification counts
        const noReplyCount = emails.filter((email: any) => email.fields?.["Reply Status"] === "No Reply").length

        const endingSoonCount = campaigns.filter((campaign: any) => {
          const endDate = campaign.fields?.["End Date"]
          if (!endDate) return false
          const end = new Date(endDate)
          const now = new Date()
          const daysUntilEnd = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          return daysUntilEnd <= 7 && daysUntilEnd > 0
        }).length

        const missingFeedbackCount = campaigns.filter(
          (campaign: any) => !campaign.fields?.["Start Date"] || !campaign.fields?.["End Date"],
        ).length

        const lowPerformingCount = emails.filter((email: any) => {
          // Simulate low performing emails (no opens after 3 days)
          const created = email.fields?.["Created Time"]
          if (!created) return false
          const createdDate = new Date(created)
          const now = new Date()
          const daysSinceCreated = Math.ceil((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
          return daysSinceCreated > 3 && email.fields?.["Reply Status"] === "No Reply"
        }).length

        const expiredPromotionsCount = promotions.filter((promo: any) => {
          // Simulate expired promotions that need review
          return Math.random() > 0.8 // 20% chance for demo
        }).length

        const notificationItems: NotificationItem[] = [
          {
            type: "No Reply",
            count: noReplyCount,
            urgency: "high",
            icon: MessageSquareX,
            description: "Emails awaiting response",
            action: "Follow up",
          },
          {
            type: "Ending Soon",
            count: endingSoonCount,
            urgency: "medium",
            icon: Clock,
            description: "Campaigns ending within 7 days",
            action: "Review",
          },
          {
            type: "Missing Details",
            count: missingFeedbackCount,
            urgency: "medium",
            icon: AlertTriangle,
            description: "Campaigns missing dates",
            action: "Complete",
          },
          {
            type: "Low Performance",
            count: lowPerformingCount,
            urgency: "low",
            icon: TrendingDown,
            description: "Emails with no engagement",
            action: "Optimize",
          },
          {
            type: "Review Needed",
            count: expiredPromotionsCount,
            urgency: "low",
            icon: Calendar,
            description: "Promotions need review",
            action: "Update",
          },
        ].filter((item) => item.count > 0)

        setNotifications(notificationItems)
        setTotalPending(notificationItems.reduce((sum, item) => sum + item.count, 0))
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
        setNotifications([])
        setTotalPending(0)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30"
      case "low":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "high":
        return <Zap className="h-3 w-3" />
      case "medium":
        return <Clock className="h-3 w-3" />
      default:
        return <Bell className="h-3 w-3" />
    }
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-blue-400 animate-pulse" />
              <CardTitle className="text-lg font-semibold text-white">Action Items</CardTitle>
            </div>
            <div className="h-6 w-12 bg-slate-800 rounded animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-800/30 rounded-md animate-pulse"></div>
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
            <Bell className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-lg font-semibold text-white">Action Items</CardTitle>
          </div>
          {totalPending > 0 && (
            <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
              {totalPending} pending
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mb-3" />
            <p className="text-white font-medium">All caught up!</p>
            <p className="text-slate-400 text-sm">No pending action items</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {notifications.map((notification, index) => {
              const Icon = notification.icon
              return (
                <div
                  key={index}
                  className={cn(
                    "group flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] cursor-pointer",
                    notification.urgency === "high"
                      ? "bg-red-900/20 border-red-500/30 hover:bg-red-900/30"
                      : notification.urgency === "medium"
                        ? "bg-amber-900/20 border-amber-500/30 hover:bg-amber-900/30"
                        : "bg-blue-900/20 border-blue-500/30 hover:bg-blue-900/30",
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={cn(
                        "p-2 rounded-full",
                        notification.urgency === "high"
                          ? "bg-red-500/20"
                          : notification.urgency === "medium"
                            ? "bg-amber-500/20"
                            : "bg-blue-500/20",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          notification.urgency === "high"
                            ? "text-red-400"
                            : notification.urgency === "medium"
                              ? "text-amber-400"
                              : "text-blue-400",
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-white">{notification.type}</p>
                        <Badge variant="outline" className={getUrgencyColor(notification.urgency)}>
                          {getUrgencyIcon(notification.urgency)}
                          <span className="ml-1">{notification.count}</span>
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">{notification.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {notification.action && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {notification.action}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
