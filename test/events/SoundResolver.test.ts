import path from "node:path";
import { describe, expect, it } from "vitest";
import { CooldownMs } from "../../src/config/CooldownMs.js";
import { DebugMode } from "../../src/config/DebugMode.js";
import { Enabled } from "../../src/config/Enabled.js";
import { EventSoundMap } from "../../src/config/EventSoundMap.js";
import { ProfileName } from "../../src/config/ProfileName.js";
import { ProfileSoundMap } from "../../src/config/ProfileSoundMap.js";
import { WololoConfig } from "../../src/config/WololoConfig.js";
import { SoundResolver } from "../../src/events/SoundResolver.js";
import { SoundsDirectory } from "../../src/sounds/SoundsDirectory.js";

function config(input: { defaultProfile?: string; events?: Record<string, string>; profiles?: Record<string, Record<string, string>> } = {}): WololoConfig {
  return new WololoConfig(
    Enabled.fromUnknown(true, true),
    SoundsDirectory.fromUnknown("/sounds", "/sounds"),
    DebugMode.fromUnknown(false, false),
    CooldownMs.fromUnknown(1000, 1000),
    ProfileName.optional(input.defaultProfile),
    EventSoundMap.fromUnknown(input.events),
    ProfileSoundMap.fromUnknown(input.profiles),
  );
}

describe("SoundResolver", () => {
  it("resolves simple event from flat config", () => {
    const resolver = new SoundResolver(config({ events: { "session.idle": "housed.wav" } }));

    expect(resolver.resolve("session.idle")).toBe(path.resolve("/sounds", "housed.wav"));
  });

  it("profile has priority over flat config", () => {
    const resolver = new SoundResolver(
      config({
        defaultProfile: "spanish",
        events: { "session.idle": "flat.wav" },
        profiles: { spanish: { "session.idle": "profile.wav" } },
      }),
    );

    expect(resolver.resolve("session.idle")).toBe(path.resolve("/sounds", "profile.wav"));
  });

  it("returns undefined when no sound is configured", () => {
    const resolver = new SoundResolver(config());

    expect(resolver.resolve("session.idle")).toBeUndefined();
  });
});
