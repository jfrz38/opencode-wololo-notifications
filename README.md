# opencode-wololo-notifications

Sound notifications for OpenCode, inspired by classic RTS games.

This plugin plays sound files when a session becomes idle, a session fails, OpenCode asks for permission, or OpenCode asks the user a question.

It includes four Age of Empires II game-content `.wav` fallback sounds so a fresh install can produce audio without downloading extra assets. You can still map events to your own local files.

## Install

```bash
npm install opencode-wololo-notifications
```

## Configuration

OpenCode currently validates `opencode.json` strictly, so plugin options should be passed using the plugin tuple form:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-wololo-notifications"]
}
```

With no event mapping, only `session.idle` is enabled and uses the bundled `wololo.wav` fallback.

To use your own sound files, pass a `soundsDir` and event map:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    [
      "opencode-wololo-notifications",
      {
        "soundsDir": "~/.config/opencode/wololo/sounds",
        "enabledEvents": ["session.idle", "session.error", "permission.asked", "question.asked"],
        "events": {
          "session.idle": "housed.wav",
          "permission.asked": "villager-select.wav",
          "question.asked": "custom-question.wav",
          "session.error": "alarm.wav"
        }
      }
    ]
  ]
}
```

Put your own sound files in:

```txt
~/.config/opencode/wololo/sounds/
```

## Profiles

```json
{
  "plugin": [
    [
      "opencode-wololo-notifications",
      {
        "soundsDir": "~/.config/opencode/wololo/sounds",
        "defaultProfile": "spanish",
        "enabledEvents": ["session.idle", "permission.asked"],
        "events": {
          "session.idle": "default.wav"
        },
        "profiles": {
          "spanish": {
            "session.idle": "santiago.wav",
            "permission.asked": "mandato.wav"
          },
          "portuguese": {
            "session.idle": "as-vosas-ordes.wav",
            "permission.asked": "sim.wav"
          }
        }
      }
    ]
  ]
}
```

Resolution priority is:

```txt
enabled event > not disabled > profile event with existing file > flat event with existing file > bundled fallback > no sound
```

## Options

| Option | Default | Description |
|---|---:|---|
| `enabled` | `true` | Enables or disables playback when the plugin starts. |
| `soundsDir` | `~/.config/opencode/wololo/sounds` | Base directory for relative sound files. |
| `debug` | `false` | Prints `[wololo]` debug messages. |
| `cooldownMs` | `1000` | Global cooldown between sounds. |
| `defaultProfile` | unset | Profile name to use from `profiles`. |
| `events` | `{}` | Flat event-to-file map. |
| `profiles` | `{}` | Profile event maps. |
| `enabledEvents` | `["session.idle"]` | Event keys or wildcard patterns allowed to play sounds. An explicit empty array disables all event sounds. |
| `disabledEvents` | `[]` | Event keys or wildcard patterns that must never play sounds. |

Bundled fallback sounds are used when an enabled event has no custom sound, or when a configured relative/absolute custom file does not exist. Entries in `events` and `profiles` select files but do not enable events.

## Enabled Events

When `enabledEvents` is omitted, only `session.idle` can play. Set an explicit empty array to silence all event notifications:

```json
{
  "plugin": [
    [
      "opencode-wololo-notifications",
      {
        "enabledEvents": []
      }
    ]
  ]
}
```

To opt into additional bundled or custom sounds, list their event keys:

```json
{
  "plugin": [
    [
      "opencode-wololo-notifications",
      {
        "enabledEvents": [
          "session.idle",
          "session.error",
          "permission.asked",
          "question.asked"
        ]
      }
    ]
  ]
}
```

Patterns support the same `*` wildcards as `disabledEvents`. For example, `session.*` enables both session events. Only the four documented event keys are emitted by the plugin.

## Disabled Events

Use `disabledEvents` as a final veto for events otherwise allowed by `enabledEvents`.

```json
{
  "plugin": [
    [
      "opencode-wololo-notifications",
      {
        "disabledEvents": ["session.error"]
      }
    ]
  ]
}
```

Patterns support `*` wildcards:

| Pattern | Effect |
|---|---|
| `session.error` | Disables only session errors. |
| `session.*` | Disables both session events. |
| `*.asked` | Disables permission and question prompts. |
| `*` | Disables every event sound. |

At least one pattern must match the event key in `enabledEvents`, and any matching pattern in `disabledEvents` suppresses the sound.

Environment fallbacks are also supported:

```txt
OPENCODE_WOLOLO_SOUNDS_DIR
OPENCODE_WOLOLO_PROFILE
OPENCODE_WOLOLO_DEBUG
```

## Supported Events

Except for the default `session.idle`, these events must be selected through `enabledEvents` before they can play.

| Event key | Description | Bundled fallback |
|---|---|---|
| `session.idle` | Session became idle. Useful as "task finished". | `wololo.wav` |
| `session.error` | Session error. | `under_attack.wav` |
| `permission.asked` | OpenCode is asking for permission. | `ally.wav` |
| `question.asked` | OpenCode is asking the user a question. | `spawn.wav` |

## Audio Support

The plugin supports `.wav` cross-platform where possible and `.mp3`/`.ogg` best effort through available players.

macOS uses `afplay`.

Linux tries `paplay`, `aplay`, `mpv`, then `ffplay`.

Windows uses PowerShell `Media.SoundPlayer` for `.wav`. Non-`.wav` files are best-effort through `ffplay` if it is available in `PATH`. For maximum compatibility on Windows, use `.wav` files.

Playback is asynchronous relative to OpenCode hooks. While one sound is playing, additional sounds are skipped, and a player process is stopped after 10 seconds if it does not exit.

## Troubleshooting

- Windows custom sounds should be `.wav` files for native playback.
- Linux needs one of `paplay`, `aplay`, `mpv`, or `ffplay` for audio output.
- macOS uses the built-in `afplay` command.
- If you change plugin files or config, restart OpenCode because plugins are loaded at startup.
- Enable `debug` to see which event resolved to which sound path.

## Note About `session.idle`

`session.idle` is used as the default "task finished" signal, but depending on OpenCode internals it may mean that the agent finished a turn and is waiting for more input, not necessarily that a whole high-level task is complete.

## Debugging

Enable debug mode to see plugin decisions:

```json
{
  "plugin": [
    ["opencode-wololo-notifications", { "debug": true }]
  ]
}
```

Example output:

```txt
[wololo] event=session.idle profile=spanish sound=/path/to/housed.wav
[wololo] no configured sound for event=question.asked
[wololo] audio player ffplay timed out after 10000ms
```

## Local Testing

Run `pnpm install --frozen-lockfile`, `pnpm run lint`, `pnpm test`, and `pnpm run build`. For local OpenCode testing before npm publishing, load the built plugin from a local file or copy a plugin entry into `.opencode/plugins/`. Restart OpenCode after changing plugin files or config because plugins are loaded at startup.

## Legal notice

The MIT License applies to the source code and project documentation authored for this project. It does not grant rights to the bundled audio files in `sounds/`.

Age of Empires II © Microsoft Corporation. `opencode-wololo-notifications` was created under Microsoft's "Game Content Usage Rules" using assets from Age of Empires II, and it is not endorsed by or affiliated with Microsoft.

Use and distribution of the bundled audio remain subject to Microsoft's Game Content Usage Rules and any third-party rights that may apply. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Age of Empires and related marks are trademarks of Microsoft.
This project is not affiliated with, endorsed by, or sponsored by Microsoft.

For Microsoft/Xbox game content, see [Microsoft's Game Content Usage Rules](https://www.xbox.com/en-US/developers/rules).
