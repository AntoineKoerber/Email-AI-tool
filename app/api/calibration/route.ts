import { type NextRequest, NextResponse } from "next/server"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kojsqibukbqamtngxrsc.supabase.co"
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvanNxaWJ1a2JxYW10bmd4cnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MDA2NjksImV4cCI6MjA2NTM3NjY2OX0.4PVEtHMI2UAxNKEWO3etaSg8_qff7vPiyd90FkICCtE"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { answers } = body

    console.log("Saving calibration answers:", answers)

    // Prepare the calibration data as JSON string
    const calibrationData = JSON.stringify({
      greeting: answers.greeting || "",
      follow_up: answers.follow_up || "",
      excitement: answers.excitement || "",
      tone: answers.tone || "",
      completed_at: new Date().toISOString(),
    })

    console.log("Prepared calibration data:", calibrationData)

    // Update the existing record with id=1
    const response = await fetch(`${SUPABASE_URL}/rest/v1/account_managers?id=eq.1`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        calibration_questions: calibrationData,
      }),
    })

    console.log("Response status:", response.status)
    console.log("Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Supabase error response:", errorText)
      throw new Error(`Supabase error: ${response.status} - ${errorText}`)
    }

    console.log("Successfully updated calibration for Henri Forbes")

    return NextResponse.json({
      success: true,
      message: "Calibration updated successfully",
    })
  } catch (error) {
    console.error("Error updating calibration:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
