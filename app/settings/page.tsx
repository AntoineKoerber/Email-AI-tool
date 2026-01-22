"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { toast } from "@/hooks/use-toast"
import {
  RefreshCw,
  CheckCircle,
  AlertCircle,
  SettingsIcon,
  User,
  Mail,
  ChevronDown,
  ChevronRight,
  Bell,
  Calendar,
  Shield,
  Link,
  LogOut,
  Globe,
  MessageSquare,
} from "lucide-react"
import DashboardLayout from "@/components/layout"

interface CalibrationData {
  greeting: string
  follow_up: string
  excitement: string
  tone: string
  completed_at: string
}

interface SettingsState {
  personalInfo: {
    fullName: string
    email: string
    timeZone: string
    defaultSignature: string
  }
  notifications: {
    slackNegativeReplies: boolean
    slackCalendlyBookings: boolean
    slack24hNoBooking: boolean
    slackChannel: string
  }
  calendly: {
    calendlyLink: string
    preFillToken: string
  }
  emailDefaults: {
    followUpInterval: string
    preferredContact: string
    addSignature: boolean
  }
  linkedServices: {
    outlookConnected: boolean
    slackConnected: boolean
    supabaseUserId: string
  }
  security: {}
}

export default function SettingsPage() {
  const router = useRouter()
  const [calibrationData, setCalibrationData] = useState<CalibrationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasCalibration, setHasCalibration] = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personalInfo: true,
    notifications: true,
    calendly: true,
    emailDefaults: true,
    linkedServices: true,
    security: true,
  })

  const [settings, setSettings] = useState<SettingsState>({
    personalInfo: {
      fullName: "John Doe",
      email: "john.doe@company.com",
      timeZone: "Europe/Berlin",
      defaultSignature: "John",
    },
    notifications: {
      slackNegativeReplies: true,
      slackCalendlyBookings: true,
      slack24hNoBooking: false,
      slackChannel: "#notifications",
    },
    calendly: {
      calendlyLink: "https://calendly.com/johndoe",
      preFillToken: "cal_token_123456",
    },
    emailDefaults: {
      followUpInterval: "48h",
      preferredContact: "Email",
      addSignature: true,
    },
    linkedServices: {
      outlookConnected: true,
      slackConnected: false,
      supabaseUserId: "user_abc123",
    },
    security: {},
  })

  useEffect(() => {
    fetchCalibrationData()
  }, [])

  const fetchCalibrationData = async () => {
    try {
      const response = await fetch("/api/calibration/status")
      const data = await response.json()

      if (data.completed && data.calibration) {
        setCalibrationData(data.calibration)
        setHasCalibration(true)
      }
    } catch (error) {
      console.error("Error fetching calibration data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetakeCalibration = () => {
    router.push("/calibration?retake=true")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleInputChange = (section: keyof SettingsState, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))

    // Show confirmation toast
    toast({
      title: "Setting Updated",
      description: "Your changes have been saved successfully.",
      duration: 2000,
    })
  }

  const handleLogout = () => {
    toast({
      title: "Logging Out",
      description: "You will be redirected to the login page.",
      duration: 2000,
    })
    // Add logout logic here
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">Manage your account preferences and system configuration</p>
        </div>

        {/* AI Tone Calibration Section */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-6 w-6 text-blue-400" />
                <div>
                  <CardTitle className="text-white">AI Tone Calibration</CardTitle>
                  <CardDescription className="text-slate-300">
                    Your personalized AI communication preferences
                  </CardDescription>
                </div>
              </div>
              {hasCalibration ? (
                <Badge variant="secondary" className="bg-green-900/50 text-green-300 border-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-orange-900/50 text-orange-300 border-orange-700">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-slate-400">Loading calibration data...</div>
            ) : hasCalibration && calibrationData ? (
              <div className="space-y-4">
                <div className="text-sm text-slate-400 mb-4">
                  Last updated: {formatDate(calibrationData.completed_at)}
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-300">Email Greeting Style</h4>
                    <p className="text-slate-400 text-sm bg-slate-800/50 p-3 rounded-md">
                      "{calibrationData.greeting}"
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-300">Follow-up Approach</h4>
                    <p className="text-slate-400 text-sm bg-slate-800/50 p-3 rounded-md">
                      "{calibrationData.follow_up}"
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-300">Excitement Expression</h4>
                    <p className="text-slate-400 text-sm bg-slate-800/50 p-3 rounded-md">
                      "{calibrationData.excitement}"
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-300">Communication Tone</h4>
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      {calibrationData.tone}
                    </Badge>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm text-slate-400">Want to update your communication style?</div>
                  <Button
                    onClick={handleRetakeCalibration}
                    variant="outline"
                    className="border-slate-600 text-black hover:bg-black hover:text-white"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retake Calibration
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Calibration Not Completed</h3>
                <p className="text-slate-400 mb-4">Complete your AI tone calibration to personalize your templates</p>
                <Button
                  onClick={handleRetakeCalibration}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Start Calibration
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Personal Info Section */}
        <Card className="bg-slate-900/50 border-slate-700">
          <Collapsible open={openSections.personalInfo} onOpenChange={() => toggleSection("personalInfo")}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="h-6 w-6 text-blue-400" />
                    <div>
                      <CardTitle className="text-white">Personal Information</CardTitle>
                      <CardDescription className="text-slate-300">
                        Manage your personal details and preferences
                      </CardDescription>
                    </div>
                  </div>
                  {openSections.personalInfo ? (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-slate-300">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      value={settings.personalInfo.fullName}
                      onChange={(e) => handleInputChange("personalInfo", "fullName", e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.personalInfo.email}
                      onChange={(e) => handleInputChange("personalInfo", "email", e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeZone" className="text-slate-300">
                      Time Zone
                    </Label>
                    <Select
                      value={settings.personalInfo.timeZone}
                      onValueChange={(value) => handleInputChange("personalInfo", "timeZone", value)}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="Europe/Berlin">Europe/Berlin (CEST)</SelectItem>
                        <SelectItem value="Europe/Malta">Europe/Malta (CET)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultSignature" className="text-slate-300">
                      Default Signature Name
                    </Label>
                    <Input
                      id="defaultSignature"
                      value={settings.personalInfo.defaultSignature}
                      onChange={(e) => handleInputChange("personalInfo", "defaultSignature", e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder="e.g., John"
                    />
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Notification Preferences Section */}
        <Card className="bg-slate-900/50 border-slate-700">
          <Collapsible open={openSections.notifications} onOpenChange={() => toggleSection("notifications")}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-6 w-6 text-blue-400" />
                    <div>
                      <CardTitle className="text-white">Notification Preferences</CardTitle>
                      <CardDescription className="text-slate-300">
                        Configure when and how you receive notifications
                      </CardDescription>
                    </div>
                  </div>
                  {openSections.notifications ? (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-slate-300">Slack notification on negative replies</Label>
                      <p className="text-sm text-slate-400">Get notified when prospects respond negatively</p>
                    </div>
                    <Switch
                      checked={settings.notifications.slackNegativeReplies}
                      onCheckedChange={(checked) => handleInputChange("notifications", "slackNegativeReplies", checked)}
                      className="border border-white"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-slate-300">Slack notification on Calendly bookings</Label>
                      <p className="text-sm text-slate-400">Get notified when someone books a meeting</p>
                    </div>
                    <Switch
                      checked={settings.notifications.slackCalendlyBookings}
                      onCheckedChange={(checked) =>
                        handleInputChange("notifications", "slackCalendlyBookings", checked)
                      }
                      className="border border-white"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-slate-300">Slack notification after 24h without booking</Label>
                      <p className="text-sm text-slate-400">Get reminded about prospects who haven't booked</p>
                    </div>
                    <Switch
                      checked={settings.notifications.slack24hNoBooking}
                      onCheckedChange={(checked) => handleInputChange("notifications", "slack24hNoBooking", checked)}
                      className="border border-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slackChannel" className="text-slate-300">
                      Slack Channel / Email to notify
                    </Label>
                    <Input
                      id="slackChannel"
                      value={settings.notifications.slackChannel}
                      onChange={(e) => handleInputChange("notifications", "slackChannel", e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder="#notifications or email@company.com"
                    />
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Calendly Settings Section */}
        <Card className="bg-slate-900/50 border-slate-700">
          <Collapsible open={openSections.calendly} onOpenChange={() => toggleSection("calendly")}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-6 w-6 text-blue-400" />
                    <div>
                      <CardTitle className="text-white">Calendly Settings</CardTitle>
                      <CardDescription className="text-slate-300">
                        Configure your calendar booking integration
                      </CardDescription>
                    </div>
                  </div>
                  {openSections.calendly ? (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="calendlyLink" className="text-slate-300">
                      Calendly Link
                    </Label>
                    <Input
                      id="calendlyLink"
                      value={settings.calendly.calendlyLink}
                      onChange={(e) => handleInputChange("calendly", "calendlyLink", e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder="https://calendly.com/your-username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preFillToken" className="text-slate-300">
                      Pre-fill Token Key
                    </Label>
                    <Input
                      id="preFillToken"
                      value={settings.calendly.preFillToken}
                      onChange={(e) => handleInputChange("calendly", "preFillToken", e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder="Used for linking emails to bookings"
                    />
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Default Email Settings Section */}
        <Card className="bg-slate-900/50 border-slate-700">
          <Collapsible open={openSections.emailDefaults} onOpenChange={() => toggleSection("emailDefaults")}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-6 w-6 text-blue-400" />
                    <div>
                      <CardTitle className="text-white">Default Email Settings</CardTitle>
                      <CardDescription className="text-slate-300">
                        Configure default behavior for email campaigns
                      </CardDescription>
                    </div>
                  </div>
                  {openSections.emailDefaults ? (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="followUpInterval" className="text-slate-300">
                      Follow-up Intervals
                    </Label>
                    <Select
                      value={settings.emailDefaults.followUpInterval}
                      onValueChange={(value) => handleInputChange("emailDefaults", "followUpInterval", value)}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="24h">24 hours</SelectItem>
                        <SelectItem value="48h">48 hours</SelectItem>
                        <SelectItem value="72h">72 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferredContact" className="text-slate-300">
                      Preferred Contact Method
                    </Label>
                    <Select
                      value={settings.emailDefaults.preferredContact}
                      onValueChange={(value) => handleInputChange("emailDefaults", "preferredContact", value)}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="Slack">Slack</SelectItem>
                        <SelectItem value="Skype">Skype</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-slate-300">Add Signature to Emails</Label>
                    <p className="text-sm text-slate-400">
                      Automatically add "Cheers, {settings.personalInfo.defaultSignature}" to emails
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailDefaults.addSignature}
                    onCheckedChange={(checked) => handleInputChange("emailDefaults", "addSignature", checked)}
                    className="border border-white"
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Linked Services Section */}
        <Card className="bg-slate-900/50 border-slate-700">
          <Collapsible open={openSections.linkedServices} onOpenChange={() => toggleSection("linkedServices")}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Link className="h-6 w-6 text-blue-400" />
                    <div>
                      <CardTitle className="text-white">Linked Services</CardTitle>
                      <CardDescription className="text-slate-300">
                        Manage your connected third-party services
                      </CardDescription>
                    </div>
                  </div>
                  {openSections.linkedServices ? (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-slate-400" />
                      <div>
                        <Label className="text-slate-300">Outlook</Label>
                        <p className="text-sm text-slate-400">Email integration</p>
                      </div>
                    </div>
                    <Badge
                      variant={settings.linkedServices.outlookConnected ? "secondary" : "outline"}
                      className={
                        settings.linkedServices.outlookConnected
                          ? "bg-green-900/50 text-green-300 border-green-700"
                          : "bg-red-900/50 text-red-300 border-red-700"
                      }
                    >
                      {settings.linkedServices.outlookConnected ? "Connected" : "Not Connected"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="h-5 w-5 text-slate-400" />
                      <div>
                        <Label className="text-slate-300">Slack</Label>
                        <p className="text-sm text-slate-400">Notification integration</p>
                      </div>
                    </div>
                    <Badge
                      variant={settings.linkedServices.slackConnected ? "secondary" : "outline"}
                      className={
                        settings.linkedServices.slackConnected
                          ? "bg-green-900/50 text-green-300 border-green-700"
                          : "bg-red-900/50 text-red-300 border-red-700"
                      }
                    >
                      {settings.linkedServices.slackConnected ? "Connected" : "Not Connected"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supabaseUserId" className="text-slate-300">
                      Supabase User ID
                    </Label>
                    <Input
                      id="supabaseUserId"
                      value={settings.linkedServices.supabaseUserId}
                      onChange={(e) => handleInputChange("linkedServices", "supabaseUserId", e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder="Optional, for advanced usage"
                    />
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Security & Access Section */}
        <Card className="bg-slate-900/50 border-slate-700">
          <Collapsible open={openSections.security} onOpenChange={() => toggleSection("security")}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-6 w-6 text-blue-400" />
                    <div>
                      <CardTitle className="text-white">Security & Access</CardTitle>
                      <CardDescription className="text-slate-300">
                        Manage your account security and API access
                      </CardDescription>
                    </div>
                  </div>
                  {openSections.security ? (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="changePassword" className="text-slate-300">
                      Change Password
                    </Label>
                    <Input
                      id="changePassword"
                      type="password"
                      placeholder="Enter new password"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <Separator className="bg-slate-700" />
                  <div className="flex justify-end">
                    <Button onClick={handleLogout} variant="destructive" className="bg-red-600 hover:bg-red-700">
                      <LogOut className="h-4 w-4 mr-2" />
                      Log Out
                    </Button>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </DashboardLayout>
  )
}
