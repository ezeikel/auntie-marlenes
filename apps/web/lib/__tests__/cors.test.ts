import { describe, expect, it } from 'vitest';
import { corsHeaders, corsOptionsResponse } from '../cors';

function createRequest(origin?: string): Request {
  const headers = new Headers();
  if (origin) headers.set('Origin', origin);
  return new Request('http://localhost:3000/api/test', { headers });
}

describe('corsHeaders', () => {
  it('allows auntiemarlenes.com origin', () => {
    const headers = corsHeaders(
      createRequest('https://auntiemarlenes.com'),
      'GET, POST',
    );
    expect(headers['Access-Control-Allow-Origin']).toBe(
      'https://auntiemarlenes.com',
    );
  });

  it('allows www.auntiemarlenes.com origin', () => {
    const headers = corsHeaders(
      createRequest('https://www.auntiemarlenes.com'),
      'GET',
    );
    expect(headers['Access-Control-Allow-Origin']).toBe(
      'https://www.auntiemarlenes.com',
    );
  });

  it('rejects unknown origins', () => {
    const headers = corsHeaders(createRequest('https://evil.com'), 'GET');
    expect(headers['Access-Control-Allow-Origin']).toBeUndefined();
  });

  it('handles missing Origin header', () => {
    const headers = corsHeaders(createRequest(), 'GET');
    expect(headers['Access-Control-Allow-Origin']).toBeUndefined();
  });

  it('sets Vary: Origin for allowed origins', () => {
    const headers = corsHeaders(
      createRequest('https://auntiemarlenes.com'),
      'GET',
    );
    expect(headers['Vary']).toBe('Origin');
  });

  it('does not set Vary for rejected origins', () => {
    const headers = corsHeaders(createRequest('https://evil.com'), 'GET');
    expect(headers['Vary']).toBeUndefined();
  });

  it('includes methods and standard headers', () => {
    const headers = corsHeaders(
      createRequest('https://auntiemarlenes.com'),
      'POST, DELETE',
    );
    expect(headers['Access-Control-Allow-Methods']).toBe('POST, DELETE');
    expect(headers['Access-Control-Allow-Headers']).toBe(
      'Content-Type, Authorization',
    );
    expect(headers['Content-Type']).toBe('application/json');
  });
});

describe('corsOptionsResponse', () => {
  it('returns 200 status', () => {
    const response = corsOptionsResponse(
      createRequest('https://auntiemarlenes.com'),
      'GET, POST',
    );
    expect(response.status).toBe(200);
  });

  it('includes CORS headers in response', () => {
    const response = corsOptionsResponse(
      createRequest('https://auntiemarlenes.com'),
      'PATCH, OPTIONS',
    );
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://auntiemarlenes.com',
    );
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe(
      'PATCH, OPTIONS',
    );
  });
});
