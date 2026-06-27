# Requirements Document

## Introduction

This document defines requirements for transforming AimTrainerPro from a basic aim tracking website with 5 core exercises into a comprehensive, competitive aim trainer platform capable of ranking first on Google and Bing for aim trainer keywords and achieving 100k monthly active users. The transformation covers new training modes, advanced SEO strategy, user engagement systems, performance optimization, content marketing, and social/competitive features.

## Glossary

- **Trainer**: The AimTrainerPro web application running at aimtrainerpro.online
- **Player**: A user who interacts with the Trainer to practice aim exercises
- **Exercise**: A single aim training scenario with defined mechanics, scoring, and duration
- **Category**: A grouping of related exercises (e.g., Flicking, Tracking, Speed)
- **Session**: A continuous period of training by a Player, from start to completion of one exercise run
- **Score_Engine**: The subsystem responsible for calculating, normalizing, and persisting Player performance metrics
- **Leaderboard_Service**: The backend API and database layer managing global and per-exercise rankings
- **SEO_Engine**: The collection of technical SEO components including structured data, sitemaps, meta tags, and page generation
- **Content_System**: The blog and landing page infrastructure for publishing SEO-optimized training content
- **Analytics_Tracker**: The system that records Player behavior, session data, and engagement metrics
- **Progression_System**: The subsystem that tracks Player improvement over time and assigns skill ratings
- **Renderer**: The Three.js-based 3D rendering layer responsible for drawing targets and game visuals
- **PWA_Shell**: The Progressive Web App service worker and manifest configuration enabling offline and installable behavior

## Requirements

### Requirement 1: Expanded Exercise Library

**User Story:** As a Player, I want access to a diverse library of aim training exercises across multiple categories, so that I can train all aspects of my aim comprehensively.

#### Acceptance Criteria

1. THE Trainer SHALL provide exercises organized into at least 6 distinct categories: Flicking, Tracking, Speed, Precision, Reaction, and Game-Specific Scenarios
2. WHEN a Player selects a category, THE Trainer SHALL display at least 5 exercises within that category, each showing the exercise name, description, difficulty rating, and focus stats
3. THE Trainer SHALL assign each exercise a difficulty rating as an integer from 1 to 5, where 1 represents the easiest and 5 represents the hardest
4. WHEN a Player completes an exercise, THE Score_Engine SHALL calculate a normalized score from 0 to 1000 based on a weighted combination of accuracy (hits divided by total clicks), speed (hits per second), and consistency (standard deviation of reaction times across hits), where accuracy contributes 50%, speed contributes 30%, and consistency contributes 20%
5. THE Trainer SHALL provide a "Daily Challenge" exercise that rotates every 24 hours at 00:00 UTC and is identical for all Players on a given calendar day (UTC)
6. IF a Player selects a category that contains no exercises, THEN THE Trainer SHALL display a message indicating that no exercises are available in that category
7. WHEN a Player completes an exercise, THE Score_Engine SHALL display the final score, accuracy percentage, total hits out of total clicks, and hits per second within 2 seconds of exercise completion

### Requirement 2: Advanced Tracking Exercises

**User Story:** As a Player, I want tracking exercises with realistic movement patterns, so that I can improve my ability to follow moving targets in FPS games.

#### Acceptance Criteria

1. THE Trainer SHALL provide tracking exercises with at least 4 distinct movement patterns: linear strafing at constant velocity, sinusoidal movement along a curved path, random direction changes at intervals between 500 and 2000 milliseconds, and acceleration/deceleration with speed varying between 25% and 100% of the base movement speed
2. WHEN a Player engages a tracking exercise, THE Score_Engine SHALL calculate tracking accuracy as the percentage of time the cursor center point remains within the target hitbox, sampled at a minimum rate of 30 times per second
3. WHERE reactive tracking mode is selected, THE Trainer SHALL change the target direction when the cursor center point is within 1.5x the target radius, within 100 milliseconds of detecting the cursor proximity
4. WHILE a tracking exercise is active, THE Trainer SHALL display the tracking accuracy percentage updated at least once per frame, showing a value between 0% and 100% rounded to the nearest whole number
5. WHEN a tracking exercise duration of 60 seconds elapses, THE Score_Engine SHALL end the exercise and display the final tracking accuracy percentage alongside total score

### Requirement 3: Flicking and Click-Timing Exercises

**User Story:** As a Player, I want varied flicking exercises that simulate real FPS engagements, so that I can improve my flick speed and precision.

#### Acceptance Criteria

1. THE Trainer SHALL provide flicking exercises with configurable target distances where the Player selects from at least three distance presets: micro-flick (5 to 15 degrees from crosshair center), medium-flick (16 to 90 degrees), and wide-flick (91 to 180 degrees)
2. WHEN a target spawns in a flicking exercise, THE Score_Engine SHALL record time-to-kill in milliseconds from target appearance to successful hit, up to a maximum of 5000 milliseconds after which the target is marked as missed
3. THE Trainer SHALL provide a "headshot only" flicking mode where each target displays a critical zone sized at 30% of the standard target radius and hitting the critical zone awards 2x the base hit reward points while hitting outside the critical zone counts as a miss
4. THE Trainer SHALL provide a multi-target flicking mode where 2 to 6 targets spawn simultaneously, each target displays a visible numeric label indicating elimination order, and the Player must eliminate them in the displayed sequence
5. IF the Player hits a target out of the displayed sequence in multi-target flicking mode, THEN THE Score_Engine SHALL count the hit as a miss and apply the miss penalty without removing the target

### Requirement 4: User Accounts and Authentication

**User Story:** As a Player, I want to create an account so that my progress, scores, and settings persist across devices.

#### Acceptance Criteria

1. THE Trainer SHALL provide account creation using email and password, requiring a password length between 8 and 128 characters
2. THE Trainer SHALL provide authentication via Google OAuth and Discord OAuth
3. WHEN a Player authenticates, THE Trainer SHALL sync local progress data (exercise results, scores, sensitivity settings, and crosshair configurations) to the server-side profile, with server-side data taking precedence where conflicts exist
4. IF a Player does not authenticate, THEN THE Trainer SHALL store progress locally in browser storage and allow full access to all exercises
5. THE Trainer SHALL allow authenticated Players to set a unique display name between 3 and 16 alphanumeric characters including underscores
6. IF a Player attempts to set a display name that is already taken, THEN THE Trainer SHALL reject the submission and display an error message indicating the name is unavailable
7. IF a sync operation fails due to network or server unavailability, THEN THE Trainer SHALL retain the local progress data and retry sync on the next successful authentication

### Requirement 5: Progression and Skill Rating System

**User Story:** As a Player, I want a visible progression system that tracks my improvement over time, so that I stay motivated to train regularly.

#### Acceptance Criteria

1. THE Progression_System SHALL assign each Player a skill rating from 0 to 5000, calculated from a composite of score and accuracy across all exercises
2. WHEN a Player completes an exercise, THE Progression_System SHALL update the skill rating using a recency-weighted average of the last 20 sessions per exercise, where the most recent session carries the highest weight
3. IF a Player has completed fewer than 20 sessions for an exercise, THEN THE Progression_System SHALL calculate the weighted average using all available sessions for that exercise
4. THE Progression_System SHALL assign Players to one of 8 ranked tiers based on skill rating thresholds: Iron (0–624), Bronze (625–1249), Silver (1250–1874), Gold (1875–2499), Platinum (2500–3124), Diamond (3125–3749), Immortal (3750–4374), Radiant (4375–5000)
5. THE Trainer SHALL display a performance graph plotting score per session over the last 30 days for each exercise
6. IF fewer than 2 data points exist for an exercise within the last 30 days, THEN THE Trainer SHALL display a message indicating insufficient data in place of the graph
7. WHEN a Player achieves a new personal best score for any exercise, THE Trainer SHALL display a notification for 5 seconds and update the personal records page

### Requirement 6: Global Leaderboard System

**User Story:** As a Player, I want to compete on global leaderboards so that I can compare my aim to other players worldwide.

#### Acceptance Criteria

1. THE Leaderboard_Service SHALL maintain separate rankings for each exercise (static_grid, micro_adjust, pop_up_reflex, strafe_track, dynamic_flicks)
2. THE Leaderboard_Service SHALL display the top 100 Players per exercise, showing each entry's numeric score, hit accuracy as a percentage (0–100%), and position number
3. WHEN a Player submits a score, THE Leaderboard_Service SHALL validate that the score is a non-negative integer not exceeding the maximum achievable score for that exercise (hit_reward × maximum_possible_hits_in_duration) and that the player name is between 1 and 64 characters
4. IF a submitted score fails validation, THEN THE Leaderboard_Service SHALL reject the submission and return an error response indicating the reason for rejection without modifying the existing rankings
5. THE Leaderboard_Service SHALL provide daily (resetting at 00:00 UTC), weekly (resetting Monday 00:00 UTC), and all-time leaderboard views for each exercise
6. THE Leaderboard_Service SHALL update rankings within 5 seconds of score submission

### Requirement 7: Technical SEO Infrastructure

**User Story:** As the site owner, I want comprehensive technical SEO so that search engines can discover, crawl, and rank all pages effectively.

#### Acceptance Criteria

1. THE SEO_Engine SHALL generate a unique title tag for every page that is between 30 and 60 characters in length and contains at least one target keyword defined for that page, and a unique meta description between 120 and 160 characters in length that summarizes the page content
2. THE SEO_Engine SHALL produce an XML sitemap at /sitemap.xml that includes all exercise pages, blog posts, category pages, and landing pages, and SHALL regenerate the sitemap on each site build so that newly published or removed pages are reflected without manual intervention
3. THE SEO_Engine SHALL include Schema.org WebApplication structured data on the home page, BreadcrumbList structured data on all pages with a navigation depth of 2 or more, Article structured data on all blog post pages, and FAQPage or HowTo structured data on exercise and guide pages that contain FAQ or step-by-step content
4. THE SEO_Engine SHALL generate a self-referencing canonical URL in the link rel="canonical" element for every page, using the absolute URL with the preferred domain
5. THE Trainer SHALL achieve a Lighthouse SEO score of 100 on the home page, blog index page, each individual blog post page, and every static page (about, contact, privacy-policy, terms)
6. IF multiple language versions of a page are available, THEN THE SEO_Engine SHALL produce hreflang link elements in the page head that reference each available language version including a self-referencing hreflang for the current language
7. IF a page does not have a defined target keyword or meta description source, THEN THE SEO_Engine SHALL fall back to generating the title from the page heading text (truncated to 60 characters) and the description from the first 160 characters of page body content

### Requirement 8: SEO-Optimized Landing Pages

**User Story:** As the site owner, I want dedicated landing pages for high-value keywords so that the site ranks for competitive search terms.

#### Acceptance Criteria

1. THE Content_System SHALL generate dedicated landing pages for each exercise category and for each game-specific keyword, where each page contains content exceeding 1500 words that does not duplicate more than 20% of body text from any other landing page on the site
2. THE Content_System SHALL generate landing pages targeting game-specific keywords including "Valorant aim trainer", "CS2 aim trainer", "Fortnite aim trainer", and "Apex Legends aim trainer"
3. WHEN a landing page is created, THE SEO_Engine SHALL include internal links to at least 3 exercises and at least 2 blog posts that share the same game or skill focus as the landing page topic
4. THE Content_System SHALL include a playable exercise embed on each landing page that loads an interactive exercise matching the page topic and allows the Player to start and complete a round without navigating to a separate page
5. THE Content_System SHALL generate an FAQ section on each landing page containing at least 4 question-answer pairs, each marked up with Schema.org FAQPage structured data
6. IF fewer than 3 exercises or fewer than 2 blog posts match the landing page topic, THEN THE Content_System SHALL link to the closest available exercises or blog posts to fulfill the minimum internal link count

### Requirement 9: Content Marketing and Blog Strategy

**User Story:** As the site owner, I want a comprehensive blog with training guides, so that the site attracts organic traffic from informational queries.

#### Acceptance Criteria

1. THE Content_System SHALL support blog posts with a minimum word count of 1500 words and a heading hierarchy containing exactly one H1 element as the post title, followed by one or more H2 sections, with optional H3 subsections nested within their parent H2
2. IF a blog post exceeds 2000 words, THEN THE Content_System SHALL generate a table of contents listing all H2 and H3 headings as navigable anchor links, displayed before the first H2 of the post body
3. THE Content_System SHALL support embedding playable exercise widgets within blog posts, where each widget launches an aim training exercise from the site's existing exercise library and is interactive without navigating away from the post
4. WHEN a blog post is published, THE SEO_Engine SHALL automatically update the XML sitemap within 1 hour to include the new post URL with its publication date
5. THE Content_System SHALL support author profiles with Schema.org Person markup containing at minimum the author name and a link to the author's profile page
6. THE Content_System SHALL categorize each blog post under exactly one of the following topics: Training Guides, Game-Specific Tips, Settings Optimization, or Pro Player Analysis
7. IF a blog post contains fewer than 1500 words at the time of publishing, THEN THE Content_System SHALL prevent publication and display an error message indicating the current word count and the 1500-word minimum requirement

### Requirement 10: Performance Optimization

**User Story:** As a Player, I want the Trainer to load quickly and run smoothly, so that my training is not interrupted by lag or slow loading.

#### Acceptance Criteria

1. THE Trainer SHALL achieve a Largest Contentful Paint under 2.5 seconds on a simulated 4G connection throttled to 9 Mbps download, 1.5 Mbps upload, and 150ms round-trip latency
2. THE Trainer SHALL achieve a Cumulative Layout Shift score below 0.1
3. WHILE an exercise is actively running, THE Renderer SHALL maintain a frame rate of at least 60 frames per second on hardware supporting WebGL 2.0
4. WHEN a Player selects an exercise, THE Trainer SHALL load the exercise-specific code on demand and begin the exercise within 1 second on a 4G connection
5. THE Trainer SHALL serve all static assets with cache headers enabling browser caching for at least 30 days
6. IF the client supports Brotli compression, THEN THE Trainer SHALL serve all JavaScript and CSS assets with Brotli encoding
7. IF the client does not support Brotli compression, THEN THE Trainer SHALL serve all JavaScript and CSS assets with gzip encoding
8. THE Trainer SHALL deliver an initial JavaScript bundle no larger than 200 KB (compressed transfer size) before exercise-specific code is loaded

### Requirement 11: Progressive Web App

**User Story:** As a Player, I want to install the Trainer as an app and use it offline, so that I can practice even without internet.

#### Acceptance Criteria

1. THE PWA_Shell SHALL serve a valid web app manifest and service worker such that the Trainer is installable as a standalone app on Chromium-based browsers (desktop and mobile) and Safari (iOS and macOS)
2. THE PWA_Shell SHALL cache exercise assets (the exercise engine script, exercise definition data, associated CSS, and audio files) so that previously-played exercises work without internet connectivity
3. WHEN a Player completes an exercise offline, THE PWA_Shell SHALL queue the score in local storage (up to a maximum of 50 pending scores) for submission when connectivity is restored
4. WHILE the Player has no internet connection, THE PWA_Shell SHALL display a visible offline indicator within 3 seconds of connectivity loss that remains visible until connectivity is restored
5. THE PWA_Shell SHALL pre-cache the 5 most recently played exercises (including their engine script, definition data, CSS, and audio files) for offline use
6. WHEN connectivity is restored, THE PWA_Shell SHALL attempt to submit all queued offline scores in chronological order within 30 seconds, retrying each failed submission up to 3 times before discarding it

### Requirement 12: Social Sharing and Viral Growth

**User Story:** As a Player, I want to share my scores and achievements on social media, so that I can attract friends to compete with me.

#### Acceptance Criteria

1. WHEN a Player completes an exercise, THE Trainer SHALL provide a shareable results card image with dimensions of 1200x630 pixels showing the Player's score, accuracy percentage, leaderboard position (if within top 10), and exercise name
2. WHEN a shared score link is accessed, THE Trainer SHALL serve Open Graph meta tags including title, description, and the results card image so that link previews render on Twitter, Discord, and Facebook
3. WHEN a Player selects the "Challenge a Friend" option after completing an exercise, THE Trainer SHALL generate a unique URL that links to the same exercise and displays the challenger's score as a benchmark to beat, and the URL SHALL remain valid for 30 days from creation
4. WHEN a Player's leaderboard position changes from outside the top 10 to within the top 10, or moves up a tier (positions 10-4, positions 3-1), THE Trainer SHALL display a one-click share option that posts a message containing the Player's name, new leaderboard tier, exercise name, and score to the Player's chosen platform
5. IF the challenge URL has expired or references an exercise that no longer exists, THEN THE Trainer SHALL display a message indicating the challenge is unavailable and offer navigation to the exercise list

### Requirement 13: Sensitivity Converter and Settings Tools

**User Story:** As a Player, I want a sensitivity converter tool so that my aim trainer sensitivity matches my in-game settings exactly.

#### Acceptance Criteria

1. THE Trainer SHALL provide a sensitivity converter that allows selection from at least 15 FPS games including Valorant, CS2, Overwatch 2, Apex Legends, and Fortnite, each with a game-specific conversion formula that translates the game's native sensitivity value to the trainer's sensitivity scale
2. WHEN a Player selects a game, enters a sensitivity value between 0.01 and 100, and enters a DPI value between 100 and 16000, THE Trainer SHALL calculate and display the equivalent trainer sensitivity within 0.1% accuracy of the mathematically correct conversion
3. IF a Player enters a DPI value or sensitivity value outside the supported range or in a non-numeric format, THEN THE Trainer SHALL display an error message indicating the valid input range and SHALL NOT perform a conversion
4. THE Trainer SHALL provide a DPI analyzer tool that measures mouse movement distance in pixels over a fixed physical distance and displays the calculated effective DPI as a numeric value
5. THE Trainer SHALL persist up to 20 game sensitivity profiles in local storage so that saved profiles remain available across browser sessions, and each profile SHALL store the selected game, sensitivity value, and DPI
6. WHEN a Player selects a previously saved game profile, THE Trainer SHALL load and apply that profile's sensitivity settings within 1 second without requiring recalculation

### Requirement 14: Customization and Training Plans

**User Story:** As a Player, I want customizable training routines, so that I can follow structured practice plans tailored to my weaknesses.

#### Acceptance Criteria

1. THE Trainer SHALL provide at least 1 pre-built training plan for each of the beginner, intermediate, and advanced levels, with each plan containing between 5 and 15 exercises in a defined sequence
2. THE Trainer SHALL allow Players to create custom playlists containing between 2 and 20 exercises that auto-advance after each completion
3. WHEN a Player starts a training plan, THE Trainer SHALL track completion percentage and estimated remaining time based on the configured duration of each remaining exercise
4. WHEN a Player opens the training plan selection screen, THE Trainer SHALL recommend at least 3 exercises where the Player's average score over their last 20 sessions ranks in the bottom 25th percentile of their own exercise scores as identified by the Progression_System
5. THE Trainer SHALL allow Players to configure exercise duration between 15 and 180 seconds in 1-second increments
6. IF a Player skips or abandons an exercise within a training plan, THEN THE Trainer SHALL mark that exercise as incomplete, exclude it from the completion percentage, and advance to the next exercise in the plan

### Requirement 15: Mobile Responsiveness and Touch Support

**User Story:** As a Player, I want the Trainer to work on mobile devices so that I can access leaderboards, stats, and settings on any device.

#### Acceptance Criteria

1. THE Trainer SHALL render all non-exercise pages (leaderboards, stats, blog, settings) without horizontal scrolling and without requiring zoom to read text on viewports from 320px to 2560px width
2. WHILE a Player is on a viewport of 768px width or less, THE Trainer SHALL display touch-optimized navigation with all interactive tap targets measuring at least 44x44 CSS pixels and at least 8px spacing between adjacent targets
3. WHEN a Player accesses an exercise page on a viewport of 768px width or less in portrait orientation, THE Trainer SHALL display a non-blocking message recommending desktop or landscape mode for the training experience
4. THE Trainer SHALL pass Google Mobile-Friendly Test for all non-exercise pages (leaderboards, stats, blog, settings, about, contact)
5. WHILE a Player is on a viewport of 768px width or less, THE Trainer SHALL reflow page content into a single-column layout with text remaining readable at default font size without horizontal scrolling

### Requirement 16: Analytics and Growth Tracking

**User Story:** As the site owner, I want detailed analytics so that I can measure user acquisition, retention, and engagement metrics toward the 100k user goal.

#### Acceptance Criteria

1. THE Analytics_Tracker SHALL record page views, unique users (identified by distinct browser session), session duration (time from first to last interaction within a 30-minute inactivity timeout window), and bounce rate (percentage of visits with only a single page view) per page, updated at least every 24 hours
2. THE Analytics_Tracker SHALL track exercise completion rates (percentage of started exercises that are finished), average scores (mean percentage score across all completed exercises), and Player retention defined as the percentage of users who return and complete at least one exercise within 1-day, 7-day, and 30-day intervals after their first visit
3. THE Analytics_Tracker SHALL integrate with Google Search Console to display organic search impressions, clicks, and average position per keyword, with data refreshed at least every 48 hours
4. WHEN monthly active users exceed a defined threshold (10k, 25k, 50k, or 100k), THE Analytics_Tracker SHALL generate a milestone notification delivered via email to the site owner within 24 hours of the threshold being crossed
5. THE Analytics_Tracker SHALL provide a dashboard view accessible only to authenticated site-owner accounts, showing traffic sources, top 10 performing pages by unique visitors, and conversion paths where a conversion is defined as a visitor completing at least one exercise during their session
6. IF the Google Search Console integration fails to retrieve data within 120 seconds, THEN THE Analytics_Tracker SHALL display the most recently cached data along with a notice indicating the timestamp of the last successful data retrieval

### Requirement 17: Core Web Vitals and Page Speed

**User Story:** As the site owner, I want excellent Core Web Vitals scores so that Google ranks the site favorably in search results.

#### Acceptance Criteria

1. THE Trainer SHALL achieve the following Core Web Vitals thresholds on all pages when tested via Google PageSpeed Insights in mobile mode: Largest Contentful Paint (LCP) at or below 2.5 seconds, Interaction to Next Paint (INP) at or below 200 milliseconds, and Cumulative Layout Shift (CLS) at or below 0.1
2. THE Trainer SHALL lazy-load all images and scripts that are positioned outside the initial viewport (below 768px viewport height on mobile, below 900px viewport height on desktop) by applying native lazy-loading or dynamic import so that these resources are not requested until the user scrolls within 200px of them
3. THE Trainer SHALL preload all fonts and CSS required to render the initial viewport content by including preload link hints in the document head so that no layout shift or flash of unstyled content occurs above the fold on first paint
4. THE Trainer SHALL use next/image optimization for all image assets, specifying explicit width and height attributes that match the rendered container dimensions and providing srcset breakpoints at 640px, 750px, 828px, 1080px, and 1200px widths
5. IF a page has not rendered meaningful content within 1 second on a simulated Slow 3G connection (400 Kbps download, 400 ms RTT as defined by Chrome DevTools throttling profile), THEN THE Trainer SHALL display a loading skeleton placeholder within 500 milliseconds of navigation start that remains visible until the page content renders

### Requirement 18: Internal Linking and Site Architecture

**User Story:** As the site owner, I want a clear site architecture with strong internal linking so that search engines can discover all content efficiently.

#### Acceptance Criteria

1. THE Trainer SHALL implement a breadcrumb navigation on all pages at depth 2 or greater from the homepage, displaying the full hierarchical path from the homepage to the current page as a sequence of clickable links separated by a delimiter
2. THE Trainer SHALL include a minimum of 2 and a maximum of 5 contextual internal links within each blog post body, pointing to exercise pages or guide pages that share at least one category or tag with the blog post
3. THE SEO_Engine SHALL ensure every page is reachable within 3 clicks from the homepage, where a click is defined as any user-initiated navigation via links present in the header, footer, breadcrumbs, or page body content
4. THE Trainer SHALL implement a related exercises widget on each exercise page linking to 3 to 5 exercises that share the same category as the current exercise; IF fewer than 3 exercises exist in the same category, THEN THE Trainer SHALL supplement with exercises from related categories until a minimum of 3 links are displayed
5. THE Trainer SHALL generate a footer on every page containing links to all major sections: exercises, categories, blog, tools, leaderboards, and legal pages

### Requirement 19: Multiplayer and Real-Time Competition

**User Story:** As a Player, I want to compete against other Players in real time, so that I have more motivation to improve.

#### Acceptance Criteria

1. WHEN both Players have joined a 1v1 room, THE Trainer SHALL display a 3-second countdown and then start the same exercise for both Players at the same moment
2. WHEN a Player initiates a 1v1 challenge, THE Trainer SHALL generate a shareable room code consisting of 6 alphanumeric characters that the opponent can join within 5 minutes before the room expires
3. WHILE a 1v1 session is in progress, THE Trainer SHALL display the opponent's score alongside the Player's own score, updating both scores at least once per second
4. IF a Player disconnects during a 1v1 session, THEN THE Trainer SHALL pause the match for 30 seconds and display a reconnection countdown to the remaining Player before declaring a forfeit
5. WHEN a 1v1 match concludes, THE Trainer SHALL display a comparison screen showing both Players' final scores, accuracy percentages, and average time-to-kill in milliseconds
6. IF no human opponent is available within 15 seconds of matchmaking, THEN THE Trainer SHALL offer the Player a match against a Bot opponent
7. WHEN a Player competes against a Bot, THE Trainer SHALL simulate Bot performance by targeting a final score within plus or minus 10 percent of the Player's average score from their last 10 sessions in the selected exercise
8. THE Trainer SHALL display a "BOT" text label adjacent to the opponent's name in the score display, lobby screen, and results screen whenever the opponent is a Bot
9. IF both Players disconnect during a 1v1 session, THEN THE Trainer SHALL cancel the match and record no result for either Player

### Requirement 20: Accessibility and Internationalization

**User Story:** As the site owner, I want the Trainer to be accessible and available in multiple languages so that it can serve a global audience.

#### Acceptance Criteria

1. THE Trainer SHALL achieve WCAG 2.1 Level AA compliance on all pages except the active exercise canvas area (including but not limited to: homepage, blog, about, contact, privacy policy, and terms pages)
2. THE Trainer SHALL provide at least 3 alternative target color palettes designed for protanopia, deuteranopia, and tritanopia as selectable accessibility settings
3. THE Trainer SHALL support at least 6 languages for all user-facing UI text (navigation labels, buttons, headings, form labels, settings, and error messages): English, Spanish, Portuguese, German, Japanese, and Chinese (Simplified)
4. WHEN a Player selects a language, THE Trainer SHALL persist the preference in local storage and serve all UI text in the selected language on subsequent visits without requiring re-selection
5. THE SEO_Engine SHALL implement hreflang tags pointing to language-specific versions of each page
6. IF a translated string is unavailable for the selected language, THEN THE Trainer SHALL fall back to displaying the English version of that string
7. WHEN a Player visits the Trainer without a previously stored language preference, THE Trainer SHALL default to English
