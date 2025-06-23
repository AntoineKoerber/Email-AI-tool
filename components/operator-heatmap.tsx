"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

// Mock data for the heatmap - only John Smith with more operators
const mockHeatmapData = [
  {
    am: "John Smith",
    operators: [
      { name: "BetMax Casino", engagement: "high", value: 92 },
      { name: "Lucky Spin Gaming", engagement: "medium", value: 68 },
      { name: "Royal Games Ltd", engagement: "high", value: 85 },
      { name: "Vegas Palace", engagement: "low", value: 32 },
      { name: "Golden Slots", engagement: "high", value: 88 },
      { name: "Diamond Casino", engagement: "high", value: 94 },
      { name: "Jackpot City", engagement: "medium", value: 72 },
      { name: "Spin Palace", engagement: "low", value: 41 },
      { name: "Casino Royale", engagement: "medium", value: 65 },
      { name: "Empire Games", engagement: "low", value: 28 },
      { name: "Lucky Star", engagement: "low", value: 35 },
      { name: "Grand Fortune", engagement: "medium", value: 58 },
      { name: "Platinum Play", engagement: "high", value: 89 },
      { name: "Royal Vegas", engagement: "high", value: 91 },
      { name: "Spin Casino", engagement: "medium", value: 76 },
      { name: "Ruby Fortune", engagement: "medium", value: 62 },
    ],
  },
]

export function OperatorHeatmap() {
  const [timeframe, setTimeframe] = useState("month")
  const [showMore, setShowMore] = useState(false)

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case "high":
        return "bg-emerald-500/30 hover:bg-emerald-500/40"
      case "medium":
        return "bg-amber-500/30 hover:bg-amber-500/40"
      case "low":
        return "bg-red-500/30 hover:bg-red-500/40"
      default:
        return "bg-slate-500/30 hover:bg-slate-500/40"
    }
  }

  const getEngagementBadge = (engagement: string) => {
    switch (engagement) {
      case "high":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      case "medium":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30"
      case "low":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  // Split operators into rows of 4
  const amData = mockHeatmapData[0]
  const operatorsPerRow = 4
  const totalRows = Math.ceil(amData.operators.length / operatorsPerRow)
  const visibleRows = showMore ? Math.min(totalRows, 3) : 1
  const visibleOperators = amData.operators.slice(0, visibleRows * operatorsPerRow)

  return (
    <Card className="bg-slate-900/90 border-slate-700/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white">Operator Engagement Heatmap</CardTitle>
          <p className="text-slate-400 text-sm mt-1">Performance overview by Account Manager</p>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="quarter">Last Quarter</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">{amData.am}</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-400">Avg. Engagement:</span>
              <Badge
                variant="outline"
                className={getEngagementBadge(
                  amData.operators.reduce((acc, op) => acc + op.value, 0) / amData.operators.length > 75
                    ? "high"
                    : amData.operators.reduce((acc, op) => acc + op.value, 0) / amData.operators.length > 50
                      ? "medium"
                      : "low",
                )}
              >
                {Math.round(amData.operators.reduce((acc, op) => acc + op.value, 0) / amData.operators.length)}%
              </Badge>
            </div>
          </div>

          {/* Scrollable container for operators */}
          <div className="overflow-x-auto">
            <div className="space-y-2" style={{ minWidth: `${operatorsPerRow * 200}px` }}>
              {Array.from({ length: visibleRows }).map((_, rowIndex) => {
                const rowOperators = amData.operators.slice(
                  rowIndex * operatorsPerRow,
                  (rowIndex + 1) * operatorsPerRow,
                )

                return (
                  <div key={rowIndex} className="grid grid-cols-4 gap-2">
                    {rowOperators.map((operator, opIndex) => (
                      <div
                        key={opIndex}
                        className={`p-4 rounded-lg border border-slate-700/50 transition-colors ${getEngagementColor(operator.engagement)}`}
                        style={{ minWidth: "180px" }}
                      >
                        <div className="flex flex-col h-full">
                          <div className="font-medium text-white mb-2 text-sm">{operator.name}</div>
                          <div className="mt-auto flex items-center justify-between">
                            <Badge variant="outline" className={`${getEngagementBadge(operator.engagement)} text-xs`}>
                              {operator.engagement}
                            </Badge>
                            <span className="text-white font-bold text-sm">{operator.value}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Show More/Less Button */}
          {totalRows > 1 && (
            <div className="flex justify-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMore(!showMore)}
                className="text-slate-400 hover:text-white"
              >
                {showMore ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show More ({totalRows - 1} more rows)
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
