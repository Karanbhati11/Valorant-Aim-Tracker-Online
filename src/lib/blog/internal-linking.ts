/**
 * Internal linking utilities for blog posts.
 * Provides tag inference and link generation helpers.
 *
 * Requirements: 18.2
 */

/**
 * Infers relevant tags from a blog post title for matching against
 * exercise focusGames and categories.
 *
 * @param title - The blog post title to extract tags from
 * @returns Array of lowercase tag strings
 */
export function inferTagsFromTitle(title: string): string[] {
  const text = title.toLowerCase();
  const tags: string[] = [];

  // Game-specific tags
  if (text.includes("valorant")) tags.push("valorant");
  if (text.includes("cs2") || text.includes("counter-strike")) tags.push("cs2");
  if (text.includes("apex") || text.includes("apex legends")) tags.push("apex");
  if (text.includes("fortnite")) tags.push("fortnite");
  if (text.includes("overwatch")) tags.push("overwatch");

  // Skill-type tags
  if (text.includes("flick")) tags.push("flicking");
  if (text.includes("track")) tags.push("tracking");
  if (text.includes("reaction") || text.includes("reflex")) tags.push("reaction");
  if (text.includes("precision") || text.includes("accuracy")) tags.push("precision");
  if (text.includes("speed") || text.includes("fast")) tags.push("speed");

  // Settings tags
  if (text.includes("sensitivity") || text.includes("sens")) tags.push("sensitivity");
  if (text.includes("dpi")) tags.push("dpi");
  if (text.includes("crosshair")) tags.push("crosshair");

  return tags;
}
