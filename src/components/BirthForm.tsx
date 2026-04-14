/**
 * BirthForm.tsx
 * Single Responsibility: Collects birth details and fires onSubmit callback.
 * Owns only its own field state. No API calls, no chart logic.
 *
 * Rule 4, 5, 6 | SOLID — Single Responsibility, Interface Segregation.
 */

import { useState } from 'react';
import { clientLogger } from '../lib/clientLogger';
import type { ChartRequest } from '../types/vedic';

interface BirthFormProps {
  onSubmit: (data: ChartRequest) => void;
  isLoading: boolean;
  error: string | null;
}

export default function BirthForm({ onSubmit, isLoading, error }: BirthFormProps) {
  clientLogger.fn('BirthForm render');

  const [form, setForm] = useState<ChartRequest>({
    name: '', dateOfBirth: '', timeOfBirth: '', placeOfBirth: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    clientLogger.fn('handleChange', { field: e.target.name });
    clientLogger.action(`Field updated: ${e.target.name}`);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clientLogger.fn('handleSubmit');
    clientLogger.action('Birth chart form submitted', { name: form.name, place: form.placeOfBirth });
    if (!form.name.trim() || !form.dateOfBirth || !form.timeOfBirth || !form.placeOfBirth.trim()) {
      clientLogger.warn('handleSubmit | Missing required fields');
      return;
    }
    onSubmit(form);
  }

  return (
    <div style={{ maxWidth: '420px', width: '100%', margin: '0 auto' }}>
      <div className="cosmic-card cosmic-card-glow" style={{ padding: '2.5rem 2rem' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p className="gold-glow" style={{ color: '#f5c518', fontSize: '1.5rem', marginBottom: '0.5rem' }}>✦</p>
          <h1 className="gold-glow" style={{
            color: '#f5c518', fontFamily: 'Georgia, serif',
            fontSize: '1.4rem', fontWeight: 700,
            letterSpacing: '0.3em', textTransform: 'uppercase',
          }}>
            NIRAM
          </h1>
          <p style={{ color: 'rgba(245,197,24,0.45)', fontSize: '0.68rem', letterSpacing: '0.2em', marginTop: '0.3rem' }}>
            VEDIC ASTROLOGY
          </p>
          <div className="cosmic-divider" style={{ margin: '1.25rem 0 1rem' }} />
          <p style={{ color: 'rgba(200,190,230,0.45)', fontSize: '0.8rem', lineHeight: 1.6 }}>
            Enter your birth details to generate your Vedic birth chart using Lahiri Ayanamsa.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: '1.25rem', padding: '0.75rem 1rem',
            background: 'rgba(180,40,40,0.18)',
            border: '1px solid rgba(200,60,60,0.35)',
            borderRadius: '0.5rem',
            color: '#fca5a5', fontSize: '0.85rem',
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label htmlFor="name" className="cosmic-label">Full Name</label>
              <input id="name" name="name" type="text" className="cosmic-input"
                placeholder="e.g. Arjun Sharma"
                value={form.name} onChange={handleChange} disabled={isLoading} required />
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="cosmic-label">Date of Birth</label>
              <input id="dateOfBirth" name="dateOfBirth" type="date" className="cosmic-input"
                value={form.dateOfBirth} onChange={handleChange} disabled={isLoading} required />
            </div>

            <div>
              <label htmlFor="timeOfBirth" className="cosmic-label">
                Time of Birth
                <span style={{ color: 'rgba(200,200,220,0.35)', textTransform: 'none', letterSpacing: 'normal', marginLeft: '0.4rem', fontSize: '0.7rem' }}>
                  (24-hr)
                </span>
              </label>
              <input id="timeOfBirth" name="timeOfBirth" type="time" className="cosmic-input"
                value={form.timeOfBirth} onChange={handleChange} disabled={isLoading} required />
            </div>

            <div>
              <label htmlFor="placeOfBirth" className="cosmic-label">Place of Birth</label>
              <input id="placeOfBirth" name="placeOfBirth" type="text" className="cosmic-input"
                placeholder="e.g. Chennai, India"
                value={form.placeOfBirth} onChange={handleChange} disabled={isLoading} required />
            </div>

            <button type="submit" className="cosmic-btn" disabled={isLoading} style={{ marginTop: '0.5rem' }}>
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                  <span className="spinner" />
                  Reading the Stars...
                </span>
              ) : '✦ Generate Birth Chart ✦'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
