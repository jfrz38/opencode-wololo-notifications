import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import type { WololoConfig } from "../config/WololoConfig.js";
import type { Logger } from "../logger/ConsoleLogger.js";
import { Cooldown } from "./Cooldown.js";
import type { PlayerCommand } from "./PlayerCommand.js";
import { PlayerCommandResolver } from "./PlayerCommandResolver.js";

const DEFAULT_PLAYBACK_TIMEOUT_MS = 10_000;

export class AudioPlayer {
  private playing = false;

  constructor(
    private readonly config: WololoConfig,
    private readonly logger: Logger,
    private readonly cooldown = new Cooldown(config.cooldownMs),
    private readonly commandResolver = new PlayerCommandResolver(),
    private readonly fileExists = existsSync,
    private readonly playbackTimeoutMs = DEFAULT_PLAYBACK_TIMEOUT_MS,
  ) {}

  async play(filePath: string): Promise<void> {
    try {
      const now = Date.now();
      if (!this.cooldown.canPlay(now)) {
        this.logger.debug("skipping sound due to cooldown");
        return;
      }

      if (this.playing) {
        this.logger.debug("skipping sound because playback is already in progress");
        return;
      }

      if (!this.fileExists(filePath)) {
        this.logger.warn(`missing sound file: ${filePath}`);
        return;
      }

      const commands = this.commandResolver.resolveCandidates(filePath);
      if (commands.length === 0) {
        this.logger.warn(`no supported audio player found for platform=${process.platform}`);
        return;
      }

      this.playing = true;
      try {
        for (const command of commands) {
          if (await this.trySpawn(command)) {
            this.cooldown.markPlayed(Date.now());
            return;
          }
        }

        this.logger.warn(`no supported audio player worked for platform=${process.platform}`);
      } finally {
        this.playing = false;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`failed to play sound: ${message}`);
    }
  }

  private async trySpawn(command: PlayerCommand): Promise<boolean> {
    try {
      const child = spawn(command.bin, command.args, {
        detached: false,
        stdio: "ignore",
        shell: false,
        windowsHide: true,
      });

      return await new Promise((resolve) => {
        let settled = false;
        const settle = (result: boolean) => {
          if (settled) return;
          settled = true;
          clearTimeout(timeout);
          resolve(result);
        };

        const timeout = setTimeout(() => {
          this.logger.debug(`audio player ${command.bin} timed out after ${this.playbackTimeoutMs}ms`);
          settle(false);
          try {
            child.kill();
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.debug(`failed to stop audio player ${command.bin}: ${message}`);
          }
        }, this.playbackTimeoutMs);

        child.once("error", (error) => {
          this.logger.debug(`audio player ${command.bin} failed: ${error.message}`);
          settle(false);
        });
        child.once("close", (code) => {
          if (code === 0) {
            settle(true);
            return;
          }

          this.logger.debug(`audio player ${command.bin} exited with code ${code ?? "unknown"}`);
          settle(false);
        });
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.debug(`audio player ${command.bin} failed: ${message}`);
      return false;
    }
  }
}
