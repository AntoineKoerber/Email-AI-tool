import { type NextRequest, NextResponse } from "next/server"
import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_DEMO_MODE } from "@/lib/supabase"
import { mockIncentives } from "@/lib/mockData"

// Transform Supabase data to match Airtable structure for frontend compatibility
function transformIncentiveRecord(record: any) {
  return {
    id: record.id,
    fields: {
      "Incentive Name": record.name,
      Name: record.name, // Alias for compatibility
      Description: record.description,
      "Promo Keywords": record.incentive_keywords || [],
      Tags: record.tags || [],
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("POST request body:", body)

    // Transform records from Airtable format to Supabase format
    const supabaseRecord = {
      name: body.fields["Incentive Name"],
      description: body.fields.Description,
      incentive_keywords: body.fields["Promo Keywords"] || [],
      tags: body.fields.Tags || [],
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/incentives`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(supabaseRecord),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Supabase error response:", errorData)
      throw new Error(`Supabase error: ${response.status}`)
    }

    const data = await response.json()
    const transformedRecords = Array.isArray(data)
      ? data.map(transformIncentiveRecord)
      : [transformIncentiveRecord(data)]

    return NextResponse.json({
      records: transformedRecords,
    })
  } catch (error) {
    console.error("Error creating incentives:", error)
    return NextResponse.json({ error: "Failed to create incentives" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("PATCH request body:", body)

    const recordId = body.recordId
    const updateData: any = {}

    if (body.fields["Incentive Name"]) updateData.name = body.fields["Incentive Name"]
    if (body.fields.Description) updateData.description = body.fields.Description
    if (body.fields["Promo Keywords"]) updateData.incentive_keywords = body.fields["Promo Keywords"]
    if (body.fields.Tags) updateData.tags = body.fields.Tags

    const response = await fetch(`${SUPABASE_URL}/rest/v1/incentives?id=eq.${recordId}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Supabase error response:", errorData)
      throw new Error(`Supabase error: ${response.status}`)
    }

    const data = await response.json()
    const transformedRecords = Array.isArray(data)
      ? data.map(transformIncentiveRecord)
      : [transformIncentiveRecord(data)]

    return NextResponse.json({
      records: transformedRecords,
    })
  } catch (error) {
    console.error("Error updating incentives:", error)
    return NextResponse.json({ error: "Failed to update incentives" }, { status: 500 })
  }
}
