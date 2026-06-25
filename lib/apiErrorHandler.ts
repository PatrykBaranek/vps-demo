// Import NextResponse as a value (not just a type) because we need to call its static methods.
import { NextRequest, NextResponse } from 'next/server';

/**
 * Higher‑order function that wraps an API route handler with a generic error
 * handling block. It catches any thrown error, logs it, and returns a JSON
 * response with a 500 status code. This keeps individual route files tidy and
 * ensures a consistent error shape across the API.
 */
export function withErrorHandler(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(request);
    } catch (error) {
      // eslint‑disable-next-line no-console
      console.error('API route error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
