/**
 * Authentication system type definitions.
 * Defines user profile and sensitivity configuration interfaces.
 */

import { PlayerTier } from '@/lib/progression/types';

export interface CrosshairConfig {
  id: string;
  name: string;
  color: string;
  size: number;
  thickness: number;
  gap: number;
  outline: boolean;
  dot: boolean;
}

export interface SensitivityProfile {
  id: string;
  game: string;
  sensitivity: number;
  dpi: number;
  trainerSensitivity: number;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  provider: 'email' | 'google' | 'discord';
  skillRating: number;
  tier: PlayerTier;
  createdAt: string;
  sensitivityProfiles: SensitivityProfile[];
  crosshairConfigs: CrosshairConfig[];
}
