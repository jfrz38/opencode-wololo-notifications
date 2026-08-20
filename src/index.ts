import type { Plugin } from "@opencode-ai/plugin";
import { AudioPlayer } from "./audio/AudioPlayer.js";
import { ConfigLoader } from "./config/ConfigLoader.js";
import { SoundResolver } from "./events/SoundResolver.js";
import { ConsoleLogger } from "./logger/ConsoleLogger.js";
import { WololoPluginHooks } from "./plugin/WololoPluginHooks.js";
import { NotificationState } from "./runtime/NotificationState.js";

export default (async (_input, options) => {
  const config = new ConfigLoader().load(options);
  const logger = new ConsoleLogger(config.debug.value);
  const notificationState = new NotificationState(config.isEnabled());

  return new WololoPluginHooks({
    config,
    logger,
    notificationState,
    soundResolver: new SoundResolver(config),
    audioPlayer: new AudioPlayer(config, logger),
  }).create();
}) satisfies Plugin;
