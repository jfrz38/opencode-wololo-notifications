import type { SoundsDirectory } from "../sounds/SoundsDirectory.js";
import type { CooldownMs } from "./CooldownMs.js";
import type { DebugMode } from "./DebugMode.js";
import type { Enabled } from "./Enabled.js";
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
  ) {}

  isEnabled(): boolean {
    return this.enabled.isEnabled();
  }

  isDebugEnabled(): boolean {
    return this.debug.isEnabled();
  }
}
