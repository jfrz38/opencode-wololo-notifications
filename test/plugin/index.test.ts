import { beforeEach, describe, expect, it, vi } from "vitest";
import WololoNotificationsPlugin from "../../src/index.js";
import { AudioPlayer } from "../../src/audio/AudioPlayer.js";
import { WOLOLO_COMMAND_DESCRIPTION, WOLOLO_COMMAND_NAME, WOLOLO_COMMAND_PART_ID, WOLOLO_COMMAND_TEMPLATE } from "../../src/commands/WololoCommandConstants.js";

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
    const hooks = await WololoNotificationsPlugin({} as never, {
      enabled: false,
      events: { "session.idle": "housed.wav" },
    });

    await hooks.event?.({ event: { type: "session.idle" } as never });

    const player = vi.mocked(AudioPlayer).mock.results[0]?.value;
    expect(player.play).not.toHaveBeenCalled();
  });

  it("registers wololo command", async () => {
    const hooks = await WololoNotificationsPlugin({} as never, {});
    const config = {};

    await hooks.config?.(config as never);

    expect(config).toEqual({
      command: {
        [WOLOLO_COMMAND_NAME]: {
          description: WOLOLO_COMMAND_DESCRIPTION,
          template: WOLOLO_COMMAND_TEMPLATE,
        },
      },
    });
  });

  it("wololo command toggles runtime playback", async () => {
    const hooks = await WololoNotificationsPlugin({} as never, {
      enabled: false,
      events: { "session.idle": "housed.wav" },
    });
    const player = vi.mocked(AudioPlayer).mock.results[0]?.value;

    await hooks.event?.({ event: { type: "session.idle" } as never });
    expect(player.play).not.toHaveBeenCalled();

    const commandOutput = { parts: [] };
    await hooks["command.execute.before"]?.(
      { command: "wololo", arguments: "on", sessionID: "session-1" },
      commandOutput as never,
    );

    expect(commandOutput.parts).toEqual([
      {
        id: WOLOLO_COMMAND_PART_ID,
        sessionID: "session-1",
        messageID: WOLOLO_COMMAND_PART_ID,
        type: "text",
        text: "Wololo notifications: enabled",
        synthetic: true,
      },
    ]);

    await hooks.event?.({ event: { type: "session.idle" } as never });
    expect(player.play).toHaveBeenCalledWith(expect.stringContaining("housed.wav"));
  });
});
