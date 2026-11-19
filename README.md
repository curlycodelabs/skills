# StoreScreenshot for Claude Code

Turn your iOS app into App Store screenshots without leaving the terminal. Claude Code opens your app in the simulator, fills it with believable demo data, captures your best 4 or 5 screens, and sends them to [StoreScreenshot](https://storescreenshot.app), which designs the gallery for you.

## Install

In Claude Code:

```
/plugin marketplace add miskoune/storescreenshot-claude-plugin
/plugin install storescreenshot@storescreenshot
```

## Connect your account

1. Create a token at https://storescreenshot.app/dashboard/settings/api-tokens and copy it.
2. Save it once (it is read from the clipboard, so it never lands in your shell history):

```bash
pbpaste | node ~/.claude/plugins/marketplaces/storescreenshot/skills/storescreenshot/scripts/storescreenshot.mjs login
```

`STORESCREENSHOT_TOKEN` in the environment still works and takes priority over the saved token.

## Use it

Open Claude Code in your app's folder and ask for App Store screenshots, or run `/storescreenshot`. Claude shows you the screens it plans to capture, the app description, and the cost in credits before anything is sent. One screenshot credit per screen.

## Requirements

- macOS with Xcode and an iOS simulator
- An iOS app (Xcode project, Swift package, Expo, or React Native)
- Node 18 or newer
