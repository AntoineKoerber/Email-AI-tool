"use client"

import { useState, useEffect } from "react"
import { Mail, MessageSquare, TrendingUp, Users } from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"
import { PlaceholderChart } from "@/components/ui/placeholder-chart"
import { LoadingChart } from "@/components/ui/loading-chart"
import { NotificationCard } from "@/components/notification-card"
import { StatsOverview } from "@/components/stats-overview"
import { TimelineFeed } from "@/components/timeline-feed"
import { CalibrationBanner } from "@/components/calibration-banner"
import DashboardLayout from "@/components/layout"
import { StatusOverview } from "@/components/status-overview"

export default function Dashboard() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Calibration Banner */}
        <CalibrationBanner />

        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-slate-400">Key metrics and action items at a glance, optimized for daily use</p>
        </div>

        {/* Top Row - Action Items and Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <NotificationCard />
          </div>
          <div className="lg:col-span-2">
            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div onClick={() => (window.location.href = "/emails")} className="cursor-pointer">
                <StatCard
                  title="Total Emails Sent"
                  value={loading ? "" : "1,247"}
                  description="+12% from last month"
                  icon={Mail}
                  trend="up"
                  loading={loading}
                />
              </div>
              <div onClick={() => (window.location.href = "/emails?filter=opened")} className="cursor-pointer">
                <StatCard
                  title="Average Open Range"
                  value={loading ? "" : "68.5%"}
                  description="+2.3% from last month"
                  icon={TrendingUp}
                  trend="up"
                  loading={loading}
                />
              </div>
              <div onClick={() => (window.location.href = "/emails?filter=replied")} className="cursor-pointer">
                <StatCard
                  title="Total Replies"
                  value={loading ? "" : "89"}
                  description="+8 from yesterday"
                  icon={MessageSquare}
                  trend="up"
                  loading={loading}
                />
              </div>
              <div onClick={() => (window.location.href = "/operators")} className="cursor-pointer">
                <StatCard
                  title="Active Operators"
                  value={loading ? "" : "24"}
                  description="+2 this month"
                  icon={Users}
                  trend="up"
                  loading={loading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status Overview Section */}
        <div className="grid grid-cols-1 gap-6">
          <StatusOverview />
        </div>

        {/* Stats Overview with Filters */}
        <div className="grid grid-cols-1 gap-6">
          <StatsOverview />
        </div>

        {/* Charts and Timeline Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            {loading ? <LoadingChart /> : <PlaceholderChart title="Calendar" description="Keep track of things" />}
          </div>
          <div>
            <TimelineFeed />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
