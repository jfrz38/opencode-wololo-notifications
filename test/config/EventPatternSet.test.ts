import { describe, expect, it } from "vitest";
import { EventPatternSet } from "../../src/config/EventPatternSet.js";

describe("EventPatternSet", () => {
  it("matches exact event keys", () => {
    const events = EventPatternSet.fromUnknown(["session.idle"]);

    expect(events.matches("session.idle")).toBe(true);
    expect(events.matches("session.error")).toBe(false);
  });

  it("matches suffix wildcards", () => {
    const events = EventPatternSet.fromUnknown(["session.*"]);

    expect(events.matches("session.idle")).toBe(true);
    expect(events.matches("session.error")).toBe(true);
    expect(events.matches("session")).toBe(false);
  });

  it("matches broad wildcards", () => {
    const events = EventPatternSet.fromUnknown(["permission.*"]);

    expect(events.matches("permission.asked")).toBe(true);
    expect(events.matches("session.idle")).toBe(false);
  });

  it("matches all events with star", () => {
    const events = EventPatternSet.fromUnknown(["*"]);

    expect(events.matches("session.idle")).toBe(true);
    expect(events.matches("question.asked")).toBe(true);
  });

  it("uses fallback patterns only when the value is not an array", () => {
    expect(EventPatternSet.fromUnknown(undefined, ["session.idle"]).toArray()).toEqual(["session.idle"]);
    expect(EventPatternSet.fromUnknown([], ["session.idle"]).toArray()).toEqual([]);
  });

  it("ignores invalid entries", () => {
    const events = EventPatternSet.fromUnknown(["session.idle", "", 1, null]);

    expect(events.toArray()).toEqual(["session.idle"]);
  });
});
