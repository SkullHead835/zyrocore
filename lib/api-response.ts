import { NextResponse } from 'next/server'

/**
 * Google Engineering Standardized API Response Helpers
 */
export function apiSuccess<T>(data: T, status = 200, headers?: Record<string, string>) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status, headers }
  )
}

export function apiError(message: string, status = 400, details?: string) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details ? { details } : {}),
    },
    { status }
  )
}
