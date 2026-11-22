# @curlycode/storescreenshot

Turn your iOS app into App Store screenshots from any coding agent. Your agent runs the app in the simulator, captures the screens that sell it, and this CLI sends them to [StoreScreenshot](https://storescreenshot.app), which designs the gallery.

## Use it with your agent

Paste this in Claude Code, Cursor, Codex, or any agent with a terminal, in your app's folder:

```
Follow https://storescreenshot.app/setup.md to create App Store screenshots for my app
```

The agent reads the guide and runs this CLI through `npx`. Nothing to install.

## Commands

```bash
npx -y @curlycode/storescreenshot@latest login
npx -y @curlycode/storescreenshot@latest me
npx -y @curlycode/storescreenshot@latest send --app-name "My App" --description-file description.txt 1-home.png 2-detail.png
```

- `login` opens StoreScreenshot in the browser. Sign in, or sign up for free, and click Authorize. The token is saved to `~/.config/storescreenshot/token`. On a machine without a browser, create a token in Settings, API tokens, and pipe it to `login --token-stdin`.
- `me` shows the signed-in account and the screenshot credits left.
- `send` creates a project from the screenshots, in gallery order, and prints the studio link. One screenshot credit per screen.

`STORESCREENSHOT_TOKEN` overrides the saved token, and `STORESCREENSHOT_API_URL` points the CLI at another server.

## Requirements

Node 18 or newer. Capturing an iOS app needs macOS with Xcode.
