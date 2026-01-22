"use client"

import { useState, useEffect } from "react"
import { BarChart3, Mail, Building, Target, DollarSign, PieChart, Bot, Calendar } from "lucide-react"
import { LoadingCard } from "@/components/ui/loading-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import DashboardLayout from "@/components/layout"

export default function Customize() {
  const [loading, setLoading] = useState(true)
  const [selectedWidgets, setSelectedWidgets] = useState(["metrics", "emails", "notifications"])

  const availableWidgets = [
    { id: "metrics", name: "Performance Metrics", icon: BarChart3, description: "Key performance indicators" },
    { id: "emails", name: "Email Activity", icon: Mail, description: "Recent email interactions" },
    { id: "operators", name: "Operator Overview", icon: Building, description: "Operator status and info" },
    { id: "campaigns", name: "Active Campaigns", icon: Target, description: "Running promotional campaigns" },
    { id: "revenue", name: "Revenue Tracking", icon: DollarSign, description: "Financial performance" },
    { id: "analytics", name: "Analytics Charts", icon: PieChart, description: "Visual data representation" },
    { id: "notifications", name: "AI Notifications", icon: Bot, description: "Smart alerts and suggestions" },
    { id: "calendar", name: "Calendar View", icon: Calendar, description: "Upcoming events and deadlines" },
  ]

  const toggleWidget = (widgetId: string) => {
    setSelectedWidgets((prev) => (prev.includes(widgetId) ? prev.filter((id) => id !== widgetId) : [...prev, widgetId]))
  }

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Customize Your Dashboard</h1>
          <p className="text-slate-400">Select which widgets to display on your dashboard</p>
        </div>

        {/* Widget Selection */}
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <LoadingCard rows={8} />
          ) : (
            <Card className="bg-slate-900/90 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">Available Widgets</CardTitle>
                <p className="text-slate-400">Choose the widgets that are most relevant to your workflow</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableWidgets.map((widget) => {
                    const Icon = widget.icon
                    const isSelected = selectedWidgets.includes(widget.id)

                    return (
                      <div
                        key={widget.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? "bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/50"
                            : "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800"
                        }`}
                        onClick={() => toggleWidget(widget.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <Checkbox checked={isSelected} onChange={() => toggleWidget(widget.id)} className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Icon className={`h-5 w-5 ${isSelected ? "text-blue-400" : "text-slate-400"}`} />
                              <h3 className={`font-medium ${isSelected ? "text-white" : "text-slate-300"}`}>
                                {widget.name}
                              </h3>
                            </div>
                            <p className="text-sm text-slate-400">{widget.description}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Dashboard Preview */}
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <LoadingCard rows={3} />
          ) : (
            <Card className="bg-slate-900/90 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">Dashboard Preview</CardTitle>
                <p className="text-slate-400">Your selected widgets will appear on the dashboard</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-slate-300">Selected widgets ({selectedWidgets.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedWidgets.map((widgetId) => {
                      const widget = availableWidgets.find((w) => w.id === widgetId)
                      return widget ? (
                        <Badge
                          key={widgetId}
                          variant="outline"
                          className="bg-blue-500/20 text-blue-400 border-blue-500/30"
                        >
                          {widget.name}
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Layout Options */}
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <LoadingCard rows={5} />
          ) : (
            <Card className="bg-slate-900/90 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">Layout Options</CardTitle>
                <p className="text-slate-400">Customize the arrangement of your dashboard widgets</p>
              </CardHeader>
              <CardContent className="h-64">
                <div className="h-full w-full rounded-md bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
                  <div className="text-center p-4">
                    <p className="text-slate-400">Layout customization options</p>
                    <p className="text-slate-500 text-sm mt-1">Drag and drop functionality coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
