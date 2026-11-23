---
title: 📲 System App Stores
---


| Ecosystem / catalog | Type | Estimated entries | Platform OS share | Entries per M devices | Coverage bias | Confidence |
|---|---|---:|---:|---:|---|---|
| Microsoft Store | Apps | **~300,000–400,000** | **Windows 76.62%** | ~305 | Microsoft stopped publishing; many low-quality/PWA listings | Low |
| winget repository | Packages | **~10,000+ manifests** | Windows 76.62% | ~8.7 | CLI installer index, not a store | Medium |
| Chocolatey | Packages | **~10,000+** | Windows 76.62% | ~8.7 | Community packages, uneven quality | Medium |
| Google Play | Apps | **~2.0–2.3M** | **Android 72.39%** | ~660 | Games, stickers, abandoned apps, mass-produced junk | Medium — declining since 2021 peak |
| F-Droid | Apps | **~4,000** | Android 72.39% | ~1.2 | FOSS only, human-reviewed | Medium |
| Apple App Store (iOS) | Apps | **~1.8–2.0M** | **iOS 27.58%** | ~1,530 | Same inflation; Apple purged 100k+ abandoned apps 2022–23 | Medium |
| Mac App Store | Apps | **~25,000–40,000** | macOS ~15.7% | ~138 | Small; most Mac software ships outside it | Low |
| Homebrew casks | Apps | **~6,000–7,000** | macOS ~15.7% | ~27 | GUI apps distributed outside MAS | Medium |
| AUR (Arch, context) | Packages | **125,986** | Linux desktop ~5% | ~42,000 (Arch ≈3M users) | Build scripts, mostly user-submitted, unaudited | High count / low density conf. |
| Debian 13 archive | Packages | **69,830** | Linux desktop ~5% | ~5,800 | Everything: libs, dev files, daemons, fonts | High — official, Aug 2025 |
| Fedora release repo | Packages | **67,424** | Linux desktop ~5% | ~13,000 | Same inflation as Debian | Medium — third-party count, 2026 |
| Ubuntu 24.04 `universe` alone | Packages | **36,000+** | Linux desktop ~5% | ~900 (Ubuntu-weighted) | One component of one release | High — Ubuntu official |
| Arch official repos | Packages | **~15,400** | Linux desktop ~5% | ~5,100 | Core/extra, curated | Medium |
| Portable Linux Apps | Apps | **10,123** | Linux desktop ~5% | ~135 | AppImage + portable archives; install-script indexed, self-reported counts | High — live counter |
| Snap Store | Apps | **8,349** (811 test → ~7,538 real) | Linux desktop ~5% | ~100 (Ubuntu-weighted) | Desktop + server + IoT mixed | High — live counter |
| Flathub | Apps | **3,760** (2,219 verified) | Linux desktop ~5% | ~50 | Desktop only, curated | High — Nov 2026 |

## What changed

**The Linux AppImage tier more than doubled, and now leads the Linux app catalogs.** At ~135 entries per million devices, Portable Linux Apps moves ahead of both Snap (~100) and Flathub (~50) on density — and it does so at 2.7× Flathub's absolute size. That's a bigger number than the "curated, human-reviewed" framing of the bottom rows would predict.

**It slots into the table's trust profile honestly, not flatteringly.** Every entry is a script managed by the AM package manager, sourced from a single community-maintained app list on GitHub — one maintainer's index rather than distributed developer submissions. Better provenance than the reupload farms it replaces, weaker than Flathub or F-Droid review. The 10,123 also counts metapackage contents as a separate line (69 items inside 4 bundles), so a handful are double-counted.

**Density ranking now reads:** AUR > Fedora > Debian > Arch official > App Store > Ubuntu universe > Play > MS Store > Mac App Store > Portable Linux Apps > Snap > Flathub > Homebrew casks > winget/Chocolatey > F-Droid.

The structural read from the last two turns is unchanged: popularity-sorted, the table's top is a 1.15B-device platform with ~17 catalog entries per million, and its bottom is a 75M-device platform holding two-thirds of the rows. Only the Linux density ordering shifted — the platform ordering didn't.