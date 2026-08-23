import type { Hooks, PluginInput } from "@opencode-ai/plugin";
import type { AudioPlayer } from "../audio/AudioPlayer.js";
import type { WololoConfig } from "../config/WololoConfig.js";
import type { SoundResolver } from "../events/SoundResolver.js";
import type { Logger } from "../logger/ConsoleLogger.js";
import type { NotificationState } from "../runtime/NotificationState.js";

const EVENT_NAMES = new Set(["session.error", "permission.asked", "question.asked"]);

export type WololoPluginHooksDependencies = {
  config: WololoConfig;
  logger: Logger;
  notificationState: NotificationState;
  soundResolver: SoundResolver;
  audioPlayer: AudioPlayer;
  client: PluginInput["client"];
};

export class WololoPluginHooks {
  constructor(private readonly dependencies: WololoPluginHooksDependencies) {}

  create(): Hooks {
    return {
      event: async ({ event }) => {
        if (event.type === "session.status") {
          if (event.properties.status.type === "idle") {
            await this.playSessionIdleSound(event.properties.sessionID);
          }
          return;
        }

        if (EVENT_NAMES.has(event.type)) this.playEventSound(event.type);
      },
    };
  }

  private async playSessionIdleSound(sessionID: string): Promise<void> {
    const { client, logger, notificationState } = this.dependencies;
    if (!notificationState.isEnabled()) return;

    try {
      const response = await client.session.get({ path: { id: sessionID } });
      if (!response.data) {
        logger.warn(`unable to determine parent for session=${sessionID}`);
        return;
      }

      if (response.data.parentID) {
        logger.debug(`ignoring idle child session=${sessionID} parent=${response.data.parentID}`);
        return;
      }

      this.playEventSound("session.idle");
    } catch {
      logger.warn(`unable to determine parent for session=${sessionID}`);
    }
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
