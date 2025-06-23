import { NextResponse } from "next/server"

const SUPABASE_URL = "https://kojsqibukbqamtngxrsc.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvanNxaWJ1a2JxYW10bmd4cnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MDA2NjksImV4cCI6MjA2NTM3NjY2OX0.4PVEtHMI2UAxNKEWO3etaSg8_qff7vPiyd90FkICCtE"

// Transform Supabase data to match Airtable structure for frontend compatibility
function transformIncentiveRecord(record: any) {
  return {
    id: record.id,
    fields: {
      name: record.name,
      Name: record.name, // Alias for compatibility
      "Incentive Name": record.name, // Another alias
    },
    createdTime: record.created_at,
  }
}

export async function GET() {
  try {
    console.log("Fetching incentives from Supabase...")

    const response = await fetch(`${SUPABASE_URL}/rest/v1/incentives?select=*`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("Supabase error:", response.status, response.statusText)
      throw new Error(`Supabase error: ${response.status}`)
    }

    const data = await response.json()
    console.log("Raw incentives data from Supabase:", data)

    // Transform data to match Airtable structure
    const transformedRecords = data.map(transformIncentiveRecord)
    console.log("Transformed incentives records:", transformedRecords)

    return NextResponse.json({
      records: transformedRecords,
    })
  } catch (error) {
    console.error("Error fetching incentives:", error)
    return NextResponse.json({ error: "Failed to fetch incentives" }, { status: 500 })
  }
}
