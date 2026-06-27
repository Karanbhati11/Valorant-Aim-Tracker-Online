# Requirements Document

## Introduction

AimTrainerPro is currently branded and positioned as a Valorant-focused aim trainer, yet it ships 30+ exercises across 6 categories that span multiple FPS games. This redesign repositions the platform as a neutral, multi-game aim trainer that treats Valorant, CS2, Apex Legends, Fortnite, Overwatch 2, and other FPS titles as equal first-class citizens.

The redesign has two pillars. The first is a complete visual and brand overhaul that removes Valorant-specific theming in favor of a game-agnostic identity. The second is a correctness overhaul of the exercise engine: several game-specific exercises are currently unplayable because the TypeScript exercise definitions and the vanilla JavaScript Three.js engine disagree about units. Definitions express spawn distances and target sizes on one scale (e.g. `minDistance: 200, maxDistance: 600`, `targetSize: 20–40`) while the engine interprets spawn distance as raw world-unit radius and silently resets any target size above 10 to a default of 2.0. The result is that exercises such as "CS2: AWP Flick" spawn targets far outside the reachable play area, and per-exercise target sizing is effectively ignored across the entire catalog.

This specification establishes a single validated unit system shared by definitions and engine, guarantees that every exercise for every game spawns reachable and correctly sized targets and produces correct scores, redesigns the homepage and navigation around multi-game browsing, preserves all existing functionality (leaderboard, progression, multiplayer, SEO, internationalization, PWA), and adds guardrails that prevent future definitions from reintroducing off-screen or oversized-target defects.

## Glossary

- **Platform**: The AimTrainerPro web application as a whole (Next.js 14 App Router site).
- **Brand_System**: The visual identity assets and tokens (logo, wordmark, color palette, typography, messaging) that define the platform's appearance.
- **Exercise_Registry**: The TypeScript source of truth for exercise definitions located under `src/lib/exercises/`.
- **Exercise_Definition**: A single typed exercise record conforming to the `ExerciseDefinition` interface, including its `mechanics` and `scoringRules`.
- **Exercise_Bridge**: The module (`src/lib/exercises/exercise-bridge.ts`) that converts `Exercise_Definition` records into the vanilla JS format and exposes them to the engine.
- **Exercise_Engine**: The client-side Three.js engine (`public/assets/js/exercises/exercise-engine.js`) that renders the 3D environment, spawns targets, and computes scores.
- **Unit_System**: The agreed, documented set of measurement units and value ranges for exercise mechanics fields (spawn distance, target size, path speed) shared by the `Exercise_Registry` and the `Exercise_Engine`.
- **Spawn_Distance**: The `minDistance` and `maxDistance` mechanics values that determine where a target appears relative to the crosshair.
- **Target_Size**: The `targetSize` mechanics value that determines the rendered radius of a target.
- **Reachable_Play_Area**: The region of the 3D scene a player can aim at and hit through normal camera rotation, within which a spawned target is fully visible and clickable.
- **Game_Profile**: A supported FPS title (e.g. Valorant, CS2, Apex Legends, Fortnite, Overwatch 2) used to group and filter exercises.
- **Game_Selector**: The homepage/UI component that lets a player browse and filter exercises by `Game_Profile` and category.
- **Exercise_Validator**: The build-time/test-time check that verifies every `Exercise_Definition` complies with the `Unit_System` and is playable.
- **Player**: An end user performing aim-training exercises.

## Requirements

### Requirement 1: Multi-Game Brand Identity

**User Story:** As a player of any FPS game, I want the platform to present a neutral multi-game brand, so that I feel the trainer is built for my game and not just Valorant.

#### Acceptance Criteria

1. THE Brand_System SHALL present a game-agnostic visual identity consisting of logo, wordmark, color palette, and typography, in which no logo, wordmark, icon, favicon, color value, or product name references Valorant or any single Game_Profile.
2. THE Platform SHALL present primary messaging, defined as the homepage hero heading, the homepage hero subheading, the page meta title, and the page meta description, that names two or more FPS Game_Profiles and that names no single Game_Profile more frequently or more prominently than any other Game_Profile within that messaging.
3. WHERE a page previously displayed Valorant-specific branding, theming, or disclaimers, THE Platform SHALL replace each such element with the neutral Brand_System equivalent so that no Valorant-specific branding, theming, or disclaimer remains on that page.
4. THE Platform SHALL reference a Game_Profile by name only within exercise listings, exercise detail content, exercise filters, or category descriptions, and SHALL NOT reference any single Game_Profile by name in the logo, wordmark, page meta title, browser tab title, or homepage hero heading.
5. THE Brand_System SHALL apply one shared color palette and one shared typography set across the homepage, exercise pages, blog, leaderboard, and multiplayer pages, such that none of these pages renders a color value or font family that is not part of that shared palette and typography set.
6. WHERE the Platform exposes an installable PWA identity comprising the application name, application icons, and favicon, THE Platform SHALL present the neutral Brand_System name and icons containing no Valorant-specific naming or imagery.

### Requirement 2: Consistent Validated Unit System

**User Story:** As a developer maintaining exercises, I want one documented unit system shared by the definitions and the engine, so that the value I write in a definition produces the behavior I intend in the engine.

#### Acceptance Criteria

1. THE Unit_System SHALL define, in documented form, the measurement unit for Spawn_Distance, Target_Size, and path speed, expressing Spawn_Distance and Target_Size in world units and path speed in world units per second.
2. THE Unit_System SHALL define the valid inclusive range for each mechanics value as Spawn_Distance from 0 to 35 world units, Target_Size from 0.25 to 10 world units, and path speed from 0 to 50 world units per second.
3. THE Exercise_Registry SHALL express every Exercise_Definition mechanics value using the units and ranges defined by the Unit_System.
4. THE Exercise_Engine SHALL interpret every mechanics value it receives using the same units defined by the Unit_System.
5. WHEN the Exercise_Bridge converts an Exercise_Definition for the Exercise_Engine, THE Exercise_Bridge SHALL preserve each mechanics value such that the value the engine receives is numerically equal to the definition value within 0.01 world units.
6. WHEN the Exercise_Engine renders a target whose Exercise_Definition Target_Size is from 0.25 to 10 world units inclusive, THE Exercise_Engine SHALL render the target at that Target_Size without substituting any default value.
7. IF an Exercise_Definition supplies a mechanics value below the Unit_System minimum or above the Unit_System maximum, THEN THE Exercise_Engine SHALL clamp the value to the nearest valid bound so that the resulting target spawns within the Reachable_Play_Area and renders fully visible.

### Requirement 3: Reachable Target Spawning

**User Story:** As a player, I want every target to appear inside the area I can aim at, so that I can actually hit targets in every exercise.

#### Acceptance Criteria

1. WHEN the Exercise_Engine spawns a target for any Exercise_Definition, THE Exercise_Engine SHALL position the target so that its entire rendered extent, including its full Target_Size radius, lies within the Reachable_Play_Area.
2. WHEN the Exercise_Engine spawns multiple targets concurrently for an Exercise_Definition, THE Exercise_Engine SHALL position every target so that each target's entire rendered extent lies within the Reachable_Play_Area.
3. WHILE a target moves along its configured path, THE Exercise_Engine SHALL keep the target's entire rendered extent within the Reachable_Play_Area at every point from spawn until the target is removed.
4. WHEN the Exercise_Engine spawns a target, THE Exercise_Engine SHALL render the target fully visible within the player's view, with no part of the target clipped by the viewport edges or occluded by scene geometry, after the player rotates the camera toward the target within the engine's supported aim-rotation range.
5. THE Exercise_Engine SHALL render each target so that it presents a single contiguous clickable area no smaller than the engine's minimum hittable size for the configured Spawn_Distance, such that a click on any part of the rendered target registers a hit.
6. IF a configured Spawn_Distance or movement path would place any part of a target outside the Reachable_Play_Area, THEN THE Exercise_Engine SHALL constrain the target's position to keep its entire rendered extent within the Reachable_Play_Area rather than render the target partially or fully outside it.

### Requirement 4: Per-Game Exercise Playability and Correct Scoring

**User Story:** As a player choosing any game's scenarios, I want every exercise to be fully playable and to score me correctly, so that I can train and track progress for my game.

#### Acceptance Criteria

1. WHEN a Player starts any Exercise_Definition in the Exercise_Registry, THE Exercise_Engine SHALL run the exercise until its configured completion condition (the elapsed duration or target count defined in the Exercise_Definition) is reached and then finish, without spawning targets outside the Reachable_Play_Area and without ending before the completion condition is reached.
2. WHEN a Player's shot intersects the clickable area of a spawned target, THE Exercise_Engine SHALL register one hit and increase the score by the hit reward defined in the Exercise_Definition scoring rules.
3. IF a Player's shot does not intersect the clickable area of any spawned target, THEN THE Exercise_Engine SHALL register one miss and apply the miss penalty defined in the Exercise_Definition scoring rules, without reducing the score below zero.
4. WHEN an exercise completes, THE Exercise_Engine SHALL produce a final result containing a score not less than zero, a hit count equal to the number of registered hits, a miss count equal to the number of registered misses, and an accuracy equal to the hit count divided by the sum of the hit count and miss count, expressed as a value from 0 to 1 inclusive.
5. IF an exercise completes with zero registered hits and zero registered misses, THEN THE Exercise_Engine SHALL report an accuracy of 0.
6. WHERE an Exercise_Definition specifies headshot mode, THE Exercise_Engine SHALL award the critical multiplier only for hits inside the critical zone defined by the Exercise_Definition, and SHALL award the base hit reward without the critical multiplier for hits outside the critical zone.
7. WHERE an Exercise_Definition specifies sequential multi-target elimination, THE Exercise_Engine SHALL count only in-order eliminations as hits and count out-of-order interactions as misses.
8. WHERE an Exercise_Definition specifies tracking mode, THE Exercise_Engine SHALL produce a tracking accuracy from 0 to 1 inclusive equal to the sampled on-target time divided by the total sampled tracking time.

### Requirement 5: Multi-Game Homepage and Navigation Redesign

**User Story:** As a player, I want to browse exercises by game and by category, so that I can quickly find scenarios relevant to the game I play.

#### Acceptance Criteria

1. THE Platform SHALL display a Game_Selector that lists every supported Game_Profile that has at least one associated exercise, together with a control to browse all exercises.
2. WHEN a Player selects a Game_Profile in the Game_Selector, THE Platform SHALL display the exercises associated with that Game_Profile within 1 second of the selection.
3. WHEN a Player selects a category, THE Platform SHALL display the exercises in that category within 1 second of the selection, scoped to the currently selected Game_Profile when a Game_Profile is active.
4. WHEN a Player first opens the homepage or has no Game_Profile selected, THE Platform SHALL display all exercises across all Game_Profiles.
5. WHEN a Player opens an exercise from the Game_Selector, THE Platform SHALL load that exercise in the Exercise_Engine within 3 seconds of the selection.
6. THE Platform SHALL present the homepage with the neutral Brand_System and multi-game positioning defined in Requirement 1.
7. IF a selected Game_Profile and category combination contains no exercises, THEN THE Platform SHALL display a message indicating that no exercises are available for that combination.
8. IF an exercise fails to load in the Exercise_Engine, THEN THE Platform SHALL display an error message and allow the Player to return to the Game_Selector.

### Requirement 6: Preservation of Existing Functionality

**User Story:** As an existing user, I want leaderboards, progression, multiplayer, SEO, internationalization, and offline support to keep working after the redesign, so that the redesign does not regress features I rely on.

#### Acceptance Criteria

1. WHEN a Player completes an exercise, THE Platform SHALL persist the result to progression storage and submit it to leaderboard storage, and SHALL make the persisted result retrievable afterward.
2. THE Platform SHALL load and operate the leaderboard, blog, multiplayer, and challenge features after the redesign without error.
3. THE Platform SHALL provide localized content for every language supported before the redesign.
4. IF a translated string is unavailable for the active language, THEN THE Platform SHALL display the English equivalent for that string.
5. THE Platform SHALL expose SEO metadata and structured data for every indexable page that exposed them before the redesign.
6. THE Platform SHALL function as an installable PWA with offline support after the redesign.
7. IF progression or leaderboard storage is unavailable when a Player completes an exercise offline, THEN THE Platform SHALL queue the result locally for submission when connectivity is restored.
8. WHERE a previously valid exercise URL or deep link existed, THE Platform SHALL resolve that link to the corresponding exercise after the redesign.
9. IF a previously valid deep link no longer resolves to an exercise, THEN THE Platform SHALL display a not-found message and offer navigation to the exercise list.

### Requirement 7: Validation Guardrails for Future Definitions

**User Story:** As a developer adding new exercises, I want automated validation of exercise definitions, so that I cannot reintroduce off-screen or oversized-target defects.

#### Acceptance Criteria

1. THE Exercise_Validator SHALL verify that the Spawn_Distance, Target_Size, and path speed mechanics values of every Exercise_Definition each fall within the valid minimum and maximum range defined by the Unit_System.
2. IF an Exercise_Definition declares a Spawn_Distance that would place a target outside the Reachable_Play_Area, THEN THE Exercise_Validator SHALL report a validation failure that identifies the offending Exercise_Definition by its identifier and names the offending field.
3. IF an Exercise_Definition declares a Target_Size outside the valid range defined by the Unit_System, THEN THE Exercise_Validator SHALL report a validation failure that identifies the offending Exercise_Definition by its identifier and names the offending field.
4. WHEN the Exercise_Validator runs, THE Exercise_Validator SHALL evaluate every Exercise_Definition in the Exercise_Registry and report a validation failure for every Exercise_Definition and field that violates the Unit_System rather than stopping at the first failure.
5. WHEN the Exercise_Validator finishes evaluating every Exercise_Definition with no Unit_System violation and no out-of-Reachable_Play_Area Spawn_Distance, THE Exercise_Validator SHALL report a successful validation result with zero validation failures.
6. WHERE the project provides a build or test command, THE Exercise_Validator SHALL run as part of that command.
7. IF the Exercise_Validator reports one or more validation failures during a build or test command, THEN THE build or test run SHALL terminate without success.
