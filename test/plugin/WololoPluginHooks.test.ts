import type { Config } from "@opencode-ai/plugin";
import { describe, expect, it, vi } from "vitest";
import type { AudioPlayer } from "../../src/audio/AudioPlayer.js";
import { WOLOLO_COMMAND_NAME, WOLOLO_COMMAND_PART_ID } from "../../src/commands/WololoCommandConstants.js";
import type { WololoCommand } from "../../src/commands/WololoCommand.js";
import type { WololoCommandRegistrar } from "../../src/commands/WololoCommandRegistrar.js";
import { CooldownMs } from "../../src/config/CooldownMs.js";
import { DebugMode } from "../../src/config/DebugMode.js";
import { Enabled } from "../../src/config/Enabled.js";
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
    wololoCommand: { execute: vi.fn(() => ({ message: "Wololo notifications: enabled" })) } as unknown as WololoCommand,
    wololoCommandRegistrar: { register: vi.fn() } as unknown as WololoCommandRegistrar,
  };
}

describe("WololoPluginHooks", () => {
  it("registers wololo command", async () => {
    const deps = dependencies();
    const hooks = new WololoPluginHooks(deps).create();
    const input: Config = {};

    await hooks.config?.(input);

    expect(deps.wololoCommandRegistrar.register).toHaveBeenCalledWith(input);
  });

  it("ignores non-wololo commands", async () => {
    const deps = dependencies();
    const hooks = new WololoPluginHooks(deps).create();
    const output = { parts: [] };

    await hooks["command.execute.before"]?.({ command: "other", arguments: "on", sessionID: "session-1" }, output as never);

    expect(deps.wololoCommand.execute).not.toHaveBeenCalled();
    expect(output.parts).toEqual([]);
  });

  it("executes wololo command and writes synthetic response", async () => {
    const deps = dependencies();
    const hooks = new WololoPluginHooks(deps).create();
    const output = { parts: [] };

    await hooks["command.execute.before"]?.({ command: WOLOLO_COMMAND_NAME, arguments: "on", sessionID: "session-1" }, output as never);

    expect(deps.wololoCommand.execute).toHaveBeenCalledWith("on");
    expect(output.parts).toEqual([
      {
        id: WOLOLO_COMMAND_PART_ID,
        sessionID: "session-1",
        messageID: WOLOLO_COMMAND_PART_ID,
        type: "text",
        text: "Wololo notifications: enabled",
        synthetic: true,
      },
    ]);
  });

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

    expect(deps.soundResolver.resolve).toHaveBeenCalledWith("session.idle", { type: "session.idle" });
    expect(deps.audioPlayer.play).toHaveBeenCalledWith("/sounds/housed.wav");
  });

  it("handles tool.execute.after", async () => {
    const deps = dependencies({ sound: "/sounds/tool.wav" });
    const hooks = new WololoPluginHooks(deps).create();

    await hooks["tool.execute.after"]?.({ tool: "bash", sessionID: "session-1", callID: "call-1", args: {} }, { title: "done", output: "ok", metadata: {} });

    expect(deps.soundResolver.resolve).toHaveBeenCalledWith("tool.execute.after", {
      tool: "bash",
      sessionID: "session-1",
      callID: "call-1",
      args: {},
      output: { title: "done", output: "ok", metadata: {} },
    });
    expect(deps.audioPlayer.play).toHaveBeenCalledWith("/sounds/tool.wav");
  });
});
