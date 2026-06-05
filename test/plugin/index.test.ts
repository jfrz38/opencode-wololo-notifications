import { describe, expect, it, vi } from "vitest";
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
  it("disabled config prevents playback", async () => {
    const hooks = await WololoNotificationsPlugin({} as never, {
      enabled: false,
      events: { "session.idle": "housed.wav" },
    });

    await hooks.event?.({ event: { type: "session.idle" } as never });

    const player = vi.mocked(AudioPlayer).mock.results[0]?.value;
    expect(player.play).not.toHaveBeenCalled();
  });
});
