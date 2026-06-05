import type { Config } from "@opencode-ai/plugin";
import { WOLOLO_COMMAND_DESCRIPTION, WOLOLO_COMMAND_NAME, WOLOLO_COMMAND_TEMPLATE } from "./WololoCommandConstants.js";

export class WololoCommandRegistrar {
  register(config: Config): void {
    config.command ??= {};
    config.command[WOLOLO_COMMAND_NAME] ??= {
      description: WOLOLO_COMMAND_DESCRIPTION,
      template: WOLOLO_COMMAND_TEMPLATE,
    };
  }
}
