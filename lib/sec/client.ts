// SEC EDGAR HTTP client.
// Compliance: requires User-Agent identifying the requester. Rate limit ≤10
// req/sec — we throttle to 1 every 150ms to be safe and serial-only.

function userAgent(): string {
  const name = process.env.SEC_USER_AGENT_NAME?.trim();
  const email = process.env.SEC_USER_AGENT_EMAIL?.trim();
  if (name && email) return `${name} ${email}`;
  const combined = process.env.SEC_USER_AGENT?.trim();
  if (combined) return combined;
  throw new Error(
    "SEC EDGAR requires a User-Agent. Set SEC_USER_AGENT_NAME + SEC_USER_AGENT_EMAIL (or SEC_USER_AGENT) in .env",
  );
}

let lastRequest = 0;
const MIN_INTERVAL_MS = 150;

async function throttle() {
  const now = Date.now();
  const wait = lastRequest + MIN_INTERVAL_MS - now;
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequest = Date.now();
}

export async function secFetch(url: string, init?: RequestInit): Promise<Response> {
  await throttle();
  const headers = new Headers(init?.headers);
  headers.set("User-Agent", userAgent());
  headers.set("Accept-Encoding", "gzip, deflate");
  headers.set("Host", new URL(url).host);
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `SEC request failed ${res.status} ${res.statusText} for ${url}\n${body.slice(0, 500)}`,
    );
  }
  return res;
}

export async function secFetchJson<T = unknown>(url: string): Promise<T> {
  const res = await secFetch(url);
  return (await res.json()) as T;
}

export async function secFetchText(url: string): Promise<string> {
  const res = await secFetch(url);
  return await res.text();
}

// SEC pads CIK to 10 digits in URLs.
export function padCik(cik: string): string {
  const digits = cik.replace(/\D/g, "");
  return digits.padStart(10, "0");
}
