"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CalibrationBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user has completed calibration
    checkCalibrationStatus()
  }, [])

  const checkCalibrationStatus = async () => {
    try {
      console.log("Checking calibration status...")
      const response = await fetch("/api/calibration/status")

      if (!response.ok) {
        console.error("Failed to fetch calibration status, showing banner by default")
        setIsVisible(true)
        return
      }

      const data = await response.json()
      console.log("Calibration status:", data)
      setIsVisible(!data.completed)
    } catch (error) {
      console.error("Error checking calibration status:", error)
      // Show banner if we can't check status (better safe than sorry)
      setIsVisible(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
  }

  if (isLoading || !isVisible) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-red-600 to-orange-600 border-l-4 border-red-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-white animate-pulse" />
            <div>
              <p className="text-white font-semibold text-sm sm:text-base">
                🚨 REQUIRED: Complete Your Email Style Calibration
              </p>
              <p className="text-red-100 text-xs sm:text-sm">
                Help us personalize your email templates by answering 4 quick questions
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/calibration">
              <Button size="sm" className="bg-white text-red-600 hover:bg-red-50 font-semibold shadow-md">
                Complete Now
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleDismiss} className="text-white hover:bg-red-700/50 p-1">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
