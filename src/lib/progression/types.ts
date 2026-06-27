/**
 * Progression system types and constants.
 * Defines player tier rankings and their score thresholds.
 */

export type PlayerTier =
  | 'Iron'
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Platinum'
  | 'Diamond'
  | 'Immortal'
  | 'Radiant';

export const TIER_THRESHOLDS: Record<PlayerTier, [number, number]> = {
  Iron: [0, 624],
  Bronze: [625, 1249],
  Silver: [1250, 1874],
  Gold: [1875, 2499],
  Platinum: [2500, 3124],
  Diamond: [3125, 3749],
  Immortal: [3750, 4374],
  Radiant: [4375, 5000],
};
