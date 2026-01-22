import { type NextRequest, NextResponse } from "next/server"
import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_DEMO_MODE } from "@/lib/supabase"
import { mockCalibration } from "@/lib/mockData"

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
