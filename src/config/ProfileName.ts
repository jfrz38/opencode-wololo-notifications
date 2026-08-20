export class ProfileName {
  private constructor(public readonly value: string) {}

  static optional(value: unknown): ProfileName | undefined {
    if (typeof value === "string" && value.length > 0) return new ProfileName(value);
    return undefined;
  }
}
