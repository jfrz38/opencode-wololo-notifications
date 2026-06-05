import type { Plugin } from "@opencode-ai/plugin";
import { AudioPlayer } from "./audio/AudioPlayer.js";
import { ConfigLoader, type WololoUserConfig } from "./config/ConfigLoader.js";
import { SoundResolver } from "./events/SoundResolver.js";
import { ConsoleLogger } from "./logger/ConsoleLogger.js";

const EVENT_NAMES = new Set(["session.idle", "session.error", "permission.asked", "permission.replied"]);

export const WololoNotificationsPlugin = (async (_context, options) => {
  const config = new ConfigLoader().load(options as WololoUserConfig | undefined);
  const logger = new ConsoleLogger(config.debug.value);
  const soundResolver = new SoundResolver(config);
  const audioPlayer = new AudioPlayer(config, logger);

  async function handle(eventName: string, payload?: unknown): Promise<void> {
    if (!config.isEnabled()) return;

    const sound = soundResolver.resolve(eventName, payload);
    if (!sound) {
      logger.debug(`no configured sound for event=${eventName}`);
      return;
    }

    logger.debug(`event=${eventName} profile=${config.defaultProfile?.value ?? "none"} sound=${sound}`);
    await audioPlayer.play(sound);
  }

  return {
    event: async ({ event }) => {
      if (EVENT_NAMES.has(event.type)) await handle(event.type, event);
    },
    "tool.execute.after": async (input, output) => {
      await handle("tool.execute.after", { ...input, output });
    },
  };
}) satisfies Plugin;

export default WololoNotificationsPlugin;
export { AudioPlayer } from "./audio/AudioPlayer.js";
export { Cooldown } from "./audio/Cooldown.js";
export type { PlayerCommand } from "./audio/PlayerCommand.js";
export { PlayerCommandResolver } from "./audio/PlayerCommandResolver.js";
export type { FileExists } from "./audio/PlayerCommandResolver.js";
export { ConfigLoader, DEFAULT_CONFIG } from "./config/ConfigLoader.js";
export type { WololoUserConfig } from "./config/ConfigLoader.js";
export { CooldownMs } from "./config/CooldownMs.js";
export { DebugMode } from "./config/DebugMode.js";
export { Enabled } from "./config/Enabled.js";
export { EventSoundMap } from "./config/EventSoundMap.js";
export { ProfileName } from "./config/ProfileName.js";
export { ProfileSoundMap } from "./config/ProfileSoundMap.js";
export { WololoConfig } from "./config/WololoConfig.js";
export { EventClassifier } from "./events/EventClassifier.js";
export { EventKey } from "./events/EventKey.js";
export { PermissionDecision } from "./events/PermissionDecision.js";
export { SoundResolver } from "./events/SoundResolver.js";
export type { ResolveSoundInput } from "./events/SoundResolver.js";
export { ToolExecutionResult } from "./events/ToolExecutionResult.js";
export { ConsoleLogger } from "./logger/ConsoleLogger.js";
export type { Logger } from "./logger/ConsoleLogger.js";
export { SoundPath } from "./sounds/SoundPath.js";
export { SoundsDirectory } from "./sounds/SoundsDirectory.js";
