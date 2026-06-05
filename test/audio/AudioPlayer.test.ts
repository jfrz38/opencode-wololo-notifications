import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AudioPlayer } from "../../src/audio/AudioPlayer.js";
import { Cooldown } from "../../src/audio/Cooldown.js";
import { CooldownMs } from "../../src/config/CooldownMs.js";
import { DebugMode } from "../../src/config/DebugMode.js";
import { Enabled } from "../../src/config/Enabled.js";
import { EventSoundMap } from "../../src/config/EventSoundMap.js";
import { ProfileSoundMap } from "../../src/config/ProfileSoundMap.js";
import { WololoConfig } from "../../src/config/WololoConfig.js";
import type { Logger } from "../../src/logger/ConsoleLogger.js";
import { SoundsDirectory } from "../../src/sounds/SoundsDirectory.js";

vi.mock("node:child_process", () => ({
  spawn: vi.fn(() => ({ on: vi.fn(), unref: vi.fn() })),
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

  it("does not throw when spawn fails", async () => {
    mockedExists.mockReturnValue(true);
    mockedSpawn.mockImplementationOnce(() => {
      throw new Error("boom");
    });

    await expect(new AudioPlayer(config, logger).play("/sounds/a.wav")).resolves.toBeUndefined();

    expect(logger.warn).toHaveBeenCalledWith("failed to play sound: boom");
  });
});
