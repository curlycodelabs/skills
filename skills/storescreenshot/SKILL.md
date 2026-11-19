---
name: storescreenshot
description: Capture the user's iOS app in the simulator and send 4 or 5 screens to StoreScreenshot, which turns them into designed App Store screenshots. Use when the user asks for App Store screenshots, store screenshots, marketing screenshots of their app, or runs /storescreenshot.
---

# StoreScreenshot

You turn the user's iOS app into a ready StoreScreenshot project. You read the code, run the app in the iOS simulator with believable demo data, capture the 4 or 5 screens that sell the app best, and send them with a short description of the app. StoreScreenshot designs the gallery. The user only reviews your plan and opens the link at the end.

Work through the steps in order. Keep the user informed in one short line per step.

## Speed rules

The whole run should take a few minutes. Most of the time is lost to the same mistakes, so:

- **Stay inside the user's app.** Never open Health, Settings, Photos or any other app to create data. If a screen depends on system data you cannot produce from the app, pick another screen or accept the empty value.
- **Do not look at the screen between taps** when you already know the layout from the code or an earlier capture. Look only when you do not know where to tap next.
- **Capture first, review once.** Take all captures in one pass, then review them together (step 8). Never open each capture right after taking it.
- **Ask everything in one message.** The plan, the demo data change and anything blocking (missing token, simulator access) go in the same message in step 5, so the user answers once.

## 1. Check the setup

1. Run `xcrun simctl help` to confirm Xcode command line tools are present. If not, tell the user to install Xcode and stop.
2. Find the app: an `.xcworkspace`, an `.xcodeproj`, a `Package.swift` app target, or an Expo or React Native project with an `ios` folder. If there is none, say this skill needs an iOS app and stop.
3. Run `node <skill dir>/scripts/storescreenshot.mjs me`. It reads `STORESCREENSHOT_TOKEN` from the environment, or the token saved by the `login` command.
   - If the token is missing or refused, do not stop: keep going with steps 2 to 4 and put the fix in the step 5 message. The fix is to create a token at https://storescreenshot.app/dashboard/settings/api-tokens, copy it, and run `pbpaste | node <skill dir>/scripts/storescreenshot.mjs login` in their own terminal. The token is read from stdin, so it never lands in shell history, and it is saved for every later session. A token exported in another terminal tab is invisible to you, so always suggest `login` rather than `export`.
   - Otherwise note the remaining screenshot credits.
4. `STORESCREENSHOT_API_URL` points the script at another server, for example a development one. Pass it on every command when the user asks for it.

## 2. Pick the screens

Read the code to find the screens that show what the app is for. Aim for 5, never fewer than 4:

- the main screen, as a regular user sees it every day
- the signature feature, the reason someone downloads the app
- a detail screen with rich content
- a result, progress, or summary screen
- one more feature that broadens the story

Skip onboarding, sign in, settings, paywalls, permission prompts, and empty states.

For each screen, find how to reach it, in this order of preference:

1. a deep link the app already handles (URL scheme or universal link routes)
2. launch arguments or environment variables the app already reads
3. tapping through the interface

Write the route down for each screen now (deep link, or the exact taps), so capture in step 7 needs no exploring.

Never edit the user's code without asking. If a temporary demo mode or seed would make capture much more reliable, propose the exact change in step 5 and wait for a yes. Revert it at the end.

## 3. Plan the demo data

Empty screens sell nothing. Look for data you can reuse: SwiftUI previews, fixtures, a seed or mock data file, a debug menu.

If there is none and the screens need history (past workouts, past orders, charts over weeks), entering it through the interface is slow and often impossible because dates cannot be backdated. Propose instead a temporary `#if DEBUG` seed that runs only when the app launches with a launch argument such as `-StoreScreenshotDemo` and only when the store is empty. Keep it in one new file plus one call at app start, so reverting it is deleting the file and one line.

The data must look real and recent: plausible names, amounts, dates within the last weeks, a few items rather than one. Never use the user's own personal data, and never capture a screen that shows a real email address or name of the user.

## 4. Write the app description

Write the description StoreScreenshot uses for the copy and the art direction, in English, under 1500 characters:

- what the app does, in one sentence
- who it is for
- the 3 key features, in the app's own vocabulary
- the brand color, read from `AccentColor` in the asset catalog or the main tint, as a hex value
- the mood of the app (calm, playful, premium, technical) in a few words

## 5. Show the plan and wait

Show the user, in one short message:

- the screens you will capture, in gallery order, with one line each
- the demo data change you propose, if any
- the app name and the description
- the cost: one screenshot credit per screen, and the credits they have left
- anything still blocking, with the exact fix: the token (`login` command from step 1), or simulator access if the session needs it

If they do not have enough credits, say so and give the pricing link before you capture anything. Wait for their go-ahead. Apply any change they ask for.

## 6. Build, boot and clear the first launch

1. Pick the largest iPhone simulator available (`xcrun simctl list devices available`). Prefer a 6.9 inch model (iPhone 17 Pro Max, 16 Pro Max, 16 Plus) because App Store Connect asks for 1320 x 2868. If none exists, create one with `xcrun simctl create`.
2. Boot it: `xcrun simctl boot <udid>`. If `open -a Simulator` fails, do not look for the app: headless capture works without the window.
3. Build for the simulator with the project's own tooling (`xcodebuild -scheme <scheme> -destination 'platform=iOS Simulator,id=<udid>' -derivedDataPath build/storescreenshot -quiet build`, or the Expo or React Native command) and install with `xcrun simctl install`.
4. Grant what can be granted before the first launch, so fewer prompts appear: `xcrun simctl privacy <udid> grant all <bundle id>`. Some services (HealthKit among them) refuse this; that is expected, carry on.
5. Set a clean status bar and appearance:
   `xcrun simctl status_bar <udid> override --time "9:41" --dataNetwork wifi --wifiMode active --wifiBars 3 --cellularMode active --cellularBars 4 --batteryState charged --batteryLevel 100`
   `xcrun simctl ui <udid> appearance light` (unless the app is designed dark first)
6. Launch with the demo argument if there is one (`xcrun simctl launch <udid> <bundle id> -StoreScreenshotDemo`), then clear the first launch: take one screenshot, dismiss every permission prompt still showing (choose the option that keeps the app usable, usually Allow for notifications and Don't Allow for health data), and repeat until the app's main screen shows. Prompts can come back on the first visit of a feature (for example the first workout started), so expect one more when you reach it.
7. The first `xcrun simctl openurl` for a custom URL scheme shows an "Open in <App>?" alert. Trigger one deep link here and tap Open, so later deep links go straight through.

## 7. Capture in one pass

For each screen, in gallery order: navigate with the route you wrote in step 2, wait about 2 seconds for animations and content to settle, then capture:

`xcrun simctl io <udid> screenshot --type=png storescreenshot-captures/<order>-<screen>.png`

Do not open the capture. Go straight to the next screen.

Prefer deep links (`xcrun simctl openurl`) and launch arguments over taps: they do not depend on the current scroll position or on a sheet left open. When a screen sits inside a modal or behind other state (an in-progress session, a minimized bar), plan the order so later screens are not covered by it, or capture those screens first.

Keep the files in `storescreenshot-captures/` at the project root so the user can reuse them. Add that folder to `.gitignore` if the project has one and the folder is not ignored yet, and say so.

## 8. Review once

Make small copies and look at all of them in one message:

```bash
mkdir -p <scratch dir>/review && for f in storescreenshot-captures/*.png; do sips -Z 900 "$f" --out <scratch dir>/review/ >/dev/null; done
```

Then read the files in `<scratch dir>/review/` together. Redo only the captures that show a keyboard, an alert, a spinner, a placeholder, a half finished transition, an empty list, or the wrong screen, then review just those again.

## 9. Send

Run:

`node <skill dir>/scripts/storescreenshot.mjs send --app-name "<App name>" --description-file <file> storescreenshot-captures/1-*.png storescreenshot-captures/2-*.png ...`

Pass the captures in gallery order. Write the description to a temporary file first.

- On success, give the user the studio link it prints. The gallery appears frame by frame over the next minutes.
- On "not enough credits", give the pricing link and remind them the captures are saved, so they can send them again with the same command after buying credits.
- On a network error, offer to run the same command again. Do not recapture.

## 10. Clean up

Clear the status bar override (`xcrun simctl status_bar <udid> clear`), revert any temporary code change you made with the user's approval (and regenerate the project if it uses a generator such as XcodeGen or Tuist), and delete any file where you stored a token during the session.
