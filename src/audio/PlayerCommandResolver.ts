import path from "node:path";
import type { PlayerCommand } from "./PlayerCommand.js";

export class PlayerCommandResolver {
  constructor(private readonly platform: NodeJS.Platform = process.platform) {}

  resolve(filePath: string): PlayerCommand | undefined {
    return this.resolveCandidates(filePath)[0];
  }

  resolveCandidates(filePath: string): PlayerCommand[] {
    const ext = path.extname(filePath).toLowerCase();

    if (this.platform === "darwin") return [{ bin: "afplay", args: [filePath] }];
    if (this.platform === "win32") return this.resolveWindows(filePath, ext);
    if (this.platform === "linux") return this.resolveLinux(filePath);

    return [];
  }

  private resolveWindows(filePath: string, ext: string): PlayerCommand[] {
    if (ext === ".wav") {
      const script = "& { (New-Object Media.SoundPlayer $args[0]).PlaySync() }";
      return [{
        bin: "powershell.exe",
        args: ["-NoProfile", "-NonInteractive", "-Command", script, filePath],
      }];
    }

    return [this.ffplay(filePath)];
  }

  private resolveLinux(filePath: string): PlayerCommand[] {
    return [
      { bin: "paplay", args: [filePath] },
      { bin: "aplay", args: [filePath] },
      { bin: "mpv", args: ["--no-video", "--no-terminal", "--script-opts=autoload-disabled=yes", filePath] },
      this.ffplay(filePath),
    ];
  }

  private ffplay(filePath: string): PlayerCommand {
    return { bin: "ffplay", args: ["-nodisp", "-autoexit", "-loglevel", "quiet", filePath] };
  }
}
