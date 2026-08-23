import { beforeEach, describe, expect, it, vi } from "vitest";
import WololoNotificationsPlugin from "../../src/index.js";
import { AudioPlayer } from "../../src/audio/AudioPlayer.js";

vi.mock("../../src/audio/AudioPlayer.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/audio/AudioPlayer.js")>();
  return {
    ...actual,
    AudioPlayer: vi.fn(function AudioPlayer() {
      return { play: vi.fn() };
    }),
  };
});

describe("WololoNotificationsPlugin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("disabled config prevents playback", async () => {
    const sessionGet = vi.fn();
    const hooks = await WololoNotificationsPlugin({ client: { session: { get: sessionGet } } } as never, {
      enabled: false,
      events: { "session.idle": "housed.wav" },
    });

    await hooks.event?.({
      event: {
        type: "session.status",
        properties: { sessionID: "session-root", status: { type: "idle" } },
      },
    });

    const player = vi.mocked(AudioPlayer).mock.results[0]?.value;
    expect(sessionGet).not.toHaveBeenCalled();
    expect(player.play).not.toHaveBeenCalled();
  });

});
