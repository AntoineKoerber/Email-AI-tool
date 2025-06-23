"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format, isAfter, isBefore, addDays } from "date-fns"
import { CalendarClock } from "lucide-react"

interface UpcomingCampaignsProps {
  campaigns?: any[]
  loading?: boolean
}

export function UpcomingCampaigns({ campaigns = [], loading = false }: UpcomingCampaignsProps) {
  const [upcomingCampaigns, setUpcomingCampaigns] = useState<any[]>([])

  useEffect(() => {
    if (campaigns.length === 0) return

    const today = new Date()
    const nextThirtyDays = addDays(today, 30)

    // Filter campaigns that:
    // 1. Start in the next 30 days
    // 2. Are already started but not yet ended
    const upcoming = campaigns
      .filter((campaign) => {
        const startDate = campaign.fields?.["Start Date"] ? new Date(campaign.fields["Start Date"]) : null
        const endDate = campaign.fields?.["End Date"] ? new Date(campaign.fields["End Date"]) : null

        if (!startDate) return false

        // Campaign starts in the next 30 days
        const startsInNext30Days = isAfter(startDate, today) && isBefore(startDate, nextThirtyDays)

        // Campaign is ongoing (started but not ended)
        const isOngoing = isBefore(startDate, today) && endDate && isAfter(endDate, today)

        return startsInNext30Days || isOngoing
      })
      .sort((a, b) => {
        const dateA = new Date(a.fields?.["Start Date"] || new Date())
        const dateB = new Date(b.fields?.["Start Date"] || new Date())
        const today = new Date()

        // Separate future and current campaigns
        const aIsFuture = isAfter(dateA, today)
        const bIsFuture = isAfter(dateB, today)

        // If both are future or both are current, sort by date
        if (aIsFuture === bIsFuture) {
          return dateA.getTime() - dateB.getTime()
        }

        // Future campaigns come first
        return aIsFuture ? -1 : 1
      })

    setUpcomingCampaigns(upcoming)
  }, [campaigns])

  const getStatusBadge = (campaign: any) => {
    const today = new Date()
    const startDate = campaign.fields?.["Start Date"] ? new Date(campaign.fields["Start Date"]) : null
    const endDate = campaign.fields?.["End Date"] ? new Date(campaign.fields["End Date"]) : null

    if (!startDate)
      return (
        <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
          Pending
        </Badge>
      )

    if (isAfter(startDate, today)) {
      return (
        <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          Upcoming
        </Badge>
      )
    }

    if (endDate && isAfter(endDate, today)) {
      return (
        <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          Active
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="bg-slate-500/20 text-slate-400 border-slate-500/30">
        Completed
      </Badge>
    )
  }

  const getDaysUntil = (dateString: string) => {
    const today = new Date()
    const targetDate = new Date(dateString)

    // If date is in the past, return "Started"
    if (isBefore(targetDate, today)) {
      return "Started"
    }

    // Calculate days difference
    const diffTime = Math.abs(targetDate.getTime() - today.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays === 1 ? "Tomorrow" : `In ${diffDays} days`
  }

  return (
    <Card className="bg-slate-900/90 border-slate-700/50 h-full">
      <CardHeader className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Upcoming Campaigns</CardTitle>
            <p className="text-slate-400 text-sm">Next 30 days</p>
          </div>
          <CalendarClock className="h-5 w-5 text-slate-400" />
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-5rem)]">
        {loading ? (
          <div className="p-6 flex items-center justify-center h-full">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
          </div>
        ) : upcomingCampaigns.length > 0 ? (
          <div className="h-full overflow-y-auto">
            <div className="divide-y divide-slate-700">
              {upcomingCampaigns.map((campaign) => (
                <div key={campaign.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-white text-sm">
                      {campaign.fields?.["Promotion (Lookup)"] || "Unnamed Promotion"}
                    </h3>
                    {getStatusBadge(campaign)}
                  </div>
                  <div className="text-sm text-slate-400 mb-2">
                    {campaign.fields?.["Operator (Lookup)"] || "Unnamed Operator"}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex flex-col">
                      <span className="text-slate-500">Start</span>
                      <span className="text-slate-300">
                        {campaign.fields?.["Start Date"]
                          ? format(new Date(campaign.fields["Start Date"]), "MMM d, yyyy")
                          : "Not set"}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-slate-500">Status</span>
                      <span className="text-slate-300">
                        {campaign.fields?.["Start Date"]
                          ? getDaysUntil(campaign.fields["Start Date"])
                          : "Not scheduled"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 h-full flex items-center justify-center">
            No upcoming campaigns in the next 30 days
          </div>
        )}
      </CardContent>
    </Card>
  )
}
