import { describe, expect, it } from "vitest";
import { NOTIFICATION_STATUS_DISABLED, NOTIFICATION_STATUS_ENABLED, NotificationState } from "../../src/runtime/NotificationState.js";

describe("NotificationState", () => {
  it("tracks enabled state", () => {
    const state = new NotificationState(false);

    expect(state.isEnabled()).toBe(false);
    expect(state.statusText()).toBe(NOTIFICATION_STATUS_DISABLED);

    state.enable();
    expect(state.isEnabled()).toBe(true);
    expect(state.statusText()).toBe(NOTIFICATION_STATUS_ENABLED);

    state.toggle();
    expect(state.isEnabled()).toBe(false);

    state.disable();
    expect(state.statusText()).toBe(NOTIFICATION_STATUS_DISABLED);
  });
});
