export class DebugMode {
  private constructor(public readonly value: boolean) {}

  static fromUnknown(value: unknown, fallback: boolean): DebugMode {
    return new DebugMode(typeof value === "boolean" ? value : fallback);
  }

  isEnabled(): boolean {
    return this.value;
  }
}
