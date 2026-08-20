import os from "node:os";
import path from "node:path";

const WINDOWS_ABSOLUTE_PATH = /^[a-zA-Z]:[\\/]/;

export class SoundPath {
  private constructor(public readonly value: string) {}

  static fromString(value: string): SoundPath {
    return new SoundPath(SoundPath.expandHome(value));
  }

  static expandHome(value: string): string {
    if (value === "~") return os.homedir();
    if (value.startsWith("~/") || value.startsWith("~\\")) return path.join(os.homedir(), value.slice(2));
    return value;
  }

  get isAbsolute(): boolean {
    return path.isAbsolute(this.value) || WINDOWS_ABSOLUTE_PATH.test(this.value);
  }
}
