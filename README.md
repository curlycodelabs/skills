# CurlyCode skills

Claude Code plugins by [CurlyCode Labs](https://github.com/curlycodelabs). Every skill lives in its own folder under `plugins/`.

## Add the marketplace

In your terminal:

```bash
claude plugin marketplace add curlycodelabs/skills
```

Or inside Claude Code: `/plugin marketplace add curlycodelabs/skills`. Then install any plugin below with `claude plugin install <name>@curlycode` (or `/plugin install <name>@curlycode`, in its own message), and just ask Claude for what you need.

## Plugins

| Plugin | What it does | Install |
| --- | --- | --- |
| [storescreenshot](plugins/storescreenshot) | Captures your iOS app in the simulator and turns the screens into App Store screenshots on [StoreScreenshot](https://storescreenshot.app). | `/plugin install storescreenshot@curlycode` |

## Any other agent

The StoreScreenshot guide works in any coding agent with a terminal (Cursor, Codex, Windsurf, Gemini CLI). Paste this in your app's folder:

```
Follow https://storescreenshot.app/setup.md to create App Store screenshots for my app
```

It runs the [`@curlycode/storescreenshot` CLI](plugins/storescreenshot/cli) through `npx`, so there is nothing to install.

## Releases

Every plugin is versioned on its own from [conventional commits](https://www.conventionalcommits.org): on each push to `main`, the release workflow looks at the commits that changed a plugin's folder since its last tag, bumps the version in its `plugin.json`, writes its `CHANGELOG.md`, and tags it `<plugin>-v<version>`. A plugin's npm CLI in `cli/` is released the same way as `<plugin>-cli`, and published to npm. `feat` is a minor release, and `fix`, `perf`, `refactor`, `style`, `chore` and `docs` are patches, since a skill is markdown.

## License

MIT
