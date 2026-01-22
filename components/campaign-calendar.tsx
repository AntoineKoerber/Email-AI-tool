"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format, isWithinInterval, parseISO, addMonths, subMonths } from "date-fns"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CampaignCalendarProps {
  campaigns?: any[]
  operators?: any[]
  loading?: boolean
}

interface CampaignEvent {
  id: string
  title: string
  start: Date
  end: Date
  operatorName: string
  promotionName: string
  color: string
}

const COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-cyan-500",
  "bg-pink-500",
]

export function CampaignCalendar({ campaigns = [], operators = [], loading = false }: CampaignCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<CampaignEvent[]>([])
  const [selectedEvents, setSelectedEvents] = useState<CampaignEvent[]>([])
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [operatorColors, setOperatorColors] = useState<Record<string, string>>({})

  // Calculate the two months to display
  const firstMonth = currentDate
  const secondMonth = addMonths(currentDate, 1)

  // Process campaigns into calendar events
  useEffect(() => {
    if (campaigns.length === 0) return

    // Create a color map for operators
    const colors: Record<string, string> = {}
    operators.forEach((operator, index) => {
      const operatorId = operator.id
      colors[operatorId] = COLORS[index % COLORS.length]
    })
    setOperatorColors(colors)

    // Process campaigns into events
    const campaignEvents: CampaignEvent[] = campaigns
      .filter((campaign) => campaign.fields?.["Start Date"] && campaign.fields?.["End Date"])
      .map((campaign) => {
        const operatorId = campaign.fields?.["Linked Operator"]?.[0] || ""
        const operatorName = campaign.fields?.["Operator (Lookup)"] || "Unknown Operator"
        const promotionName = campaign.fields?.["Promotion (Lookup)"] || "Unknown Promotion"

        return {
          id: campaign.id,
          title: promotionName,
          start: parseISO(campaign.fields["Start Date"]),
          end: parseISO(campaign.fields["End Date"]),
          operatorName,
          promotionName,
          color: colors[operatorId] || COLORS[0],
        }
      })

    setEvents(campaignEvents)
  }, [campaigns, operators])

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isWithinInterval(date, { start: event.start, end: event.end }))
  }

  // Handle clicking on a date with events
  const handleDateClick = (date: Date, dayEvents: CampaignEvent[]) => {
    if (dayEvents.length > 0) {
      setSelectedEvents(dayEvents)
      setShowEventDialog(true)
    }
  }

  // Navigate to previous/next month pair
  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentDate(subMonths(currentDate, 1))
    } else {
      setCurrentDate(addMonths(currentDate, 1))
    }
  }

  return (
    <TooltipProvider>
      <Card className="bg-slate-900/90 border-slate-700/50 h-full">
        <CardHeader className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Campaign Schedule</CardTitle>
              <p className="text-slate-400 text-sm">View and manage campaign timelines</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                onClick={() => navigateMonth("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium text-white min-w-[200px] text-center">
                {format(firstMonth, "MMM yyyy")} - {format(secondMonth, "MMM yyyy")}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                onClick={() => navigateMonth("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="h-[400px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
                <p className="text-sm text-slate-400">Loading campaign data...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Two-month calendar display */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-slate-700 rounded-lg bg-slate-800/50 p-4">
                  <div className="text-center text-white font-medium mb-4">{format(firstMonth, "MMMM yyyy")}</div>
                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-center">
                      <div className="grid grid-cols-7 gap-1">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                          <div key={day} className="text-center text-xs text-slate-400 w-9">
                            {day}
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Simplified calendar for first month */}
                    <div className="flex justify-center">
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 35 }).map((_, i) => {
                          const day = new Date(
                            firstMonth.getFullYear(),
                            firstMonth.getMonth(),
                            i - firstMonth.getDay() + 1,
                          )
                          const isCurrentMonth = day.getMonth() === firstMonth.getMonth()
                          const dayEvents = getEventsForDate(day)
                          const hasEvents = dayEvents.length > 0

                          return (
                            <div
                              key={i}
                              className={cn(
                                "h-9 w-9 flex items-center justify-center rounded-md text-sm",
                                isCurrentMonth ? "text-white" : "text-slate-500 opacity-50",
                                hasEvents && isCurrentMonth ? "bg-slate-700/50" : "",
                                "relative cursor-pointer hover:bg-slate-700",
                              )}
                              onClick={() => handleDateClick(day, dayEvents)}
                            >
                              {day.getDate()}
                              {hasEvents && isCurrentMonth && (
                                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                                  {dayEvents.slice(0, 3).map((event, index) => (
                                    <div key={index} className={cn("w-1.5 h-1.5 rounded-full", event.color)} />
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border border-slate-700 rounded-lg bg-slate-800/50 p-4">
                  <div className="text-center text-white font-medium mb-4">{format(secondMonth, "MMMM yyyy")}</div>
                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-center">
                      <div className="grid grid-cols-7 gap-1">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                          <div key={day} className="text-center text-xs text-slate-400 w-9">
                            {day}
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Simplified calendar for second month */}
                    <div className="flex justify-center">
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 35 }).map((_, i) => {
                          const day = new Date(
                            secondMonth.getFullYear(),
                            secondMonth.getMonth(),
                            i - secondMonth.getDay() + 1,
                          )
                          const isCurrentMonth = day.getMonth() === secondMonth.getMonth()
                          const dayEvents = getEventsForDate(day)
                          const hasEvents = dayEvents.length > 0

                          return (
                            <div
                              key={i}
                              className={cn(
                                "h-9 w-9 flex items-center justify-center rounded-md text-sm",
                                isCurrentMonth ? "text-white" : "text-slate-500 opacity-50",
                                hasEvents && isCurrentMonth ? "bg-slate-700/50" : "",
                                "relative cursor-pointer hover:bg-slate-700",
                              )}
                              onClick={() => handleDateClick(day, dayEvents)}
                            >
                              {day.getDate()}
                              {hasEvents && isCurrentMonth && (
                                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                                  {dayEvents.slice(0, 3).map((event, index) => (
                                    <div key={index} className={cn("w-1.5 h-1.5 rounded-full", event.color)} />
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 border-t border-slate-700 pt-4">
                {operators.slice(0, 8).map((operator, index) => (
                  <div key={operator.id} className="flex items-center space-x-2">
                    <div className={cn("w-3 h-3 rounded-full", COLORS[index % COLORS.length])} />
                    <span className="text-xs text-slate-300">{operator.fields?.["Operator Name"] || "Unknown"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog for showing events on a specific date */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>
              Campaigns for {selectedEvents.length > 0 ? format(selectedEvents[0].start, "MMMM d, yyyy") : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {selectedEvents.map((event) => (
              <div key={event.id} className="p-3 rounded-lg border border-slate-700 bg-slate-800">
                <div className="flex items-center space-x-2 mb-1">
                  <div className={cn("w-3 h-3 rounded-full", event.color)} />
                  <h4 className="font-medium text-white">{event.promotionName}</h4>
                </div>
                <div className="text-sm text-slate-400 ml-5 space-y-1">
                  <p>Operator: {event.operatorName}</p>
                  <p>
                    Duration: {format(event.start, "MMM d")} - {format(event.end, "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
