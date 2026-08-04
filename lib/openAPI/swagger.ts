import { createSwaggerSpec } from "next-swagger-doc";

export async function getApiDocs() {
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
}
