import { type NextRequest, NextResponse } from "next/server"
import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_DEMO_MODE } from "@/lib/supabase"
import { mockOperators } from "@/lib/mockData"

// Helper function to handle the specific operator ID change
function normalizeOperatorId(operatorId: string): string {
  if (operatorId === "6 bis") {
    return "6_bis"
  }
  return operatorId
}

// Helper function to generate a unique ID
function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Helper function to format tags as plain text
function formatTags(tags: any): string[] {
  if (!tags) return []
  if (Array.isArray(tags)) return tags
  if (typeof tags === "string") return [tags]
  return []
}

// Transform Supabase data to match Airtable structure for frontend compatibility
function transformOperatorRecord(record: any) {
  return {
    id: record.id, // Use the unique id field
    fields: {
      "Operator Name": record.operator,
      "Contact Name": record.contact_name,
      Country: record.market,
      "Preferred Language": record.language,
      "Contact Email": record.contact_email,
      Tags: formatTags(record.tags), // Format tags as plain text array
      "Engagement Status": record.engagement_status
        ? record.engagement_status.charAt(0).toUpperCase() + record.engagement_status.slice(1)
        : null,
      "Communication Preference": record.pref_comm || "unknown",
      "Last Modified Time": record.updated_at || record.created_at,
    },
    createdTime: record.created_at,
  }
}

export async function GET() {
  try {
    // Return mock data in demo mode
    if (IS_DEMO_MODE) {
      const transformedRecords = mockOperators.map(transformOperatorRecord)
      return NextResponse.json({ records: transformedRecords })
    }

    // Try with proper Supabase ordering syntax
    const response = await fetch(`${SUPABASE_URL}/rest/v1/operators?select=*&order=created_at.desc`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
    })

    // If ordering fails, try without ordering
    if (!response.ok) {
      console.warn("Ordering failed, trying without order parameter")
      const fallbackResponse = await fetch(`${SUPABASE_URL}/rest/v1/operators?select=*`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
      })

      if (!fallbackResponse.ok) {
        throw new Error(`Supabase error: ${fallbackResponse.status}`)
      }

      const data = await fallbackResponse.json()
      console.log("Raw Supabase operators data (fallback):", data)

      // Transform and sort on frontend side
      const transformedRecords = data
        .map(transformOperatorRecord)
        .sort((a: any, b: any) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime())

      console.log("Transformed operators data (sorted):", transformedRecords)

      return NextResponse.json({
        records: transformedRecords,
      })
    }

    const data = await response.json()
    console.log("Raw Supabase operators data:", data)

    // Transform data to match Airtable structure
    const transformedRecords = data.map(transformOperatorRecord)
    console.log("Transformed operators data:", transformedRecords)

    return NextResponse.json({
      records: transformedRecords,
    })
  } catch (error) {
    console.error("Error fetching operators:", error)
    return NextResponse.json({ error: "Failed to fetch operators" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("POST request body:", body)

    // Generate a unique ID for the new record
    const uniqueId = generateUniqueId()

    // Build the record with required fields including the unique ID
    const supabaseRecord: any = {
      id: uniqueId, // Add unique ID
      operator: body.records[0].fields["Operator Name"],
      market: body.records[0].fields.Country,
      language: body.records[0].fields["Preferred Language"],
      contact_email: body.records[0].fields["Contact Email"],
    }

    // Add Contact Name if provided
    if (body.records[0].fields["Contact Name"]) {
      supabaseRecord.contact_name = body.records[0].fields["Contact Name"]
    }

    // Only add optional fields if they exist and have values
    if (body.records[0].fields.Tags && body.records[0].fields.Tags.length > 0) {
      supabaseRecord.tags = body.records[0].fields.Tags // Store as array
    }

    if (body.records[0].fields["Engagement Status"] && body.records[0].fields["Engagement Status"] !== "none") {
      // Map frontend values to Supabase enum values
      const statusMap: { [key: string]: string } = {
        Hot: "hot",
        Medium: "medium",
        Cold: "cold",
      }
      const frontendStatus = body.records[0].fields["Engagement Status"]
      supabaseRecord.engagement_status = statusMap[frontendStatus] || frontendStatus.toLowerCase()
    }

    // Add communication preference
    if (body.records[0].fields["Communication Preference"]) {
      supabaseRecord.pref_comm = body.records[0].fields["Communication Preference"]
    }

    console.log("Attempting to insert with unique ID:", supabaseRecord)

    const response = await fetch(`${SUPABASE_URL}/rest/v1/operators`, {
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
      throw new Error(`Supabase error: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    console.log("Supabase response:", data)

    // Handle both single object and array responses
    const records = Array.isArray(data) ? data : [data]
    const transformedRecords = records.map(transformOperatorRecord)

    return NextResponse.json({
      records: transformedRecords,
    })
  } catch (error) {
    console.error("Error creating operators:", error)
    return NextResponse.json({ error: "Failed to create operators" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("PATCH request body:", body)

    // Normalize the record ID to handle the "6 bis" -> "6_bis" case
    const recordId = normalizeOperatorId(body.recordId)
    console.log("Original record ID:", body.recordId, "Normalized:", recordId)

    const updateData: any = {}

    // Update allowed fields (not the primary key fields)
    if (body.fields["Operator Name"]) updateData.operator = body.fields["Operator Name"]
    if (body.fields["Contact Name"]) updateData.contact_name = body.fields["Contact Name"]
    if (body.fields.Country) updateData.market = body.fields.Country
    if (body.fields["Preferred Language"]) updateData.language = body.fields["Preferred Language"]
    if (body.fields["Contact Email"]) updateData.contact_email = body.fields["Contact Email"]

    // Handle optional fields
    if (body.fields.Tags !== undefined) {
      updateData.tags = body.fields.Tags.length > 0 ? body.fields.Tags : null
    }

    if (body.fields["Engagement Status"] !== undefined) {
      if (body.fields["Engagement Status"] && body.fields["Engagement Status"] !== "none") {
        // Map frontend values to Supabase enum values
        const statusMap: { [key: string]: string } = {
          Hot: "hot",
          Medium: "medium",
          Cold: "cold",
        }
        const frontendStatus = body.fields["Engagement Status"]
        updateData.engagement_status = statusMap[frontendStatus] || frontendStatus.toLowerCase()
      } else {
        updateData.engagement_status = null
      }
    }

    // Handle communication preference
    if (body.fields["Communication Preference"] !== undefined) {
      updateData.pref_comm = body.fields["Communication Preference"]
    }

    console.log("Update data for record ID:", recordId, updateData)

    // Use the normalized ID field for the update query
    const response = await fetch(`${SUPABASE_URL}/rest/v1/operators?id=eq.${recordId}`, {
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
    console.log("Update successful for record:", recordId, data)
    const transformedRecords = data.map(transformOperatorRecord)

    return NextResponse.json({
      records: transformedRecords,
    })
  } catch (error) {
    console.error("Error updating operators:", error)
    return NextResponse.json({ error: "Failed to update operators" }, { status: 500 })
  }
}
