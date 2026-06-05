import { existsSync } from "node:fs";
import path from "node:path";
import type { PlayerCommand } from "./PlayerCommand.js";

export type FileExists = (filePath: string) => boolean;

export class PlayerCommandResolver {
  constructor(
    private readonly platform: NodeJS.Platform = process.platform,
    private readonly exists: FileExists = existsSync,
  ) {}

  resolve(filePath: string): PlayerCommand | undefined {
    const ext = path.extname(filePath).toLowerCase();

    if (this.platform === "darwin") return { bin: "afplay", args: [filePath] };
    if (this.platform === "win32") return this.resolveWindows(filePath, ext);
    if (this.platform === "linux") return this.resolveLinux(filePath);

    return undefined;
  }

  private resolveWindows(filePath: string, ext: string): PlayerCommand | undefined {
    if (ext === ".wav") {
      return {
        bin: "powershell.exe",
        args: ["-NoProfile", "-NonInteractive", "-Command", `(New-Object Media.SoundPlayer ${JSON.stringify(filePath)}).PlaySync()`],
      };
    }

    if (this.exists("ffplay")) return this.ffplay(filePath);
    return undefined;
  }

  private resolveLinux(filePath: string): PlayerCommand | undefined {
    for (const bin of ["paplay", "aplay"]) {
      if (this.exists(`/usr/bin/${bin}`) || this.exists(`/bin/${bin}`)) return { bin, args: [filePath] };
    }

    if (this.exists("/usr/bin/ffplay") || this.exists("/bin/ffplay")) return this.ffplay(filePath);
    return undefined;
  }

  private ffplay(filePath: string): PlayerCommand {
    return { bin: "ffplay", args: ["-nodisp", "-autoexit", "-loglevel", "quiet", filePath] };
  }
}
