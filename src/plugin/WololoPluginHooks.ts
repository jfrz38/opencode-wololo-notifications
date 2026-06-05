import type { Config, Hooks } from "@opencode-ai/plugin";
import type { Part } from "@opencode-ai/sdk";
import type { AudioPlayer } from "../audio/AudioPlayer.js";
import { WOLOLO_COMMAND_NAME, WOLOLO_COMMAND_PART_ID } from "../commands/WololoCommandConstants.js";
import type { WololoCommand } from "../commands/WololoCommand.js";
import type { WololoCommandRegistrar } from "../commands/WololoCommandRegistrar.js";
import type { WololoConfig } from "../config/WololoConfig.js";
import type { SoundResolver } from "../events/SoundResolver.js";
import type { Logger } from "../logger/ConsoleLogger.js";
import type { NotificationState } from "../runtime/NotificationState.js";

const EVENT_NAMES = new Set(["session.idle", "session.error", "permission.asked", "permission.replied"]);

export type WololoPluginHooksDependencies = {
  config: WololoConfig;
  logger: Logger;
  notificationState: NotificationState;
  soundResolver: SoundResolver;
  audioPlayer: AudioPlayer;
  wololoCommand: WololoCommand;
  wololoCommandRegistrar: WololoCommandRegistrar;
};

export class WololoPluginHooks {
  constructor(private readonly dependencies: WololoPluginHooksDependencies) {}

  create(): Hooks {
    return {
      config: async (input) => {
        this.registerCommand(input);
      },
      event: async ({ event }) => {
        if (EVENT_NAMES.has(event.type)) await this.playEventSound(event.type, event);
      },
      "command.execute.before": async (input, output) => {
        this.executeCommand(input, output);
      },
      "tool.execute.after": async (input, output) => {
        await this.playEventSound("tool.execute.after", { ...input, output });
      },
    };
  }

  private registerCommand(config: Config): void {
    this.dependencies.wololoCommandRegistrar.register(config);
  }

  private executeCommand(input: { command: string; sessionID: string; arguments: string }, output: { parts: Part[] }): void {
    if (input.command !== WOLOLO_COMMAND_NAME) return;

    const result = this.dependencies.wololoCommand.execute(input.arguments);
    output.parts = [this.createCommandResponsePart(input.sessionID, result.message)];
  }

  private createCommandResponsePart(sessionID: string, message: string): Part {
    return {
      id: WOLOLO_COMMAND_PART_ID,
      sessionID,
      messageID: WOLOLO_COMMAND_PART_ID,
      type: "text",
      text: message,
      synthetic: true,
    };
  }

  private async playEventSound(eventName: string, payload?: unknown): Promise<void> {
    const { audioPlayer, config, logger, notificationState, soundResolver } = this.dependencies;
    if (!notificationState.isEnabled()) return;

    const sound = soundResolver.resolve(eventName, payload);
    if (!sound) {
      logger.debug(`no configured sound for event=${eventName}`);
      return;
    }

    logger.debug(`event=${eventName} profile=${config.defaultProfile?.value ?? "none"} sound=${sound}`);
    await audioPlayer.play(sound);
  }
}
