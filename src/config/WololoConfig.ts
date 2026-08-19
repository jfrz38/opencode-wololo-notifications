import type { SoundsDirectory } from "../sounds/SoundsDirectory.js";
import type { CooldownMs } from "./CooldownMs.js";
import type { DebugMode } from "./DebugMode.js";
import type { Enabled } from "./Enabled.js";
import type { EventPatternSet } from "./EventPatternSet.js";
import type { EventSoundMap } from "./EventSoundMap.js";
import type { ProfileName } from "./ProfileName.js";
import type { ProfileSoundMap } from "./ProfileSoundMap.js";

export class WololoConfig {
  constructor(
    public readonly enabled: Enabled,
    public readonly soundsDir: SoundsDirectory,
    public readonly debug: DebugMode,
    public readonly cooldownMs: CooldownMs,
    public readonly defaultProfile: ProfileName | undefined,
    public readonly events: EventSoundMap,
    public readonly profiles: ProfileSoundMap,
    public readonly enabledEvents: EventPatternSet,
    public readonly disabledEvents: EventPatternSet,
  ) {}

  isEnabled(): boolean {
    return this.enabled.isEnabled();
  }

  isDebugEnabled(): boolean {
    return this.debug.isEnabled();
  }
}
