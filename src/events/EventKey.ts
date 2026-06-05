export class EventKey {
  private constructor(public readonly value: string) {}

  static fromString(value: string): EventKey {
    return new EventKey(value);
  }
}
