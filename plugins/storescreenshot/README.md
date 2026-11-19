# StoreScreenshot for Claude Code

Turn your iOS app into App Store screenshots without leaving the terminal. Claude Code opens your app in the simulator, fills it with believable demo data, captures your best 4 or 5 screens, and sends them to [StoreScreenshot](https://storescreenshot.app), which designs the gallery for you.

## Install

In your terminal, from your app's folder. This installs the plugin and opens Claude Code with the request:

```bash
claude plugin marketplace add curlycodelabs/skills && claude plugin install storescreenshot@curlycode && claude "Create App Store screenshots for my app with StoreScreenshot"
```

Already inside Claude Code or the desktop app? Send these one per message (Claude Code runs one slash command at a time), then restart Claude Code:

```
/plugin marketplace add curlycodelabs/skills
```

```
/plugin install storescreenshot@curlycode
```

## Connect your account

Nothing to set up. The first time you ask for screenshots, Claude opens a StoreScreenshot page in your browser: sign in, or sign up for free, and click **Authorize**. The token is saved on your machine for every later session.

No browser on that machine? Create a token in Settings, API tokens, and pipe it to `storescreenshot.mjs login --token-stdin`. `STORESCREENSHOT_TOKEN` in the environment also works and takes priority over the saved token.

## Use it

Open Claude Code in your app's folder and ask:

```
Create App Store screenshots for my app with StoreScreenshot
```

`/storescreenshot` does the same. Claude shows you the screens it plans to capture, the app description, and the cost in credits before anything is sent. One screenshot credit per screen.

## Requirements

- macOS with Xcode and an iOS simulator
- An iOS app (Xcode project, Swift package, Expo, or React Native)
- Node 18 or newer
