export async function getApiDocs() {
  return {
    openapi: "3.0.0",
    info: {
      title: "IPL Data Platform API",
      version: "1.0.0",
      description: "Production-ready RESTful APIs and dynamic SQL leaderboards for IPL match analytics.",
    },
    servers: [
      {
        url: "http://localhost:4040",
        description: "Local Development Server",
      },
    ],
    paths: {
      "/api/health": {
        get: {
          tags: ["Health"],
          summary: "Database connectivity and system health check",
          responses: {
            "200": {
              description: "System is healthy and database is connected",
            },
            "500": {
              description: "Database connection failed",
            },
          },
        },
      },
      "/api/teams": {
        get: {
          tags: ["Teams"],
          summary: "List all IPL teams with pagination",
          parameters: [
            {
              name: "page",
              in: "query",
              required: false,
              schema: { type: "integer", default: 1 },
              description: "Page number",
            },
            {
              name: "limit",
              in: "query",
              required: false,
              schema: { type: "integer", default: 20 },
              description: "Items per page",
            },
          ],
          responses: {
            "200": {
              description: "Paginated list of IPL teams",
            },
          },
        },
      },
      "/api/teams/{id}": {
        get: {
          tags: ["Teams"],
          summary: "Get specific team details by ID",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
              description: "Team ID (tid)",
            },
          ],
          responses: {
            "200": {
              description: "Team record details",
            },
            "404": {
              description: "Team not found",
            },
          },
        },
      },
      "/api/players": {
        get: {
          tags: ["Players"],
          summary: "List players with pagination and filtering",
          parameters: [
            {
              name: "page",
              in: "query",
              required: false,
              schema: { type: "integer", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              required: false,
              schema: { type: "integer", default: 20 },
            },
            {
              name: "role",
              in: "query",
              required: false,
              schema: { type: "string" },
              description: "Filter by role (e.g. bat, bowl, all-rounder)",
            },
            {
              name: "country",
              in: "query",
              required: false,
              schema: { type: "string" },
              description: "Filter by country (e.g. in)",
            },
            {
              name: "search",
              in: "query",
              required: false,
              schema: { type: "string" },
              description: "Search player by name",
            },
          ],
          responses: {
            "200": {
              description: "Paginated player list",
            },
          },
        },
      },
      "/api/players/{id}": {
        get: {
          tags: ["Players"],
          summary: "Get player profile with computed career statistics",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
              description: "Player ID (pid)",
            },
          ],
          responses: {
            "200": {
              description: "Player profile and aggregated career statistics",
            },
            "404": {
              description: "Player not found",
            },
          },
        },
      },
      "/api/matches": {
        get: {
          tags: ["Matches"],
          summary: "List matches with pagination and filtering",
          parameters: [
            {
              name: "page",
              in: "query",
              required: false,
              schema: { type: "integer", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              required: false,
              schema: { type: "integer", default: 20 },
            },
            {
              name: "teamId",
              in: "query",
              required: false,
              schema: { type: "integer" },
              description: "Filter matches involving team ID",
            },
            {
              name: "startDate",
              in: "query",
              required: false,
              schema: { type: "string" },
            },
            {
              name: "endDate",
              in: "query",
              required: false,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Paginated match list",
            },
          },
        },
      },
      "/api/matches/{id}": {
        get: {
          tags: ["Matches"],
          summary: "Get detailed scorecard and innings breakdown for a match",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
              description: "Match ID",
            },
          ],
          responses: {
            "200": {
              description: "Match scorecard breakdown",
            },
            "404": {
              description: "Match not found",
            },
          },
        },
      },
      "/api/stats/batting-leaders": {
        get: {
          tags: ["Leaderboards"],
          summary: "Top batting leaders computed via SQL aggregation",
          parameters: [
            {
              name: "page",
              in: "query",
              required: false,
              schema: { type: "integer", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              required: false,
              schema: { type: "integer", default: 20 },
            },
            {
              name: "metric",
              in: "query",
              required: false,
              schema: {
                type: "string",
                enum: ["runs", "average", "strikeRate", "fours", "sixes"],
                default: "runs",
              },
              description: "Aggregation sorting metric",
            },
          ],
          responses: {
            "200": {
              description: "Batting leaderboard rankings",
            },
          },
        },
      },
      "/api/stats/bowling-leaders": {
        get: {
          tags: ["Leaderboards"],
          summary: "Top bowling leaders computed via SQL aggregation",
          parameters: [
            {
              name: "page",
              in: "query",
              required: false,
              schema: { type: "integer", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              required: false,
              schema: { type: "integer", default: 20 },
            },
            {
              name: "metric",
              in: "query",
              required: false,
              schema: {
                type: "string",
                enum: ["wickets", "economy", "strikeRate", "maidens"],
                default: "wickets",
              },
              description: "Aggregation sorting metric",
            },
          ],
          responses: {
            "200": {
              description: "Bowling leaderboard rankings",
            },
          },
        },
      },
    },
  };
}
