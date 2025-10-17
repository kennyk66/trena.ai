import { NextResponse } from "next/server";

/**
 * Simple test endpoint to check if Lusha Prospecting API has any data
 */
export async function GET() {
  try {
    const apiKey = process.env.LUSHA_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "No API key configured" }, { status: 500 });
    }

    // Test with the most basic possible request
    const testRequests = [
      {
        name: "No filters (should return everything)",
        body: { filters: {} }
      },
      {
        name: "Only US location",
        body: {
          filters: {
            companies: {
              include: {
                locations: [{ country: "US" }]
              }
            }
          }
        }
      },
      {
        name: "Basic seniority filter",
        body: {
          filters: {
            contacts: {
              include: {
                seniority: [3, 4, 5, 6, 7]
              }
            }
          }
        }
      },
      {
        name: "Asia-Pacific seniority (no location)",
        body: {
          filters: {
            contacts: {
              include: {
                seniority: [3, 4, 5, 6, 7]
              }
            }
          }
        }
      },
      {
        name: "Asia-Pacific with location",
        body: {
          filters: {
            companies: {
              include: {
                locations: [
                  { country: "AU" },
                  { country: "JP" },
                  { country: "SG" },
                  { country: "IN" },
                  { country: "CN" }
                ]
              }
            },
            contacts: {
              include: {
                seniority: [3, 4, 5, 6, 7]
              }
            }
          }
        }
      }
    ];

    const results = [];

    for (const test of testRequests) {
      try {
        const response = await fetch("https://api.lusha.com/prospecting/contact/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api_key": apiKey,
          },
          body: JSON.stringify(test.body),
        });

        const data = await response.json();

        results.push({
          test: test.name,
          status: response.status,
          success: response.ok,
          totalResults: data.totalResults || 0,
          dataLength: Array.isArray(data.data) ? data.data.length : 0,
          billing: data.billing
        });
      } catch (error) {
        results.push({
          test: test.name,
          error: error instanceof Error ? error.message : "Unknown error",
          success: false
        });
      }
    }

    return NextResponse.json({
      apiKeyConfigured: !!apiKey,
      results
    });

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
