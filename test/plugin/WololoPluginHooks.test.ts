import { describe, expect, it, vi } from "vitest";
import type { PluginInput } from "@opencode-ai/plugin";
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
  const sessionGet = vi.fn().mockResolvedValue({ data: { id: "session-root" } });
  return {
    config: config(),
    logger: { debug: vi.fn(), warn: vi.fn() } satisfies Logger,
    notificationState,
    soundResolver: { resolve: vi.fn(() => input.sound) } as unknown as SoundResolver,
    audioPlayer: { play: vi.fn() } as unknown as AudioPlayer,
    client: { session: { get: sessionGet } } as unknown as PluginInput["client"],
    sessionGet,
  };
}

describe("WololoPluginHooks", () => {
  it("does not play event sound when notifications are disabled", async () => {
    const deps = dependencies({ enabled: false, sound: "/sounds/housed.wav" });
    const hooks = new WololoPluginHooks(deps).create();

    await hooks.event?.({
      event: {
        type: "session.status",
        properties: { sessionID: "session-root", status: { type: "idle" } },
      },
    });

    expect(deps.sessionGet).not.toHaveBeenCalled();
    expect(deps.soundResolver.resolve).not.toHaveBeenCalled();
    expect(deps.audioPlayer.play).not.toHaveBeenCalled();
  });

  it("plays the configured idle sound for a root session", async () => {
    const deps = dependencies({ sound: "/sounds/housed.wav" });
    const hooks = new WololoPluginHooks(deps).create();

    await hooks.event?.({
      event: {
        type: "session.status",
        properties: { sessionID: "session-root", status: { type: "idle" } },
      },
    });

    expect(deps.sessionGet).toHaveBeenCalledWith({ path: { id: "session-root" } });
    expect(deps.soundResolver.resolve).toHaveBeenCalledWith("session.idle");
    expect(deps.audioPlayer.play).toHaveBeenCalledWith("/sounds/housed.wav");
  });

  it("does not play the idle sound for a child session", async () => {
    const deps = dependencies({ sound: "/sounds/housed.wav" });
    deps.sessionGet.mockResolvedValue({ data: { id: "session-child", parentID: "session-root" } });
    const hooks = new WololoPluginHooks(deps).create();

    await hooks.event?.({
      event: {
        type: "session.status",
        properties: { sessionID: "session-child", status: { type: "idle" } },
      },
    });

    expect(deps.soundResolver.resolve).not.toHaveBeenCalled();
    expect(deps.audioPlayer.play).not.toHaveBeenCalled();
  });

  it("ignores non-idle session statuses", async () => {
    const deps = dependencies({ sound: "/sounds/housed.wav" });
    const hooks = new WololoPluginHooks(deps).create();

    await hooks.event?.({
      event: {
        type: "session.status",
        properties: { sessionID: "session-root", status: { type: "busy" } },
      },
    });

    expect(deps.sessionGet).not.toHaveBeenCalled();
    expect(deps.soundResolver.resolve).not.toHaveBeenCalled();
    expect(deps.audioPlayer.play).not.toHaveBeenCalled();
  });

  it("does not play when the session lookup returns no data", async () => {
    const deps = dependencies({ sound: "/sounds/housed.wav" });
    deps.sessionGet.mockResolvedValue({ data: undefined });
    const hooks = new WololoPluginHooks(deps).create();

    await hooks.event?.({
      event: {
        type: "session.status",
        properties: { sessionID: "session-root", status: { type: "idle" } },
      },
    });

    expect(deps.logger.warn).toHaveBeenCalledWith(
      "unable to determine parent for session=session-root",
    );
    expect(deps.audioPlayer.play).not.toHaveBeenCalled();
  });

  it("does not play or reject when the session lookup fails", async () => {
    const deps = dependencies({ sound: "/sounds/housed.wav" });
    deps.sessionGet.mockRejectedValue(new Error("connection failed"));
    const hooks = new WololoPluginHooks(deps).create();

    await expect(
      hooks.event?.({
        event: {
          type: "session.status",
          properties: { sessionID: "session-root", status: { type: "idle" } },
        },
      }),
    ).resolves.toBeUndefined();
    expect(deps.logger.warn).toHaveBeenCalledWith(
      "unable to determine parent for session=session-root",
    );
    expect(deps.audioPlayer.play).not.toHaveBeenCalled();
  });

  it("ignores the legacy session.idle event", async () => {
    const deps = dependencies({ sound: "/sounds/housed.wav" });
    const hooks = new WololoPluginHooks(deps).create();

    await hooks.event?.({
      event: { type: "session.idle", properties: { sessionID: "session-root" } },
    });

    expect(deps.sessionGet).not.toHaveBeenCalled();
    expect(deps.soundResolver.resolve).not.toHaveBeenCalled();
    expect(deps.audioPlayer.play).not.toHaveBeenCalled();
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
