/**
 * Base API utility for WordPress REST API requests
 * Provides a reusable foundation for fetching data from the headless WordPress backend
 */

// =============================================================================
// Configuration Constants
// =============================================================================

const _WORDPRESS_API_URL = process.env.WORDPRESS_API_URL?.replace(/\/+$/, '') ?? '';

if (!_WORDPRESS_API_URL) {
  const msg =
    'WORDPRESS_API_URL is not set. Copy .env.example to .env.local and set your WordPress backend URL. ' +
    'For production build run: node scripts/prepare-live-env.mjs (uses conf/start.md).';
  throw new Error(msg);
}

/** WordPress backend base URL (no trailing slash). Set in .env.local or .env.production.local */
export const WORDPRESS_API_URL = _WORDPRESS_API_URL;

/** Standard WordPress REST API v2 base path */
export const WP_REST_BASE = '/wp-json/wp/v2';

/** Default fetch options for static generation - compatible with output: 'export' */
export const DEFAULT_FETCH_OPTIONS: RequestInit = {
  cache: 'force-cache',
  headers: {
    'Content-Type': 'application/json',
  },
};

// =============================================================================
// Types
// =============================================================================

export interface ApiError extends Error {
  status?: number;
  statusText?: string;
  url?: string;
}

export interface FetchOptions extends RequestInit {
  /** Skip the default WP REST v2 base path (for custom plugin endpoints) */
  skipRestBase?: boolean;
  /** Suppress console error logging for gracefully handled failures */
  suppressErrorLogging?: boolean;
}

export type QueryParams = Record<string, string | number | boolean | undefined>;

// =============================================================================
// Helper Utilities
// =============================================================================

/**
 * Build a full URL with query parameters
 * @param endpoint - The API endpoint path
 * @param params - Optional query parameters
 * @param skipRestBase - If true, don't prepend WP_REST_BASE (for custom endpoints)
 * @returns The full URL string
 */
export function buildUrl(
  endpoint: string,
  params?: QueryParams,
  skipRestBase: boolean = false
): string {
  const basePath = skipRestBase ? '/wp-json' : WP_REST_BASE;
  const url = new URL(`${WORDPRESS_API_URL}${basePath}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

/**
 * Handle API errors with consistent logging
 * @param error - The error that occurred
 * @param url - The URL that was being fetched
 * @param response - Optional response object for additional context
 * @param suppressLogging - If true, suppress console error logging (for gracefully handled failures)
 */
export function handleApiError(
  error: unknown,
  url: string,
  response?: Response,
  suppressLogging: boolean = false
): ApiError {
  const apiError = new Error(
    error instanceof Error ? error.message : 'Unknown API error'
  ) as ApiError;

  apiError.url = url;

  if (response) {
    apiError.status = response.status;
    apiError.statusText = response.statusText;
  }

  // Only log if not suppressed
  if (!suppressLogging) {
    // Log detailed error information
    console.error(`WordPress API Error (${url}):`, {
      message: apiError.message,
      status: apiError.status,
      statusText: apiError.statusText,
    });

    // Additional debugging for 404 errors
    if (response?.status === 404) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('WordPress REST API Not Found (404)');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Troubleshooting steps:');
      console.error('1. Verify WordPress is running at:', WORDPRESS_API_URL);
      console.error('2. Test API manually: curl', url);
      console.error('3. Check WordPress permalinks (Settings -> Permalinks)');
      console.error('4. Ensure REST API is enabled (not disabled by security plugin)');
      console.error('5. If seeing "rest_no_route", verify you installed the PHP code from WORDPRESS_SETUP.md');
      console.error('   (You need to add wordpress-functions.php to your theme functions.php)');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
  }

  return apiError;
}

// =============================================================================
// Main Fetch Function
// =============================================================================

/**
 * Fetch data from WordPress REST API with type safety and error handling
 *
 * @template T - The expected response type
 * @param endpoint - The API endpoint path (e.g., '/posts', '/pages')
 * @param params - Optional query parameters
 * @param options - Optional fetch options (extends RequestInit)
 * @returns Promise resolving to typed data
 * @throws ApiError on fetch failure
 *
 * @example
 * // Fetch posts with _embed
 * const posts = await fetchWordPress<WPPost[]>('/posts', { _embed: true, per_page: 10 });
 *
 * @example
 * // Fetch from custom plugin endpoint
 * const menu = await fetchWordPress<WPMenu>('/wp-api-menus/v2/menus/primary', undefined, { skipRestBase: true });
 */
export async function fetchWordPress<T>(
  endpoint: string,
  params?: QueryParams,
  options: FetchOptions = {}
): Promise<T> {
  const { skipRestBase = false, suppressErrorLogging = false, ...fetchOptions } = options;
  const url = buildUrl(endpoint, params, skipRestBase);

  console.log('Fetching from WordPress API:', url);

  try {
    const response = await fetch(url, {
      ...DEFAULT_FETCH_OPTIONS,
      ...fetchOptions,
      headers: {
        ...DEFAULT_FETCH_OPTIONS.headers,
        ...fetchOptions.headers,
      },
    });

    console.log('WordPress API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();

      // Suppress verbose logging for 502 errors (WordPress server down)
      const is502Error = response.status === 502;
      const shouldSuppressLog = suppressErrorLogging || is502Error;

      if (!shouldSuppressLog) {
        console.error('WordPress API error response:', errorText);
      } else if (is502Error) {
        // Only log a simple message for 502 errors
        console.warn(`WordPress server unavailable (502). Please check that your Local site is running.`);
      }

      throw handleApiError(
        new Error(`WordPress API error: ${response.status} ${response.statusText}`),
        url,
        response,
        shouldSuppressLog
      );
    }

    const data = await response.json();

    console.log(
      'WordPress API data received:',
      Array.isArray(data) ? `${data.length} items` : 'single item'
    );

    return data as T;
  } catch (error) {
    // Re-throw if already an ApiError
    if ((error as ApiError).url) {
      throw error;
    }

    // Wrap other errors
    throw handleApiError(error, url, undefined, suppressErrorLogging);
  }
}

/**
 * Fetch from a custom WordPress plugin endpoint (outside /wp/v2)
 * Convenience wrapper for fetchWordPress with skipRestBase: true
 *
 * @template T - The expected response type
 * @param endpoint - The full endpoint path after /wp-json (e.g., '/wp-api-menus/v2/menus')
 * @param params - Optional query parameters
 * @param options - Optional fetch options
 * @returns Promise resolving to typed data
 *
 * @example
 * const menu = await fetchCustomEndpoint<WPMenu>('/wp-api-menus/v2/menu-locations/primary');
 */
export async function fetchCustomEndpoint<T>(
  endpoint: string,
  params?: QueryParams,
  options: Omit<FetchOptions, 'skipRestBase'> = {}
): Promise<T> {
  return fetchWordPress<T>(endpoint, params, { ...options, skipRestBase: true });
}
