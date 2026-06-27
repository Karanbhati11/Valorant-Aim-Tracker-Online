# Implementation Plan: Multi-Game Redesign

## Overview

This plan implements the multi-game redesign in five phases: (1) unit system and validation infrastructure, (2) exercise engine fixes and definition migration, (3) game profiles and navigation UI, (4) brand system overhaul, and (5) preservation verification. Each phase builds on the prior so there is no orphaned or disconnected code.

## Tasks

- [x] 1. Establish the Unit System and Validation Infrastructure
  - [x] 1.1 Create the unit-system module (`src/lib/exercises/unit-system.ts`)
    - Define the `UnitRange` interface, `UNIT_SYSTEM` constant with units, ranges, and playArea
    - Implement `clampToRange`, `isWithinRange`, and `maxReachableDistance` functions
    - Export a plain-data mirror suitable for serialization onto `window.UNIT_SYSTEM`
    - _Requirements: 2.1, 2.2, 2.7_

  - [x] 1.2 Write property test for clamping (Property 1)
    - **Property 1: Clamping maps any value to the nearest valid bound**
    - Use fast-check to generate arbitrary numbers and verify clampToRange returns a value within the valid range, equals the nearest bound when outside, and equals the input when inside
    - **Validates: Requirements 2.7**

  - [x] 1.3 Create the exercise validator (`src/lib/exercises/validator.ts`)
    - Implement `ValidationFailure` and `ValidationReport` interfaces
    - Implement `validateRegistry` that checks every definition's spawnDistance, targetSize, and pathSpeed against unit-system ranges
    - Flag definitions whose maxDistance exceeds `maxReachableDistance(targetSize)` as `unreachable`
    - Aggregate all failures across all definitions (do not stop at first)
    - Return `ok: true` with empty failures array when no violations found
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 1.4 Write property tests for the validator (Properties 18, 19, 20)
    - **Property 18: The validator detects out-of-range values and reports the offending id and field**
    - **Property 19: The validator flags unreachable spawn distances**
    - **Property 20: The validator reports every violation, not just the first**
    - Use fast-check to generate registries with known valid/invalid values and verify failure sets match expectations
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

  - [x] 1.5 Wire the validator into the build and test pipeline
    - Create `src/lib/exercises/validator.test.ts` that runs `validateRegistry` over the real registry and fails when `report.ok === false`
    - Add a prebuild script or integrate into existing build step so a validation failure terminates the build
    - _Requirements: 7.6, 7.7_

- [x] 2. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Fix the Exercise Engine and Bridge
  - [x] 3.1 Extract pure scoring and spawn helpers from the engine
    - Create `public/assets/js/exercises/engine-helpers.js` with pure functions: `resolveTargetSize`, `computeSpawnPosition`, `stepMovement`, `applyHit`, `applyMiss`, `computeResult`, `headshotReward`, `sequentialOutcome`, `trackingAccuracy`
    - These helpers read from a `UNIT_SYSTEM` parameter (no globals) so they are testable in Node via Vitest
    - Create a TypeScript wrapper/re-export at `src/lib/exercises/engine-helpers.ts` that imports the JS helpers for testing
    - _Requirements: 2.6, 2.7, 3.1, 3.2, 3.3, 3.5, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [x] 3.2 Fix target size handling in `exercise-engine.js`
    - Replace `if (isNaN(size) || size <= 0 || size > 10) size = 2.0;` with a call to the clamping helper that clamps to `[0.25, 10]`
    - Read bounds from `window.UNIT_SYSTEM` with fallback to hardcoded constants
    - Sizes within range are rendered exactly; out-of-range sizes are clamped to nearest bound
    - _Requirements: 2.6, 2.7, 3.5_

  - [x] 3.3 Fix spawn distance and placement in `exercise-engine.js`
    - Interpret `minDistance/maxDistance` as world-unit spawn distances in `[0, 35]`
    - Clamp spawn distance values using the unit-system helper
    - Cap effective radius at `maxReachableDistance(targetSize)` so target center + radius stays within play area
    - Apply same constraint for grid placement and concurrent target spawns
    - _Requirements: 3.1, 3.2, 3.6_

  - [x] 3.4 Fix path/movement clamping in `exercise-engine.js`
    - Extend bounce logic to account for target radius (not just center) so rendered extent stays inside play area
    - Clamp `pathSpeed` to `[0, 50]` using unit-system bounds
    - _Requirements: 3.3_

  - [x] 3.5 Fix scoring edge cases in `exercise-engine.js`
    - Ensure accuracy is `0` when both hits and misses are zero (not `hits/1`)
    - Verify miss penalty floors score at 0 via `Math.max(0, …)`
    - Pin headshot critical multiplier logic: multiplier only for hits inside critical zone
    - Pin sequential elimination logic: only in-order hits count
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [x] 3.6 Update the exercise bridge to expose `window.UNIT_SYSTEM`
    - Modify `src/lib/exercises/exercise-bridge.ts` `installBridge` to serialize and set `window.UNIT_SYSTEM` with the plain-data mirror from unit-system module
    - Ensure `toVanillaExercise` preserves numeric mechanics values without transformation
    - _Requirements: 2.4, 2.5_

  - [x] 3.7 Write property tests for engine helpers (Properties 2, 5, 6, 7, 8, 9, 10, 11, 12)
    - **Property 2: Target size resolution honors configured size and minimum hittable size**
    - **Property 5: Spawned targets are fully inside the reachable play area**
    - **Property 6: Moving targets stay inside the reachable play area for their whole lifetime**
    - **Property 7: A hit increases the score by the hit reward**
    - **Property 8: A miss applies the penalty and never drives the score below zero**
    - **Property 9: Final results are internally consistent and accuracy is well-defined**
    - **Property 10: Headshot scoring applies the critical multiplier only inside the critical zone**
    - **Property 11: Sequential elimination counts only in-order eliminations as hits**
    - **Property 12: Tracking accuracy equals on-target sample ratio within [0,1]**
    - **Validates: Requirements 2.6, 3.1, 3.2, 3.3, 3.5, 3.6, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8**

  - [x] 3.8 Write property test for bridge value preservation (Property 3)
    - **Property 3: The bridge preserves mechanics values**
    - Generate arbitrary ExerciseDefinition objects and verify toVanillaExercise output values are within 0.01 of source
    - **Validates: Requirements 2.5**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Migrate Exercise Definitions to the New Unit System
  - [x] 5.1 Migrate all exercise definitions to unit-system ranges
    - Update `src/lib/exercises/definitions/flicking.ts` — rescale minDistance/maxDistance to [0, 35], targetSize to [0.25, 10], pathSpeed to [0, 50]
    - Update `src/lib/exercises/definitions/tracking.ts` — same rescaling
    - Update `src/lib/exercises/definitions/precision.ts` — same rescaling
    - Update `src/lib/exercises/definitions/speed.ts` — same rescaling
    - Update `src/lib/exercises/definitions/reaction.ts` — same rescaling
    - Update `src/lib/exercises/definitions/game-specific.ts` — same rescaling
    - Preserve relative difficulty ordering (e.g. AWP flick near max distance 35)
    - _Requirements: 2.3_

  - [ ] 5.2 Write property test for registry compliance (Property 4)
    - **Property 4: Every definition's mechanics values lie within the unit system ranges**
    - Iterate real registry and verify all definitions pass unit-system range checks
    - **Validates: Requirements 2.3**

  - [x] 5.3 Verify the validator passes on the migrated registry
    - Run `validateRegistry` against the full real registry
    - Confirm `ok: true` with zero failures
    - Fix any remaining definitions that fail validation
    - _Requirements: 7.5_

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement Game Profiles and Multi-Game Navigation
  - [ ] 7.1 Create game profiles module (`src/lib/exercises/game-profiles.ts`)
    - Define `GameProfile` interface with id, name, slug
    - Define `GAME_PROFILES` array for Valorant, CS2, Apex Legends, Fortnite, Overwatch 2
    - Implement `getActiveGameProfiles(registry)` — returns only profiles with ≥1 associated exercise
    - Implement `getExercisesForGame(registry, gameId, category)` — filters by game and/or category
    - Use existing `focusGames` field on ExerciseDefinition for association
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 7.2 Write property tests for game profile filtering (Properties 13, 14)
    - **Property 13: Active game profiles are exactly those with at least one exercise**
    - **Property 14: Game and category filtering returns exactly the matching exercises**
    - Generate arbitrary registries with varying focusGames and categories
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

  - [ ] 7.3 Create the Game Selector component (`src/components/GameSelector.tsx`)
    - Client component listing active game profiles plus "All exercises" control
    - On game/category selection, filter in-memory registry and re-render (no network call)
    - Show empty-state message for game+category with no exercises
    - Surface error and "Back to games" action if engine fails to load
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.7, 5.8_

  - [ ] 7.4 Integrate Game Selector into the homepage (`src/app/page.tsx`)
    - Add Game Selector into the existing exercises tab
    - Default view shows all exercises when no game is selected
    - Wire selected exercise to existing `window.ExerciseController` flow
    - _Requirements: 5.4, 5.5, 5.6_

  - [ ] 7.5 Write unit tests for Game Selector UI states
    - Test empty-state rendering for no-match filter
    - Test error-state rendering when engine fails
    - Test default-state with no selection shows all exercises
    - _Requirements: 5.7, 5.8_

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement the Brand System Overhaul
  - [ ] 9.1 Create brand tokens and messaging modules (`src/lib/brand/`)
    - Create `src/lib/brand/tokens.ts` — shared color palette and typography set
    - Create `src/lib/brand/messaging.ts` — hero heading, hero subheading, meta title, meta description that name ≥2 game profiles with equal prominence
    - _Requirements: 1.1, 1.2, 1.5_

  - [ ] 9.2 Apply brand tokens to global styles and Tailwind config
    - Update `globals.css` or Tailwind config to consume brand tokens
    - Ensure all pages (homepage, exercises, blog, leaderboard, multiplayer) use the shared palette and typography
    - _Requirements: 1.5_

  - [ ] 9.3 Remove Valorant-specific branding from all pages
    - Remove Riot/Valorant disclaimer from `src/app/page.tsx`
    - Replace "AIMTRAINER PRO / Valorant" framing with neutral brand
    - Update `src/lib/seo/metadata-generator.ts` and `src/app/layout.tsx` meta titles
    - Ensure game names appear only in exercise listings/filters/descriptions
    - _Requirements: 1.1, 1.3, 1.4_

  - [ ] 9.4 Update PWA identity and favicon
    - Update `public/manifest.json` with neutral app name and icons
    - Replace favicon with neutral brand icon
    - Ensure no Valorant-specific naming or imagery in installable identity
    - _Requirements: 1.6_

  - [ ] 9.5 Write unit tests for brand compliance
    - Test messaging names ≥2 game profiles with no single profile more prominent
    - Test no forbidden Valorant-specific tokens in logo, wordmark, meta title, browser tab title, hero heading
    - Test PWA manifest has no single-game tokens
    - _Requirements: 1.1, 1.2, 1.4, 1.6_

- [ ] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Preservation and Cross-Cutting Concerns
  - [ ] 11.1 Verify and fix i18n fallback behavior
    - Ensure the i18n resolver falls back to English for missing translation keys
    - Verify all locale files have key parity
    - _Requirements: 6.3, 6.4_

  - [ ] 11.2 Write property test for i18n fallback (Property 15)
    - **Property 15: Missing translations fall back to English**
    - Generate arbitrary locale+key pairs and verify fallback to English
    - **Validates: Requirements 6.4**

  - [ ] 11.3 Verify offline queue and progression persistence
    - Confirm exercise results persist to progression and leaderboard storage on completion
    - Confirm offline queue enqueues results when storage is unavailable and flushes on reconnect
    - _Requirements: 6.1, 6.7_

  - [ ] 11.4 Write property test for offline queue (Property 16)
    - **Property 16: Offline-queued results survive a reconnect round trip**
    - Generate sequences of results, simulate offline enqueue and reconnect flush, verify no loss or duplication
    - **Validates: Requirements 6.7**

  - [ ] 11.5 Verify and fix deep-link resolution
    - Ensure all exercise URLs from the registry resolve correctly after redesign
    - Add not-found view for unresolved deep links with navigation to exercise list
    - _Requirements: 6.8, 6.9_

  - [ ] 11.6 Write property test for deep-link resolution (Property 17)
    - **Property 17: Every registered exercise id resolves to its exercise via deep link**
    - Generate exercise ids from registry and verify resolver returns the correct exercise
    - **Validates: Requirements 6.8**

  - [ ] 11.7 Verify existing features still function
    - Run existing leaderboard, blog, multiplayer, challenge, and SEO test suites
    - Verify structured data and SEO metadata on all indexable pages
    - Confirm PWA installability and offline support
    - _Requirements: 6.2, 6.5, 6.6_

- [ ] 12. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using fast-check with Vitest
- Unit tests validate specific examples, UI states, and brand compliance
- The engine helpers extraction (3.1) enables property testing of engine logic without a browser/WebGL context
- Definition migration (5.1) preserves relative difficulty ordering rather than mechanically rescaling

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["1.4", "1.5"] },
    { "id": 3, "tasks": ["3.1", "3.6"] },
    { "id": 4, "tasks": ["3.2", "3.3", "3.4", "3.5"] },
    { "id": 5, "tasks": ["3.7", "3.8"] },
    { "id": 6, "tasks": ["5.1"] },
    { "id": 7, "tasks": ["5.2", "5.3"] },
    { "id": 8, "tasks": ["7.1", "9.1"] },
    { "id": 9, "tasks": ["7.2", "7.3", "9.2"] },
    { "id": 10, "tasks": ["7.4", "7.5", "9.3", "9.4"] },
    { "id": 11, "tasks": ["9.5", "11.1", "11.3", "11.5"] },
    { "id": 12, "tasks": ["11.2", "11.4", "11.6", "11.7"] }
  ]
}
```
