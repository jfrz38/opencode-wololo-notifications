export class Enabled {
  private constructor(public readonly value: boolean) {}

  static fromUnknown(value: unknown, fallback: boolean): Enabled {
    return new Enabled(typeof value === "boolean" ? value : fallback);
  }

  isEnabled(): boolean {
    return this.value;
  }
}
