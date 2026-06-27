# Implementation Plan: Full Aim Trainer SEO Platform

## Overview

This plan transforms AimTrainerPro from a basic 5-exercise aim tracker into a comprehensive, SEO-first competitive platform. Implementation proceeds in phases: core infrastructure and types first, then exercise system expansion, user accounts and progression, SEO/content systems, multiplayer, and finally optimization and polish. Each task builds incrementally on prior work, ensuring no orphaned code.

## Tasks

- [x] 1. Set up project infrastructure and core type system
  - [x] 1.1 Create core TypeScript interfaces and type definitions
    - Create `src/lib/exercises/types.ts` with ExerciseMechanics, ScoringRules, ExerciseCategory, ExerciseDefinition, ExerciseResult interfaces
    - Create `src/lib/scoring/types.ts` with NormalizedScoreInput, PlayerTier types
    - Create `src/lib/auth/types.ts` with UserProfile, SensitivityProfile interfaces
    - Create `src/lib/multiplayer/types.ts` with MatchRoom, MatchPlayer, WSClientEvent, WSServerEvent types
    - Create `src/lib/seo/types.ts` with PageSEO, StructuredDataBlock interfaces
    - Create `src/lib/content/types.ts` with LandingPage, BlogPostSchema interfaces
    - Create `src/lib/analytics/types.ts` with AnalyticsEvent, DashboardMetrics interfaces
    - Create `src/lib/progression/types.ts` with PlayerTier enum and TIER_THRESHOLDS constant
    - _Requirements: 1.1–1.7, 2.1–2.5, 3.1–3.5, 4.1–4.7, 5.1–5.7, 6.1–6.6, 7.1–7.7, 19.1–19.9_

  - [x] 1.2 Install and configure required dependencies
    - Install next-auth, @auth/mongodb-adapter, next-intl, next-pwa, socket.io, socket.io-client, bcryptjs, sharp
    - Install dev dependencies: @types/bcryptjs, vitest, @testing-library/react
    - Configure next-pwa in next.config.js
    - Configure next-intl middleware and routing
    - _Requirements: 4.1–4.2, 11.1, 19.1–19.3, 20.3_

  - [x] 1.3 Set up MongoDB collections and indexes
    - Create `src/lib/db/setup.ts` with index definitions for users, sessions, leaderboard, matches, analytics_events, challenge_links collections
    - Add unique indexes on users.email, users.displayName, matches.roomCode, challenge_links.urlCode
    - Add compound indexes for leaderboard queries (exerciseId + timeframe + score)
    - Add TTL indexes on matches.expiresAt and challenge_links.expiresAt
    - _Requirements: 4.1, 6.1–6.6, 16.1–16.2, 19.2_

  - [x] 1.4 Configure internationalization (i18n) file structure
    - Create `src/messages/en.json`, `src/messages/es.json`, `src/messages/pt.json`, `src/messages/de.json`, `src/messages/ja.json`, `src/messages/zh.json`
    - Create `src/middleware.ts` with next-intl routing configuration (locales, defaultLocale: 'en', localePrefix: 'as-needed')
    - Create `src/lib/i18n/config.ts` with supported locales and fallback logic
    - _Requirements: 20.3–20.7_

- [x] 2. Implement score engine and progression system
  - [x] 2.1 Implement the score calculation engine
    - Create `src/lib/scoring/score-engine.ts` with calculateNormalizedScore (accuracy 50%, speed 30%, consistency 20% weighting returning 0–1000)
    - Implement calculateTrackingAccuracy (samples array + sampleRateHz → 0.0–1.0)
    - Implement calculateStandardDeviation for reaction time consistency
    - Implement score validation (non-negative integer, max per exercise based on hitReward × max hits)
    - _Requirements: 1.4, 1.7, 2.2, 6.3_

  - [x] 2.2 Write unit tests for score engine
    - Test calculateNormalizedScore with known inputs produces expected 0–1000 range
    - Test calculateTrackingAccuracy with edge cases (all hits, all misses, alternating)
    - Test score validation rejects invalid scores
    - _Requirements: 1.4, 2.2, 6.3_

  - [x] 2.3 Implement the skill rating and progression system
    - Create `src/lib/progression/skill-rating.ts` with calculateWeightedAverage (exponential decay over last 20 sessions)
    - Implement compositeSkillRating across all exercises returning 0–5000
    - Implement getPlayerTier mapping rating to Iron/Bronze/Silver/Gold/Platinum/Diamond/Immortal/Radiant
    - Handle edge case: fewer than 20 sessions uses all available sessions
    - _Requirements: 5.1–5.4, 5.7_

  - [x] 2.4 Write unit tests for progression system
    - Test recency-weighted average with various session counts
    - Test tier assignment at boundary values (624→Iron, 625→Bronze, etc.)
    - Test fewer-than-20 sessions edge case
    - _Requirements: 5.1–5.4_

- [x] 3. Expand exercise library and framework
  - [x] 3.1 Create the typed exercise registry and definition system
    - Create `src/lib/exercises/registry.ts` with exercise registration, lookup by ID, and filtering by category
    - Define all 6+ categories: flicking, tracking, speed, precision, reaction, game-specific
    - Implement exercise validation (required fields, difficulty 1–5, valid mechanics)
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 3.2 Define tracking exercise definitions
    - Create exercise definitions for linear strafing, sinusoidal movement, random direction changes (500–2000ms intervals), and acceleration/deceleration (25%–100% base speed)
    - Configure trackingMode: true, trackingSampleRate: 30+ Hz for all tracking exercises
    - Set 60-second duration for tracking exercises
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.3 Define flicking exercise definitions
    - Create exercises for micro-flick (5–15°), medium-flick (16–90°), and wide-flick (91–180°) distance presets
    - Create headshot-only mode definition with criticalZoneRatio: 0.3 and criticalMultiplier: 2.0
    - Create multi-target sequential elimination mode (2–6 targets with numeric labels)
    - Configure time-to-kill tracking (max 5000ms before miss)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.4 Define speed, precision, reaction, and game-specific exercises
    - Create at least 5 exercises per category for speed, precision, and reaction
    - Create game-specific exercises for Valorant, CS2, Apex Legends scenarios
    - Ensure each exercise has unique ID, name, description, difficulty, duration, mechanics, and scoring rules
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 3.5 Implement daily challenge rotation system
    - Create `src/lib/exercises/daily-challenge.ts` with deterministic exercise selection based on UTC date
    - Ensure all Players see the same challenge on a given calendar day (UTC)
    - Rotate at 00:00 UTC
    - _Requirements: 1.5_

  - [x] 3.6 Update the exercise engine to support new mechanics
    - Modify `public/assets/js/exercises/exercise-engine.js` to accept ExerciseMechanics config for tracking mode, headshot mode, multi-target mode
    - Implement tracking accuracy sampling at 30+ Hz
    - Implement reactive tracking (direction change when cursor within 1.5x target radius within 100ms)
    - Implement multi-target sequential elimination logic with miss penalty for out-of-order hits
    - Implement time-to-kill recording per target
    - _Requirements: 2.1–2.5, 3.1–3.5_

  - [x] 3.7 Write unit tests for exercise registry and daily challenge
    - Test exercise lookup by ID and category filtering
    - Test daily challenge produces same result for same UTC date
    - Test daily challenge produces different results for different dates
    - _Requirements: 1.1, 1.5_

- [x] 4. Checkpoint - Core systems verified
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement user authentication system
  - [x] 5.1 Configure NextAuth.js with MongoDB adapter
    - Create `src/app/api/auth/[...nextauth]/route.ts` with CredentialsProvider (email/password, bcrypt hashed, 8–128 chars), GoogleProvider, DiscordProvider
    - Configure MongoDBAdapter for session/user storage
    - Set up JWT session strategy with appropriate expiry
    - _Requirements: 4.1, 4.2_

  - [x] 5.2 Implement user profile and display name management
    - Create `src/app/api/user/profile/route.ts` for GET/PUT profile operations
    - Implement display name validation (3–16 alphanumeric + underscore, unique check)
    - Return appropriate error when display name is taken
    - _Requirements: 4.5, 4.6_

  - [x] 5.3 Implement local-to-server data sync
    - Create `src/lib/auth/sync.ts` with logic to sync local progress (exercise results, scores, sensitivity, crosshairs) to server on authentication
    - Server-side data takes precedence on conflicts
    - Retain local data and retry on sync failure
    - _Requirements: 4.3, 4.4, 4.7_

  - [x] 5.4 Write unit tests for authentication and sync
    - Test display name validation (valid, too short, too long, special chars, duplicates)
    - Test sync conflict resolution (server wins)
    - Test password length validation (8–128 chars)
    - _Requirements: 4.1, 4.5, 4.6, 4.7_

- [x] 6. Implement leaderboard and progression UI
  - [x] 6.1 Enhance leaderboard API with timeframes and validation
    - Update `src/app/api/leaderboard/get/route.ts` to support daily/weekly/all-time views with proper UTC resets
    - Update `src/app/api/leaderboard/post/route.ts` to validate scores against MAX_SCORE_PER_EXERCISE, player name 1–64 chars
    - Ensure ranking updates within 5 seconds of submission
    - Return top 100 with score, accuracy %, and position
    - _Requirements: 6.1–6.6_

  - [x] 6.2 Implement progression UI components
    - Create `src/components/ProgressionDisplay.tsx` showing skill rating, current tier, and tier progress bar
    - Create `src/components/PerformanceGraph.tsx` plotting score per session over last 30 days per exercise
    - Display "insufficient data" message when fewer than 2 data points exist
    - Implement personal best notification (5-second display) when new high score achieved
    - _Requirements: 5.5, 5.6, 5.7_

  - [x] 6.3 Implement leaderboard UI with timeframe selector
    - Create `src/components/Leaderboard.tsx` with tabs for daily/weekly/all-time views
    - Display top 100 per exercise with rank number, score, accuracy %
    - Add per-exercise filter/selector
    - _Requirements: 6.1, 6.2, 6.5_

  - [x] 6.4 Write unit tests for leaderboard validation
    - Test score rejection when exceeding maximum
    - Test player name validation (1–64 chars)
    - Test timeframe filtering logic (daily reset at 00:00 UTC, weekly at Monday 00:00 UTC)
    - _Requirements: 6.3, 6.4, 6.5_

- [x] 7. Implement sensitivity converter and settings tools
  - [x] 7.1 Implement sensitivity conversion engine
    - Create `src/lib/tools/sensitivity-converter.ts` with SUPPORTED_GAMES array (15+ games with yawPerCount and formula)
    - Implement convertSensitivity pure function (from/to game, sensitivity, DPI → converted value within 0.1% accuracy)
    - Implement calculateTrainerSensitivity for game → trainer scale conversion
    - Implement validateSensitivityInput (sensitivity: 0.01–100, DPI: 100–16000)
    - _Requirements: 13.1, 13.2, 13.3_

  - [x] 7.2 Build sensitivity converter UI page
    - Create `src/app/tools/sensitivity-converter/page.tsx` as SSR page with game selector, sensitivity input, DPI input, result display
    - Display error messages for out-of-range or non-numeric inputs
    - Implement profile save/load (up to 20 profiles in localStorage)
    - Apply profile settings within 1 second of selection
    - _Requirements: 13.1–13.6_

  - [x] 7.3 Implement DPI analyzer tool
    - Create `src/app/tools/dpi-analyzer/page.tsx` with mouse movement measurement interface
    - Measure pixel distance over fixed physical distance and calculate effective DPI
    - _Requirements: 13.4_

  - [x] 7.4 Write unit tests for sensitivity converter
    - Test conversion accuracy between all supported game pairs within 0.1% tolerance
    - Test validation rejects out-of-range values
    - Test round-trip conversion (A→B→A returns original within tolerance)
    - _Requirements: 13.1, 13.2, 13.3_

- [x] 8. Implement training plans and customization
  - [x] 8.1 Create training plan system
    - Create `src/lib/training/plans.ts` with pre-built plans for beginner, intermediate, advanced (5–15 exercises each in defined sequence)
    - Implement playlist creation logic (2–20 exercises, auto-advance on completion)
    - Track completion percentage and estimated remaining time
    - Handle skip/abandon (mark incomplete, exclude from percentage, advance to next)
    - _Requirements: 14.1, 14.2, 14.3, 14.6_

  - [x] 8.2 Implement weakness-based exercise recommendations
    - Create `src/lib/training/recommendations.ts` that identifies exercises where player's average score over last 20 sessions is in bottom 25th percentile
    - Recommend at least 3 exercises on the training plan selection screen
    - _Requirements: 14.4_

  - [x] 8.3 Build training plan UI
    - Create `src/components/TrainingPlan.tsx` with plan selection, progress tracking, exercise queue display
    - Allow configurable exercise duration (15–180 seconds in 1-second increments)
    - Show completion percentage and time remaining
    - _Requirements: 14.1–14.6_

  - [x] 8.4 Write unit tests for training plan logic
    - Test completion percentage calculation with skipped exercises
    - Test recommendation algorithm identifies bottom 25th percentile
    - Test duration configuration bounds (15–180 seconds)
    - _Requirements: 14.3, 14.4, 14.5, 14.6_

- [x] 9. Checkpoint - Feature systems complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement SEO engine and technical SEO infrastructure
  - [x] 10.1 Implement metadata generation system
    - Create `src/lib/seo/metadata-generator.ts` with generatePageMetadata (title 30–60 chars with keyword, description 120–160 chars)
    - Implement fallback logic: title from heading text (truncated 60 chars), description from first 160 chars of body
    - Implement generateBreadcrumbs from URL path
    - Implement generateStructuredData (WebApplication, BreadcrumbList, Article, FAQPage, HowTo)
    - _Requirements: 7.1, 7.3, 7.4, 7.7_

  - [x] 10.2 Enhance sitemap and robots.txt generation
    - Update `src/app/sitemap.ts` to include all exercise pages, blog posts, category pages, landing pages, and tools
    - Ensure sitemap regenerates on each build
    - Add support for new blog posts updating sitemap within 1 hour
    - _Requirements: 7.2, 9.4_

  - [x] 10.3 Implement structured data across all page types
    - Add WebApplication schema on home page (already exists, enhance)
    - Add BreadcrumbList on all pages with depth ≥ 2
    - Add Article schema on all blog posts
    - Add FAQPage schema on pages with FAQ content
    - Add self-referencing canonical URLs on all pages
    - _Requirements: 7.3, 7.4, 7.5_

  - [x] 10.4 Implement hreflang tags for internationalization
    - Create `src/lib/seo/hreflang.ts` that generates hreflang link elements for all available language versions
    - Include self-referencing hreflang for current language
    - Integrate with next-intl routing
    - _Requirements: 7.6, 20.5_

  - [x] 10.5 Write unit tests for SEO metadata generation
    - Test title length constraints (30–60 chars)
    - Test description length constraints (120–160 chars)
    - Test breadcrumb generation from various URL paths
    - Test fallback behavior when no keyword/description defined
    - _Requirements: 7.1, 7.7_

- [x] 11. Create SEO landing pages
  - [x] 11.1 Build landing page template and generation system
    - Create `src/app/[locale]/landing/[slug]/page.tsx` as SSG page with MDX support
    - Include exercise embed component, FAQ section with FAQPage schema, internal links (3+ exercises, 2+ blog posts)
    - Ensure content exceeds 1500 words per page with <20% duplication between pages
    - _Requirements: 8.1, 8.3, 8.4, 8.5, 8.6_

  - [x] 11.2 Create game-specific landing pages
    - Create landing pages for "Valorant aim trainer", "CS2 aim trainer", "Fortnite aim trainer", "Apex Legends aim trainer"
    - Each page with unique 1500+ word content, embedded exercise, FAQ section (4+ Q&A), and internal links
    - _Requirements: 8.2, 8.3, 8.4, 8.5_

  - [x] 11.3 Create category landing pages
    - Create landing pages for each exercise category (flicking, tracking, speed, precision, reaction, game-specific)
    - Each with unique content, exercise embed, FAQ, and proper internal linking
    - _Requirements: 8.1, 8.3, 8.4, 8.5_

  - [x] 11.4 Implement playable exercise embed component
    - Create `src/components/ExerciseEmbed.tsx` that loads a specific exercise inline within landing pages and blog posts
    - Player can start and complete a round without navigating away
    - _Requirements: 8.4, 9.3_

- [x] 12. Implement content marketing and blog enhancements
  - [x] 12.1 Enhance blog system with content requirements
    - Update `src/app/blog/[slug]/page.tsx` to enforce heading hierarchy (one H1, H2 sections, optional H3 nested in H2)
    - Implement table of contents generation for posts exceeding 2000 words (H2 + H3 as anchor links)
    - Add word count validation (minimum 1500 words, prevent publication if below)
    - _Requirements: 9.1, 9.2, 9.7_

  - [x] 12.2 Add author profiles and blog categorization
    - Create `src/lib/blog/authors.ts` with author profiles and Schema.org Person markup
    - Implement blog category system: Training Guides, Game-Specific Tips, Settings Optimization, Pro Player Analysis
    - Each post assigned exactly one category
    - _Requirements: 9.5, 9.6_

  - [x] 12.3 Implement internal linking within blog posts
    - Create `src/components/InternalLink.tsx` for contextual links within post bodies
    - Ensure 2–5 internal links per post pointing to exercises or guides sharing category/tag
    - _Requirements: 18.2_

  - [x] 12.4 Write unit tests for blog content validation
    - Test word count enforcement (reject below 1500)
    - Test heading hierarchy validation
    - Test table of contents generation for 2000+ word posts
    - _Requirements: 9.1, 9.2, 9.7_

- [x] 13. Implement internal linking and site architecture
  - [x] 13.1 Implement breadcrumb navigation component
    - Create `src/components/Breadcrumbs.tsx` displaying full hierarchical path from homepage to current page
    - Add to all pages at depth ≥ 2 with clickable links separated by delimiter
    - Include BreadcrumbList structured data
    - _Requirements: 18.1, 7.3_

  - [x] 13.2 Implement related exercises widget
    - Create `src/components/RelatedExercises.tsx` showing 3–5 exercises from same category
    - If fewer than 3 in same category, supplement with exercises from related categories
    - _Requirements: 18.4_

  - [x] 13.3 Implement site-wide footer with section links
    - Create `src/components/Footer.tsx` with links to all major sections: exercises, categories, blog, tools, leaderboards, legal pages
    - Ensure footer renders on every page
    - _Requirements: 18.5_

  - [x] 13.4 Ensure 3-click navigation depth from homepage
    - Audit and update header/footer/navigation to ensure every page is reachable within 3 clicks from homepage
    - Add category navigation in header, exercise links in category pages
    - _Requirements: 18.3_

- [x] 14. Checkpoint - SEO and content systems complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Implement social sharing and viral growth features
  - [x] 15.1 Implement shareable results card generation
    - Create `src/app/api/share/card/route.ts` that generates a 1200x630px results card image using sharp/canvas
    - Include player score, accuracy %, leaderboard position (if top 10), and exercise name
    - _Requirements: 12.1_

  - [x] 15.2 Implement challenge-a-friend system
    - Create `src/app/api/challenge/route.ts` for generating unique challenge URLs (valid 30 days)
    - Create `src/app/challenge/[code]/page.tsx` that displays challenger's score as benchmark and links to exercise
    - Show "challenge unavailable" message for expired/invalid URLs with navigation to exercise list
    - _Requirements: 12.3, 12.5_

  - [x] 15.3 Implement Open Graph meta tags for shared links
    - Ensure challenge URLs and score share links include og:title, og:description, og:image
    - Serve proper previews on Twitter, Discord, Facebook
    - _Requirements: 12.2_

  - [x] 15.4 Implement leaderboard promotion share prompts
    - Detect when player enters top 10 or moves up a tier (10–4, 3–1)
    - Display one-click share option with player name, tier, exercise name, score
    - _Requirements: 12.4_

  - [x] 15.5 Write unit tests for challenge link generation
    - Test URL generation produces valid 6+ char codes
    - Test expiry logic (30 days)
    - Test invalid/expired link handling
    - _Requirements: 12.3, 12.5_

- [x] 16. Implement PWA and offline support
  - [x] 16.1 Configure service worker and web app manifest
    - Update `public/manifest.json` with complete PWA manifest (icons, display: standalone, theme_color)
    - Configure next-pwa with Workbox strategies: StaleWhileRevalidate for exercise definitions, CacheFirst (30 days) for static assets, NetworkFirst for API responses
    - Ensure installable on Chromium (desktop/mobile) and Safari (iOS/macOS)
    - _Requirements: 11.1, 11.2_

  - [x] 16.2 Implement offline score queue
    - Create `src/lib/pwa/offline-queue.ts` with queueOfflineScore (max 50 items) and flushOfflineQueue (chronological, within 30 seconds, retry 3x)
    - Store queued scores in IndexedDB/localStorage
    - _Requirements: 11.3, 11.6_

  - [x] 16.3 Implement offline indicator and pre-caching
    - Create `src/components/OfflineIndicator.tsx` displaying visible offline indicator within 3 seconds of connectivity loss
    - Pre-cache 5 most recently played exercises (engine script, definitions, CSS, audio)
    - _Requirements: 11.4, 11.5_

  - [x] 16.4 Write unit tests for offline queue
    - Test queue capacity (rejects at 50)
    - Test chronological flush order
    - Test retry logic (max 3 attempts)
    - _Requirements: 11.3, 11.6_

- [x] 17. Implement multiplayer and real-time competition
  - [x] 17.1 Set up WebSocket server infrastructure
    - Create `src/lib/multiplayer/ws-server.ts` with Socket.io server configuration (separate Node process for Railway/Fly.io)
    - Implement room creation (6 alphanumeric char code, 5-minute expiry)
    - Implement join, score_update, exercise_complete, disconnect events
    - _Requirements: 19.1, 19.2_

  - [x] 17.2 Implement match lifecycle management
    - Create `src/lib/multiplayer/match-manager.ts` handling room states: waiting → countdown → active → completed
    - Implement 3-second countdown synchronization when both players join
    - Implement opponent score display updating at least once per second
    - Implement 30-second disconnect pause with reconnection countdown
    - Handle double-disconnect (cancel match, no result)
    - _Requirements: 19.1, 19.3, 19.4, 19.5, 19.9_

  - [x] 17.3 Implement bot opponent system
    - Create `src/lib/multiplayer/bot.ts` that offers bot after 15 seconds of no matchmaking
    - Simulate bot performance within ±10% of player's average from last 10 sessions
    - Display "BOT" label on opponent name in score display, lobby, and results
    - _Requirements: 19.6, 19.7, 19.8_

  - [x] 17.4 Build multiplayer UI components
    - Create `src/components/MultiplayerLobby.tsx` with room code input/display, opponent info
    - Create `src/components/MatchResults.tsx` showing comparison: both scores, accuracy, avg time-to-kill
    - Create `src/components/OpponentScore.tsx` for real-time score overlay during match
    - _Requirements: 19.1, 19.3, 19.5_

  - [x] 17.5 Write unit tests for multiplayer logic
    - Test room code generation (6 alphanumeric chars, unique)
    - Test room expiry after 5 minutes
    - Test bot score calculation within ±10% of player average
    - Test disconnect handling (30s pause, forfeit after timeout)
    - _Requirements: 19.2, 19.4, 19.6, 19.7_

- [x] 18. Checkpoint - Multiplayer and social features complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 19. Implement performance optimization and Core Web Vitals
  - [x] 19.1 Implement code splitting and lazy loading
    - Configure dynamic imports for exercise-specific code (load on demand, begin within 1 second on 4G)
    - Lazy-load images and scripts below initial viewport (native lazy-loading or dynamic import, triggered within 200px of scroll position)
    - Ensure initial JS bundle ≤ 200 KB compressed transfer size
    - _Requirements: 10.4, 10.8, 17.2_

  - [x] 19.2 Implement asset optimization and caching
    - Configure cache headers for 30+ day browser caching on all static assets
    - Implement Brotli compression for JS/CSS (fallback to gzip when Brotli unsupported)
    - Configure next/image optimization with explicit width/height and srcset breakpoints (640, 750, 828, 1080, 1200px)
    - _Requirements: 10.5, 10.6, 10.7, 17.4_

  - [x] 19.3 Implement font and CSS preloading
    - Add preload link hints in document head for fonts and above-fold CSS
    - Ensure no layout shift or flash of unstyled content above the fold
    - Implement loading skeleton placeholder (visible within 500ms on Slow 3G)
    - _Requirements: 17.3, 17.5_

  - [x] 19.4 Optimize for Core Web Vitals targets
    - Target LCP ≤ 2.5s on 4G (9 Mbps, 150ms RTT)
    - Target INP ≤ 200ms
    - Target CLS < 0.1
    - Maintain 60fps during active exercises on WebGL 2.0 hardware
    - _Requirements: 10.1, 10.2, 10.3, 17.1_

  - [x] 19.5 Write performance integration tests
    - Test bundle size ≤ 200 KB compressed
    - Test exercise load time < 1 second from user selection
    - Verify cache headers on static assets
    - _Requirements: 10.4, 10.5, 10.8_

- [x] 20. Implement mobile responsiveness and accessibility
  - [x] 20.1 Implement responsive layout system
    - Ensure all non-exercise pages render without horizontal scrolling on 320px–2560px viewports
    - Implement single-column reflow for viewports ≤ 768px
    - Touch-optimized navigation: all tap targets ≥ 44x44 CSS pixels with ≥ 8px spacing
    - _Requirements: 15.1, 15.2, 15.5_

  - [x] 20.2 Implement mobile exercise recommendations
    - Display non-blocking message recommending desktop/landscape mode on viewports ≤ 768px in portrait
    - Ensure all non-exercise pages pass Google Mobile-Friendly Test
    - _Requirements: 15.3, 15.4_

  - [x] 20.3 Implement accessibility features
    - Achieve WCAG 2.1 Level AA on all pages except active exercise canvas
    - Create 3 alternative target color palettes for protanopia, deuteranopia, tritanopia
    - Add as selectable accessibility settings in UI
    - _Requirements: 20.1, 20.2_

  - [x] 20.4 Implement language selection and persistence
    - Create language selector component in settings/navigation
    - Persist language preference in localStorage
    - Serve all UI text in selected language on subsequent visits
    - Default to English when no preference stored
    - Fallback to English for unavailable translated strings
    - _Requirements: 20.3, 20.4, 20.6, 20.7_

  - [x] 20.5 Write unit tests for i18n and accessibility
    - Test language fallback to English for missing translations
    - Test language persistence in localStorage
    - Test color palette switching for accessibility modes
    - _Requirements: 20.3, 20.4, 20.6_

- [x] 21. Implement analytics and growth tracking
  - [x] 21.1 Implement analytics event tracking system
    - Create `src/lib/analytics/tracker.ts` recording page views, unique users, session duration (30-min inactivity timeout), bounce rate per page
    - Track exercise completion rates, average scores, player retention (1-day, 7-day, 30-day)
    - Update metrics at least every 24 hours
    - _Requirements: 16.1, 16.2_

  - [x] 21.2 Implement Google Search Console integration
    - Create `src/lib/analytics/gsc-integration.ts` to display organic search impressions, clicks, average position per keyword
    - Refresh data at least every 48 hours
    - Display cached data with timestamp notice on retrieval failure (120s timeout)
    - _Requirements: 16.3, 16.6_

  - [x] 21.3 Implement analytics dashboard
    - Create `src/app/admin/analytics/page.tsx` accessible only to site-owner accounts
    - Display traffic sources, top 10 pages by unique visitors, conversion paths (visitor → exercise completion)
    - _Requirements: 16.5_

  - [x] 21.4 Implement milestone notification system
    - Create `src/lib/analytics/milestones.ts` that detects when MAU crosses 10k, 25k, 50k, 100k thresholds
    - Send email notification to site owner within 24 hours of threshold crossing
    - _Requirements: 16.4_

  - [x] 21.5 Write unit tests for analytics tracking
    - Test session duration calculation with 30-minute timeout
    - Test bounce rate calculation (single page view = bounce)
    - Test milestone detection at threshold crossings
    - _Requirements: 16.1, 16.4_

- [x] 22. Wire all systems together and final integration
  - [x] 22.1 Integrate exercise system with UI and scoring pipeline
    - Connect new exercise registry with the existing exercise selection UI in page.tsx
    - Wire exercise completion → score engine → progression update → leaderboard submission pipeline
    - Ensure results display within 2 seconds of completion showing score, accuracy, hits, KPS
    - Display empty category message when no exercises available in selected category
    - _Requirements: 1.4, 1.6, 1.7, 5.2_

  - [x] 22.2 Integrate authentication with all features
    - Wire NextAuth session to leaderboard submissions, progression tracking, multiplayer
    - Ensure guest mode works (localStorage) without authentication
    - Wire social sharing to authenticated user profiles
    - _Requirements: 4.3, 4.4_

  - [x] 22.3 Integrate SEO engine across all pages
    - Apply metadata-generator to all pages (exercises, blog, landing, tools, legal)
    - Verify Lighthouse SEO score of 100 on home, blog index, blog posts, and static pages
    - Ensure all structured data renders correctly
    - _Requirements: 7.1–7.7_

  - [x] 22.4 Wire i18n across all user-facing components
    - Apply next-intl translations to all navigation labels, buttons, headings, form labels, settings, error messages
    - Wire hreflang generation for all language-versioned pages
    - Test language switching end-to-end
    - _Requirements: 20.3–20.7_

  - [x] 22.5 Write integration tests for end-to-end flows
    - Test exercise completion → score → leaderboard pipeline
    - Test auth → sync → progression flow
    - Test offline exercise → queue → online flush flow
    - _Requirements: 1.4, 4.3, 11.3, 11.6_

- [x] 23. Final checkpoint - All systems integrated
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation between major phases
- The project uses TypeScript with Next.js 14, MongoDB, Three.js, and Tailwind CSS
- The WebSocket server for multiplayer runs as a separate process (Railway/Fly.io) since Netlify Functions don't support persistent connections
- SEO pages use SSR/SSG; exercise gameplay remains client-side Three.js
- All i18n text uses next-intl with JSON message bundles

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "1.4"] },
    { "id": 2, "tasks": ["2.1", "3.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "3.2", "3.3", "3.4", "3.5"] },
    { "id": 4, "tasks": ["2.4", "3.6", "3.7"] },
    { "id": 5, "tasks": ["5.1", "7.1"] },
    { "id": 6, "tasks": ["5.2", "5.3", "7.2", "7.3", "7.4"] },
    { "id": 7, "tasks": ["5.4", "6.1", "8.1", "8.2"] },
    { "id": 8, "tasks": ["6.2", "6.3", "6.4", "8.3", "8.4"] },
    { "id": 9, "tasks": ["10.1", "10.2", "10.3"] },
    { "id": 10, "tasks": ["10.4", "10.5", "11.1", "11.4"] },
    { "id": 11, "tasks": ["11.2", "11.3", "12.1", "12.2"] },
    { "id": 12, "tasks": ["12.3", "12.4", "13.1", "13.2", "13.3"] },
    { "id": 13, "tasks": ["13.4", "15.1", "15.2"] },
    { "id": 14, "tasks": ["15.3", "15.4", "15.5", "16.1"] },
    { "id": 15, "tasks": ["16.2", "16.3", "16.4"] },
    { "id": 16, "tasks": ["17.1"] },
    { "id": 17, "tasks": ["17.2", "17.3"] },
    { "id": 18, "tasks": ["17.4", "17.5"] },
    { "id": 19, "tasks": ["19.1", "19.2", "19.3"] },
    { "id": 20, "tasks": ["19.4", "19.5", "20.1", "20.2"] },
    { "id": 21, "tasks": ["20.3", "20.4", "20.5"] },
    { "id": 22, "tasks": ["21.1", "21.2", "21.3", "21.4"] },
    { "id": 23, "tasks": ["21.5", "22.1", "22.2"] },
    { "id": 24, "tasks": ["22.3", "22.4", "22.5"] }
  ]
}
```
