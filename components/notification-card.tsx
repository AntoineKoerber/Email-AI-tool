"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MessageSquareX, Calendar, CheckCircle2, ArrowRight, Bell, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface NotificationItem {
  type: string
  count: number
  urgency: "high" | "medium" | "low"
  icon: any
  description: string
  action?: string
  filterUrl?: string
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
        const noReplyCount = emails.filter(
          (email: any) => email.fields?.["Reply Status"] === "No Reply" && email.fields?.["follow_up_1"] === false,
        ).length

        const waitingBookingCount = emails.filter(
          (email: any) => email.fields?.["ai_answered"] === true && email.fields?.["booking_done"] === false,
        ).length

        const bookedCount = emails.filter((email: any) => email.fields?.["booking_done"] === true).length

        // Keep the existing endingSoonCount logic for campaigns

        const endingSoonCount = campaigns.filter((campaign: any) => {
          const endDate = campaign.fields?.["End Date"]
          if (!endDate) return false
          const end = new Date(endDate)
          const now = new Date()
          const daysUntilEnd = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          return daysUntilEnd <= 7 && daysUntilEnd > 0
        }).length

        const notificationItems: NotificationItem[] = [
          {
            type: "No Reply",
            count: noReplyCount,
            urgency: "high",
            icon: MessageSquareX,
            description: "Emails awaiting response",
            action: "Follow up",
            filterUrl: "/emails?filter=no-reply",
          },
          {
            type: "Ending Soon",
            count: endingSoonCount,
            urgency: "medium",
            icon: Clock,
            description: "Campaigns ending within 7 days",
            action: "Review",
            filterUrl: "/campaigns?filter=ending-soon",
          },
          {
            type: "Waiting Booking",
            count: waitingBookingCount,
            urgency: "medium",
            icon: Calendar,
            description: "AI answered, booking pending",
            action: "Book",
            filterUrl: "/emails?filter=waiting-booking",
          },
          {
            type: "Booked",
            count: bookedCount,
            urgency: "low",
            icon: CheckCircle2,
            description: "Meetings booked",
            action: "View",
            filterUrl: "/emails?filter=booked",
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
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mb-2" />
            <p className="text-white font-medium text-sm">All caught up!</p>
            <p className="text-slate-400 text-xs">No pending action items</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.slice(0, 4).map((notification, index) => {
              const Icon = notification.icon
              return (
                <div
                  key={index}
                  onClick={() => {
                    if (notification.filterUrl) {
                      window.location.href = notification.filterUrl
                    }
                  }}
                  className={cn(
                    "group flex items-center justify-between p-3 rounded-md border transition-all duration-200 hover:scale-[1.01] cursor-pointer",
                    notification.urgency === "high"
                      ? "bg-red-900/20 border-red-500/30 hover:bg-red-900/30"
                      : notification.urgency === "medium"
                        ? "bg-amber-900/20 border-amber-500/30 hover:bg-amber-900/30"
                        : "bg-blue-900/20 border-blue-500/30 hover:bg-blue-900/30",
                  )}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div
                      className={cn(
                        "p-1.5 rounded-full flex-shrink-0",
                        notification.urgency === "high"
                          ? "bg-red-500/20"
                          : notification.urgency === "medium"
                            ? "bg-amber-500/20"
                            : "bg-blue-500/20",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-3 w-3",
                          notification.urgency === "high"
                            ? "text-red-400"
                            : notification.urgency === "medium"
                              ? "text-amber-400"
                              : "text-blue-400",
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white truncate">{notification.type}</p>
                        <Badge
                          variant="outline"
                          className={cn("ml-2 flex-shrink-0", getUrgencyColor(notification.urgency))}
                        >
                          <span>{notification.count}</span>
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{notification.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center ml-2">
                    <ArrowRight className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              )
            })}
            {notifications.length > 4 && (
              <div className="pt-2 border-t border-slate-700/50">
                <button className="w-full text-xs text-slate-400 hover:text-white transition-colors py-1">
                  +{notifications.length - 4} more items
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
