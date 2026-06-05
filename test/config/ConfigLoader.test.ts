import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfigLoader } from "../../src/config/ConfigLoader.js";

describe("ConfigLoader", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("loads default config", () => {
    const config = new ConfigLoader().load();

    expect(config.enabled.value).toBe(true);
    expect(config.debug.value).toBe(false);
    expect(config.cooldownMs.value).toBe(1000);
    expect(config.soundsDir.value).toBe(path.join(os.homedir(), ".config/opencode/wololo/sounds"));
  });

  it("merges user config over defaults", () => {
    const config = new ConfigLoader().load({ enabled: false, soundsDir: "~/custom", debug: true, cooldownMs: 50 });

    expect(config.enabled.value).toBe(false);
    expect(config.debug.value).toBe(true);
    expect(config.cooldownMs.value).toBe(50);
    expect(config.soundsDir.value).toBe(path.join(os.homedir(), "custom"));
  });

  it("normalizes flat events", () => {
    const config = new ConfigLoader().load({ events: { "session.idle": "housed.wav", invalid: 1 } });

    expect(config.events.toRecord()).toEqual({ "session.idle": "housed.wav" });
  });

  it("normalizes profiles", () => {
    const config = new ConfigLoader().load({ defaultProfile: "spanish", profiles: { spanish: { "session.idle": "housed.wav" } } });

    expect(config.defaultProfile?.value).toBe("spanish");
    expect(config.profiles.toRecord().spanish).toEqual({ "session.idle": "housed.wav" });
  });

  it("supports environment fallbacks", () => {
    vi.stubEnv("OPENCODE_WOLOLO_SOUNDS_DIR", "~/env-sounds");
    vi.stubEnv("OPENCODE_WOLOLO_PROFILE", "portuguese");
    vi.stubEnv("OPENCODE_WOLOLO_DEBUG", "true");

    const config = new ConfigLoader().load();

    expect(config.soundsDir.value).toBe(path.join(os.homedir(), "env-sounds"));
    expect(config.defaultProfile?.value).toBe("portuguese");
    expect(config.debug.value).toBe(true);
  });
});
