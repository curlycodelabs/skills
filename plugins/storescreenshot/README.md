# StoreScreenshot for Claude Code

Turn your iOS app into App Store screenshots without leaving the terminal. Claude Code opens your app in the simulator, fills it with believable demo data, captures your best 4 or 5 screens, and sends them to [StoreScreenshot](https://storescreenshot.app), which designs the gallery for you.

## Install

In Claude Code:

```
/plugin marketplace add curlycodelabs/skills
/plugin install storescreenshot@curlycode
```

## Connect your account

Nothing to set up. The first time you ask for screenshots, Claude opens a StoreScreenshot page in your browser: sign in, or sign up for free, and click **Authorize**. The token is saved on your machine for every later session.

No browser on that machine? Create a token in Settings, API tokens, and pipe it to `storescreenshot.mjs login --token-stdin`. `STORESCREENSHOT_TOKEN` in the environment also works and takes priority over the saved token.

## Use it

Open Claude Code in your app's folder and ask for App Store screenshots, or run `/storescreenshot`. Claude shows you the screens it plans to capture, the app description, and the cost in credits before anything is sent. One screenshot credit per screen.

## Requirements

- macOS with Xcode and an iOS simulator
- An iOS app (Xcode project, Swift package, Expo, or React Native)
- Node 18 or newer
