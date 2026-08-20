import type { Hooks } from "@opencode-ai/plugin";
import type { AudioPlayer } from "../audio/AudioPlayer.js";
import type { WololoConfig } from "../config/WololoConfig.js";
import type { SoundResolver } from "../events/SoundResolver.js";
import type { Logger } from "../logger/ConsoleLogger.js";
import type { NotificationState } from "../runtime/NotificationState.js";

const EVENT_NAMES = new Set(["session.idle", "session.error", "permission.asked", "question.asked"]);

export type WololoPluginHooksDependencies = {
  config: WololoConfig;
  logger: Logger;
  notificationState: NotificationState;
  soundResolver: SoundResolver;
  audioPlayer: AudioPlayer;
};

export class WololoPluginHooks {
  constructor(private readonly dependencies: WololoPluginHooksDependencies) {}

  create(): Hooks {
    return {
      event: async ({ event }) => {
        if (EVENT_NAMES.has(event.type)) this.playEventSound(event.type);
      },
    };
  }

  private playEventSound(eventName: string): void {
    const { audioPlayer, config, logger, notificationState, soundResolver } = this.dependencies;
    if (!notificationState.isEnabled()) return;

    const sound = soundResolver.resolve(eventName);
    if (!sound) {
      logger.debug(`no configured sound for event=${eventName}`);
      return;
    }

    logger.debug(`event=${eventName} profile=${config.defaultProfile?.value ?? "none"} sound=${sound}`);
    void audioPlayer.play(sound);
  }
}
