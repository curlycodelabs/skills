# StoreScreenshot skill

Turn your iOS app into App Store screenshots from your coding agent. The agent opens your app in the simulator, fills it with believable demo data, captures your best 4 or 5 screens, and sends them to [StoreScreenshot](https://storescreenshot.app), which designs the gallery for you.

## Any coding agent

Paste this in Claude Code, Cursor, Codex, Windsurf, Gemini CLI, or any agent with a terminal, in your app's folder:

```
Follow https://storescreenshot.app/setup.md to create App Store screenshots for my app
```

Nothing to install. The agent follows the guide and runs the [`@curlycode/storescreenshot` CLI](cli) through `npx`.

## Claude Code plugin

For a `/storescreenshot` command in Claude Code, install the plugin from the CurlyCode library:

```bash
claude plugin marketplace add curlycodelabs/skills
claude plugin install storescreenshot@curlycode
```

Then ask `Create App Store screenshots for my app with StoreScreenshot`.

## Connect your account

The first time, the agent opens a StoreScreenshot page in your browser: sign in, or sign up for free, and click **Authorize**. The token is saved on your machine for every later run. Claude shows you the screens it plans to capture, the app description, and the cost in credits before anything is sent. One screenshot credit per screen.

## Requirements

- macOS with Xcode and an iOS simulator
- An iOS app (Xcode project, Swift package, Expo, or React Native)
- Node 18 or newer

## What is in this folder

- `skills/storescreenshot/SKILL.md`: the Claude Code skill. It loads the guide from https://storescreenshot.app/setup.md, so it stays current without an update
- `cli/`: the `@curlycode/storescreenshot` npm package the agent runs
