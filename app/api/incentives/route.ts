import { NextResponse } from "next/server"
import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_DEMO_MODE } from "@/lib/supabase"
import { mockIncentives } from "@/lib/mockData"

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
    // Return mock data in demo mode
    if (IS_DEMO_MODE) {
      const transformedRecords = mockIncentives.map(transformIncentiveRecord)
      return NextResponse.json({ records: transformedRecords })
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/incentives?select=*`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status}`)
    }

    const data = await response.json()

    // Transform data to match Airtable structure
    const transformedRecords = data.map(transformIncentiveRecord)

    return NextResponse.json({
      records: transformedRecords,
    })
  } catch (error) {
    console.error("Error fetching incentives:", error)
    return NextResponse.json({ error: "Failed to fetch incentives" }, { status: 500 })
  }
}
