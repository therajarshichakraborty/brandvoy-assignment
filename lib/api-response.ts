import { NextResponse } from "next/server";

export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  totalPages: number;
}

export function successResponse<T>(data: T, meta?: PaginationMeta, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta ? { meta } : {}),
    },
    { status }
  );
}

export function errorResponse(message: string, code: string = "BAD_REQUEST", status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
      },
    },
    { status }
  );
}
