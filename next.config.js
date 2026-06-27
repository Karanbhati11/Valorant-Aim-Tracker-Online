const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    // Exercise definitions - StaleWhileRevalidate for fast loads with background updates
    {
      urlPattern: /\/assets\/js\/exercises\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "exercise-definitions",
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    // Static assets (CSS, images, audio, fonts) - CacheFirst with 30-day expiry
    {
      urlPattern: /\/assets\/(?!js\/exercises\/).*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-assets",
        expiration: {
          maxEntries: 128,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    // Next.js static chunks and build assets - CacheFirst with 30-day expiry
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "next-static-assets",
        expiration: {
          maxEntries: 128,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    // Image optimization - CacheFirst with 30-day expiry
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "next-image-assets",
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    // Google Fonts webfonts - CacheFirst with 1 year expiry
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts-webfonts",
        expiration: {
          maxEntries: 8,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    // Google Fonts stylesheets - StaleWhileRevalidate
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "google-fonts-stylesheets",
        expiration: {
          maxEntries: 8,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
    // API routes (excluding auth) - NetworkFirst for fresh data with fallback
    {
      urlPattern: ({ url }) => {
        if (!(self.origin === url.origin)) return false;
        const pathname = url.pathname;
        return !pathname.startsWith("/api/auth/") && pathname.startsWith("/api/");
      },
      handler: "NetworkFirst",
      options: {
        cacheName: "api-responses",
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
      },
    },
    // Start URL - NetworkFirst
    {
      urlPattern: /^\/$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "start-url",
        expiration: {
          maxEntries: 1,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
      },
    },
    // All other same-origin pages - NetworkFirst
    {
      urlPattern: ({ url }) => {
        if (!(self.origin === url.origin)) return false;
        return !url.pathname.startsWith("/api/");
      },
      handler: "NetworkFirst",
      options: {
        cacheName: "pages",
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
      },
    },
    // Cross-origin requests - NetworkFirst with short cache
    {
      urlPattern: ({ url }) => !(self.origin === url.origin),
      handler: "NetworkFirst",
      options: {
        cacheName: "cross-origin",
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  eslint: {
    // Lint is run separately via `npm run lint`. These are style-level rules
    // (no-explicit-any, prefer-const, etc.) that should not block production builds.
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ["image/webp", "image/avif"],
    // Requirement 17.4: srcset breakpoints at 640, 750, 828, 1080, 1200px
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  /**
   * Webpack configuration for code splitting and bundle size optimization.
   * Requirements: 10.8 (initial JS bundle ≤ 200 KB compressed)
   * Requirements: 10.4 (exercise code loaded on demand)
   */
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...(config.optimization.splitChunks && config.optimization.splitChunks.cacheGroups),
            // Separate heavy third-party libraries into their own chunks
            // loaded only on pages that need them
            mongodb: {
              test: /[\\/]node_modules[\\/](mongodb|bson)[\\/]/,
              name: 'vendor-mongodb',
              chunks: 'all',
              priority: 30,
            },
          },
        },
      };
    }
    return config;
  },
};

module.exports = withPWA(nextConfig);
