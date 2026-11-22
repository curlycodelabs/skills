---
name: storescreenshot
description: Capture the user's iOS app in the simulator and send 4 or 5 screens to StoreScreenshot, which turns them into designed App Store screenshots. Use when the user asks for App Store screenshots, store screenshots, marketing screenshots of their app, or runs /storescreenshot.
---

# StoreScreenshot

The full guide lives at https://storescreenshot.app/setup.md, so every agent follows the same steps and the guide stays current without a plugin update.

1. Run `curl -fsSL https://storescreenshot.app/setup.md` and read the whole output. Do not use a fetch tool that summarizes the page: every step matters.
2. Follow it from the top, step by step. The StoreScreenshot commands run through `npx -y @curlycode/storescreenshot@latest`.
3. If the page cannot be reached, tell the user StoreScreenshot looks unreachable and offer to try again in a moment.
