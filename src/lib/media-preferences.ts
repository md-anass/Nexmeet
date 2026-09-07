export type MediaPreferences = { cameraEnabled: boolean; microphoneEnabled: boolean };

export function mediaPreferenceKey(meetingCode: string) {
  return `nexmeet_media_preferences_${meetingCode}`;
}

export function readMediaPreferences(meetingCode: string): MediaPreferences {
  if (typeof window === "undefined") return { cameraEnabled: true, microphoneEnabled: true };
  try {
    const value: unknown = JSON.parse(window.sessionStorage.getItem(mediaPreferenceKey(meetingCode)) ?? "null");
    if (value && typeof value === "object") {
      const row = value as Record<string, unknown>;
      if (typeof row.cameraEnabled === "boolean" && typeof row.microphoneEnabled === "boolean") {
        return { cameraEnabled: row.cameraEnabled, microphoneEnabled: row.microphoneEnabled };
      }
    }
  } catch {
    // Ignore unavailable or malformed tab-scoped preferences.
  }
  return { cameraEnabled: true, microphoneEnabled: true };
}

export function writeMediaPreferences(meetingCode: string, preferences: MediaPreferences) {
  try {
    window.sessionStorage.setItem(mediaPreferenceKey(meetingCode), JSON.stringify(preferences));
  } catch {
    // Media controls continue to work when browser storage is unavailable.
  }
}
