import { WololoCommandAction } from "./WololoCommandAction.js";

const ACTION_ALIASES = new Map<string, WololoCommandAction>([
  ["", WololoCommandAction.Toggle],
  ["toggle", WololoCommandAction.Toggle],
  ["on", WololoCommandAction.Enable],
  ["enable", WololoCommandAction.Enable],
  ["enabled", WololoCommandAction.Enable],
  ["off", WololoCommandAction.Disable],
  ["disable", WololoCommandAction.Disable],
  ["disabled", WololoCommandAction.Disable],
  ["status", WololoCommandAction.Status],
  ["help", WololoCommandAction.Help],
  ["--help", WololoCommandAction.Help],
  ["-h", WololoCommandAction.Help],
]);

export class WololoCommandParser {
  parse(args: string): WololoCommandAction {
    return ACTION_ALIASES.get(args.trim().toLowerCase()) ?? WololoCommandAction.Help;
  }
}
