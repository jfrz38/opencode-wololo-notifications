import { describe, expect, it } from "vitest";
import { PlayerCommandResolver } from "../../src/audio/PlayerCommandResolver.js";

describe("PlayerCommandResolver", () => {
  it("resolves afplay on darwin", () => {
    expect(new PlayerCommandResolver("darwin").resolve("/sounds/a.wav")).toEqual({ bin: "afplay", args: ["/sounds/a.wav"] });
  });

  it("resolves powershell on win32 wav files", () => {
    const command = new PlayerCommandResolver("win32").resolve("C:\\sounds\\a.wav");

    expect(command?.bin).toBe("powershell.exe");
    expect(command?.args.join(" ")).toContain("Media.SoundPlayer");
  });

  it("uses available linux player", () => {
    const command = new PlayerCommandResolver("linux", (file) => file === "/usr/bin/paplay").resolve("/sounds/a.wav");

    expect(command).toEqual({ bin: "paplay", args: ["/sounds/a.wav"] });
  });
});
