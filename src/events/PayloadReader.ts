export class PayloadReader {
  constructor(private readonly payload: unknown) {}

  stringProperty(keys: string[]): string | undefined {
    return PayloadReader.stringProperty(this.payload, keys);
  }

  nestedStringProperty(parentKey: string, keys: string[]): string | undefined {
    if (!this.payload || typeof this.payload !== "object") return undefined;
    return PayloadReader.stringProperty((this.payload as Record<string, unknown>)[parentKey], keys);
  }

  record(): Record<string, unknown> | undefined {
    if (!this.payload || typeof this.payload !== "object") return undefined;
    return this.payload as Record<string, unknown>;
  }

  static stringProperty(value: unknown, keys: string[]): string | undefined {
    if (!value || typeof value !== "object") return undefined;

    for (const key of keys) {
      const item = (value as Record<string, unknown>)[key];
      if (typeof item === "string") return item.toLowerCase();
    }

    return undefined;
  }
}
