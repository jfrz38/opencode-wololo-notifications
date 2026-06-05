import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import type { WololoConfig } from "../config/WololoConfig.js";
import type { Logger } from "../logger/ConsoleLogger.js";
import { Cooldown } from "./Cooldown.js";
import { PlayerCommandResolver } from "./PlayerCommandResolver.js";

export class AudioPlayer {
  constructor(
    private readonly config: WololoConfig,
    private readonly logger: Logger,
    private readonly cooldown = new Cooldown(config.cooldownMs),
    private readonly commandResolver = new PlayerCommandResolver(),
    private readonly fileExists = existsSync,
  ) {}

  async play(filePath: string): Promise<void> {
    try {
      const now = Date.now();
      if (!this.cooldown.canPlay(now)) {
        this.logger.debug("skipping sound due to cooldown");
        return;
      }

      if (!this.fileExists(filePath)) {
        this.logger.warn(`missing sound file: ${filePath}`);
        return;
      }

      const command = this.commandResolver.resolve(filePath);
      if (!command) {
        this.logger.warn(`no supported audio player found for platform=${process.platform}`);
        return;
      }

      this.cooldown.markPlayed(now);
      const child = spawn(command.bin, command.args, {
        detached: true,
        stdio: "ignore",
        shell: false,
      });

      child.on("error", (error) => this.logger.warn(`failed to play sound: ${error.message}`));
      child.unref();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`failed to play sound: ${message}`);
    }
  }
}
