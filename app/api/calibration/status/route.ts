import { NextResponse } from "next/server"
import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_DEMO_MODE } from "@/lib/supabase"
import { mockCalibration } from "@/lib/mockData"

export async function GET() {
  try {
    // Return mock data in demo mode
    if (IS_DEMO_MODE) {
      return NextResponse.json({
        completed: true,
        calibration: mockCalibration,
      })
    }

    // Use numeric ID instead of string
    const accountManagerId = 1

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/account_managers?id=eq.${accountManagerId}&select=calibration_questions`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      // Return false by default if we can't check
      return NextResponse.json({ completed: false })
    }

    const data = await response.json()
    console.log("Calibration status data:", data)

    // ----------  SAFER PARSING & VALIDATION  ----------
    const raw = data?.[0]?.calibration_questions

    // raw can be: null | string | object
    let calibrationData: any = null
    let completed = false

    if (raw !== null && raw !== undefined) {
      if (typeof raw === "string") {
        const trimmed = raw.trim()
        if (trimmed.length > 0) {
          try {
            calibrationData = JSON.parse(trimmed)
            completed = true
          } catch (parseErr) {
            console.error("Error parsing calibration JSON:", parseErr)
            // Treat as not completed if malformed
          }
        }
      } else if (typeof raw === "object") {
        calibrationData = raw
        completed = true
      }
    }

    if (completed && calibrationData) {
      // Ensure timestamp exists
      if (!calibrationData.completed_at) {
        calibrationData.completed_at = new Date().toISOString()
      }

      return NextResponse.json({
        completed: true,
        calibration: calibrationData,
      })
    }

    // If we reach here, no valid calibration present
    return NextResponse.json({ completed: false })
    // ---------------------------------------------------
  } catch (error) {
    console.error("Error checking calibration status:", error)
    // Return false by default if there's an error
    return NextResponse.json({ completed: false })
  }
}
