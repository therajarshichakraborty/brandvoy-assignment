"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

interface ReactSwaggerProps {
  spec: Record<string, unknown>;
}

export default function ReactSwagger({ spec }: ReactSwaggerProps) {
  return <SwaggerUI spec={spec} />;
}
