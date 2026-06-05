import { EventSoundMap } from "./EventSoundMap.js";
import type { ProfileName } from "./ProfileName.js";

export class ProfileSoundMap {
  private constructor(private readonly entries: Record<string, EventSoundMap>) {}

  static fromUnknown(value: unknown): ProfileSoundMap {
    if (!value || typeof value !== "object" || Array.isArray(value)) return new ProfileSoundMap({});

    const entries: Record<string, EventSoundMap> = {};
    for (const [key, item] of Object.entries(value)) {
      const events = EventSoundMap.fromUnknown(item);
      if (!events.isEmpty()) entries[key] = events;
    }

    return new ProfileSoundMap(entries);
  }

  eventsFor(profile: ProfileName | undefined): EventSoundMap | undefined {
    if (!profile) return undefined;
    return this.entries[profile.value];
  }

  toRecord(): Record<string, Record<string, string>> {
    return Object.fromEntries(Object.entries(this.entries).map(([key, events]) => [key, events.toRecord()]));
  }
}
