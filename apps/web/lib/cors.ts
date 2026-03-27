const ALLOWED_ORIGINS = [
  'https://auntiemarlenes.com',
  'https://www.auntiemarlenes.com',
];

if (process.env.NODE_ENV === 'development') {
  ALLOWED_ORIGINS.push('http://localhost:3000');
}

/**
 * Returns CORS headers with origin validation.
 * Only allows requests from approved origins.
 */
export function corsHeaders(
  request: Request,
  methods: string,
): Record<string, string> {
  const origin = request.headers.get('Origin');
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Vary'] = 'Origin';
  }

  return headers;
}

/**
 * Returns a preflight OPTIONS response with CORS headers.
 */
export function corsOptionsResponse(
  request: Request,
  methods: string,
): Response {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(request, methods),
  });
}
