"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RefreshCw, CheckCircle, AlertCircle, SettingsIcon, User, Mail } from "lucide-react"
import DashboardLayout from "@/components/layout"

interface CalibrationData {
  greeting: string
  follow_up: string
  excitement: string
  tone: string
  completed_at: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [calibrationData, setCalibrationData] = useState<CalibrationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasCalibration, setHasCalibration] = useState(false)

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

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">Manage your account preferences and calibration settings</p>
        </div>

        {/* Email Style Calibration Section */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="h-6 w-6 text-blue-400" />
                <div>
                  <CardTitle className="text-white">Email Style Calibration</CardTitle>
                  <CardDescription className="text-slate-300">
                    Your personalized email communication preferences
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
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
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
                <p className="text-slate-400 mb-4">
                  Complete your email style calibration to personalize your templates
                </p>
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

        {/* Account Settings Section */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6 text-blue-400" />
              <div>
                <CardTitle className="text-white">Account Settings</CardTitle>
                <CardDescription className="text-slate-300">
                  Manage your account preferences and profile
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-slate-400 text-sm">
              Additional account settings will be available here in future updates.
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
