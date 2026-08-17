# Public release checklist

## Repository

- [x] Product name does not use `GPT` as part of the product brand
- [x] MIT license and third-party notices are present
- [x] Public README, privacy policy, support guide, contributing guide, and security policy are present
- [x] CI runs the local regression checks and package build
- [ ] Create the public GitHub repository
- [ ] Confirm the README images and installation instructions render on GitHub
- [ ] Enable GitHub private vulnerability reporting
- [ ] Confirm the default branch is `main` and CI passes

## GitHub release

- [ ] Create tag and release `v0.15.0`
- [ ] Attach `packages/live-asmr-studio-v0.15.0.zip`
- [ ] Explain ZIP extraction, unpacked installation, and the reload-based update flow
- [ ] Verify the release download from a signed-out browser session

Chrome Web Store publication is not planned for this release. `docs/store-listing.md` and the listing artwork remain available if that decision changes later.

## Manual acceptance

- [ ] Install the packaged ZIP as an unpacked extension in a clean Chrome profile
- [ ] Verify first-run English UI, then all five language switches
- [ ] Connect and stop ChatGPT Voice Live tab audio
- [ ] Switch the capture target between two tabs and verify the old badge stops
- [ ] Copy one prompt from every session mode
- [ ] Test spatial drag, motion start/stop, ambience, mute, and settings export/import
- [ ] Import one legacy `GPT Live ASMR` settings file
- [ ] Trigger and dismiss the one-time 10× gain warning
- [ ] Confirm no external request is made by the extension during normal use
