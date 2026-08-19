import { describe, expect, it } from "vitest";
import { PlayerCommandResolver } from "../../src/audio/PlayerCommandResolver.js";

describe("PlayerCommandResolver", () => {
  it("resolves afplay on darwin", () => {
    expect(new PlayerCommandResolver("darwin").resolve("/sounds/a.wav")).toEqual({ bin: "afplay", args: ["/sounds/a.wav"] });
  });

  it("passes win32 wav paths as powershell arguments", () => {
    const command = new PlayerCommandResolver("win32").resolve("C:\\sounds with spaces\\a 'quote'.wav");

    expect(command?.bin).toBe("powershell.exe");
    expect(command?.args).toEqual([
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      "& { (New-Object Media.SoundPlayer $args[0]).PlaySync() }",
      "C:\\sounds with spaces\\a 'quote'.wav",
    ]);
  });

  it("returns ordered linux fallback candidates", () => {
    const commands = new PlayerCommandResolver("linux").resolveCandidates("/sounds/a.wav");

    expect(commands.map((command) => command.bin)).toEqual(["paplay", "aplay", "mpv", "ffplay"]);
    expect(commands[2]).toEqual({ bin: "mpv", args: ["--no-video", "--no-terminal", "--script-opts=autoload-disabled=yes", "/sounds/a.wav"] });
  });

  it("uses ffplay for win32 non-wav files", () => {
    expect(new PlayerCommandResolver("win32").resolve("C:\\sounds\\a.mp3")).toEqual({
      bin: "ffplay",
      args: ["-nodisp", "-autoexit", "-loglevel", "quiet", "C:\\sounds\\a.mp3"],
    });
  });
});
