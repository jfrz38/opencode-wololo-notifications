import path from "node:path";
import { describe, expect, it } from "vitest";
import { CooldownMs } from "../../src/config/CooldownMs.js";
import { DebugMode } from "../../src/config/DebugMode.js";
import { Enabled } from "../../src/config/Enabled.js";
import { EventPatternSet } from "../../src/config/EventPatternSet.js";
import { EventSoundMap } from "../../src/config/EventSoundMap.js";
import { ProfileName } from "../../src/config/ProfileName.js";
import { ProfileSoundMap } from "../../src/config/ProfileSoundMap.js";
import { WololoConfig } from "../../src/config/WololoConfig.js";
import { SoundResolver } from "../../src/events/SoundResolver.js";
import { SoundsDirectory } from "../../src/sounds/SoundsDirectory.js";

function config(input: { defaultProfile?: string; events?: Record<string, string>; profiles?: Record<string, Record<string, string>>; enabledEvents?: unknown; disabledEvents?: unknown } = {}): WololoConfig {
  return new WololoConfig(
    Enabled.fromUnknown(true, true),
    SoundsDirectory.fromUnknown("/sounds", "/sounds"),
    DebugMode.fromUnknown(false, false),
    CooldownMs.fromUnknown(1000, 1000),
    ProfileName.optional(input.defaultProfile),
    EventSoundMap.fromUnknown(input.events),
    ProfileSoundMap.fromUnknown(input.profiles),
    EventPatternSet.fromUnknown(input.enabledEvents, ["session.idle"]),
    EventPatternSet.fromUnknown(input.disabledEvents),
  );
}

describe("SoundResolver", () => {
  it("resolves an event from flat config", () => {
    const resolver = new SoundResolver(config({ events: { "session.idle": "housed.wav" } }), () => true);

    expect(resolver.resolve("session.idle")).toBe(path.resolve("/sounds", "housed.wav"));
  });

  it("gives profiles priority over flat config", () => {
    const resolver = new SoundResolver(
      config({
        defaultProfile: "spanish",
        events: { "session.idle": "flat.wav" },
        profiles: { spanish: { "session.idle": "profile.wav" } },
      }),
      () => true,
    );

    expect(resolver.resolve("session.idle")).toBe(path.resolve("/sounds", "profile.wav"));
  });

  it.each([
    ["session.idle", "wololo.wav"],
    ["session.error", "under_attack.wav"],
    ["permission.asked", "ally.wav"],
    ["question.asked", "spawn.wav"],
  ])("uses the distinct bundled fallback for %s", (eventName, fileName) => {
    const resolver = new SoundResolver(config({ enabledEvents: [eventName] }));

    expect(resolver.resolve(eventName)).toBe(path.resolve("sounds", fileName));
  });

  it("enables only session.idle by default", () => {
    const resolver = new SoundResolver(config());

    expect(resolver.resolve("session.idle")).toBe(path.resolve("sounds", "wololo.wav"));
    expect(resolver.resolve("session.error")).toBeUndefined();
    expect(resolver.resolve("permission.asked")).toBeUndefined();
    expect(resolver.resolve("question.asked")).toBeUndefined();
  });

  it("disables every sound with an explicitly empty enabled event list", () => {
    const resolver = new SoundResolver(config({ enabledEvents: [] }));

    expect(resolver.resolve("session.idle")).toBeUndefined();
  });

  it("enables only events selected by configured patterns", () => {
    const resolver = new SoundResolver(config({ enabledEvents: ["permission.*"] }));

    expect(resolver.resolve("permission.asked")).toBe(path.resolve("sounds", "ally.wav"));
    expect(resolver.resolve("session.idle")).toBeUndefined();
  });

  it("does not enable an event merely because it has a custom mapping", () => {
    const resolver = new SoundResolver(config({ events: { "session.error": "error-custom.wav" } }), () => true);

    expect(resolver.resolve("session.error")).toBeUndefined();
  });

  it("falls back to bundled sound when a configured file is missing", () => {
    const resolver = new SoundResolver(config({ enabledEvents: ["session.error"], events: { "session.error": "missing.wav" } }), () => false);

    expect(resolver.resolve("session.error")).toBe(path.resolve("sounds", "under_attack.wav"));
  });

  it("returns undefined for unsupported events", () => {
    const resolver = new SoundResolver(config({ enabledEvents: ["*"] }));

    expect(resolver.resolve("unknown.event")).toBeUndefined();
  });

  it("applies disabled events as a final veto", () => {
    const resolver = new SoundResolver(config({ enabledEvents: ["session.*"], disabledEvents: ["session.error"] }));

    expect(resolver.resolve("session.error")).toBeUndefined();
    expect(resolver.resolve("session.idle")).toBe(path.resolve("sounds", "wololo.wav"));
  });

  it("blocks all events with star", () => {
    const resolver = new SoundResolver(config({ disabledEvents: ["*"] }));

    expect(resolver.resolve("session.idle")).toBeUndefined();
  });
});
