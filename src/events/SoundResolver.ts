import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { WololoConfig } from "../config/WololoConfig.js";

const BUNDLED_SOUNDS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../sounds");

const BUNDLED_EVENT_SOUNDS = new Map<string, string>([
  ["session.idle", "wololo.wav"],
  ["session.error", "under_attack.wav"],
  ["permission.asked", "ally.wav"],
  ["question.asked", "spawn.wav"],
]);

export class SoundResolver {
  constructor(
    private readonly config: WololoConfig,
    private readonly fileExists = existsSync,
  ) {}

  resolve(eventName: string): string | undefined {
    const profileEvents = this.config.profiles.eventsFor(this.config.defaultProfile);

    if (!this.config.enabledEvents.matches(eventName)) return undefined;
    if (this.config.disabledEvents.matches(eventName)) return undefined;

    const fromProfile = profileEvents?.get(eventName);
    if (fromProfile) {
      const resolved = this.config.soundsDir.resolve(fromProfile);
      if (this.fileExists(resolved)) return resolved;
    }

    const fromFlatConfig = this.config.events.get(eventName);
    if (fromFlatConfig) {
      const resolved = this.config.soundsDir.resolve(fromFlatConfig);
      if (this.fileExists(resolved)) return resolved;
    }

    const fromBundled = BUNDLED_EVENT_SOUNDS.get(eventName);
    if (fromBundled) return path.resolve(BUNDLED_SOUNDS_DIR, fromBundled);

    return undefined;
  }
}
