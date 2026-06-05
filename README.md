# opencode-wololo-notifications

Sound notifications for OpenCode, inspired by classic RTS games.

This plugin plays local sound files when relevant OpenCode events happen, such as a session becoming idle, permission prompts, session errors, or tool execution finishing.

## Install

```bash
npm install opencode-wololo-notifications
```

## Configuration

OpenCode currently validates `opencode.json` strictly, so plugin options should be passed using the plugin tuple form:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    [
      "opencode-wololo-notifications",
      {
        "soundsDir": "~/.config/opencode/wololo/sounds",
        "events": {
          "session.idle": "housed.wav",
          "permission.asked": "villager-select.wav",
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
profile event > flat events > no sound
```

## Options

| Option | Default | Description |
|---|---:|---|
| `enabled` | `true` | Initial playback state. Runtime state can be changed with `/wololo`. |
| `soundsDir` | `~/.config/opencode/wololo/sounds` | Base directory for relative sound files. |
| `debug` | `false` | Prints `[wololo]` debug messages. |
| `cooldownMs` | `1000` | Global cooldown between sounds. |
| `defaultProfile` | unset | Profile name to use from `profiles`. |
| `events` | `{}` | Flat event-to-file map. |
| `profiles` | `{}` | Profile event maps. |

Environment fallbacks are also supported:

```txt
OPENCODE_WOLOLO_SOUNDS_DIR
OPENCODE_WOLOLO_PROFILE
OPENCODE_WOLOLO_DEBUG
```

## Runtime Command

The plugin automatically registers a `/wololo` command in OpenCode.

```txt
/wololo
/wololo on
/wololo off
/wololo toggle
/wololo status
```

`/wololo` without arguments toggles playback on or off.

This state is runtime-only. It affects the current OpenCode process and does not write back to `opencode.json`.

## Supported Events

| Event key | Description |
|---|---|
| `session.idle` | Session became idle. Useful as "task finished". |
| `session.error` | Session error. |
| `permission.asked` | OpenCode is asking for permission. |
| `permission.replied` | Permission was answered. |
| `permission.replied.allow` | Permission was allowed. |
| `permission.replied.deny` | Permission was denied. |
| `tool.execute.after` | Tool execution finished. |
| `tool.execute.after.success` | Tool execution finished successfully. |
| `tool.execute.after.error` | Tool execution failed. |

## Audio Support

The MVP supports `.wav` cross-platform where possible and `.mp3`/`.ogg` best effort through available players.

macOS uses `afplay`.

Linux tries `paplay`, `aplay`, then `ffplay`.

Windows uses PowerShell `Media.SoundPlayer` for `.wav`. For maximum compatibility on Windows, use `.wav` files.

## Note About `session.idle`

`session.idle` is used as the default "task finished" signal, but depending on OpenCode internals it may mean that the agent finished a turn and is waiting for more input, not necessarily that a whole high-level task is complete.

## Debugging

Enable debug mode to see plugin decisions:

```json
{
  "debug": true
}
```

Example output:

```txt
[wololo] event=session.idle profile=spanish sound=/path/to/housed.wav
[wololo] missing sound file: /path/to/file.wav
[wololo] no configured sound for event=tool.execute.after
```

## Local Testing

For local OpenCode testing before npm publishing, build the plugin and load it from a local file or copy a plugin entry into `.opencode/plugins/`. Restart OpenCode after changing plugin files or config because plugins are loaded at startup.

## Legal notice

This project does not include any Age of Empires, Age of Empires II,
Microsoft, Xbox Game Studios, or World’s Edge audio assets.

Users must provide their own sound files and ensure they have the right to use them.

Age of Empires and related marks are trademarks of Microsoft.
This project is not affiliated with, endorsed by, or sponsored by Microsoft.

For Microsoft/Xbox game content, see Microsoft’s Game Content Usage Rules:
https://www.xbox.com/en-US/developers/rules
