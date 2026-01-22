import { type NextRequest, NextResponse } from "next/server"
import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_DEMO_MODE } from "@/lib/supabase"
import { mockCampaigns } from "@/lib/mockData"

// Helper function to handle the specific operator ID change
function normalizeOperatorId(operatorId: string): string {
  if (operatorId === "6 bis") {
    return "6_bis"
  }
  return operatorId
}

// Helper function to get incentive name by checking the incentives table structure
async function getIncentiveName(incentiveId: string | number): Promise<string> {
  if (!incentiveId) return "Unknown Incentive"

  try {
    let actualId = incentiveId
    if (typeof incentiveId === "string" && incentiveId.startsWith("incentive-")) {
      actualId = incentiveId.replace("incentive-", "")
    }

    console.log("Looking up incentive name for ID:", actualId)

    // First, let's try to get the table structure to see what columns exist
    const structureResponse = await fetch(`${SUPABASE_URL}/rest/v1/incentives?limit=1`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (structureResponse.ok) {
      const structureData = await structureResponse.json()
      console.log("Incentives table structure (first row):", structureData)
    }

    // Try different possible column names for the ID
    const possibleQueries = [
      `${SUPABASE_URL}/rest/v1/incentives?id=eq.${actualId}&select=name`,
      `${SUPABASE_URL}/rest/v1/incentives?incentive_id=eq.${actualId}&select=name`,
      `${SUPABASE_URL}/rest/v1/incentives?select=name&limit=1&offset=${Number.parseInt(actualId.toString()) - 1}`, // If it's row-based
    ]

    for (const queryUrl of possibleQueries) {
      try {
        console.log("Trying query:", queryUrl)
        const response = await fetch(queryUrl, {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
        })

        console.log("Response status:", response.status)
        if (response.ok) {
          const data = await response.json()
          console.log("Response data:", data)
          if (data && data.length > 0 && data[0]?.name) {
            console.log("Successfully found incentive name:", data[0].name)
            return data[0].name
          }
        } else {
          const errorText = await response.text()
          console.log("Query failed with error:", errorText)
        }
      } catch (queryError) {
        console.log("Query error:", queryError)
        continue
      }
    }

    // If all queries fail, return a fallback
    return `Incentive ${actualId}`
  } catch (error) {
    console.error("Error in getIncentiveName:", error)
    return `Unknown Incentive (${incentiveId})`
  }
}

// Helper function to generate campaign reference
function generateCampaignRef(operatorName: string | null, incentiveName: string | null): string {
  const timestamp = Date.now().toString().slice(-6) // Last 6 digits of timestamp

  let operatorPart = "UNKN"
  let incentivePart = "UNKN"

  if (operatorName && operatorName !== "—") {
    operatorPart = operatorName
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 4)
  }

  if (incentiveName && incentiveName !== "—") {
    incentivePart = incentiveName
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 4)
  }

  return `CAMP-${operatorPart}-${incentivePart}-${timestamp}`
}

// Helper function to determine status based on dates
function determineStatus(startDate: string | null, endDate: string | null): string | null {
  if (!startDate || !endDate) {
    return null // No status if dates are missing
  }

  const today = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  // Set time to start of day for accurate comparison
  today.setHours(0, 0, 0, 0)
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)

  if (today < start) {
    return "planned" // Campaign hasn't started yet
  } else if (today >= start && today <= end) {
    return "active" // Campaign is currently running
  } else {
    return "done" // Campaign has ended
  }
}

// Transform Supabase data to match Airtable structure for frontend compatibility
function transformCampaignRecord(record: any) {
  console.log("Transforming campaign record:", record)

  // Map Supabase enum values to frontend display values
  const statusMap: { [key: string]: string } = {
    planned: "Planned",
    active: "Active",
    done: "Done",
  }

  // Use the operator and incentive names directly from the campaigns table
  const operatorName = record.operator || "—"
  const incentiveName = record.incentive || "—"

  console.log("Using direct names - Operator:", operatorName, "Incentive:", incentiveName)

  return {
    id: record.id,
    fields: {
      "Operator (Lookup)": operatorName,
      "Promotion (Lookup)": incentiveName,
      "Incentive (Lookup)": incentiveName,
      "Start Date": record.start_date,
      "End Date": record.end_date,
      "Tags Incentive": record.tags_incentive, // Add this field
      Status: record.status ? statusMap[record.status] : null,
      "Linked Operator": record.operator ? [record.operator] : [],
      "Linked Promo": record.incentive ? [record.incentive] : [],
      Ref: record.ref,
    },
    createdTime: record.created_at,
  }
}

export async function GET() {
  try {
    // Return mock data in demo mode
    if (IS_DEMO_MODE) {
      const transformedRecords = mockCampaigns.map(transformCampaignRecord)
      return NextResponse.json({ records: transformedRecords })
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/campaigns?select=*`, {
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

    // Transform data to match Airtable structure (no async lookups needed)
    const transformedRecords = data.map(transformCampaignRecord)

    return NextResponse.json({
      records: transformedRecords,
    })
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("POST request body:", body)

    const startDate = body.fields["Start Date"] || null
    const endDate = body.fields["End Date"] || null
    const operator = body.fields["Linked Operator"]?.[0] || body.fields.operator
    const incentive = body.fields["Linked Promo"]?.[0] || body.fields.incentive

    // For POST, we need to convert IDs to names if they're coming from the form
    let operatorName = operator
    let incentiveName = incentive

    // Convert operator ID to name if needed, with normalization
    if (operator && (typeof operator === "number" || operator.toString().match(/^\d+$/))) {
      try {
        const normalizedOperatorId = normalizeOperatorId(operator.toString())
        console.log("Looking up operator with normalized ID:", normalizedOperatorId)

        const operatorResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/operators?id=eq.${normalizedOperatorId}&select=operator`,
          {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              "Content-Type": "application/json",
            },
          },
        )

        if (operatorResponse.ok) {
          const operatorData = await operatorResponse.json()
          operatorName = operatorData[0]?.operator || operator
        }
      } catch (error) {
        console.error("Error fetching operator name for POST:", error)
        operatorName = operator
      }
    }

    // Convert incentive ID to name if needed
    if (
      incentive &&
      (typeof incentive === "number" || incentive.toString().match(/^\d+$/) || incentive.startsWith("incentive-"))
    ) {
      incentiveName = await getIncentiveName(incentive)
    }

    // Generate campaign reference
    const ref = generateCampaignRef(operatorName, incentiveName)

    // Transform records from Airtable format to Supabase format
    const supabaseRecord: any = {
      ref: ref,
      operator: operatorName, // Store the name, not the ID
      incentive: incentiveName, // Store the name, not the ID
      start_date: startDate,
      end_date: endDate,
    }

    // Determine status based on dates
    const status = determineStatus(startDate, endDate)
    if (status) {
      supabaseRecord.status = status
    }

    console.log("Supabase record to insert:", supabaseRecord)

    const response = await fetch(`${SUPABASE_URL}/rest/v1/campaigns`, {
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
    const transformedRecords = (Array.isArray(data) ? data : [data]).map(transformCampaignRecord)

    return NextResponse.json({
      records: transformedRecords,
    })
  } catch (error) {
    console.error("Error creating campaigns:", error)
    return NextResponse.json({ error: "Failed to create campaigns" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("PATCH request body:", body)

    const recordId = body.recordId
    console.log("Record ID to update:", recordId)

    const updateData: any = {}

    // Convert operator ID to name if needed, with normalization
    if (body.fields["Linked Operator"]) {
      const operator = body.fields["Linked Operator"][0]
      let operatorName = operator

      if (operator && (typeof operator === "number" || operator.toString().match(/^\d+$/))) {
        try {
          const normalizedOperatorId = normalizeOperatorId(operator.toString())
          console.log("Looking up operator with normalized ID:", normalizedOperatorId)

          const operatorResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/operators?id=eq.${normalizedOperatorId}&select=operator`,
            {
              headers: {
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                "Content-Type": "application/json",
              },
            },
          )

          if (operatorResponse.ok) {
            const operatorData = await operatorResponse.json()
            operatorName = operatorData[0]?.operator || operator
          }
        } catch (error) {
          console.error("Error fetching operator name for PATCH:", error)
          operatorName = operator
        }
      }

      updateData.operator = operatorName
    }

    // Convert incentive ID to name if needed
    if (body.fields["Linked Promo"]) {
      const incentive = body.fields["Linked Promo"][0]
      let incentiveName = incentive

      if (
        incentive &&
        (typeof incentive === "number" || incentive.toString().match(/^\d+$/) || incentive.startsWith("incentive-"))
      ) {
        incentiveName = await getIncentiveName(incentive)
      }

      updateData.incentive = incentiveName
    }

    if (body.fields["Start Date"]) updateData.start_date = body.fields["Start Date"]
    if (body.fields["End Date"]) updateData.end_date = body.fields["End Date"]
    if (body.fields["Tags Incentive"]) updateData.tags_incentive = body.fields["Tags Incentive"]

    // Determine status based on dates
    const startDate = body.fields["Start Date"] || null
    const endDate = body.fields["End Date"] || null

    if (startDate || endDate) {
      const status = determineStatus(startDate, endDate)
      if (status) {
        updateData.status = status
      } else {
        updateData.status = null
      }
    }

    console.log("Supabase update data:", updateData)

    // First, let's check what the actual record looks like
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/campaigns?select=*`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (checkResponse.ok) {
      const allRecords = await checkResponse.json()
      console.log("All campaign records for debugging:", allRecords)
      const targetRecord = allRecords.find((r: any) => r.id === recordId || r.ref === recordId)
      console.log("Target record found:", targetRecord)
    }

    // Try updating by id first, then by ref if that fails
    let response = await fetch(`${SUPABASE_URL}/rest/v1/campaigns?id=eq.${recordId}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(updateData),
    })

    // If that fails, try using ref
    if (!response.ok) {
      console.log("Update by id failed, trying by ref...")
      response = await fetch(`${SUPABASE_URL}/rest/v1/campaigns?ref=eq.${recordId}`, {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(updateData),
      })
    }

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Supabase error response:", errorData)
      throw new Error(`Supabase error: ${response.status}`)
    }

    const data = await response.json()
    console.log("Update response data:", data)
    const transformedRecords = (Array.isArray(data) ? data : [data]).map(transformCampaignRecord)

    return NextResponse.json({
      records: transformedRecords,
    })
  } catch (error) {
    console.error("Error updating campaigns:", error)
    return NextResponse.json({ error: "Failed to update campaigns" }, { status: 500 })
  }
}
