'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  SUPPORTED_GAMES,
  convertSensitivity,
  validateSensitivityInput,
  calculateCmPer360,
  calculateTrainerSensitivity,
} from '@/lib/tools/sensitivity-converter';

/** Profile stored in localStorage */
interface SensitivityProfile {
  id: string;
  name: string;
  game: string;
  sensitivity: number;
  dpi: number;
}

const PROFILES_STORAGE_KEY = 'aimtrainerpro_sensitivity_profiles';
const MAX_PROFILES = 20;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadProfiles(): SensitivityProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_PROFILES);
  } catch {
    return [];
  }
}

function saveProfiles(profiles: SensitivityProfile[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles.slice(0, MAX_PROFILES)));
}

export default function SensitivityConverterPage() {
  const [fromGame, setFromGame] = useState(SUPPORTED_GAMES[0].id);
  const [toGame, setToGame] = useState(SUPPORTED_GAMES[1].id);
  const [sensitivityInput, setSensitivityInput] = useState('0.3');
  const [dpiInput, setDpiInput] = useState('800');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [cmPer360From, setCmPer360From] = useState<number | null>(null);
  const [trainerSens, setTrainerSens] = useState<number | null>(null);

  // Profile state
  const [profiles, setProfiles] = useState<SensitivityProfile[]>([]);
  const [profileName, setProfileName] = useState('');
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);
  const [profileApplied, setProfileApplied] = useState<string | null>(null);

  // Load profiles on mount
  useEffect(() => {
    setProfiles(loadProfiles());
  }, []);

  // Convert in real-time when inputs change
  const performConversion = useCallback(() => {
    setError(null);
    setResult(null);
    setCmPer360From(null);
    setTrainerSens(null);

    const sensNum = parseFloat(sensitivityInput);
    const dpiNum = parseFloat(dpiInput);

    if (isNaN(sensNum) || sensitivityInput.trim() === '') {
      setError('Sensitivity must be a numeric value between 0.01 and 100');
      return;
    }
    if (isNaN(dpiNum) || dpiInput.trim() === '') {
      setError('DPI must be a numeric value between 100 and 16000');
      return;
    }

    const validation = validateSensitivityInput(sensNum, dpiNum);
    if (!validation.valid) {
      setError(validation.error || 'Invalid input');
      return;
    }

    try {
      const converted = convertSensitivity(fromGame, toGame, sensNum, dpiNum);
      setResult(converted);
      setCmPer360From(calculateCmPer360(fromGame, sensNum, dpiNum));
      setTrainerSens(calculateTrainerSensitivity(fromGame, sensNum, dpiNum));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    }
  }, [fromGame, toGame, sensitivityInput, dpiInput]);

  useEffect(() => {
    performConversion();
  }, [performConversion]);

  // Profile management
  const handleSaveProfile = () => {
    setProfileSaveError(null);
    const trimmedName = profileName.trim();

    if (!trimmedName) {
      setProfileSaveError('Please enter a profile name');
      return;
    }
    if (trimmedName.length > 30) {
      setProfileSaveError('Profile name must be 30 characters or less');
      return;
    }
    if (profiles.length >= MAX_PROFILES) {
      setProfileSaveError(`Maximum of ${MAX_PROFILES} profiles reached. Delete one to save a new profile.`);
      return;
    }

    const sensNum = parseFloat(sensitivityInput);
    const dpiNum = parseFloat(dpiInput);
    const validation = validateSensitivityInput(sensNum, dpiNum);
    if (!validation.valid) {
      setProfileSaveError('Fix input errors before saving');
      return;
    }

    const newProfile: SensitivityProfile = {
      id: generateId(),
      name: trimmedName,
      game: fromGame,
      sensitivity: sensNum,
      dpi: dpiNum,
    };

    const updated = [...profiles, newProfile];
    setProfiles(updated);
    saveProfiles(updated);
    setProfileName('');
  };

  const handleLoadProfile = (profile: SensitivityProfile) => {
    setFromGame(profile.game);
    setSensitivityInput(String(profile.sensitivity));
    setDpiInput(String(profile.dpi));
    setProfileApplied(profile.name);
    setTimeout(() => setProfileApplied(null), 2000);
  };

  const handleDeleteProfile = (id: string) => {
    const updated = profiles.filter((p) => p.id !== id);
    setProfiles(updated);
    saveProfiles(updated);
  };

  const getGameName = (gameId: string): string => {
    return SUPPORTED_GAMES.find((g) => g.id === gameId)?.name || gameId;
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '56px 24px 72px' }}>
      {/* Hero Header */}
      <section style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px' }}>
        <span
          style={{
            display: 'inline-block',
            fontSize: '0.72rem',
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            fontWeight: 700,
            color: 'var(--accent)',
            background: 'rgba(34, 211, 238, 0.08)',
            border: '1px solid rgba(34, 211, 238, 0.25)',
            padding: '6px 14px',
            borderRadius: '999px',
            marginBottom: '18px',
          }}
        >
          Tool
        </span>
        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            lineHeight: 1.08,
            letterSpacing: '-1px',
            textTransform: 'none',
            margin: '0 0 16px',
          }}
        >
          Sensitivity <span className="brand-accent">Converter</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, margin: 0 }}>
          Convert your sensitivity between 16+ FPS games instantly. Match your muscle memory across every title.
        </p>
      </section>

      {/* Conversion Inputs */}
      <section
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius, 12px)',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
            marginBottom: '20px',
          }}
        >
          {/* From Game */}
          <div className="setting-group">
            <label className="setting-label" htmlFor="from-game">From Game</label>
            <select
              id="from-game"
              value={fromGame}
              onChange={(e) => setFromGame(e.target.value)}
              style={{ width: '100%' }}
            >
              {SUPPORTED_GAMES.map((game) => (
                <option key={game.id} value={game.id}>{game.name}</option>
              ))}
            </select>
          </div>

          {/* To Game */}
          <div className="setting-group">
            <label className="setting-label" htmlFor="to-game">To Game</label>
            <select
              id="to-game"
              value={toGame}
              onChange={(e) => setToGame(e.target.value)}
              style={{ width: '100%' }}
            >
              {SUPPORTED_GAMES.map((game) => (
                <option key={game.id} value={game.id}>{game.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}
        >
          <div className="setting-group">
            <label className="setting-label" htmlFor="sensitivity-input">
              Sensitivity ({getGameName(fromGame)})
            </label>
            <input
              id="sensitivity-input"
              type="text"
              inputMode="decimal"
              value={sensitivityInput}
              onChange={(e) => setSensitivityInput(e.target.value)}
              placeholder="e.g. 0.3"
              style={{ width: '100%' }}
              aria-describedby="sens-range-hint"
            />
            <span id="sens-range-hint" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Range: 0.01 – 100
            </span>
          </div>

          <div className="setting-group">
            <label className="setting-label" htmlFor="dpi-input">Mouse DPI</label>
            <input
              id="dpi-input"
              type="text"
              inputMode="numeric"
              value={dpiInput}
              onChange={(e) => setDpiInput(e.target.value)}
              placeholder="e.g. 800"
              style={{ width: '100%' }}
              aria-describedby="dpi-range-hint"
            />
            <span id="dpi-range-hint" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Range: 100 – 16000
            </span>
          </div>
        </div>
      </section>

      {/* Error display */}
      {error && (
        <div
          role="alert"
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius, 12px)',
            padding: '16px 20px',
            marginBottom: '24px',
            color: '#ef4444',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      {/* Result display */}
      {result !== null && !error && (
        <section
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius, 12px)',
            padding: '32px 24px',
            marginBottom: '24px',
            textAlign: 'center',
            backgroundImage: 'linear-gradient(135deg, rgba(34, 211, 238, 0.04), rgba(99, 102, 241, 0.04))',
            borderColor: 'rgba(34, 211, 238, 0.25)',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, marginBottom: '8px' }}>
            {getGameName(toGame)} Sensitivity
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-1.5px' }}>
            {result.toFixed(4)}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '16px',
              marginTop: '20px',
              maxWidth: '360px',
              margin: '20px auto 0',
            }}
          >
            {cmPer360From !== null && (
              <div
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>cm/360</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>{cmPer360From.toFixed(2)} cm</div>
              </div>
            )}
            {trainerSens !== null && (
              <div
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Trainer Scale</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>{trainerSens.toFixed(4)}</div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Saved Profiles */}
      <section
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius, 12px)',
          padding: '24px',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', letterSpacing: '-0.3px', marginTop: 0, marginBottom: '16px' }}>
          Saved Profiles
        </h2>

        {/* Profile applied notification */}
        {profileApplied && (
          <div
            style={{
              background: 'rgba(34, 211, 238, 0.08)',
              border: '1px solid rgba(34, 211, 238, 0.25)',
              borderRadius: '8px',
              padding: '10px 16px',
              marginBottom: '16px',
              color: 'var(--accent)',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            Profile &quot;{profileApplied}&quot; applied
          </div>
        )}

        {/* Save new profile */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label className="setting-label" htmlFor="profile-name">Profile Name</label>
            <input
              id="profile-name"
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="My Valorant Setup"
              maxLength={30}
              style={{ width: '100%' }}
            />
          </div>
          <button
            className="action-btn primary"
            onClick={handleSaveProfile}
            disabled={profiles.length >= MAX_PROFILES}
            style={{ flex: '0 0 auto', padding: '10px 20px', fontSize: '0.85rem' }}
          >
            Save Profile ({profiles.length}/{MAX_PROFILES})
          </button>
        </div>

        {profileSaveError && (
          <div
            role="alert"
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '10px 16px',
              color: '#ef4444',
              fontSize: '0.85rem',
              marginBottom: '12px',
              fontWeight: 600,
            }}
          >
            {profileSaveError}
          </div>
        )}

        {/* Profile list */}
        {profiles.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            No saved profiles yet. Configure your settings above and save a profile for quick access.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {profiles.map((profile) => (
              <div
                key={profile.id}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                  transition: 'border-color 0.2s',
                }}
              >
                <div style={{ flex: '1 1 auto', minWidth: '150px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px', color: 'var(--text-main)' }}>
                    {profile.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {getGameName(profile.game)} • Sens: {profile.sensitivity} • DPI: {profile.dpi}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="action-btn"
                    onClick={() => handleLoadProfile(profile)}
                    style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                  >
                    Load
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => handleDeleteProfile(profile.id)}
                    style={{ padding: '8px 14px', fontSize: '0.8rem', color: '#ef4444' }}
                    aria-label={`Delete profile ${profile.name}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
