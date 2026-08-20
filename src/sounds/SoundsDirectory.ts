import path from "node:path";
import { SoundPath } from "./SoundPath.js";

export class SoundsDirectory {
  private constructor(public readonly value: string) {}

  static fromUnknown(value: unknown, fallback: string): SoundsDirectory {
    const raw = typeof value === "string" && value.length > 0 ? value : fallback;
    return new SoundsDirectory(SoundPath.expandHome(raw));
  }

  resolve(sound: string): string {
    const soundPath = SoundPath.fromString(sound);
    if (soundPath.isAbsolute) return soundPath.value;
    return path.resolve(this.value, soundPath.value);
  }
}
