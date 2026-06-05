export class EnvConfig {
  constructor(private readonly env: NodeJS.ProcessEnv = process.env) {}

  get soundsDir(): string | undefined {
    return this.env.OPENCODE_WOLOLO_SOUNDS_DIR;
  }

  get profile(): string | undefined {
    return this.env.OPENCODE_WOLOLO_PROFILE;
  }

  get debug(): boolean | undefined {
    const value = this.env.OPENCODE_WOLOLO_DEBUG;
    if (!value) return undefined;
    if (["1", "true", "yes", "on"].includes(value.toLowerCase())) return true;
    if (["0", "false", "no", "off"].includes(value.toLowerCase())) return false;
    return undefined;
  }
}
