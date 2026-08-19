import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AudioPlayer } from "../../src/audio/AudioPlayer.js";
import { Cooldown } from "../../src/audio/Cooldown.js";
import { PlayerCommandResolver } from "../../src/audio/PlayerCommandResolver.js";
import { CooldownMs } from "../../src/config/CooldownMs.js";
import { DebugMode } from "../../src/config/DebugMode.js";
import { Enabled } from "../../src/config/Enabled.js";
import { EventPatternSet } from "../../src/config/EventPatternSet.js";
import { EventSoundMap } from "../../src/config/EventSoundMap.js";
import { ProfileSoundMap } from "../../src/config/ProfileSoundMap.js";
import { WololoConfig } from "../../src/config/WololoConfig.js";
import type { Logger } from "../../src/logger/ConsoleLogger.js";
import { SoundsDirectory } from "../../src/sounds/SoundsDirectory.js";

vi.mock("node:child_process", () => ({
  spawn: vi.fn(() => ({
    once: vi.fn((event, callback) => {
      if (event === "close") callback(0);
    }),
  })),
}));

vi.mock("node:fs", () => ({
  existsSync: vi.fn(),
}));

const mockedSpawn = vi.mocked(spawn);
const mockedExists = vi.mocked(existsSync);

const config = new WololoConfig(
  Enabled.fromUnknown(true, true),
  SoundsDirectory.fromUnknown("/sounds", "/sounds"),
  DebugMode.fromUnknown(true, false),
  CooldownMs.fromUnknown(1000, 1000),
  undefined,
  EventSoundMap.fromUnknown({}),
  ProfileSoundMap.fromUnknown({}),
  EventPatternSet.fromUnknown(["session.idle"]),
  EventPatternSet.fromUnknown([]),
);

const logger = {
  debug: vi.fn(),
  warn: vi.fn(),
} satisfies Logger;

describe("AudioPlayer", () => {
  beforeEach(() => {
    vi.setSystemTime(10_000);
    mockedExists.mockReset();
    mockedSpawn.mockClear();
    logger.debug.mockClear();
    logger.warn.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not spawn when file does not exist", async () => {
    mockedExists.mockReturnValue(false);

    await new AudioPlayer(config, logger).play("/sounds/missing.wav");

    expect(mockedSpawn).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith("missing sound file: /sounds/missing.wav");
  });

  it("does not spawn when cooldown is active", async () => {
    mockedExists.mockReturnValue(true);
    const cooldown = new Cooldown(config.cooldownMs);
    const player = new AudioPlayer(config, logger, cooldown);

    await player.play("/sounds/a.wav");
    vi.setSystemTime(10_100);
    await player.play("/sounds/a.wav");

    expect(mockedSpawn).toHaveBeenCalledTimes(1);
  });

  it("does not start concurrent playback", async () => {
    mockedExists.mockReturnValue(true);
    let close: ((code: number) => void) | undefined;
    mockedSpawn.mockImplementationOnce(
      () =>
        ({
          once: vi.fn((event, callback) => {
            if (event === "close") close = callback;
          }),
          kill: vi.fn(),
        }) as never,
    );
    const player = new AudioPlayer(config, logger, new Cooldown(config.cooldownMs), new PlayerCommandResolver("win32"));

    const firstPlayback = player.play("/sounds/a.wav");
    await player.play("/sounds/b.wav");

    expect(mockedSpawn).toHaveBeenCalledTimes(1);
    expect(logger.debug).toHaveBeenCalledWith("skipping sound because playback is already in progress");
    close?.(0);
    await firstPlayback;
  });

  it("stops a player that exceeds the playback timeout", async () => {
    vi.useFakeTimers();
    mockedExists.mockReturnValue(true);
    const kill = vi.fn();
    mockedSpawn.mockImplementationOnce(() => ({ once: vi.fn(), kill }) as never);
    const player = new AudioPlayer(config, logger, new Cooldown(config.cooldownMs), new PlayerCommandResolver("win32"), mockedExists, 100);

    const playback = player.play("/sounds/a.wav");
    await vi.advanceTimersByTimeAsync(100);
    await playback;

    expect(kill).toHaveBeenCalledOnce();
    expect(logger.debug).toHaveBeenCalledWith("audio player powershell.exe timed out after 100ms");
    expect(logger.warn).toHaveBeenCalledWith("no supported audio player worked for platform=win32");
  });

  it("does not throw when spawn fails", async () => {
    mockedExists.mockReturnValue(true);
    mockedSpawn.mockImplementationOnce(() => {
      throw new Error("boom");
    });

    await expect(new AudioPlayer(config, logger, new Cooldown(config.cooldownMs), new PlayerCommandResolver("win32")).play("/sounds/a.wav")).resolves.toBeUndefined();

    expect(logger.warn).toHaveBeenCalledWith("no supported audio player worked for platform=win32");
    expect(logger.debug).toHaveBeenCalledWith("audio player powershell.exe failed: boom");
  });

  it("tries the next command when a player fails to spawn", async () => {
    mockedExists.mockReturnValue(true);
    mockedSpawn
      .mockImplementationOnce(() => ({
        once: vi.fn((event, callback) => {
          if (event === "error") callback(new Error("missing"));
        }),
      }) as never)
      .mockImplementationOnce(() => ({
        once: vi.fn((event, callback) => {
          if (event === "close") callback(0);
        }),
      }) as never);

    await new AudioPlayer(config, logger, new Cooldown(config.cooldownMs), new PlayerCommandResolver("linux")).play("/sounds/a.mp3");

    expect(mockedSpawn).toHaveBeenCalledTimes(2);
    expect(logger.debug).toHaveBeenCalledWith("audio player paplay failed: missing");
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("tries the next command when a player exits with an error", async () => {
    mockedExists.mockReturnValue(true);
    mockedSpawn
      .mockImplementationOnce(() => ({
        once: vi.fn((event, callback) => {
          if (event === "close") callback(1);
        }),
      }) as never)
      .mockImplementationOnce(() => ({
        once: vi.fn((event, callback) => {
          if (event === "close") callback(0);
        }),
      }) as never);

    await new AudioPlayer(config, logger, new Cooldown(config.cooldownMs), new PlayerCommandResolver("linux")).play("/sounds/a.mp3");

    expect(mockedSpawn).toHaveBeenCalledTimes(2);
    expect(logger.debug).toHaveBeenCalledWith("audio player paplay exited with code 1");
    expect(logger.warn).not.toHaveBeenCalled();
  });
});
