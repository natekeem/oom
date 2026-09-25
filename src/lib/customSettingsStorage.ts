type SecretSettings = { apiKey?: string; rememberKey?: boolean; legacyStoredKey?: boolean };
// Configuration is device-local; secrets are tab-session scoped unless explicitly remembered.
export function loadCustomSettings<T extends SecretSettings>(key: string, defaults: T): T {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "{}") as T;
    const legacy = Boolean(saved.apiKey && saved.rememberKey === undefined);
    return { ...defaults, ...saved, apiKey: saved.apiKey || sessionStorage.getItem(`${key}:key`) || "", legacyStoredKey: legacy, rememberKey: saved.rememberKey === true };
  } catch { return defaults; }
}
export function saveCustomSettings<T extends SecretSettings>(key: string, settings: T) {
  const { apiKey = "", legacyStoredKey: _legacy, ...config } = settings;
  void _legacy;
  sessionStorage.setItem(`${key}:key`, apiKey);
  localStorage.setItem(key, JSON.stringify({ ...config, rememberKey: settings.rememberKey === true, ...(settings.rememberKey ? { apiKey } : {}) }));
}
