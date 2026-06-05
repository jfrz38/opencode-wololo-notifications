import { describe, expect, it } from "vitest";
import { WololoCommand } from "../../src/commands/WololoCommand.js";
import { WOLOLO_COMMAND_USAGE } from "../../src/commands/WololoCommandConstants.js";
import { NotificationState } from "../../src/runtime/NotificationState.js";

describe("WololoCommand", () => {
  it("toggles notifications without arguments", () => {
    const state = new NotificationState(false);
    const command = new WololoCommand(state);

    expect(command.execute("").message).toBe("Wololo notifications: enabled");
    expect(state.isEnabled()).toBe(true);
  });

  it("supports on, off and status", () => {
    const state = new NotificationState(false);
    const command = new WololoCommand(state);

    expect(command.execute("on").message).toBe("Wololo notifications: enabled");
    expect(command.execute("status").message).toBe("Wololo notifications: enabled");
    expect(command.execute("off").message).toBe("Wololo notifications: disabled");
  });

  it("returns usage for unknown arguments", () => {
    const command = new WololoCommand(new NotificationState(true));

    expect(command.execute("wat").message).toBe(WOLOLO_COMMAND_USAGE);
  });
});
