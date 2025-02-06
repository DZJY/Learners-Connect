# Setup

Watch Tailwind CSS File

```
npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch
```

Run Development server

```
npm run dev
```

To Use Google Cloud Applications API Key

- Download "capable-bliss-378816-9458a5c4bedd.json", place it anywhere but note the path. This is the service-account-file.json.

- Run the following command in Powershell:
```
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\your\service-account-file.json"
```

- Or in Command Prompt:
```
set GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\your\service-account-file.json"
```

- Or in Unix-like shell (like bash):
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-file.json"

Make sure to replace /path/to/your/service-account-file.json or C:\path\to\your\service-account-file.json with the actual path to your service account key JSON file.

Remember, this sets the environment variable for the current shell session only. If you close the shell or open a new one, you'll need to set the variable again. To make it permanent, you'll need to add the export or set command to your shell's profile or startup file, or set the environment variable in your system settings, which is different for each operating system.

For security, don't forget to keep your service account key JSON file secure. Never commit it to a public repository or expose it in any public manner.

## Mantine Next Template

Get started with Mantine + Next with just a few button clicks.
Click `Use this template` button at the header of repository or [follow this link](https://github.com/mantinedev/mantine-next-template/generate) and
create new repository with `@mantine` packages. Note that you have to be logged in to GitHub to generate template.

## Features

This template comes with several essential features:

- Server side rendering setup for Mantine
- Color scheme is stored in cookie to avoid color scheme mismatch after hydration
- Storybook with color scheme toggle
- Jest with react testing library
- ESLint setup with [eslint-config-mantine](https://github.com/mantinedev/eslint-config-mantine)

## npm scripts

### Build and dev scripts

- `dev` – start dev server
- `build` – bundle application for production
- `export` – exports static website to `out` folder
- `analyze` – analyzes application bundle with [@next/bundle-analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

### Testing scripts

- `typecheck` – checks TypeScript types
- `lint` – runs ESLint
- `prettier:check` – checks files with Prettier
- `jest` – runs jest tests
- `jest:watch` – starts jest watch
- `test` – runs `jest`, `prettier:check`, `lint` and `typecheck` scripts

### Other scripts

- `storybook` – starts storybook dev server
- `storybook:build` – build production storybook bundle to `storybook-static`
- `prettier:write` – formats all files with Prettier
