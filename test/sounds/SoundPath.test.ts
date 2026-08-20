import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SoundPath } from "../../src/sounds/SoundPath.js";
import { SoundsDirectory } from "../../src/sounds/SoundsDirectory.js";

describe("SoundPath", () => {
  it("expands home directory", () => {
    expect(SoundPath.expandHome("~/sounds/a.wav")).toBe(path.join(os.homedir(), "sounds/a.wav"));
  });

  it("keeps absolute unix paths", () => {
    expect(SoundsDirectory.fromUnknown("~/sounds", "~/sounds").resolve("/abs/x.wav")).toBe("/abs/x.wav");
  });

  it("keeps absolute windows paths", () => {
    expect(SoundsDirectory.fromUnknown("~/sounds", "~/sounds").resolve("C:\\x\\y.wav")).toBe("C:\\x\\y.wav");
  });

  it("resolves relative sound against soundsDir", () => {
    expect(SoundsDirectory.fromUnknown("~/sounds", "~/sounds").resolve("housed.wav")).toBe(path.resolve(os.homedir(), "sounds", "housed.wav"));
  });
});
