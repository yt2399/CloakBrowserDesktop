# CloakBrowserApp

English | [简体中文](./README.md)

CloakBrowserApp is a local desktop application for managing isolated browser environments powered by CloakBrowser. It combines an Electron interface with a local Express API, SQLite persistence, and persistent browser contexts.

> This project is source-available for noncommercial use. Personal study, research, testing, and other uses permitted by the license are welcome. Commercial use requires separate permission.

## Screenshots

### Environment Management

![Environment management](./docs/images/environment-management.png)

### Environment Editor

![Environment editor](./docs/images/profile-editor.png)

### Kernel Downloads

![Kernel downloads](./docs/images/kernel-downloads.png)

## Features

- Create, edit, launch, stop, and delete local browser environments
- Configure proxy, timezone, locale, screen size, CPU, memory, and storage quota
- Isolate environments with separate persistent user-data directories
- Generate stable browser fingerprint arguments from each environment seed
- Persist environment configuration in a local SQLite database
- Manage environments and sessions through an API bound to `127.0.0.1`
- Group Windows, Linux, and macOS kernel downloads by Chromium build
- Provide official downloads, URL copying, and GitHub fallback links

## Tech Stack

- Electron 39
- React 19 + TypeScript
- electron-vite + Vite 7
- Tailwind CSS 4
- Express 5
- better-sqlite3
- CloakBrowser + Playwright Core
- Radix UI + Lucide Icons

## Getting Started

### Requirements

- Windows 10/11
- Node.js 22 LTS
- npm 10 or later

### Development

```bash
npm install
npm run dev
```

### Type Check

```bash
npm run typecheck
```

### Production Build

```bash
npm run build
```

## Project Layout

```text
src/
  main/       Electron main process, local API, SQLite, and browser sessions
  preload/    Secure bridge for window controls
  renderer/   React management interface
docs/images/  Screenshots used by the repository documentation
```

## Local Data and Privacy

- Environment settings and user data are stored in Electron's application-data directory.
- The management API listens on `127.0.0.1:6788` by default.
- Proxy credentials may be sensitive. Do not commit databases, logs, or screenshots containing real configuration.
- `.gitignore` excludes databases, build output, dependencies, and environment files.

## Project Status

The current release focuses on Windows desktop development and packaging. Environment management and kernel downloads are available; proxy and settings pages are still being expanded.

## Upstream

CloakBrowserApp uses [CloakBrowser](https://github.com/CloakHQ/CloakBrowser) for browser runtime capabilities. CloakBrowser, Chromium, third-party dependencies, and downloaded binaries remain subject to their own licenses. This repository's license only covers original CloakBrowserApp code.

## License

This project is licensed under the [PolyForm Noncommercial License 1.0.0](./LICENSE), SPDX identifier `PolyForm-Noncommercial-1.0.0`.

The license permits qualifying noncommercial use, modification, and distribution, but does not permit unauthorized commercial use. It is a source-available license, not an OSI-approved open-source license. For commercial licensing, contact the maintainers through a GitHub Issue.
