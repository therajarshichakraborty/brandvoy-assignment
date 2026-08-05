import { NextResponse } from "next/server";
import { getApiDocs } from "@/lib/openAPI/swagger";

export async function GET() {
  try {
    const spec = await getApiDocs();
    return NextResponse.json(spec);
  } catch (error) {
    console.error("OpenAPI Spec Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate OpenAPI spec" },
      { status: 500 }
    );
  }
}

