import { SoundsDirectory } from "../sounds/SoundsDirectory.js";
import { CooldownMs } from "./CooldownMs.js";
import { DebugMode } from "./DebugMode.js";
import { Enabled } from "./Enabled.js";
import { EnvConfig } from "./EnvConfig.js";
import { EventPatternSet } from "./EventPatternSet.js";
import { EventSoundMap } from "./EventSoundMap.js";
import { ProfileName } from "./ProfileName.js";
import { ProfileSoundMap } from "./ProfileSoundMap.js";
import { WololoConfig } from "./WololoConfig.js";

export type WololoUserConfig = Partial<{
  enabled: unknown;
  soundsDir: unknown;
  debug: unknown;
  cooldownMs: unknown;
  defaultProfile: unknown;
  events: unknown;
  profiles: unknown;
  enabledEvents: unknown;
  disabledEvents: unknown;
}>;

export const DEFAULT_CONFIG = {
  enabled: true,
  soundsDir: "~/.config/opencode/wololo/sounds",
  debug: false,
  cooldownMs: 1000,
  enabledEvents: ["session.idle"],
} as const;

export class ConfigLoader {
  constructor(private readonly env = new EnvConfig()) {}

  load(options: WololoUserConfig = {}): WololoConfig {
    const soundsDir = typeof options.soundsDir === "string" && options.soundsDir.length > 0 ? options.soundsDir : this.env.soundsDir ?? DEFAULT_CONFIG.soundsDir;
    const defaultProfile = ProfileName.optional(options.defaultProfile) ?? ProfileName.optional(this.env.profile);
    const debugFallback = this.env.debug ?? DEFAULT_CONFIG.debug;

    return new WololoConfig(
      Enabled.fromUnknown(options.enabled, DEFAULT_CONFIG.enabled),
      SoundsDirectory.fromUnknown(soundsDir, DEFAULT_CONFIG.soundsDir),
      DebugMode.fromUnknown(options.debug, debugFallback),
      CooldownMs.fromUnknown(options.cooldownMs, DEFAULT_CONFIG.cooldownMs),
      defaultProfile,
      EventSoundMap.fromUnknown(options.events),
      ProfileSoundMap.fromUnknown(options.profiles),
      EventPatternSet.fromUnknown(options.enabledEvents, [...DEFAULT_CONFIG.enabledEvents]),
      EventPatternSet.fromUnknown(options.disabledEvents),
    );
  }
}
