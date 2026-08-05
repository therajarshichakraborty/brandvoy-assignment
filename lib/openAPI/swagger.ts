import { createSwaggerSpec } from "next-swagger-doc";

const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "IPL Data Platform API",
    version: "1.0.0",
    description: "Production-ready RESTful APIs and dynamic SQL leaderboards for IPL match analytics.",
  },
  servers: [
    {
      url: "/",
      description: "Default Server",
    },
  ],
  tags: [
    { name: "Health", description: "Health check endpoints" },
    { name: "Teams", description: "IPL Teams operations" },
    { name: "Players", description: "IPL Players operations" },
    { name: "Matches", description: "IPL Matches & Scorecards" },
    { name: "Leaderboards", description: "IPL Batting & Bowling Stats" },
  ],
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Database connectivity and system health check",
        responses: {
          "200": { description: "System is healthy and database is connected" },
          "500": { description: "Database connection failed" },
        },
      },
    },
    "/api/teams": {
      get: {
        tags: ["Teams"],
        summary: "List all IPL teams with pagination and search",
        parameters: [
          {
            in: "query",
            name: "page",
            schema: { type: "integer", default: 1 },
            description: "Page number",
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", default: 20 },
            description: "Items per page",
          },
          {
            in: "query",
            name: "search",
            schema: { type: "string" },
            description: "Search team by title or abbreviation",
          },
        ],
        responses: {
          "200": { description: "Paginated list of IPL teams" },
          "400": { description: "Invalid query parameters" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/teams/{id}": {
      get: {
        tags: ["Teams"],
        summary: "Get specific team details by ID",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
            description: "Team ID (tid)",
          },
        ],
        responses: {
          "200": { description: "Team record details" },
          "400": { description: "Invalid team ID format" },
          "404": { description: "Team not found" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/players": {
      get: {
        tags: ["Players"],
        summary: "List players with pagination and filtering",
        parameters: [
          {
            in: "query",
            name: "page",
            schema: { type: "integer", default: 1 },
            description: "Page number",
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", default: 20 },
            description: "Items per page",
          },
          {
            in: "query",
            name: "teamId",
            schema: { type: "integer" },
            description: "Filter by team ID",
          },
          {
            in: "query",
            name: "role",
            schema: { type: "string" },
            description: "Filter by playing role",
          },
          {
            in: "query",
            name: "country",
            schema: { type: "string" },
            description: "Filter by country code",
          },
          {
            in: "query",
            name: "search",
            schema: { type: "string" },
            description: "Search player by name",
          },
        ],
        responses: {
          "200": { description: "Paginated player list" },
          "400": { description: "Invalid query parameters" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/players/{id}": {
      get: {
        tags: ["Players"],
        summary: "Get player profile with computed career statistics",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
            description: "Player ID (pid)",
          },
        ],
        responses: {
          "200": { description: "Player profile and aggregated career statistics" },
          "400": { description: "Invalid player ID format" },
          "404": { description: "Player not found" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/matches": {
      get: {
        tags: ["Matches"],
        summary: "List matches with pagination and filtering",
        parameters: [
          {
            in: "query",
            name: "page",
            schema: { type: "integer", default: 1 },
            description: "Page number",
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", default: 20 },
            description: "Items per page",
          },
          {
            in: "query",
            name: "teamId",
            schema: { type: "integer" },
            description: "Filter matches involving team ID",
          },
          {
            in: "query",
            name: "startDate",
            schema: { type: "string" },
            description: "Start date (YYYY-MM-DD)",
          },
          {
            in: "query",
            name: "endDate",
            schema: { type: "string" },
            description: "End date (YYYY-MM-DD)",
          },
        ],
        responses: {
          "200": { description: "Paginated match list" },
          "400": { description: "Invalid query parameters" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/matches/{id}": {
      get: {
        tags: ["Matches"],
        summary: "Get detailed scorecard and innings breakdown for a match",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
            description: "Match ID",
          },
        ],
        responses: {
          "200": { description: "Match scorecard breakdown" },
          "400": { description: "Invalid match ID format" },
          "404": { description: "Match not found" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/stats/batting-leaders": {
      get: {
        tags: ["Leaderboards"],
        summary: "Top batting leaders computed via SQL aggregation",
        parameters: [
          {
            in: "query",
            name: "page",
            schema: { type: "integer", default: 1 },
            description: "Page number",
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", default: 20 },
            description: "Items per page",
          },
          {
            in: "query",
            name: "metric",
            schema: {
              type: "string",
              enum: ["runs", "average", "strikeRate", "fours", "sixes"],
              default: "runs",
            },
            description: "Sorting metric",
          },
        ],
        responses: {
          "200": { description: "Batting leaderboard rankings" },
          "400": { description: "Invalid query parameters" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/stats/bowling-leaders": {
      get: {
        tags: ["Leaderboards"],
        summary: "Top bowling leaders computed via SQL aggregation",
        parameters: [
          {
            in: "query",
            name: "page",
            schema: { type: "integer", default: 1 },
            description: "Page number",
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", default: 20 },
            description: "Items per page",
          },
          {
            in: "query",
            name: "metric",
            schema: {
              type: "string",
              enum: ["wickets", "economy", "strikeRate", "maidens"],
              default: "wickets",
            },
            description: "Sorting metric",
          },
        ],
        responses: {
          "200": { description: "Bowling leaderboard rankings" },
          "400": { description: "Invalid query parameters" },
          "500": { description: "Server error" },
        },
      },
    },
  },
};

export async function getApiDocs(): Promise<Record<string, unknown>> {
  try {
    const spec = createSwaggerSpec({
      apiFolder: "app/api",
      definition: {
        openapi: "3.0.0",
        info: {
          title: "IPL Data Platform API",
          version: "1.0.0",
          description: "Production-ready RESTful APIs and dynamic SQL leaderboards for IPL match analytics.",
        },
        servers: [
          {
            url: "/",
            description: "Default Server",
          },
        ],
        tags: openApiSpec.tags,
      },
    });
    return spec as Record<string, unknown>;
  } catch {
    return openApiSpec as Record<string, unknown>;
  }
}

