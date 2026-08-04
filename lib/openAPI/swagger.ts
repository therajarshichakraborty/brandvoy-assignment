import { createSwaggerSpec } from "next-swagger-doc";

export async function getApiDocs() {
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
            url: "http://localhost:4040",
            description: "Local Development Server",
          },
        ],
        tags: [
          { name: "Health", description: "Health check endpoints" },
          { name: "Teams", description: "IPL Teams operations" },
          { name: "Players", description: "IPL Players operations" },
          { name: "Matches", description: "IPL Matches & Scorecards" },
          { name: "Leaderboards", description: "IPL Batting & Bowling Stats" },
        ],
      },
    });
    return spec;
  } catch (error) {
    return {
      openapi: "3.0.0",
      info: {
        title: "IPL Data Platform API",
        version: "1.0.0",
        description: "Production-ready RESTful APIs and dynamic SQL leaderboards for IPL match analytics.",
      },
      paths: {
        "/api/health": { get: { tags: ["Health"], summary: "Database connectivity and system health check" } },
        "/api/teams": { get: { tags: ["Teams"], summary: "List all IPL teams with pagination" } },
        "/api/teams/{id}": { get: { tags: ["Teams"], summary: "Get specific team details by ID" } },
        "/api/players": { get: { tags: ["Players"], summary: "List players with pagination and filtering" } },
        "/api/players/{id}": { get: { tags: ["Players"], summary: "Get player profile with computed career statistics" } },
        "/api/matches": { get: { tags: ["Matches"], summary: "List matches with pagination and filtering" } },
        "/api/matches/{id}": { get: { tags: ["Matches"], summary: "Get detailed scorecard and innings breakdown for a match" } },
        "/api/stats/batting-leaders": { get: { tags: ["Leaderboards"], summary: "Top batting leaders computed via SQL aggregation" } },
        "/api/stats/bowling-leaders": { get: { tags: ["Leaderboards"], summary: "Top bowling leaders computed via SQL aggregation" } },
      },
    };
  }
}
