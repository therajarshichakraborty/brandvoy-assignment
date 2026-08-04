import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import {
  paginationSchema,
  playersQuerySchema,
  matchesQuerySchema,
  battingLeadersQuerySchema,
  bowlingLeadersQuerySchema,
} from "../validators";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

registry.registerPath({
  method: "get",
  path: "/api/health",
  tags: ["Health"],
  summary: "Database connectivity and system health check",
  responses: {
    200: {
      description: "System is healthy and database is connected",
    },
    500: {
      description: "Database connection failed",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/teams",
  tags: ["Teams"],
  summary: "List all IPL teams with pagination",
  request: {
    query: paginationSchema,
  },
  responses: {
    200: {
      description: "Paginated list of IPL teams",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/teams/{id}",
  tags: ["Teams"],
  summary: "Get specific team details by ID",
  request: {
    params: z.object({
      id: z.coerce.number().int().positive(),
    }),
  },
  responses: {
    200: {
      description: "Team record details",
    },
    404: {
      description: "Team not found",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/players",
  tags: ["Players"],
  summary: "List players with pagination and filtering",
  request: {
    query: playersQuerySchema,
  },
  responses: {
    200: {
      description: "Paginated player list",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/players/{id}",
  tags: ["Players"],
  summary: "Get player profile with computed career statistics",
  request: {
    params: z.object({
      id: z.coerce.number().int().positive(),
    }),
  },
  responses: {
    200: {
      description: "Player profile and aggregated career statistics",
    },
    404: {
      description: "Player not found",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/matches",
  tags: ["Matches"],
  summary: "List matches with pagination and filtering",
  request: {
    query: matchesQuerySchema,
  },
  responses: {
    200: {
      description: "Paginated match list",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/matches/{id}",
  tags: ["Matches"],
  summary: "Get detailed scorecard and innings breakdown for a match",
  request: {
    params: z.object({
      id: z.coerce.number().int().positive(),
    }),
  },
  responses: {
    200: {
      description: "Match scorecard breakdown",
    },
    404: {
      description: "Match not found",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/stats/batting-leaders",
  tags: ["Leaderboards"],
  summary: "Top batting leaders computed via SQL aggregation",
  request: {
    query: battingLeadersQuerySchema,
  },
  responses: {
    200: {
      description: "Batting leaderboard rankings",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/stats/bowling-leaders",
  tags: ["Leaderboards"],
  summary: "Top bowling leaders computed via SQL aggregation",
  request: {
    query: bowlingLeadersQuerySchema,
  },
  responses: {
    200: {
      description: "Bowling leaderboard rankings",
    },
  },
});

export async function getApiDocs() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
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
  });
}
