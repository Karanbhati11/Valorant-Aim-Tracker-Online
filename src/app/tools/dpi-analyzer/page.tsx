'use client';

import { useState, useRef, useCallback } from 'react';

export default function DpiAnalyzerPage() {
  const [pixelDistance, setPixelDistance] = useState<number>(0);
  const [physicalDistance, setPhysicalDistance] = useState<string>('');
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');
  const [calculatedDpi, setCalculatedDpi] = useState<number | null>(null);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurementComplete, setMeasurementComplete] = useState(false);

  const totalDistanceRef = useRef(0);
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);
  const measureAreaRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsMeasuring(true);
    setMeasurementComplete(false);
    setCalculatedDpi(null);
    totalDistanceRef.current = 0;
    lastPositionRef.current = { x: e.clientX, y: e.clientY };
    setPixelDistance(0);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isMeasuring || !lastPositionRef.current) return;

      const dx = e.clientX - lastPositionRef.current.x;
      const dy = e.clientY - lastPositionRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      totalDistanceRef.current += distance;
      lastPositionRef.current = { x: e.clientX, y: e.clientY };
      setPixelDistance(Math.round(totalDistanceRef.current));
    },
    [isMeasuring]
  );

  const handleMouseUp = useCallback(() => {
    if (isMeasuring) {
      setIsMeasuring(false);
      setMeasurementComplete(true);
      lastPositionRef.current = null;
    }
  }, [isMeasuring]);

  const handleMouseLeave = useCallback(() => {
    if (isMeasuring) {
      setIsMeasuring(false);
      setMeasurementComplete(true);
      lastPositionRef.current = null;
    }
  }, [isMeasuring]);

  const calculateDpi = useCallback(() => {
    const physDist = parseFloat(physicalDistance);
    if (isNaN(physDist) || physDist <= 0) return;
    if (pixelDistance <= 0) return;

    // Convert cm to inches if needed
    const distanceInInches = unit === 'cm' ? physDist / 2.54 : physDist;

    // DPI = pixels / inches
    const dpi = Math.round(pixelDistance / distanceInInches);
    setCalculatedDpi(dpi);
  }, [physicalDistance, pixelDistance, unit]);

  const resetMeasurement = useCallback(() => {
    setPixelDistance(0);
    setPhysicalDistance('');
    setCalculatedDpi(null);
    setMeasurementComplete(false);
    totalDistanceRef.current = 0;
    lastPositionRef.current = null;
  }, []);

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
          DPI <span className="brand-accent">Analyzer</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, margin: 0 }}>
          Measure your mouse&apos;s effective DPI with a simple drag test. Know exactly what your hardware is doing.
        </p>
      </section>

      {/* How to Use */}
      <section
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius, 12px)',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <h2 style={{ fontSize: '1.15rem', marginTop: 0, marginBottom: '12px', color: 'var(--text-main)' }}>
          How to Use
        </h2>
        <ol
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            paddingLeft: '20px',
            margin: 0,
            lineHeight: 2,
          }}
        >
          <li>Place your mouse at one edge of your mousepad (or a known distance)</li>
          <li>Click and drag in the measurement area below, moving your mouse the full physical distance</li>
          <li>Release the mouse button when done</li>
          <li>Enter the physical distance you moved your mouse</li>
          <li>Click &quot;Calculate DPI&quot; to see your effective DPI</li>
        </ol>
      </section>

      {/* Measurement Area */}
      <section
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius, 12px)',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <label
          className="setting-label"
          style={{ marginBottom: '12px', display: 'block' }}
        >
          Measurement Area — Click and drag your mouse here
        </label>
        <div
          ref={measureAreaRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{
            width: '100%',
            height: '200px',
            background: isMeasuring
              ? 'rgba(99, 102, 241, 0.06)'
              : 'rgba(0, 0, 0, 0.25)',
            border: `2px ${isMeasuring ? 'solid' : 'dashed'} ${
              isMeasuring ? 'var(--accent)' : 'var(--border)'
            }`,
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: isMeasuring ? 'crosshair' : 'pointer',
            transition: 'background 0.2s, border-color 0.2s',
            userSelect: 'none',
          }}
        >
          {!isMeasuring && !measurementComplete && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🖱️</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Click and drag to start measuring
              </div>
            </div>
          )}
          {isMeasuring && (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: 'var(--accent)',
                }}
              >
                {pixelDistance} px
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                Recording... release mouse to stop
              </div>
            </div>
          )}
          {measurementComplete && !isMeasuring && (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: 'var(--accent)',
                }}
              >
                {pixelDistance} px
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                Measurement complete
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Physical Distance Input */}
      <section
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius, 12px)',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <label className="setting-label" style={{ marginBottom: '12px', display: 'block' }}>
          Physical Distance Moved
        </label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            alignItems: 'end',
          }}
        >
          <div className="setting-group">
            <input
              type="number"
              value={physicalDistance}
              onChange={(e) => setPhysicalDistance(e.target.value)}
              placeholder="e.g. 5"
              min="0.01"
              step="0.1"
              style={{ width: '100%' }}
            />
          </div>
          <div className="setting-group">
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as 'inches' | 'cm')}
              style={{ width: '100%' }}
            >
              <option value="inches">inches</option>
              <option value="cm">centimeters</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className="action-btn primary"
              onClick={calculateDpi}
              disabled={!measurementComplete || !physicalDistance || parseFloat(physicalDistance) <= 0}
              style={{
                padding: '10px 24px',
                opacity:
                  !measurementComplete || !physicalDistance || parseFloat(physicalDistance) <= 0
                    ? 0.5
                    : 1,
                cursor:
                  !measurementComplete || !physicalDistance || parseFloat(physicalDistance) <= 0
                    ? 'not-allowed'
                    : 'pointer',
              }}
            >
              Calculate DPI
            </button>
            <button
              className="action-btn"
              onClick={resetMeasurement}
              style={{ padding: '10px 24px' }}
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      {/* Result Display */}
      {calculatedDpi !== null && (
        <section
          style={{
            background: 'var(--bg-card)',
            border: '1px solid rgba(34, 211, 238, 0.25)',
            borderRadius: 'var(--radius, 12px)',
            padding: '32px 24px',
            textAlign: 'center',
            marginBottom: '24px',
            backgroundImage: 'linear-gradient(135deg, rgba(34, 211, 238, 0.04), rgba(99, 102, 241, 0.04))',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              fontWeight: 700,
              marginBottom: '8px',
            }}
          >
            Your Effective DPI
          </div>
          <div
            style={{
              fontSize: '3.5rem',
              fontWeight: 800,
              color: 'var(--accent)',
              letterSpacing: '-2px',
            }}
          >
            {calculatedDpi}
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              marginTop: '8px',
            }}
          >
            Based on {pixelDistance} pixels over{' '}
            {physicalDistance} {unit === 'inches' ? 'inch(es)' : 'cm'}
          </div>
        </section>
      )}

      {/* Tips */}
      <section
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius, 12px)',
          padding: '24px',
        }}
      >
        <h2 style={{ fontSize: '1.15rem', marginTop: 0, marginBottom: '12px', color: 'var(--text-main)' }}>
          Tips for Accurate Results
        </h2>
        <ul
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            paddingLeft: '18px',
            margin: 0,
            lineHeight: 1.9,
          }}
        >
          <li>Use a ruler or known distance on your mousepad for best accuracy</li>
          <li>Move your mouse in a straight line for a clean measurement</li>
          <li>Disable any mouse acceleration in your OS settings before testing</li>
          <li>Run the test multiple times and average the results</li>
          <li>Common DPI values: 400, 800, 1600, 3200</li>
        </ul>
      </section>
    </div>
  );
}
