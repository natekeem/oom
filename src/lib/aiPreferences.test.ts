import { beforeEach, describe, expect, it } from 'vitest';
import { loadCustomSettings, saveCustomSettings } from './customSettingsStorage';
import { getFeedbackMode, setFeedbackMode } from './aiPreferences';
const defaults = { endpoint: '', apiKey: '' };
beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
describe('device AI preferences and opt-in secrets', () => {
  it('defaults managed and preserves explicit custom', () => {
    expect(getFeedbackMode()).toBe('managed'); setFeedbackMode('custom'); expect(getFeedbackMode()).toBe('custom');
  });
  it('saves metadata locally but secrets only for the current session by default', () => {
    saveCustomSettings('test', { endpoint: 'https://example.invalid', apiKey: 'fixture-secret' });
    expect(localStorage.getItem('test')).not.toContain('fixture-secret');
    expect(loadCustomSettings('test', defaults).apiKey).toBe('fixture-secret');
    sessionStorage.clear(); expect(loadCustomSettings('test', defaults).apiKey).toBe('');
  });
  it('remembers only with opt-in and removes the stored secret when unchecked', () => {
    saveCustomSettings('test', { apiKey: 'fixture-secret', rememberKey: true });
    expect(localStorage.getItem('test')).toContain('fixture-secret');
    saveCustomSettings('test', { apiKey: 'fixture-secret', rememberKey: false });
    expect(localStorage.getItem('test')).not.toContain('fixture-secret');
    expect(loadCustomSettings('test', defaults).apiKey).toBe('fixture-secret');
  });
  it('keeps legacy keys usable with a warning until the user saves their choice', () => {
    localStorage.setItem('test', JSON.stringify({ apiKey: 'legacy-fixture' }));
    const loaded = loadCustomSettings('test', defaults);
    expect(loaded).toMatchObject({ apiKey: 'legacy-fixture', rememberKey: false, legacyStoredKey: true });
    expect(localStorage.getItem('test')).toContain('legacy-fixture');
    saveCustomSettings('test', loaded);
    expect(localStorage.getItem('test')).not.toContain('legacy-fixture');
    expect(loadCustomSettings('test', defaults).apiKey).toBe('legacy-fixture');
  });
});
