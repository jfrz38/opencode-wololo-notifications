import { describe, expect, it, vi } from "vitest";
import type { AudioPlayer } from "../../src/audio/AudioPlayer.js";
import { CooldownMs } from "../../src/config/CooldownMs.js";
import { DebugMode } from "../../src/config/DebugMode.js";
import { Enabled } from "../../src/config/Enabled.js";
import { EventPatternSet } from "../../src/config/EventPatternSet.js";
import { EventSoundMap } from "../../src/config/EventSoundMap.js";
import { ProfileSoundMap } from "../../src/config/ProfileSoundMap.js";
import { WololoConfig } from "../../src/config/WololoConfig.js";
import type { SoundResolver } from "../../src/events/SoundResolver.js";
import type { Logger } from "../../src/logger/ConsoleLogger.js";
import { WololoPluginHooks } from "../../src/plugin/WololoPluginHooks.js";
import { NotificationState } from "../../src/runtime/NotificationState.js";
import { SoundsDirectory } from "../../src/sounds/SoundsDirectory.js";

function config(): WololoConfig {
  return new WololoConfig(
    Enabled.fromUnknown(true, true),
    SoundsDirectory.fromUnknown("/sounds", "/sounds"),
    DebugMode.fromUnknown(false, false),
    CooldownMs.fromUnknown(1000, 1000),
    undefined,
    EventSoundMap.fromUnknown({}),
    ProfileSoundMap.fromUnknown({}),
    EventPatternSet.fromUnknown(["session.idle"]),
    EventPatternSet.fromUnknown([]),
  );
}

function dependencies(input: { enabled?: boolean; sound?: string | undefined } = {}) {
  const notificationState = new NotificationState(input.enabled ?? true);
  return {
    config: config(),
    logger: { debug: vi.fn(), warn: vi.fn() } satisfies Logger,
    notificationState,
    soundResolver: { resolve: vi.fn(() => input.sound) } as unknown as SoundResolver,
    audioPlayer: { play: vi.fn() } as unknown as AudioPlayer,
  };
}

describe("WololoPluginHooks", () => {
  it("does not play event sound when notifications are disabled", async () => {
    const deps = dependencies({ enabled: false, sound: "/sounds/housed.wav" });
    const hooks = new WololoPluginHooks(deps).create();

    await hooks.event?.({ event: { type: "session.idle" } as never });

    expect(deps.soundResolver.resolve).not.toHaveBeenCalled();
    expect(deps.audioPlayer.play).not.toHaveBeenCalled();
  });

  it("plays configured event sound when notifications are enabled", async () => {
    const deps = dependencies({ sound: "/sounds/housed.wav" });
    const hooks = new WololoPluginHooks(deps).create();

    await hooks.event?.({ event: { type: "session.idle" } as never });

    expect(deps.soundResolver.resolve).toHaveBeenCalledWith("session.idle");
    expect(deps.audioPlayer.play).toHaveBeenCalledWith("/sounds/housed.wav");
  });

  it("handles permission.asked", async () => {
    const deps = dependencies({ sound: "/sounds/ally.wav" });
    const hooks = new WololoPluginHooks(deps).create();
    const event = { type: "permission.asked", properties: { id: "permission-1" } };

    await hooks.event?.({ event: event as never });

    expect(deps.soundResolver.resolve).toHaveBeenCalledWith("permission.asked");
    expect(deps.audioPlayer.play).toHaveBeenCalledWith("/sounds/ally.wav");
  });

  it("handles question.asked", async () => {
    const deps = dependencies({ sound: "/sounds/spawn.wav" });
    const hooks = new WololoPluginHooks(deps).create();
    const event = { type: "question.asked", properties: { id: "question-1" } };

    await hooks.event?.({ event: event as never });

    expect(deps.soundResolver.resolve).toHaveBeenCalledWith("question.asked");
    expect(deps.audioPlayer.play).toHaveBeenCalledWith("/sounds/spawn.wav");
  });
});
