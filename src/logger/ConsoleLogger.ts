export interface Logger {
  debug(message: string): void;
  warn(message: string): void;
}

export class ConsoleLogger implements Logger {
  constructor(private readonly debugEnabled: boolean) {}

  debug(message: string): void {
    if (this.debugEnabled) console.warn(`[wololo] ${message}`);
  }

  warn(message: string): void {
    if (this.debugEnabled) console.warn(`[wololo] ${message}`);
  }
}
