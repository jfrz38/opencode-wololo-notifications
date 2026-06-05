import type { Config } from "@opencode-ai/plugin";
import { describe, expect, it } from "vitest";
import { WOLOLO_COMMAND_DESCRIPTION, WOLOLO_COMMAND_NAME, WOLOLO_COMMAND_TEMPLATE } from "../../src/commands/WololoCommandConstants.js";
import { WololoCommandRegistrar } from "../../src/commands/WololoCommandRegistrar.js";

describe("WololoCommandRegistrar", () => {
  it("registers wololo command", () => {
    const config: Config = {};

    new WololoCommandRegistrar().register(config);

    expect(config.command?.[WOLOLO_COMMAND_NAME]).toEqual({
      description: WOLOLO_COMMAND_DESCRIPTION,
      template: WOLOLO_COMMAND_TEMPLATE,
    });
  });

  it("does not overwrite user command", () => {
    const config: Config = {
      command: {
        wololo: {
          description: "custom",
          template: "custom template",
        },
      },
    };

    new WololoCommandRegistrar().register(config);

    expect(config.command?.[WOLOLO_COMMAND_NAME]).toEqual({
      description: "custom",
      template: "custom template",
    });
  });
});
