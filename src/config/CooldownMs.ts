export class CooldownMs {
  private constructor(public readonly value: number) {}

  static fromUnknown(value: unknown, fallback: number): CooldownMs {
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) return new CooldownMs(value);
    return new CooldownMs(fallback);
  }
}
