import { NextResponse } from "next/server"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kojsqibukbqamtngxrsc.supabase.co"
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvanNxaWJ1a2JxYW10bmd4cnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MDA2NjksImV4cCI6MjA2NTM3NjY2OX0.4PVEtHMI2UAxNKEWO3etaSg8_qff7vPiyd90FkICCtE"

export async function GET() {
  try {
    console.log("Checking calibration status...")

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

    console.log("Supabase response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Supabase error:", errorText)
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
