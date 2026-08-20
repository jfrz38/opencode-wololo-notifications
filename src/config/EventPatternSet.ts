export class EventPatternSet {
  private constructor(
    private readonly patterns: string[],
    private readonly matchers: RegExp[],
  ) {}

  static fromUnknown(value: unknown, fallback: string[] = []): EventPatternSet {
    const input = Array.isArray(value) ? value : fallback;
    const patterns = input.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter((item) => item.length > 0);
    return new EventPatternSet(
      patterns,
      patterns.map((pattern) => EventPatternSet.matcherFor(pattern)),
    );
  }

  matches(eventKey: string): boolean {
    return this.matchers.some((matcher) => matcher.test(eventKey));
  }

  toArray(): string[] {
    return [...this.patterns];
  }

  private static matcherFor(pattern: string): RegExp {
    const escaped = pattern.replace(/[|\\{}()[\]^$+?.]/g, "\\$&").replace(/\*/g, ".*");
    return new RegExp(`^${escaped}$`);
  }
}
