import type { Plugin } from "@opencode-ai/plugin";
import { AudioPlayer } from "./audio/AudioPlayer.js";
import { WololoCommand } from "./commands/WololoCommand.js";
import { WololoCommandRegistrar } from "./commands/WololoCommandRegistrar.js";
import { ConfigLoader, type WololoUserConfig } from "./config/ConfigLoader.js";
import { SoundResolver } from "./events/SoundResolver.js";
import { ConsoleLogger } from "./logger/ConsoleLogger.js";
import { WololoPluginHooks } from "./plugin/WololoPluginHooks.js";
import { NotificationState } from "./runtime/NotificationState.js";

export const WololoNotificationsPlugin = (async (_context, options) => {
  const config = new ConfigLoader().load(options as WololoUserConfig | undefined);
  const logger = new ConsoleLogger(config.debug.value);
  const notificationState = new NotificationState(config.isEnabled());

  return new WololoPluginHooks({
    config,
    logger,
    notificationState,
    soundResolver: new SoundResolver(config),
    audioPlayer: new AudioPlayer(config, logger),
    wololoCommand: new WololoCommand(notificationState),
    wololoCommandRegistrar: new WololoCommandRegistrar(),
  }).create();
}) satisfies Plugin;

export default WololoNotificationsPlugin;
export { AudioPlayer } from "./audio/AudioPlayer.js";
export { Cooldown } from "./audio/Cooldown.js";
export type { PlayerCommand } from "./audio/PlayerCommand.js";
export { PlayerCommandResolver } from "./audio/PlayerCommandResolver.js";
export type { FileExists } from "./audio/PlayerCommandResolver.js";
export { WololoCommand } from "./commands/WololoCommand.js";
export { WololoCommandAction } from "./commands/WololoCommandAction.js";
export { WOLOLO_COMMAND_DESCRIPTION, WOLOLO_COMMAND_NAME, WOLOLO_COMMAND_PART_ID, WOLOLO_COMMAND_STATUS_PREFIX, WOLOLO_COMMAND_TEMPLATE, WOLOLO_COMMAND_USAGE } from "./commands/WololoCommandConstants.js";
export { WololoCommandParser } from "./commands/WololoCommandParser.js";
export { WololoCommandRegistrar } from "./commands/WololoCommandRegistrar.js";
export { WololoCommandResult } from "./commands/WololoCommandResult.js";
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
export { WololoPluginHooks } from "./plugin/WololoPluginHooks.js";
export type { WololoPluginHooksDependencies } from "./plugin/WololoPluginHooks.js";
export { NotificationState } from "./runtime/NotificationState.js";
export { SoundPath } from "./sounds/SoundPath.js";
export { SoundsDirectory } from "./sounds/SoundsDirectory.js";
