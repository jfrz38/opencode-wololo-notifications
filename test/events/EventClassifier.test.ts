import { describe, expect, it } from "vitest";
import { EventClassifier } from "../../src/events/EventClassifier.js";

const classifier = new EventClassifier();

describe("EventClassifier", () => {
  it("classifies permission allow replies", () => {
    expect(classifier.keysFor("permission.replied", { status: "allow" }).map((key) => key.value)).toEqual(["permission.replied.allow", "permission.replied"]);
  });

  it("classifies permission deny replies", () => {
    expect(classifier.keysFor("permission.replied", { status: "deny" }).map((key) => key.value)).toEqual(["permission.replied.deny", "permission.replied"]);
  });

  it("falls back when permission reply decision is unknown", () => {
    expect(classifier.keysFor("permission.replied", { status: "maybe" }).map((key) => key.value)).toEqual(["permission.replied"]);
  });

  it("classifies failed tool executions", () => {
    expect(classifier.keysFor("tool.execute.after", { output: { error: "failed" } }).map((key) => key.value)).toEqual(["tool.execute.after.error", "tool.execute.after"]);
  });

  it("classifies successful tool executions", () => {
    expect(classifier.keysFor("tool.execute.after", { output: { output: "ok" } }).map((key) => key.value)).toEqual(["tool.execute.after.success", "tool.execute.after"]);
  });

  it("uses the event name as key for simple events", () => {
    expect(classifier.keysFor("session.idle").map((key) => key.value)).toEqual(["session.idle"]);
  });
});
