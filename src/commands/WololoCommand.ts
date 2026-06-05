import { NotificationState } from "../runtime/NotificationState.js";
import { WololoCommandAction } from "./WololoCommandAction.js";
import { WOLOLO_COMMAND_STATUS_PREFIX, WOLOLO_COMMAND_USAGE } from "./WololoCommandConstants.js";
import { WololoCommandParser } from "./WololoCommandParser.js";
import { WololoCommandResult } from "./WololoCommandResult.js";

export class WololoCommand {
  constructor(
    private readonly state: NotificationState,
    private readonly parser = new WololoCommandParser(),
  ) {}

  execute(args: string): WololoCommandResult {
    return this.executeAction(this.parser.parse(args));
  }

  private executeAction(action: WololoCommandAction): WololoCommandResult {
    switch (action) {
      case WololoCommandAction.Toggle:
        this.state.toggle();
        return this.status();
      case WololoCommandAction.Enable:
        this.state.enable();
        return this.status();
      case WololoCommandAction.Disable:
        this.state.disable();
        return this.status();
      case WololoCommandAction.Status:
        return this.status();
      case WololoCommandAction.Help:
        return new WololoCommandResult(WOLOLO_COMMAND_USAGE);
    }
  }

  private status(): WololoCommandResult {
    return new WololoCommandResult(`${WOLOLO_COMMAND_STATUS_PREFIX}: ${this.state.statusText()}`);
  }
}
