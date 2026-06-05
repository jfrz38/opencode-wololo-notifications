import { describe, expect, it } from "vitest";
import { WololoCommandAction } from "../../src/commands/WololoCommandAction.js";
import { WololoCommandParser } from "../../src/commands/WololoCommandParser.js";

describe("WololoCommandParser", () => {
  it.each([
    ["", WololoCommandAction.Toggle],
    ["toggle", WololoCommandAction.Toggle],
    ["ON", WololoCommandAction.Enable],
    ["enable", WololoCommandAction.Enable],
    ["enabled", WololoCommandAction.Enable],
    ["off", WololoCommandAction.Disable],
    ["disable", WololoCommandAction.Disable],
    ["disabled", WololoCommandAction.Disable],
    ["status", WololoCommandAction.Status],
    ["help", WololoCommandAction.Help],
    ["--help", WololoCommandAction.Help],
    ["-h", WololoCommandAction.Help],
    ["unknown", WololoCommandAction.Help],
  ])("parses %s", (input, action) => {
    expect(new WololoCommandParser().parse(input)).toBe(action);
  });
});
