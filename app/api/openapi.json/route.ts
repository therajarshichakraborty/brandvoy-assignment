import { NextResponse } from "next/server";
import { getApiDocs } from "@/lib/openAPI/swagger";

export async function GET() {
  try {
    const spec = await getApiDocs();
    return NextResponse.json(spec);
  } catch (error) {
    console.error("OpenAPI Spec Generation Error:", error);
    return NextResponse.json(
      {
        openapi: "3.0.0",
        info: {
          title: "IPL Data Platform API",
          version: "1.0.0",
          description: "Production-ready RESTful APIs and dynamic SQL leaderboards for IPL match analytics.",
        },
        paths: {
          "/api/health": { get: { summary: "Database connectivity and system health check" } },
          "/api/teams": { get: { summary: "List all IPL teams with pagination" } },
          "/api/teams/{id}": { get: { summary: "Get specific team details by ID" } },
          "/api/players": { get: { summary: "List players with pagination and filtering" } },
          "/api/players/{id}": { get: { summary: "Get player profile with computed career statistics" } },
          "/api/matches": { get: { summary: "List matches with pagination and filtering" } },
          "/api/matches/{id}": { get: { summary: "Get detailed scorecard and innings breakdown for a match" } },
          "/api/stats/batting-leaders": { get: { summary: "Top batting leaders computed via SQL aggregation" } },
          "/api/stats/bowling-leaders": { get: { summary: "Top bowling leaders computed via SQL aggregation" } },
        },
      },
      { status: 200 }
    );
  }
}
