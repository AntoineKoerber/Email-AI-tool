"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Mail,
  MessageSquare,
  TrendingUp,
  Users,
  Calendar,
  Plus,
  Send,
  Eye,
  Edit,
  Building,
  DollarSign,
  Target,
  Bot,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  BarChart3,
  PieChart,
  Bell,
  X,
} from "lucide-react"

// Mock data
const dashboardMetrics = {
  totalEmailsSent: 1247,
  averageOpenRange: 68.5,
  totalReplies: 89,
}

const aiNotifications = [
  {
    id: 1,
    type: "warning",
    title: "Missing Operator Contact Info",
    message: "3 operators are missing primary contact information. This may affect campaign delivery.",
    action: "Update Contacts",
  },
  {
    id: 2,
    type: "info",
    title: "Promotion Performance Alert",
    message: "Welcome Bonus 200% has low conversion rates. Consider reviewing terms or targeting.",
    action: "Review Campaign",
  },
  {
    id: 3,
    type: "success",
    title: "Integration Complete",
    message: "Royal Games Ltd has successfully integrated 5 new games this week.",
    action: "View Details",
  },
]

const recentEmails = [
  {
    id: 1,
    operatorName: "Sarah Johnson",
    status: "Delivered",
    openRate: 72.3,
    lastReply: "Thanks for the follow-up. I'll review the proposal and get back to you by Friday.",
  },
  {
    id: 2,
    operatorName: "Mike Chen",
    status: "Opened",
    openRate: 45.8,
    lastReply: "Interesting approach. Can we schedule a call to discuss the implementation details?",
  },
  {
    id: 3,
    operatorName: "Emily Rodriguez",
    status: "Replied",
    openRate: 89.2,
    lastReply: "Perfect timing! We were just looking for a solution like this. When can we start?",
  },
]

const campaigns = [
  {
    id: 1,
    operator: "BetMax Casino",
    promotion: "Welcome Bonus 200%",
    startDate: "2024-01-15",
    endDate: "2024-03-15",
    status: "Active",
    performance: "High",
    conversions: 234,
  },
  {
    id: 2,
    operator: "Lucky Spin Gaming",
    promotion: "Free Spins Friday",
    startDate: "2024-01-10",
    endDate: "2024-02-10",
    status: "Active",
    performance: "Medium",
    conversions: 156,
  },
  {
    id: 3,
    operator: "Royal Games Ltd",
    promotion: "VIP Cashback Program",
    startDate: "2024-01-20",
    endDate: "2024-04-20",
    status: "Pending",
    performance: "N/A",
    conversions: 0,
  },
]

const emailCampaigns = [
  {
    id: 1,
    name: "Q4 Game Launch Campaign",
    status: "Active",
    sent: 450,
    opened: 312,
    clicked: 89,
    dateCreated: "2024-01-15",
  },
  {
    id: 2,
    name: "Holiday Bonus Promotion",
    status: "Completed",
    sent: 680,
    opened: 523,
    clicked: 156,
    dateCreated: "2024-01-10",
  },
]

const operators = [
  {
    id: 1,
    name: "BetMax Casino",
    contactEmail: "sarah.johnson@betmax.com",
    contactName: "Sarah Johnson",
    profilePhoto: "/placeholder.svg?height=40&width=40",
    tags: ["VIP", "High Volume"],
    country: "Malta",
    preferredLanguage: "English",
    amAssigned: "John Smith",
    campaignHistory: 12,
    emailsSent: 45,
    engagementStatus: "High",
    outcome: "Active",
    pastPromos: 8,
    promoHistory: "Welcome Bonus, Free Spins, VIP Program",
  },
  {
    id: 2,
    name: "Lucky Spin Gaming",
    contactEmail: "mike.chen@luckyspin.com",
    contactName: "Mike Chen",
    profilePhoto: "/placeholder.svg?height=40&width=40",
    tags: ["New", "Growing"],
    country: "United Kingdom",
    preferredLanguage: "English",
    amAssigned: "Jane Doe",
    campaignHistory: 6,
    emailsSent: 23,
    engagementStatus: "Medium",
    outcome: "Active",
    pastPromos: 3,
    promoHistory: "Welcome Bonus, Tournament",
  },
  {
    id: 3,
    name: "Royal Games Ltd",
    contactEmail: "emily.rodriguez@royalgames.com",
    contactName: "Emily Rodriguez",
    profilePhoto: "/placeholder.svg?height=40&width=40",
    tags: ["Premium", "Enterprise"],
    country: "Gibraltar",
    preferredLanguage: "Spanish",
    amAssigned: "John Smith",
    campaignHistory: 0,
    emailsSent: 12,
    engagementStatus: "Low",
    outcome: "Pending",
    pastPromos: 0,
    promoHistory: "None",
  },
]

const promotions = [
  {
    id: 1,
    name: "Welcome Bonus 200%",
    type: "Deposit Bonus",
    status: "Active",
    operators: 12,
    conversions: 234,
  },
  {
    id: 2,
    name: "Free Spins Friday",
    type: "Free Spins",
    status: "Active",
    operators: 8,
    conversions: 567,
  },
]

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

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    case "Delivered":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    case "Opened":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30"
    case "Replied":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    case "Bounced":
      return "bg-red-500/20 text-red-400 border-red-500/30"
    case "Completed":
      return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    case "Draft":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    case "Pending":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30"
    case "High":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    case "Medium":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30"
    case "Low":
      return "bg-red-500/20 text-red-400 border-red-500/30"
    default:
      return "bg-slate-500/20 text-slate-400 border-slate-500/30"
  }
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-amber-400" />
    case "success":
      return <CheckCircle className="h-5 w-5 text-emerald-400" />
    case "info":
      return <Clock className="h-5 w-5 text-blue-400" />
    default:
      return <Bell className="h-5 w-5 text-slate-400" />
  }
}

export default function Component() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedWidgets, setSelectedWidgets] = useState(["metrics", "emails", "notifications"])
  const [dismissedNotifications, setDismissedNotifications] = useState<number[]>([])
  const [showCompletedTasks, setShowCompletedTasks] = useState(false)

  const dismissNotification = (id: number) => {
    setDismissedNotifications([...dismissedNotifications, id])
  }

  const toggleWidget = (widgetId: string) => {
    setSelectedWidgets((prev) => (prev.includes(widgetId) ? prev.filter((id) => id !== widgetId) : [...prev, widgetId]))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Modern Navigation Bar */}
      <div className="border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Account Manager Portal
              </h1>
              <p className="text-slate-400 mt-1">Manage your gaming operator relationships</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
              <TabsTrigger
                value="dashboard"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="campaigns"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200"
              >
                Campaigns
              </TabsTrigger>
              <TabsTrigger
                value="emails"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200"
              >
                Emails
              </TabsTrigger>
              <TabsTrigger
                value="operators"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200"
              >
                Operators
              </TabsTrigger>
              <TabsTrigger
                value="promotions"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200"
              >
                Promotions
              </TabsTrigger>
              <TabsTrigger
                value="add"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200"
              >
                Customize
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {selectedWidgets.includes("notifications") && (
              <Card className="bg-gradient-to-r from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4 text-blue-400" />
                      <CardTitle className="text-lg font-semibold text-white">AI Assistant</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant={showCompletedTasks ? "default" : "outline"}
                        onClick={() => setShowCompletedTasks(!showCompletedTasks)}
                        className="h-7 text-xs"
                      >
                        {showCompletedTasks ? "Show Todo" : "Show Done"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {aiNotifications
                      .filter((notification) => !dismissedNotifications.includes(notification.id))
                      .filter((notification) =>
                        showCompletedTasks ? notification.type === "success" : notification.type !== "success",
                      )
                      .map((notification) => (
                        <div
                          key={notification.id}
                          className="flex items-center space-x-3 p-3 rounded-md bg-slate-800/30 border border-slate-700/20 hover:bg-slate-800/50 transition-colors"
                        >
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{notification.title}</p>
                            <p className="text-xs text-slate-400 truncate">{notification.message}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => dismissNotification(notification.id)}
                              className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedWidgets.includes("metrics") && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/20 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-white">Total Emails Sent</CardTitle>
                    <Mail className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {dashboardMetrics.totalEmailsSent.toLocaleString()}
                    </div>
                    <p className="text-xs text-emerald-400 mt-1">+12% from last month</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 border-emerald-500/20 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-white">Average Open Range</CardTitle>
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{dashboardMetrics.averageOpenRange}%</div>
                    <p className="text-xs text-emerald-400 mt-1">+2.3% from last month</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/20 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-white">Total Replies</CardTitle>
                    <MessageSquare className="h-4 w-4 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{dashboardMetrics.totalReplies}</div>
                    <p className="text-xs text-emerald-400 mt-1">+8 from yesterday</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedWidgets.includes("emails") && (
              <Card className="bg-slate-900/90 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-white">Recent Email Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Operator Name</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">Average Open Range</TableHead>
                        <TableHead className="text-slate-300">Last Reply</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentEmails.map((email) => (
                        <TableRow key={email.id} className="border-slate-700 hover:bg-slate-800/50">
                          <TableCell className="font-medium text-white">{email.operatorName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(email.status)}>
                              {email.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {email.openRate > 0 ? `${email.openRate}%` : "—"}
                          </TableCell>
                          <TableCell className="text-slate-400 max-w-md truncate">{email.lastReply}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Campaign Management</h2>
                <p className="text-slate-400">Track operator promotional campaigns and performance</p>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Campaign
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 border-emerald-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-white">Active Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">2</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-white">Total Conversions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">390</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-white">Avg Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">High</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-900/20 to-amber-800/20 border-amber-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-white">Pending Setup</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">1</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-900/90 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">Campaign Overview</CardTitle>
                <p className="text-slate-400">Operator-specific promotional campaigns with dates and performance</p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Operator</TableHead>
                      <TableHead className="text-slate-300">Promotion</TableHead>
                      <TableHead className="text-slate-300">Start Date</TableHead>
                      <TableHead className="text-slate-300">End Date</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Performance</TableHead>
                      <TableHead className="text-slate-300">Conversions</TableHead>
                      <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id} className="border-slate-700 hover:bg-slate-800/50">
                        <TableCell className="font-medium text-white">{campaign.operator}</TableCell>
                        <TableCell className="text-slate-300">{campaign.promotion}</TableCell>
                        <TableCell className="text-slate-300">{campaign.startDate}</TableCell>
                        <TableCell className="text-slate-300">{campaign.endDate}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(campaign.performance)}>
                            {campaign.performance}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300">{campaign.conversions}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emails Tab */}
          <TabsContent value="emails" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Email Campaigns</h2>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-white">Active Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">2</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 border-emerald-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-white">Total Sent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">1,130</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-white">Total Opened</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">835</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-900/20 to-amber-800/20 border-amber-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-white">Total Clicked</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">245</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-900/90 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Campaign Name</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Sent</TableHead>
                      <TableHead className="text-slate-300">Opened</TableHead>
                      <TableHead className="text-slate-300">Clicked</TableHead>
                      <TableHead className="text-slate-300">Date Created</TableHead>
                      <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailCampaigns.map((campaign) => (
                      <TableRow key={campaign.id} className="border-slate-700 hover:bg-slate-800/50">
                        <TableCell className="font-medium text-white">{campaign.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300">{campaign.sent}</TableCell>
                        <TableCell className="text-slate-300">{campaign.opened}</TableCell>
                        <TableCell className="text-slate-300">{campaign.clicked}</TableCell>
                        <TableCell className="text-slate-300">{campaign.dateCreated}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Operators Tab */}
          <TabsContent value="operators" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Operators Management</h2>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Operator
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-white">Total Operators</CardTitle>
                  <Building className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{operators.length}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 border-emerald-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-white">Active Operators</CardTitle>
                  <Users className="h-4 w-4 text-emerald-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">2</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-900/20 to-amber-800/20 border-amber-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-white">Total Campaigns</CardTitle>
                  <Target className="h-4 w-4 text-amber-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">18</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-white">Avg Engagement</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">Medium</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-900/90 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">Operators Directory</CardTitle>
                <p className="text-slate-400">Comprehensive operator information and relationship management</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Operator</TableHead>
                        <TableHead className="text-slate-300">Contact Info</TableHead>
                        <TableHead className="text-slate-300">Location</TableHead>
                        <TableHead className="text-slate-300">AM Assigned</TableHead>
                        <TableHead className="text-slate-300">Engagement</TableHead>
                        <TableHead className="text-slate-300">Campaigns</TableHead>
                        <TableHead className="text-slate-300">Promotions</TableHead>
                        <TableHead className="text-slate-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {operators.map((operator) => (
                        <TableRow key={operator.id} className="border-slate-700 hover:bg-slate-800/50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <img
                                src={operator.profilePhoto || "/placeholder.svg"}
                                alt={operator.name}
                                className="h-10 w-10 rounded-full bg-slate-700"
                              />
                              <div>
                                <div className="font-medium text-white">{operator.name}</div>
                                <div className="flex space-x-1 mt-1">
                                  {operator.tags.map((tag, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-slate-300 font-medium">{operator.contactName}</div>
                              <div className="text-slate-400 text-sm">{operator.contactEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-slate-300">{operator.country}</div>
                              <div className="text-slate-400 text-sm">{operator.preferredLanguage}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-300">{operator.amAssigned}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant="outline" className={getStatusColor(operator.engagementStatus)}>
                                {operator.engagementStatus}
                              </Badge>
                              <div className="text-slate-400 text-sm">{operator.emailsSent} emails sent</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-slate-300">{operator.campaignHistory} total</div>
                              <Badge variant="outline" className={getStatusColor(operator.outcome)}>
                                {operator.outcome}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-slate-300">{operator.pastPromos} completed</div>
                              <div className="text-slate-400 text-xs max-w-32 truncate" title={operator.promoHistory}>
                                {operator.promoHistory}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                                <Send className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Promotions Tab */}
          <TabsContent value="promotions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Promotions Management</h2>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Promotion
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900/90 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-white">Create New Promotion</CardTitle>
                  <p className="text-slate-400">Design promotional offers for operators to implement</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="promo-name" className="text-slate-300">
                      Promotion Name
                    </Label>
                    <Input
                      id="promo-name"
                      placeholder="Enter promotion name"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="promo-type" className="text-slate-300">
                      Promotion Type
                    </Label>
                    <Select>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select promotion type" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="deposit">Deposit Bonus</SelectItem>
                        <SelectItem value="freespins">Free Spins</SelectItem>
                        <SelectItem value="cashback">Cashback</SelectItem>
                        <SelectItem value="tournament">Tournament</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-slate-300">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Enter promotion description and terms"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Create Promotion Template
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/90 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-white">Promotion Templates</CardTitle>
                  <p className="text-slate-400">Available promotional offers for operators</p>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Name</TableHead>
                        <TableHead className="text-slate-300">Type</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">Operators</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {promotions.map((promo) => (
                        <TableRow key={promo.id} className="border-slate-700 hover:bg-slate-800/50">
                          <TableCell className="font-medium text-white">{promo.name}</TableCell>
                          <TableCell className="text-slate-300">{promo.type}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(promo.status)}>
                              {promo.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-300">{promo.operators}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Customize Tab */}
          <TabsContent value="add" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Customize Your Dashboard</h2>
              <p className="text-slate-400">Select which widgets to display on your dashboard</p>
            </div>

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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
