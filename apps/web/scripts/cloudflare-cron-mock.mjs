import { createServer } from 'node:http';
// A local-only no-op dispatcher: validates the real cron payloads, never forwards.
const secret = process.env.LOCAL_WORKER_SECRET || 'local-a2-worker-test';
createServer(async (request, response) => {
  let raw = '';
  for await (const chunk of request) raw += chunk;
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    body = null;
  }
  const authenticated = request.headers.authorization === `Bearer ${secret}`;
  const payload =
    request.url === '/generate/blog'
      ? JSON.stringify(body) === '{}'
      : request.url === '/jobs/publish/next' &&
        body?.dry_run === false &&
        JSON.stringify(body?.platforms) ===
          JSON.stringify(['instagram', 'facebook']);
  const accepted = request.method === 'POST' && authenticated && payload;
  console.log(
    JSON.stringify({
      path: request.url,
      method: request.method,
      authenticated,
      payloadValid: Boolean(payload),
      accepted,
    }),
  );
  response.writeHead(accepted ? 200 : 400, {
    'content-type': 'application/json',
  });
  response.end(JSON.stringify({ accepted }));
}).listen(3029, '127.0.0.1', () =>
  console.log('No-op content worker: localhost:3029'),
);
