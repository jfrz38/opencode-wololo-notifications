import type { CooldownMs } from "../config/CooldownMs.js";

export class Cooldown {
  private lastPlayedAt = 0;

  constructor(private readonly duration: CooldownMs) {}

  canPlay(now = Date.now()): boolean {
    return now - this.lastPlayedAt >= this.duration.value;
  }

  markPlayed(now = Date.now()): void {
    this.lastPlayedAt = now;
  }

  reset(): void {
    this.lastPlayedAt = 0;
  }
}
