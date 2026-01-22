"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format, isSameDay, addMonths, subMonths } from "date-fns"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PlaceholderChartProps {
  title: string
  description?: string
  height?: string
}

interface CalendarEvent {
  date: Date
  type: "email" | "campaign" | "meeting" | "promotion"
  count: number
  title: string
  status: "completed" | "pending" | "scheduled"
}

export function PlaceholderChart({ title, description }: PlaceholderChartProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  // Add state for the second month
  const [secondMonth, setSecondMonth] = useState<Date>(addMonths(new Date(), 1))

  useEffect(() => {
    async function fetchCalendarData() {
      try {
        const [emailsRes, campaignsRes] = await Promise.all([fetch("/api/emails"), fetch("/api/campaigns")])

        const [emailsData, campaignsData] = await Promise.all([
          emailsRes.ok ? emailsRes.json() : { records: [] },
          campaignsRes.ok ? campaignsRes.json() : { records: [] },
        ])

        const emails = emailsData.records || []
        const campaigns = campaignsData.records || []
        const calendarEvents: CalendarEvent[] = []

        // Group emails by date
        const emailsByDate = new Map<string, any[]>()
        emails.forEach((email: any) => {
          const createdTime = email.fields?.["Created Time"]
          if (createdTime) {
            const dateKey = format(new Date(createdTime), "yyyy-MM-dd")
            if (!emailsByDate.has(dateKey)) {
              emailsByDate.set(dateKey, [])
            }
            emailsByDate.get(dateKey)?.push(email)
          }
        })

        // Add email events
        emailsByDate.forEach((emailList, dateKey) => {
          const eventDate = new Date(dateKey)
          const repliedCount = emailList.filter((email: any) => email.fields?.["Reply Status"] === "Replied").length

          calendarEvents.push({
            date: eventDate,
            type: "email",
            count: emailList.length,
            title: `${emailList.length} emails sent${repliedCount > 0 ? `, ${repliedCount} replied` : ""}`,
            status: repliedCount > 0 ? "completed" : "pending",
          })
        })

        // Add campaign events
        campaigns.forEach((campaign: any) => {
          const startDate = campaign.fields?.["Start Date"]
          const endDate = campaign.fields?.["End Date"]
          const now = new Date()

          if (startDate) {
            const start = new Date(startDate)
            calendarEvents.push({
              date: start,
              type: "campaign",
              count: 1,
              title: `Campaign: ${campaign.fields?.["Promotion (Lookup)"] || "Unknown"}`,
              status: start <= now ? "completed" : "scheduled",
            })
          }

          if (endDate) {
            const end = new Date(endDate)
            if (end < now) {
              calendarEvents.push({
                date: end,
                type: "campaign",
                count: 1,
                title: `Campaign ended: ${campaign.fields?.["Promotion (Lookup)"] || "Unknown"}`,
                status: "completed",
              })
            }
          }
        })

        // Add some simulated meetings
        const now = new Date()
        for (let i = 0; i < 8; i++) {
          const randomDate = new Date()
          randomDate.setDate(randomDate.getDate() + Math.floor(Math.random() * 60) - 30)

          calendarEvents.push({
            date: randomDate,
            type: "meeting",
            count: 1,
            title: "Strategy Meeting",
            status: randomDate < now ? "completed" : "scheduled",
          })
        }

        setEvents(calendarEvents)
      } catch (error) {
        console.error("Failed to fetch calendar data:", error)
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    fetchCalendarData()
  }, [])

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(event.date, date))
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "email":
        return "bg-blue-500"
      case "campaign":
        return "bg-emerald-500"
      case "meeting":
        return "bg-purple-500"
      default:
        return "bg-slate-500"
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

  // Navigate both months together
  const navigateMonths = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setDate(date && subMonths(date, 1))
      setSecondMonth(subMonths(secondMonth, 1))
    } else {
      setDate(date && addMonths(date, 1))
      setSecondMonth(addMonths(secondMonth, 1))
    }
  }

  // Custom day content component
  const DayContent = ({ date: dayDate }: { date: Date }) => {
    const dayEvents = getEventsForDate(dayDate)
    const hasEvents = dayEvents.length > 0

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span>{dayDate.getDate()}</span>
        {hasEvents && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                {dayEvents.slice(0, 3).map((event, index) => (
                  <div key={index} className={cn("w-1.5 h-1.5 rounded-full", getEventTypeColor(event.type))} />
                ))}
                {dayEvents.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-800 border border-slate-700 text-white shadow-lg">
              <div className="space-y-2 max-w-xs">
                {dayEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between space-x-2">
                    <span className="text-sm font-medium">{event.title}</span>
                    <Badge variant="outline" className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white font-semibold">{title}</CardTitle>
              {description && <p className="text-slate-400 text-sm">{description}</p>}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                onClick={() => navigateMonths("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium text-white">
                {format(date || new Date(), "MMM yyyy")} - {format(secondMonth, "MMM yyyy")}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                onClick={() => navigateMonths("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Month Calendar */}
              <Calendar
                mode="single"
                month={date}
                selected={date}
                onSelect={setDate}
                className="rounded-lg border border-slate-700 bg-slate-800/50 shadow-sm"
                classNames={{
                  months: "flex flex-col space-y-4",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center text-white",
                  caption_label: "text-sm font-medium text-white",
                  nav: "space-x-1 flex items-center",
                  nav_button: "hidden", // Hide default nav buttons
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-slate-400 rounded-md w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-slate-700/50 [&:has([aria-selected])]:bg-slate-700 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: cn(
                    "inline-flex items-center justify-center rounded-md text-sm font-normal ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 aria-selected:opacity-100 h-9 w-9 text-white hover:bg-slate-700 hover:text-white",
                  ),
                  day_range_end: "day-range-end",
                  day_selected:
                    "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white",
                  day_today: "bg-slate-700 text-white font-semibold",
                  day_outside:
                    "day-outside text-slate-500 opacity-50 aria-selected:bg-slate-700/50 aria-selected:text-slate-500 aria-selected:opacity-30",
                  day_disabled: "text-slate-500 opacity-50",
                  day_range_middle: "aria-selected:bg-slate-700 aria-selected:text-white",
                  day_hidden: "invisible",
                }}
                components={{
                  DayContent,
                }}
              />

              {/* Second Month Calendar */}
              <Calendar
                mode="single"
                month={secondMonth}
                selected={date}
                onSelect={setDate}
                className="rounded-lg border border-slate-700 bg-slate-800/50 shadow-sm"
                classNames={{
                  months: "flex flex-col space-y-4",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center text-white",
                  caption_label: "text-sm font-medium text-white",
                  nav: "space-x-1 flex items-center",
                  nav_button: "hidden", // Hide default nav buttons
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-slate-400 rounded-md w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-slate-700/50 [&:has([aria-selected])]:bg-slate-700 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: cn(
                    "inline-flex items-center justify-center rounded-md text-sm font-normal ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 aria-selected:opacity-100 h-9 w-9 text-white hover:bg-slate-700 hover:text-white",
                  ),
                  day_range_end: "day-range-end",
                  day_selected:
                    "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white",
                  day_today: "bg-slate-700 text-white font-semibold",
                  day_outside:
                    "day-outside text-slate-500 opacity-50 aria-selected:bg-slate-700/50 aria-selected:text-slate-500 aria-selected:opacity-30",
                  day_disabled: "text-slate-500 opacity-50",
                  day_range_middle: "aria-selected:bg-slate-700 aria-selected:text-white",
                  day_hidden: "invisible",
                }}
                components={{
                  DayContent,
                }}
              />
            </div>

            {/* Selected Date Events */}
            {date && (
              <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <h4 className="font-medium text-white mb-3">Events for {format(date, "MMMM d, yyyy")}</h4>
                {getEventsForDate(date).length > 0 ? (
                  <div className="space-y-2">
                    {getEventsForDate(date).map((event, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-slate-700/50 rounded border border-slate-600"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={cn("w-3 h-3 rounded-full", getEventTypeColor(event.type))} />
                          <span className="text-sm font-medium text-white">{event.title}</span>
                        </div>
                        <Badge variant="outline" className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No events scheduled for this date</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
