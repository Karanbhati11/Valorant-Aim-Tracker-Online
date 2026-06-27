/**
 * Google Search Console Integration
 *
 * Fetches organic search data (impressions, clicks, average position per keyword)
 * from the Google Search Console API and caches results in MongoDB.
 *
 * - Refreshes data every 48 hours (staleness check on access)
 * - On retrieval failure (120s timeout), returns cached data with timestamp notice
 * - Requires GOOGLE_GSC_CLIENT_EMAIL and GOOGLE_GSC_PRIVATE_KEY env vars for service account auth
 * - Requires GOOGLE_GSC_SITE_URL env var for the verified site property
 *
 * Requirements: 16.3, 16.6
 */

import { getDatabase } from '@/lib/mongo';

// --- Types ---

export interface GSCKeywordData {
  keyword: string;
  impressions: number;
  clicks: number;
  averagePosition: number;
}

export interface GSCCachedData {
  keywords: GSCKeywordData[];
  fetchedAt: string; // ISO timestamp of last successful fetch
  siteUrl: string;
}

export interface GSCResult {
  data: GSCCachedData | null;
  fromCache: boolean;
  cacheNotice?: string; // Present when returning stale cached data due to fetch failure
  error?: string;
}

// --- Constants ---

const GSC_COLLECTION = 'gsc_cache';
const CACHE_MAX_AGE_MS = 48 * 60 * 60 * 1000; // 48 hours in milliseconds
const FETCH_TIMEOUT_MS = 120_000; // 120 seconds

// --- Internal Helpers ---

/**
 * Obtains an OAuth2 access token using Google service account credentials.
 * Uses the JWT bearer flow for server-to-server communication.
 */
async function getAccessToken(): Promise<string> {
  const clientEmail = process.env.GOOGLE_GSC_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_GSC_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    throw new Error(
      'Missing GOOGLE_GSC_CLIENT_EMAIL or GOOGLE_GSC_PRIVATE_KEY environment variables'
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signature = await signWithRSA(signatureInput, privateKey);
  const jwt = `${signatureInput}.${signature}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to obtain access token: ${response.status} ${errorBody}`);
  }

  const tokenData = await response.json();
  return tokenData.access_token;
}

/**
 * Signs a string with RSA-SHA256 using the provided private key.
 * Uses Node.js crypto module.
 */
async function signWithRSA(data: string, privateKey: string): Promise<string> {
  const crypto = await import('crypto');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(data);
  sign.end();
  const signature = sign.sign(privateKey);
  return base64UrlEncode(signature);
}

/**
 * Base64url encodes a string or Buffer (no padding).
 */
function base64UrlEncode(input: string | Buffer): string {
  const buffer = typeof input === 'string' ? Buffer.from(input, 'utf-8') : input;
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Fetches search analytics data from Google Search Console API.
 * Queries the last 28 days of data grouped by keyword (query dimension).
 */
async function fetchGSCData(siteUrl: string): Promise<GSCKeywordData[]> {
  const accessToken = await getAccessToken();

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 28);

  const requestBody = {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    dimensions: ['query'],
    rowLimit: 1000,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const encodedSiteUrl = encodeURIComponent(siteUrl);
    const response = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`GSC API error: ${response.status} ${errorBody}`);
    }

    const result = await response.json();
    const rows: GSCKeywordData[] = (result.rows || []).map(
      (row: { keys: string[]; impressions: number; clicks: number; position: number }) => ({
        keyword: row.keys[0],
        impressions: row.impressions,
        clicks: row.clicks,
        averagePosition: Math.round(row.position * 10) / 10,
      })
    );

    return rows;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Formats a Date as YYYY-MM-DD for the GSC API.
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// --- Cache Operations ---

/**
 * Retrieves the cached GSC data from MongoDB.
 */
async function getCachedData(siteUrl: string): Promise<GSCCachedData | null> {
  const db = await getDatabase();
  const collection = db.collection<GSCCachedData>(GSC_COLLECTION);
  const cached = await collection.findOne({ siteUrl });
  return cached ? { keywords: cached.keywords, fetchedAt: cached.fetchedAt, siteUrl: cached.siteUrl } : null;
}

/**
 * Stores fetched GSC data in MongoDB cache.
 */
async function setCachedData(data: GSCCachedData): Promise<void> {
  const db = await getDatabase();
  const collection = db.collection(GSC_COLLECTION);
  await collection.updateOne(
    { siteUrl: data.siteUrl },
    { $set: data },
    { upsert: true }
  );
}

/**
 * Checks if cached data is stale (older than 48 hours).
 */
function isCacheStale(cachedData: GSCCachedData): boolean {
  const fetchedAt = new Date(cachedData.fetchedAt).getTime();
  const now = Date.now();
  return now - fetchedAt > CACHE_MAX_AGE_MS;
}

// --- Public API ---

/**
 * Gets Google Search Console keyword data with caching.
 *
 * Flow:
 * 1. Check if cached data exists and is fresh (< 48 hours old)
 * 2. If fresh, return cached data
 * 3. If stale or missing, attempt to fetch new data from GSC API
 * 4. On success, cache and return the new data
 * 5. On failure (timeout or API error), return stale cached data with timestamp notice
 *
 * Requirements: 16.3, 16.6
 */
export async function getGSCData(): Promise<GSCResult> {
  const siteUrl = process.env.GOOGLE_GSC_SITE_URL;

  if (!siteUrl) {
    return {
      data: null,
      fromCache: false,
      error: 'GOOGLE_GSC_SITE_URL environment variable is not configured',
    };
  }

  // Check existing cache
  const cachedData = await getCachedData(siteUrl);

  // If cache is fresh, return it directly
  if (cachedData && !isCacheStale(cachedData)) {
    return { data: cachedData, fromCache: true };
  }

  // Cache is stale or missing — attempt fresh fetch
  try {
    const keywords = await fetchGSCData(siteUrl);
    const freshData: GSCCachedData = {
      keywords,
      fetchedAt: new Date().toISOString(),
      siteUrl,
    };

    await setCachedData(freshData);
    return { data: freshData, fromCache: false };
  } catch (error) {
    // On failure, return cached data with notice (Requirement 16.6)
    if (cachedData) {
      const lastUpdated = new Date(cachedData.fetchedAt);
      return {
        data: cachedData,
        fromCache: true,
        cacheNotice: `Data retrieval failed. Showing cached data from ${lastUpdated.toLocaleString()}`,
        error: error instanceof Error ? error.message : 'Unknown error fetching GSC data',
      };
    }

    // No cached data available at all
    return {
      data: null,
      fromCache: false,
      error: error instanceof Error ? error.message : 'Failed to fetch GSC data and no cache available',
    };
  }
}

/**
 * Forces a refresh of GSC data regardless of cache staleness.
 * Useful for manual refreshes from the admin dashboard.
 */
export async function refreshGSCData(): Promise<GSCResult> {
  const siteUrl = process.env.GOOGLE_GSC_SITE_URL;

  if (!siteUrl) {
    return {
      data: null,
      fromCache: false,
      error: 'GOOGLE_GSC_SITE_URL environment variable is not configured',
    };
  }

  try {
    const keywords = await fetchGSCData(siteUrl);
    const freshData: GSCCachedData = {
      keywords,
      fetchedAt: new Date().toISOString(),
      siteUrl,
    };

    await setCachedData(freshData);
    return { data: freshData, fromCache: false };
  } catch (error) {
    const cachedData = await getCachedData(siteUrl);
    if (cachedData) {
      const lastUpdated = new Date(cachedData.fetchedAt);
      return {
        data: cachedData,
        fromCache: true,
        cacheNotice: `Data retrieval failed. Showing cached data from ${lastUpdated.toLocaleString()}`,
        error: error instanceof Error ? error.message : 'Unknown error fetching GSC data',
      };
    }

    return {
      data: null,
      fromCache: false,
      error: error instanceof Error ? error.message : 'Failed to fetch GSC data and no cache available',
    };
  }
}

// Export constants for testing
export const _internals = {
  CACHE_MAX_AGE_MS,
  FETCH_TIMEOUT_MS,
  isCacheStale,
  formatDate,
};
