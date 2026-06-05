import type { WololoConfig } from "../config/WololoConfig.js";
import { EventClassifier } from "./EventClassifier.js";

export type ResolveSoundInput = {
  eventName: string;
  payload?: unknown;
  config: WololoConfig;
};

export class SoundResolver {
  constructor(
    private readonly config: WololoConfig,
    private readonly classifier = new EventClassifier(),
  ) {}

  resolve(eventName: string, payload?: unknown): string | undefined {
    const profileEvents = this.config.profiles.eventsFor(this.config.defaultProfile);

    for (const key of this.classifier.keysFor(eventName, payload)) {
      const fromProfile = profileEvents?.get(key.value);
      if (fromProfile) return this.config.soundsDir.resolve(fromProfile);

      const fromFlatConfig = this.config.events.get(key.value);
      if (fromFlatConfig) return this.config.soundsDir.resolve(fromFlatConfig);
    }

    return undefined;
  }
}
