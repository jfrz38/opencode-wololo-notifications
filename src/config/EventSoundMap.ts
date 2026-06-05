export class EventSoundMap {
  private constructor(private readonly entries: Record<string, string>) {}

  static fromUnknown(value: unknown): EventSoundMap {
    if (!value || typeof value !== "object" || Array.isArray(value)) return new EventSoundMap({});

    const entries: Record<string, string> = {};
    for (const [key, item] of Object.entries(value)) {
      if (typeof item === "string" && item.length > 0) entries[key] = item;
    }

    return new EventSoundMap(entries);
  }

  get(eventKey: string): string | undefined {
    return this.entries[eventKey];
  }

  isEmpty(): boolean {
    return Object.keys(this.entries).length === 0;
  }

  toRecord(): Record<string, string> {
    return { ...this.entries };
  }
}
