/**
 * Sensitivity Converter Engine
 *
 * Pure TypeScript functions for converting mouse sensitivity between FPS games.
 * Conversion logic: game sensitivity → cm/360 → target game sensitivity.
 *
 * Formula: cm/360 = 360 / (dpi * sens * yawPerCount)
 * To convert: newSens = (fromGame.yawPerCount * fromSens) / toGame.yawPerCount
 *
 * Validates: Requirements 13.1, 13.2, 13.3
 */

export interface GameConfig {
  id: string;
  name: string;
  yawPerCount: number; // degrees per mouse count at sens=1
  pitchPerCount?: number;
  formula: 'linear' | 'source' | 'quake' | 'custom';
  customFn?: (sens: number, dpi: number) => number;
}

/**
 * Supported games with their sensitivity conversion parameters.
 * Each game has a yawPerCount value representing degrees of rotation
 * per mouse count at sensitivity = 1.
 */
export const SUPPORTED_GAMES: GameConfig[] = [
  { id: 'valorant', name: 'Valorant', yawPerCount: 0.07, formula: 'linear' },
  { id: 'cs2', name: 'CS2', yawPerCount: 0.022, formula: 'source' },
  { id: 'overwatch2', name: 'Overwatch 2', yawPerCount: 0.0066, formula: 'linear' },
  { id: 'apex', name: 'Apex Legends', yawPerCount: 0.022, formula: 'source' },
  { id: 'fortnite', name: 'Fortnite', yawPerCount: 0.5585, formula: 'linear' },
  { id: 'r6siege', name: 'Rainbow Six Siege', yawPerCount: 0.00572, formula: 'linear' },
  { id: 'pubg', name: 'PUBG', yawPerCount: 0.002222, formula: 'linear' },
  { id: 'cod-warzone', name: 'Call of Duty: Warzone', yawPerCount: 0.0066, formula: 'linear' },
  { id: 'battlefield2042', name: 'Battlefield 2042', yawPerCount: 0.002222, formula: 'linear' },
  { id: 'quake-champions', name: 'Quake Champions', yawPerCount: 0.022, formula: 'quake' },
  { id: 'tf2', name: 'Team Fortress 2', yawPerCount: 0.022, formula: 'source' },
  { id: 'csgo', name: 'CS:GO', yawPerCount: 0.022, formula: 'source' },
  { id: 'destiny2', name: 'Destiny 2', yawPerCount: 0.0066, formula: 'linear' },
  { id: 'halo-infinite', name: 'Halo Infinite', yawPerCount: 0.0039, formula: 'linear' },
  { id: 'splitgate', name: 'Splitgate', yawPerCount: 0.0066, formula: 'linear' },
  { id: 'diabotical', name: 'Diabotical', yawPerCount: 0.022, formula: 'quake' },
];

/** Sensitivity input validation range */
const SENSITIVITY_RANGE = { min: 0.01, max: 100 } as const;
/** DPI input validation range */
const DPI_RANGE = { min: 100, max: 16000 } as const;

/**
 * Finds a game configuration by its ID.
 * Returns undefined if the game is not found.
 */
export function findGameById(gameId: string): GameConfig | undefined {
  return SUPPORTED_GAMES.find((g) => g.id === gameId);
}

/**
 * Calculates the effective degrees per count for a game at a given sensitivity.
 * This accounts for different formula types:
 * - linear: yawPerCount * sensitivity (direct multiplication)
 * - source: yawPerCount * sensitivity (Source engine uses same linear formula)
 * - quake: yawPerCount * sensitivity (Quake-style also linear at base level)
 * - custom: uses the game's custom function
 */
function getEffectiveDegreesPerCount(
  game: GameConfig,
  sensitivity: number,
  dpi: number
): number {
  if (game.formula === 'custom' && game.customFn) {
    return game.customFn(sensitivity, dpi);
  }
  // For linear, source, and quake formulas, the effective degrees per count
  // is simply yawPerCount * sensitivity
  return game.yawPerCount * sensitivity;
}

/**
 * Converts sensitivity from one game to another.
 *
 * The conversion preserves the physical mouse movement (cm/360):
 * cm/360 = 360 / (dpi * sens * yawPerCount)
 *
 * To find equivalent sensitivity in another game:
 * newSens = (fromGame.yawPerCount * fromSens) / toGame.yawPerCount
 *
 * @param fromGame - Source game ID
 * @param toGame - Target game ID
 * @param sensitivity - Source game sensitivity value
 * @param dpi - Mouse DPI (used for custom formula games)
 * @returns Converted sensitivity value for the target game (within 0.1% accuracy)
 * @throws Error if either game ID is not found in SUPPORTED_GAMES
 */
export function convertSensitivity(
  fromGame: string,
  toGame: string,
  sensitivity: number,
  dpi: number
): number {
  const sourceGame = findGameById(fromGame);
  const targetGame = findGameById(toGame);

  if (!sourceGame) {
    throw new Error(`Unsupported game: ${fromGame}`);
  }
  if (!targetGame) {
    throw new Error(`Unsupported game: ${toGame}`);
  }

  // Calculate effective degrees per count for the source game
  const sourceDegreesPerCount = getEffectiveDegreesPerCount(sourceGame, sensitivity, dpi);

  // For custom formula target games, we need to invert the custom function
  // For standard formulas, newSens = sourceDegreesPerCount / targetGame.yawPerCount
  if (targetGame.formula === 'custom' && targetGame.customFn) {
    // For custom target games, we'd need an inverse function
    // Since none of our current games use custom, this is a safety fallback
    return sourceDegreesPerCount / targetGame.yawPerCount;
  }

  // Standard conversion: newSens = (fromYaw * fromSens) / toYaw
  const convertedSensitivity = sourceDegreesPerCount / targetGame.yawPerCount;

  return convertedSensitivity;
}

/**
 * Internal reference scale for the trainer's sensitivity.
 * Based on a standard yaw of 0.022 (Source engine standard).
 */
const TRAINER_BASE_YAW = 0.022;

/**
 * Converts a game's sensitivity to the trainer's internal scale value.
 *
 * The trainer uses a unified internal sensitivity scale so that
 * any game's sensitivity can be mapped to consistent in-trainer behavior.
 *
 * @param game - Game ID to convert from
 * @param sensitivity - Game sensitivity value
 * @param dpi - Mouse DPI
 * @returns Trainer's internal scale value
 * @throws Error if game ID is not found in SUPPORTED_GAMES
 */
export function calculateTrainerSensitivity(
  game: string,
  sensitivity: number,
  dpi: number
): number {
  const gameConfig = findGameById(game);

  if (!gameConfig) {
    throw new Error(`Unsupported game: ${game}`);
  }

  // Calculate the effective degrees per count for the given game settings
  const effectiveDegreesPerCount = getEffectiveDegreesPerCount(gameConfig, sensitivity, dpi);

  // Convert to trainer's internal scale using the trainer's base yaw
  const trainerSensitivity = effectiveDegreesPerCount / TRAINER_BASE_YAW;

  return trainerSensitivity;
}

/**
 * Validates sensitivity and DPI input values.
 *
 * Sensitivity must be between 0.01 and 100.
 * DPI must be between 100 and 16000.
 *
 * @param sensitivity - Sensitivity value to validate
 * @param dpi - DPI value to validate
 * @returns Object with valid boolean and optional error message
 */
export function validateSensitivityInput(
  sensitivity: number,
  dpi: number
): { valid: boolean; error?: string } {
  if (typeof sensitivity !== 'number' || isNaN(sensitivity)) {
    return {
      valid: false,
      error: `Sensitivity must be a numeric value between ${SENSITIVITY_RANGE.min} and ${SENSITIVITY_RANGE.max}`,
    };
  }

  if (typeof dpi !== 'number' || isNaN(dpi)) {
    return {
      valid: false,
      error: `DPI must be a numeric value between ${DPI_RANGE.min} and ${DPI_RANGE.max}`,
    };
  }

  if (sensitivity < SENSITIVITY_RANGE.min || sensitivity > SENSITIVITY_RANGE.max) {
    return {
      valid: false,
      error: `Sensitivity must be between ${SENSITIVITY_RANGE.min} and ${SENSITIVITY_RANGE.max}. Got: ${sensitivity}`,
    };
  }

  if (dpi < DPI_RANGE.min || dpi > DPI_RANGE.max) {
    return {
      valid: false,
      error: `DPI must be between ${DPI_RANGE.min} and ${DPI_RANGE.max}. Got: ${dpi}`,
    };
  }

  return { valid: true };
}

/**
 * Calculates cm/360 (centimeters per full 360° rotation) for a given game configuration.
 * Useful for displaying to users as a universal sensitivity reference.
 *
 * @param game - Game ID
 * @param sensitivity - Game sensitivity value
 * @param dpi - Mouse DPI
 * @returns cm/360 value
 */
export function calculateCmPer360(
  game: string,
  sensitivity: number,
  dpi: number
): number {
  const gameConfig = findGameById(game);

  if (!gameConfig) {
    throw new Error(`Unsupported game: ${game}`);
  }

  const effectiveDegreesPerCount = getEffectiveDegreesPerCount(gameConfig, sensitivity, dpi);

  // cm/360 = (360 / (dpi * degreesPerCount)) * 2.54
  // But degreesPerCount = yawPerCount * sensitivity, so:
  // cm/360 = (360 / (dpi * yawPerCount * sensitivity)) * 2.54
  // Actually: counts per 360 = 360 / effectiveDegreesPerCount
  // inches per 360 = countsPerTurn / dpi
  // cm per 360 = inchesPerTurn * 2.54
  const countsPerFullTurn = 360 / effectiveDegreesPerCount;
  const inchesPerFullTurn = countsPerFullTurn / dpi;
  const cmPerFullTurn = inchesPerFullTurn * 2.54;

  return cmPerFullTurn;
}
