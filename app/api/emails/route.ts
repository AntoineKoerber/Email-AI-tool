import { type NextRequest, NextResponse } from "next/server"

const SUPABASE_URL = "https://kojsqibukbqamtngxrsc.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvanNxaWJ1a2JxYW10bmd4cnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MDA2NjksImV4cCI6MjA2NTM3NjY2OX0.4PVEtHMI2UAxNKEWO3etaSg8_qff7vPiyd90FkICCtE"

// Helper function to handle the specific operator ID change
function normalizeOperatorId(operatorId: string): string {
  if (operatorId === "6 bis") {
    return "6_bis"
  }
  return operatorId
}

// Transform Supabase data to match frontend expectations
function transformEmailRecord(record: any) {
  return {
    // Use email_id as the primary identifier (updated from email_ID)
    id: record.email_id || record.id,
    fields: {
      Status: record.status,
      "Reply Status": record.reply_status,
      "Operator (Lookup)": record.operator,
      "Incentive (Lookup)": record.incentive,
      "Created Time": record.created_time,
      "AI Answered": record.ai_answered,
      generated_email_subject: record.generated_email_subject,
      generated_email_body: record.generated_email_body,
      final_email_subject: record.final_email_subject,
      final_email_body: record.final_email_body,
      follow_up_1: record.follow_up_1,
      follow_up_2: record.follow_up_2,
    },
    // Use the Supabase created_time directly
    createdTime: record.created_time,
  }
}

// Helper function to generate email ID
function generateEmailId(operatorName: string, incentiveName: string, timestamp: number): string {
  // Get first 3 letters of operator name (or full name if shorter)
  const operatorPrefix = operatorName
    .replace(/[^a-zA-Z]/g, "")
    .substring(0, 3)
    .toUpperCase()

  // Get first 3 letters of incentive name (or full name if shorter)
  const incentivePrefix = incentiveName
    .replace(/[^a-zA-Z]/g, "")
    .substring(0, 3)
    .toUpperCase()

  // Use timestamp for uniqueness
  const timeId = timestamp.toString().slice(-6) // Last 6 digits of timestamp

  return `${operatorPrefix}${incentivePrefix}${timeId}`
}

export async function GET() {
  try {
    // Get raw data from Supabase without any ordering
    const response = await fetch(`${SUPABASE_URL}/rest/v1/emails?select=*`, {
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
    console.log("Raw Supabase data (first 3 records):", data.slice(0, 3))

    // Transform data to match frontend expectations
    const transformedRecords = data.map(transformEmailRecord)
    console.log("Transformed records (first 3):", transformedRecords.slice(0, 3))

    return NextResponse.json({
      records: transformedRecords,
    })
  } catch (error) {
    console.error("Error fetching emails:", error)
    return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("POST request body:", body)

    // We need to fetch operator and incentive data to get their names for ID generation
    const [operatorsRes, incentivesRes] = await Promise.all([fetch("/api/operators"), fetch("/api/promotions")])

    const [operatorsData, incentivesData] = await Promise.all([
      operatorsRes.ok ? operatorsRes.json() : { records: [] },
      incentivesRes.ok ? incentivesRes.json() : { records: [] },
    ])

    console.log("Operators data structure:", operatorsData)
    console.log("Incentives data structure:", incentivesData)
    console.log("First incentive record:", incentivesData.records?.[0])

    // Create lookup maps - handle both direct arrays and objects with records property
    const operatorMap = new Map()
    const operatorRecords = Array.isArray(operatorsData) ? operatorsData : operatorsData.records || []

    operatorRecords.forEach((op: any) => {
      const operatorId = op.id || `op-${op.fields?.["Operator Name"] || op.operator || "unknown"}`
      const operatorName = op.fields?.["Operator Name"] || op.operator || "Unknown"

      // Store both original and normalized IDs
      operatorMap.set(operatorId, operatorName)
      operatorMap.set(normalizeOperatorId(operatorId), operatorName)
    })

    const incentiveMap = new Map()
    const incentiveRecords = Array.isArray(incentivesData) ? incentivesData : incentivesData.records || []

    console.log("Processing incentive records:", incentiveRecords.length)
    incentiveRecords.forEach((inc: any, index: number) => {
      console.log(`Incentive ${index}:`, inc)

      // Get all possible field names for incentive name
      const incentiveName =
        inc.fields?.["Incentive Name"] ||
        inc.fields?.["Name"] ||
        inc.fields?.incentive_name ||
        inc.fields?.name ||
        inc.incentive_name ||
        inc.name ||
        `Incentive ${index + 1}`

      // Get all possible ID formats
      const incentiveId = inc.id || inc.fields?.id || `incentive-${index}`

      console.log(`Mapping incentive ID "${incentiveId}" to name "${incentiveName}"`)

      // Store with multiple possible ID formats
      incentiveMap.set(String(incentiveId), incentiveName)
      incentiveMap.set(incentiveId, incentiveName)
      if (inc.id) {
        incentiveMap.set(inc.id, incentiveName)
        incentiveMap.set(String(inc.id), incentiveName)
      }
    })

    console.log("Final incentive map:", Array.from(incentiveMap.entries()))
    console.log("Operator map:", Array.from(operatorMap.entries()))

    // Get current timestamp for created_time
    const currentTime = new Date().toISOString()

    // Transform records from Airtable format to Supabase format
    const supabaseRecords = body.records.map((record: any) => {
      const operatorId = record.fields["Casino Operator"]?.[0] || record.fields.operator
      const incentiveId = record.fields.Incentive?.[0] || record.fields.incentive

      console.log("Processing record with:")
      console.log("- Raw operator ID:", operatorId)
      console.log("- Raw incentive ID:", incentiveId)

      // Try both original and normalized operator ID
      const operatorName = operatorMap.get(operatorId) || operatorMap.get(normalizeOperatorId(operatorId)) || "Unknown"

      // Try to find incentive name with the exact ID first
      const incentiveName = incentiveMap.get(String(incentiveId)) || incentiveMap.get(incentiveId) || "Unknown"

      console.log("- Mapped operator:", operatorName)
      console.log("- Mapped incentive:", incentiveName)
      console.log("- Available incentive IDs:", Array.from(incentiveMap.keys()))

      const timestamp = Date.now()
      const emailId = generateEmailId(operatorName, incentiveName, timestamp)

      console.log("- Generated email ID:", emailId)
      console.log("- Created time:", currentTime)

      return {
        email_id: emailId, // Updated from email_ID to email_id
        status: record.fields.Status || "pending_review",
        reply_status: record.fields["Reply Status"] || "No Reply",
        operator: operatorName,
        incentive: incentiveName,
        created_time: currentTime, // Add the created timestamp
        generated_email_subject: record.fields.generated_email_subject || "",
        generated_email_body: record.fields.generated_email_body || "",
        ai_answered: record.fields.ai_answered || false,
        follow_up_1: false, // Default to false for new records
        follow_up_2: false, // Default to false for new records
      }
    })

    console.log("Final transformed records for Supabase:", supabaseRecords)

    const response = await fetch(`${SUPABASE_URL}/rest/v1/emails`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(supabaseRecords),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Supabase error response:", errorData)
      throw new Error(`Supabase error: ${response.status}`)
    }

    const data = await response.json()
    const transformedRecords = data.map(transformEmailRecord)

    return NextResponse.json({
      records: transformedRecords,
    })
  } catch (error) {
    console.error("Error creating emails:", error)
    return NextResponse.json({ error: "Failed to create emails" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("=== PATCH REQUEST DEBUG ===")
    console.log("PATCH request body:", JSON.stringify(body, null, 2))

    // Handle single record update
    if (body.records && body.records.length > 0) {
      const record = body.records[0]
      const searchId = record.email_id // Updated from email_ID to email_id

      console.log("Looking for record with email_id:", searchId)

      // First, let's check if the record exists and what columns are available
      console.log("=== CHECKING RECORD EXISTS ===")
      const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/emails?email_id=eq.${searchId}`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
      })

      if (checkResponse.ok) {
        const existingRecords = await checkResponse.json()
        console.log("Existing records found:", existingRecords.length)
        if (existingRecords.length > 0) {
          console.log("Existing record structure:", Object.keys(existingRecords[0]))
          console.log("Existing record data:", existingRecords[0])
        } else {
          console.log("No records found with email_id:", searchId)
          return NextResponse.json({ error: "Record not found" }, { status: 404 })
        }
      }

      // Prepare update data - use the fields directly from the record
      const updateData: any = {
        status: record.status || "approved", // Use lowercase status
      }

      // Add final email fields if provided
      if (record.final_email_subject) {
        updateData.final_email_subject = record.final_email_subject
        console.log("Setting final_email_subject to:", record.final_email_subject)
      }
      if (record.final_email_body) {
        updateData.final_email_body = record.final_email_body
        console.log("Setting final_email_body to:", record.final_email_body.substring(0, 100) + "...")
      }

      console.log("Update data being sent:", updateData)

      // Perform the update using the email_id directly
      const updateUrl = `${SUPABASE_URL}/rest/v1/emails?email_id=eq.${searchId}`
      console.log("Update URL:", updateUrl)

      const updateResponse = await fetch(updateUrl, {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(updateData),
      })

      console.log("Update response status:", updateResponse.status)
      console.log("Update response headers:", Object.fromEntries(updateResponse.headers.entries()))

      if (!updateResponse.ok) {
        const errorData = await updateResponse.text()
        console.error("Update failed:", errorData)
        throw new Error(`Update failed: ${updateResponse.status} - ${errorData}`)
      }

      const responseText = await updateResponse.text()
      console.log("Update response text:", responseText)

      let updatedData = []
      if (responseText) {
        try {
          updatedData = JSON.parse(responseText)
          console.log("Updated data:", updatedData)
        } catch (e) {
          console.error("Failed to parse update response:", e)
        }
      }

      // If no data returned, fetch the updated record manually
      if (!updatedData || updatedData.length === 0) {
        console.log("No data returned from update, fetching updated record...")
        const fetchResponse = await fetch(`${SUPABASE_URL}/rest/v1/emails?email_id=eq.${searchId}`, {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
        })

        if (fetchResponse.ok) {
          updatedData = await fetchResponse.json()
          console.log("Fetched updated record:", updatedData)
        }
      }

      if (!updatedData || updatedData.length === 0) {
        throw new Error("Failed to update record - no data returned")
      }

      const transformedRecords = updatedData.map(transformEmailRecord)
      console.log("Transformed updated records:", transformedRecords)
      console.log("=== END PATCH DEBUG ===")

      return NextResponse.json({
        records: transformedRecords,
      })
    }

    return NextResponse.json({ error: "No records to update" }, { status: 400 })
  } catch (error) {
    console.error("Error updating emails:", error)
    return NextResponse.json(
      {
        error: `Failed to update emails: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
