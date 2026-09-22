const ALLOWED_ORIGINS = [
  "https://opic-on-me.com",
  "http://localhost:5173",
  "http://localhost:4173",
];

export function getCorsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get("origin") ?? "";
  const isAllowed = ALLOWED_ORIGINS.includes(origin);
  const allowOrigin = isAllowed ? origin : "https://opic-on-me.com";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-region",
    "Access-Control-Expose-Headers": "server-timing, x-response-time, x-sb-edge-region",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

export function handleCorsPreflight(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(req),
    });
  }
  return null;
}

export function withTiming(res: Response, startTime: number): Response {
  const elapsed = performance.now() - startTime;
  const headers = new Headers(res.headers);
  headers.set("Server-Timing", `total;dur=${elapsed.toFixed(1)}`);
  headers.set("X-Response-Time", `${elapsed.toFixed(1)}ms`);

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}

export function jsonResponse(
  req: Request,
  data: unknown,
  status = 200,
  extraHeaders: HeadersInit = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...getCorsHeaders(req),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      ...extraHeaders,
    },
  });
}

export function errorResponse(
  req: Request,
  status: number,
  code: string,
  message: string
): Response {
  return jsonResponse(
    req,
    {
      error: {
        code,
        message,
      },
    },
    status
  );
}
